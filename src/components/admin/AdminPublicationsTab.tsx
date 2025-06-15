
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PublicationForm from './PublicationForm';

interface Publication {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  is_featured: boolean;
}

interface AdminPublicationsTabProps {
  publications: Publication[];
  onAddPublication: (data: any) => void;
}

const AdminPublicationsTab = ({ publications, onAddPublication }: AdminPublicationsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Publications Management</CardTitle>
        <CardDescription>Add and manage publications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <PublicationForm onAdd={onAddPublication} />
          <div className="space-y-4">
            {publications.map((publication: Publication) => (
              <div key={publication.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{publication.title}</h3>
                <p className="text-sm text-gray-600">{publication.authors}</p>
                <p className="text-sm text-gray-500">{publication.journal} - {publication.year}</p>
                {publication.is_featured && <Badge>Featured</Badge>}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPublicationsTab;
