
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  content: string;
  type: 'mandate' | 'activity';
  order: number;
  is_active: boolean;
}

interface AdminContentTabProps {
  mandates: ContentItem[];
  activities: ContentItem[];
  onAddContent: (data: any, type: 'mandate' | 'activity') => void;
  onUpdateContent: (id: string, data: any, type: 'mandate' | 'activity') => void;
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
    order: 1
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      order: 1
    });
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

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      order: item.order
    });
  };

  const handleDelete = (id: string, type: 'mandate' | 'activity') => {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      onDeleteContent(id, type);
    }
  };

  const ContentForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
      <Textarea
        placeholder="Content"
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        rows={6}
        required
      />
      <Input
        type="number"
        placeholder="Display Order"
        value={formData.order}
        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
        min="1"
      />
      <Button type="submit">
        {editingItem ? 'Update' : 'Add'} {activeTab === 'mandates' ? 'Mandate' : 'Activity'}
      </Button>
    </form>
  );

  const ContentTable = ({ items, type }: { items: ContentItem[], type: 'mandate' | 'activity' }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Content Preview</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items
          .sort((a, b) => a.order - b.order)
          .map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.order}</TableCell>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell className="max-w-md truncate">{item.content}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(item)}
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
              <ContentForm />
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
          <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit {editingItem.type === 'mandate' ? 'Mandate' : 'Activity'}</DialogTitle>
                <DialogDescription>Update content details</DialogDescription>
              </DialogHeader>
              <ContentForm />
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminContentTab;
