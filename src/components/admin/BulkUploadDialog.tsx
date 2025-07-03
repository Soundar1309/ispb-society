
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Download, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BulkUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BulkUploadDialog = ({ isOpen, onClose, onSuccess }: BulkUploadDialogProps) => {
  const [csvData, setCsvData] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const downloadTemplate = () => {
    const template = `name,designation,institution,specialization,member_since,email,phone
Dr. John Doe,Professor,Example University,Plant Genetics,2020,john.doe@example.com,+1234567890
Dr. Jane Smith,Associate Professor,Research Institute,Crop Breeding,2019,jane.smith@example.com,+0987654321`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'life_members_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const parseCsvData = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const requiredHeaders = ['name', 'designation'];
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

      if (!record.name || !record.designation) {
        parseErrors.push(`Row ${i + 1}: Name and designation are required`);
        continue;
      }

      data.push(record);
    }

    if (parseErrors.length > 0) {
      throw new Error(`Parsing errors:\n${parseErrors.join('\n')}`);
    }

    return data;
  };

  const handleUpload = async () => {
    if (!csvData.trim()) {
      toast.error('Please paste CSV data');
      return;
    }

    setIsUploading(true);
    setErrors([]);

    try {
      const data = parseCsvData(csvData);
      
      const { error } = await supabase
        .from('life_members')
        .insert(data);

      if (error) throw error;

      toast.success(`Successfully uploaded ${data.length} life members`);
      setCsvData('');
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
          <DialogTitle>Bulk Upload Life Members</DialogTitle>
          <DialogDescription>
            Upload multiple life members at once using CSV format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>CSV Data</Label>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Required columns: name, designation. Optional: institution, specialization, member_since, email, phone
            </AlertDescription>
          </Alert>

          <Textarea
            placeholder="Paste your CSV data here..."
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="whitespace-pre-line">{errors.join('\n')}</div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={isUploading || !csvData.trim()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadDialog;
