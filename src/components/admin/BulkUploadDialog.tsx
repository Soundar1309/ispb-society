
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Upload, Download, AlertCircle, FileUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BulkUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BulkUploadDialog = ({ isOpen, onClose, onSuccess }: BulkUploadDialogProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const headers = [
      'life_member_no',
      'name',
      'address',
      'occupation',
      'date_of_enrollment',
      'email',
      'mobile',
      'image_url'
    ];

    const sampleData = [
      [
        'LM-001',
        'Ramasamy, P.',
        'Agricultural Research Center-Hays',
        'Sorghum Breeder',
        '1995-11-10',
        'ramasamyp@hotmail.com',
        '+1234567890',
        'https://example.com/profile1.jpg'
      ],
      [
        'LM-002',
        'Sundaresan, N',
        'Coimbatore',
        'Professor (Retd.)',
        '1995-11-10',
        'sundaresan@research.org',
        '+0987654321',
        'https://example.com/profile2.jpg'
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
    link.setAttribute('download', 'life_members_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      try {
        // Read the file immediately to avoid permission issues later
        const text = await file.text();
        setCsvContent(text);
        setSelectedFile(file);
        setErrors([]);
      } catch (error) {
        console.error('Error reading file:', error);
        toast.error('Error reading file. Please try again.');
        setSelectedFile(null);
        setCsvContent('');
      }
    } else {
      toast.error('Please select a valid CSV file');
      setSelectedFile(null);
      setCsvContent('');
    }
  };

  const parseCsvData = (csvText: string) => {
    const lines = csvText.trim().split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    
    // Create a mapping of CSV headers to database columns
    const headerMap: { [key: string]: string } = {
      'Life Member No.': 'life_member_no',
      'life_member_no': 'life_member_no',
      'Name of the Member': 'name',
      'name': 'name',
      'Address': 'address',
      'address': 'address',
      'Occupation': 'occupation',
      'occupation': 'occupation',
      'Date of enrollment': 'date_of_enrollment',
      'date_of_enrollment': 'date_of_enrollment',
      'Email': 'email',
      'email': 'email',
      'Mobile': 'mobile',
      'mobile': 'mobile',
      'Image link': 'image_url',
      'image_url': 'image_url'
    };
    
    // Map headers to database column names
    const mappedHeaders = headers.map(h => headerMap[h] || h);
    
    // Check for required fields
    const hasLifeMemberNo = mappedHeaders.includes('life_member_no');
    const hasName = mappedHeaders.includes('name');
    
    if (!hasLifeMemberNo || !hasName) {
      throw new Error('CSV must have "Life Member No." and "Name of the Member" columns');
    }

    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Parse CSV handling quoted fields and commas
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const record: any = {};
      mappedHeaders.forEach((mappedHeader, index) => {
        // Skip S.No. column
        if (mappedHeader === 'S.No.' || mappedHeader === 's.no.') return;
        
        const value = values[index] || '';
        // Treat empty strings as null, remove BOM character if present
        const cleanValue = value.replace(/^\uFEFF/, '').trim();
        record[mappedHeader] = cleanValue === '' ? null : cleanValue;
      });

      if (!record.name || !record.life_member_no) {
        console.warn(`Row ${i + 1}: Skipping - name and life_member_no are required`);
        continue;
      }

      // Convert date string to proper format if provided
      if (record.date_of_enrollment) {
        try {
          const dateStr = record.date_of_enrollment.trim();
          let day, month, year;
          
          // Handle DD.MM.YYYY or DD.MM.YY format (with dots)
          if (dateStr.includes('.')) {
            const parts = dateStr.split('.');
            if (parts.length === 3) {
              day = parts[0].padStart(2, '0');
              month = parts[1].padStart(2, '0');
              year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
              record.date_of_enrollment = `${year}-${month}-${day}`;
            }
          }
          // Handle DD/MM/YYYY or D/MM/YY format (with slashes)
          else if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              day = parts[0].padStart(2, '0');
              month = parts[1].padStart(2, '0');
              year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
              record.date_of_enrollment = `${year}-${month}-${day}`;
            }
          }
          // Handle DD-MM-YY or D-MM-YY format (with dashes)
          else if (dateStr.includes('-') && dateStr.split('-').length === 3) {
            const parts = dateStr.split('-');
            day = parts[0].padStart(2, '0');
            month = parts[1].padStart(2, '0');
            year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
            record.date_of_enrollment = `${year}-${month}-${day}`;
          }
          // Try parsing as standard date format
          else {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              record.date_of_enrollment = date.toISOString().split('T')[0];
            } else {
              record.date_of_enrollment = null;
            }
          }
        } catch (e) {
          // Keep as null if date parsing fails
          record.date_of_enrollment = null;
        }
      }

      data.push(record);
    }

    if (data.length === 0) {
      throw new Error('No valid data rows found in CSV');
    }

    return data;
  };

  const handleUpload = async () => {
    if (!selectedFile || !csvContent) {
      toast.error('Please select a CSV file');
      return;
    }

    setIsUploading(true);
    setErrors([]);

    try {
      const data = parseCsvData(csvContent);
      
      // Deduplicate data by life_member_no (keep the last occurrence)
      const deduplicatedData = Array.from(
        data.reduce((map, item) => {
          map.set(item.life_member_no, item);
          return map;
        }, new Map<string, any>()).values()
      );
      
      const duplicateCount = data.length - deduplicatedData.length;
      if (duplicateCount > 0) {
        toast.info(`Removed ${duplicateCount} duplicate entries from CSV`);
      }
      
      // Use upsert to update existing records and insert new ones
      const { error } = await supabase
        .from('life_members')
        .upsert(deduplicatedData as any[], {
          onConflict: 'life_member_no',
          ignoreDuplicates: false
        });

      if (error) throw error;

      toast.success(`Successfully uploaded ${deduplicatedData.length} life members (new records added and existing records updated)`);
      setSelectedFile(null);
      setCsvContent('');
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
          <DialogTitle className="text-xl font-semibold text-gray-900">Bulk Upload Life Members</DialogTitle>
          <DialogDescription className="text-gray-600">
            Upload multiple life members at once using CSV file format
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
              Required columns: name, designation. Optional: institution, specialization, member_since, email, phone, image_url
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
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
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

export default BulkUploadDialog;
