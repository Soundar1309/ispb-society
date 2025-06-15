
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import PublicationForm from './PublicationForm';

interface Publication {
  id: string;
  title: string;
  authors: string;
  journal: string;
  volume?: string;
  year: number;
  doi?: string;
  is_featured: boolean;
}

interface AdminPublicationsTabProps {
  publications: Publication[];
  onAddPublication: (data: any) => void;
  onUpdatePublication?: (id: string, data: any) => void;
  onDeletePublication?: (id: string) => void;
}

const AdminPublicationsTab = ({ 
  publications, 
  onAddPublication, 
  onUpdatePublication, 
  onDeletePublication 
}: AdminPublicationsTabProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const handleEdit = (publication: Publication) => {
    setEditingId(publication.id);
    setEditData(publication);
  };

  const handleSaveEdit = () => {
    if (onUpdatePublication && editingId) {
      onUpdatePublication(editingId, editData);
      setEditingId(null);
      setEditData({});
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this publication?')) {
      if (onDeletePublication) {
        onDeletePublication(id);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publications Management</CardTitle>
        <CardDescription>Add, edit, and manage publications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <PublicationForm onAdd={onAddPublication} />
          
          <div className="space-y-4">
            {publications.map((publication: Publication) => (
              <div key={publication.id} className="p-4 border rounded-lg">
                {editingId === publication.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-title">Title</Label>
                        <Input
                          id="edit-title"
                          value={editData.title || ''}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-authors">Authors</Label>
                        <Input
                          id="edit-authors"
                          value={editData.authors || ''}
                          onChange={(e) => setEditData({ ...editData, authors: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-journal">Journal</Label>
                        <Input
                          id="edit-journal"
                          value={editData.journal || ''}
                          onChange={(e) => setEditData({ ...editData, journal: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-volume">Volume</Label>
                        <Input
                          id="edit-volume"
                          value={editData.volume || ''}
                          onChange={(e) => setEditData({ ...editData, volume: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-year">Year</Label>
                        <Input
                          id="edit-year"
                          type="number"
                          value={editData.year || ''}
                          onChange={(e) => setEditData({ ...editData, year: parseInt(e.target.value) || null })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-doi">DOI</Label>
                        <Input
                          id="edit-doi"
                          value={editData.doi || ''}
                          onChange={(e) => setEditData({ ...editData, doi: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="edit-featured"
                        checked={editData.is_featured || false}
                        onChange={(e) => setEditData({ ...editData, is_featured: e.target.checked })}
                      />
                      <Label htmlFor="edit-featured">Featured Publication</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} size="sm">Save</Button>
                      <Button onClick={handleCancelEdit} variant="outline" size="sm">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{publication.title}</h3>
                      <p className="text-sm text-gray-600">{publication.authors}</p>
                      <p className="text-sm text-gray-500">
                        {publication.journal}
                        {publication.volume && ` - Vol. ${publication.volume}`}
                        {publication.year && ` - ${publication.year}`}
                      </p>
                      {publication.doi && (
                        <p className="text-sm text-blue-600">DOI: {publication.doi}</p>
                      )}
                      {publication.is_featured && <Badge className="mt-2">Featured</Badge>}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(publication)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(publication.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPublicationsTab;
