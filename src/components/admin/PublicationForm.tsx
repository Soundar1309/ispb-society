
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PublicationFormData {
  title: string;
  authors: string;
  journal: string;
  volume: string;
  year: string;
  doi: string;
  is_featured: boolean;
}

interface PublicationFormProps {
  onAdd: (data: any) => void;
}

const PublicationForm = ({ onAdd }: PublicationFormProps) => {
  const [formData, setFormData] = useState<PublicationFormData>({
    title: '',
    authors: '',
    journal: '',
    volume: '',
    year: '',
    doi: '',
    is_featured: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      year: parseInt(formData.year) || null
    });
    setFormData({
      title: '',
      authors: '',
      journal: '',
      volume: '',
      year: '',
      doi: '',
      is_featured: false
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h4 className="font-semibold">Add New Publication</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <Input
          placeholder="Authors"
          value={formData.authors}
          onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
        />
        <Input
          placeholder="Journal"
          value={formData.journal}
          onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
        />
        <Input
          placeholder="Volume"
          value={formData.volume}
          onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
        />
        <Input
          placeholder="Year"
          type="number"
          value={formData.year}
          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
        />
        <Input
          placeholder="DOI"
          value={formData.doi}
          onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="featured"
          checked={formData.is_featured}
          onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
        />
        <label htmlFor="featured" className="text-sm">Featured Publication</label>
      </div>
      <Button type="submit">Add Publication</Button>
    </form>
  );
};

export default PublicationForm;
