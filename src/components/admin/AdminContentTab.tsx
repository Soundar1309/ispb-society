
import { useState, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';

// Memoized Quill to prevent re-render on unrelated form updates (e.g., Title/Year typing)
const MemoQuill = memo(
  ({ value, onChange }: { value: string; onChange: (content: string) => void }) => (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      className="bg-background"
      modules={{
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          ['link'],
          ['clean']
        ]
      }}
    />
  ),
  (prev, next) => prev.value === next.value
);

interface ContentFormState {
  title: string;
  content: string;
  year: number | null;
}

interface ContentFormProps {
  formData: ContentFormState;
  editingItem: ContentItem | null;
  activeTab: 'mandates' | 'activities';
  onInputChange: (field: string, value: string | number | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

function ContentForm({ formData, editingItem, activeTab, onInputChange, onSubmit }: ContentFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        placeholder="Title (optional)"
        value={formData.title}
        onChange={(e) => onInputChange('title', e.target.value)}
      />
      <Input
        type="number"
        placeholder="Year (optional)"
        value={formData.year ?? ''}
        onChange={(e) => onInputChange('year', e.target.value ? parseInt(e.target.value) : null)}
      />
      <div className="space-y-2">
        <label className="text-sm font-medium">Content</label>
        <MemoQuill
          value={formData.content}
          onChange={(content) => onInputChange('content', content)}
        />
      </div>
      <Button type="submit">
        {editingItem ? 'Update' : 'Add'} {activeTab === 'mandates' ? 'Mandate' : 'Activity'}
      </Button>
    </form>
  );
}

interface ContentItem {
  id: string;
  title: string | null;
  content: string;
  type: 'mandate' | 'activity';
  order: number;
  year?: number | null;
  is_active: boolean;
}

// Payload used when creating/updating content items
type ContentUpsert = Pick<ContentItem, 'title' | 'content' | 'year' | 'is_active'>;

interface AdminContentTabProps {
  mandates: ContentItem[];
  activities: ContentItem[];
  onAddContent: (data: ContentUpsert, type: 'mandate' | 'activity') => void;
  onUpdateContent: (id: string, data: ContentUpsert, type: 'mandate' | 'activity') => void;
  onDeleteContent: (id: string, type: 'mandate' | 'activity') => void;
}

const AdminContentTab = ({
  mandates,
  activities,
  onAddContent,
  onUpdateContent,
  onDeleteContent
}: AdminContentTabProps) => {
  const [activeTab, setActiveTab] = useState<'mandates' | 'activities'>('mandates');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    year: null as number | null
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      year: null
    });
  };

  const handleInputChange = (field: string, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const contentData = {
      ...formData,
      is_active: true
    };

    if (editingItem) {
      onUpdateContent(editingItem.id, contentData, editingItem.type);
      setEditingItem(null);
    } else {
      onAddContent(contentData, activeTab === 'mandates' ? 'mandate' : 'activity');
      setIsAddDialogOpen(false);
    }
    resetForm();
  };

  const handleEdit = (item: ContentItem, type: 'mandate' | 'activity') => {
    // Ensure the editing item has a valid type from context, since DB rows may not include it
    setEditingItem({ ...item, type });
    setFormData({
      title: item.title || '',
      content: item.content,
      year: item.year || null
    });
  };

  const handleDelete = (id: string, type: 'mandate' | 'activity') => {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      onDeleteContent(id, type);
    }
  };



  const ContentTable = ({ items, type }: { items: ContentItem[], type: 'mandate' | 'activity' }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Year</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Content Preview</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items
          .sort((a, b) => (b.year || 0) - (a.year || 0))
          .map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.year || '-'}</TableCell>
              <TableCell className="font-medium">{item.title || '-'}</TableCell>
              <TableCell className="max-w-md truncate">
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.content.substring(0, 100)) + '...' }} />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(item, type)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(item.id, type)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>Manage mandates and activities content</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setActiveTab(activeTab)}>
                <Plus className="h-4 w-4 mr-2" />
                Add {activeTab === 'mandates' ? 'Mandate' : 'Activity'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New {activeTab === 'mandates' ? 'Mandate' : 'Activity'}</DialogTitle>
                <DialogDescription>Create new content item</DialogDescription>
              </DialogHeader>
              <ContentForm
                formData={formData}
                editingItem={editingItem}
                activeTab={activeTab}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'mandates' | 'activities')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mandates">Mandates</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>
          <TabsContent value="mandates">
            <ContentTable items={mandates} type="mandate" />
          </TabsContent>
          <TabsContent value="activities">
            <ContentTable items={activities} type="activity" />
          </TabsContent>
        </Tabs>

        {editingItem && (
          <Dialog open={!!editingItem} onOpenChange={(open) => { if (!open) setEditingItem(null); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit {editingItem.type === 'mandate' ? 'Mandate' : 'Activity'}</DialogTitle>
                <DialogDescription>Update content details</DialogDescription>
              </DialogHeader>
              <ContentForm
                formData={formData}
                editingItem={editingItem}
                activeTab={activeTab}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminContentTab;
