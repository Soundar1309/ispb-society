
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Upload, Download, AlertCircle, FileUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MembersBulkUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MembersBulkUploadDialog = ({ isOpen, onClose, onSuccess }: MembersBulkUploadDialogProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const headers = [
      'full_name',
      'email',
      'phone',
      'institution',
      'designation',
      'specialization',
      'membership_type',
      'valid_from',
      'valid_until',
      'amount',
      'member_code'
    ];

    const sampleData = [
      [
        'Dr. John Doe',
        'john.doe@university.edu',
        '+1234567890',
        'University of Agriculture',
        'Professor',
        'Plant Genetics',
        'annual',
        '2024-01-01',
        '2024-12-31',
        '5000',
        'LM-001'
      ],
      [
        'Dr. Jane Smith',
        'jane.smith@research.org',
        '+0987654321',
        'Agricultural Research Institute',
        'Research Scientist',
        'Crop Breeding',
        'lifetime',
        '2024-01-01',
        '2054-01-01',
        '25000',
        'LM-002'
      ]
    ];

    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'members_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setErrors([]);
    } else {
      toast.error('Please select a valid CSV file');
      setSelectedFile(null);
    }
  };

  const parseCsvData = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const requiredHeaders = ['full_name', 'email', 'membership_type'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    const data = [];
    const parseErrors = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) {
        parseErrors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }

      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || null;
      });

      if (!record.full_name || !record.email || !record.membership_type) {
        parseErrors.push(`Row ${i + 1}: Name, email, and membership type are required`);
        continue;
      }

      if (record.amount) {
        record.amount = parseFloat(record.amount);
      }

      data.push(record);
    }

    if (parseErrors.length > 0) {
      throw new Error(`Parsing errors:\n${parseErrors.join('\n')}`);
    }

    return data;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a CSV file');
      return;
    }

    setIsUploading(true);
    setErrors([]);

    try {
      const csvText = await selectedFile.text();
      const data = parseCsvData(csvText);
      
      for (const member of data) {
        const userRoleData = {
          full_name: member.full_name,
          email: member.email,
          phone: member.phone,
          institution: member.institution,
          designation: member.designation,
          specialization: member.specialization,
          role: 'member'
        };

        const { data: userRole, error: userError } = await supabase
          .from('user_roles')
          .insert(userRoleData)
          .select()
          .single();

        if (userError) {
          console.error('Error creating user role:', userError);
          continue;
        }

        const membershipData = {
          user_id: userRole.user_id,
          membership_type: member.membership_type,
          valid_from: member.valid_from,
          valid_until: member.valid_until,
          amount: member.amount,
          member_code: member.member_code,
          status: 'active',
          payment_status: 'manual',
          is_manual: true
        };

        const { error: membershipError } = await supabase
          .from('memberships')
          .insert(membershipData);

        if (membershipError) {
          console.error('Error creating membership:', membershipError);
        }
      }

      toast.success(`Successfully uploaded ${data.length} members`);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Bulk upload error:', error);
      const errorMessage = error.message || 'Error during bulk upload';
      setErrors([errorMessage]);
      toast.error('Bulk upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Bulk Upload Members</DialogTitle>
          <DialogDescription className="text-gray-600">
            Upload multiple members with memberships using CSV file format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Label className="text-sm font-medium text-gray-700">CSV File Upload</Label>
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Required columns: full_name, email, membership_type. Optional: phone, institution, designation, specialization, valid_from, valid_until, amount, member_code
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload-members"
              />
              <label htmlFor="csv-upload-members" className="cursor-pointer">
                <FileUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Click to select CSV file or drag and drop</p>
                <p className="text-sm text-gray-500">Only CSV files are accepted</p>
              </label>
            </div>

            {selectedFile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">Selected file: {selectedFile.name}</p>
                <p className="text-green-600 text-sm">Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
              </div>
            )}
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="whitespace-pre-line">{errors.join('\n')}</div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={isUploading || !selectedFile}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload CSV'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MembersBulkUploadDialog;
