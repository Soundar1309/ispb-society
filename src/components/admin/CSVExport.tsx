
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  institution?: string;
  phone?: string;
}

interface CSVExportProps {
  users: User[];
}

const CSVExport = ({ users }: CSVExportProps) => {
  const downloadCSV = (data: any[], filename: string, headers: string[]) => {
    try {
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header.toLowerCase().replace(' ', '_')] || '';
            // Escape commas and quotes in CSV
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${filename} downloaded successfully`);
    } catch (error) {
      toast.error('Error downloading CSV file');
    }
  };

  const exportUsers = () => {
    const headers = ['Full Name', 'Email', 'Institution', 'Phone', 'Created At'];
    const userData = users.map(user => ({
      'full_name': user.full_name || 'N/A',
      'email': user.email,
      'institution': user.institution || 'N/A',
      'phone': user.phone || 'N/A',
      'created_at': new Date(user.created_at).toLocaleDateString()
    }));
    
    downloadCSV(userData, `registered_users_${new Date().toISOString().split('T')[0]}.csv`, headers);
  };

  return (
    <div className="flex gap-4">
      <Button onClick={exportUsers} variant="outline">
        <Download className="h-4 w-4 mr-2" />
        Export Users CSV
      </Button>
    </div>
  );
};

export default CSVExport;
