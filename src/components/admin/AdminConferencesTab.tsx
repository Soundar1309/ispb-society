import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Conference {
  id: string;
  title: string;
  description: string;
  venue: string;
  date_from: string;
  date_to: string;
  registration_fee: number;
  early_bird_fee: number;
  early_bird_deadline: string;
  is_active: boolean;
}

interface AdminConferencesTabProps {
  conferences: Conference[];
  onAddConference: (data: any) => void;
  onUpdateConference: (id: string, data: any) => void;
  onDeleteConference: (id: string) => void;
}

const AdminConferencesTab = ({ 
  conferences, 
  onAddConference, 
  onUpdateConference, 
  onDeleteConference 
}: AdminConferencesTabProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingConference, setEditingConference] = useState<Conference | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    date_from: '',
    date_to: '',
    registration_fee: '',
    early_bird_fee: '',
    early_bird_deadline: ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      venue: '',
      date_from: '',
      date_to: '',
      registration_fee: '',
      early_bird_fee: '',
      early_bird_deadline: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const conferenceData = {
      ...formData,
      registration_fee: parseFloat(formData.registration_fee),
      early_bird_fee: parseFloat(formData.early_bird_fee),
      is_active: true
    };

    if (editingConference) {
      onUpdateConference(editingConference.id, conferenceData);
      setEditingConference(null);
    } else {
      onAddConference(conferenceData);
      setIsAddDialogOpen(false);
    }
    resetForm();
  };

  const handleEdit = (conference: Conference) => {
    setEditingConference(conference);
    setFormData({
      title: conference.title,
      description: conference.description || '',
      venue: conference.venue || '',
      date_from: conference.date_from || '',
      date_to: conference.date_to || '',
      registration_fee: conference.registration_fee?.toString() || '',
      early_bird_fee: conference.early_bird_fee?.toString() || '',
      early_bird_deadline: conference.early_bird_deadline || ''
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this conference?')) {
      onDeleteConference(id);
    }
  };

  const ConferenceForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Conference Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
      <Textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      <Input
        placeholder="Venue"
        value={formData.venue}
        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">From Date</label>
          <Input
            type="date"
            value={formData.date_from}
            onChange={(e) => setFormData({ ...formData, date_from: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">To Date</label>
          <Input
            type="date"
            value={formData.date_to}
            onChange={(e) => setFormData({ ...formData, date_to: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Registration Fee</label>
          <Input
            type="number"
            placeholder="0.00"
            value={formData.registration_fee}
            onChange={(e) => setFormData({ ...formData, registration_fee: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Early Bird Fee</label>
          <Input
            type="number"
            placeholder="0.00"
            value={formData.early_bird_fee}
            onChange={(e) => setFormData({ ...formData, early_bird_fee: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Early Bird Deadline</label>
        <Input
          type="date"
          value={formData.early_bird_deadline}
          onChange={(e) => setFormData({ ...formData, early_bird_deadline: e.target.value })}
        />
      </div>
      <Button type="submit">
        {editingConference ? 'Update Conference' : 'Add Conference'}
      </Button>
    </form>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Conference Management</CardTitle>
            <CardDescription>Add, edit, and manage conferences</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Conference
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Conference</DialogTitle>
                <DialogDescription>Create a new conference event</DialogDescription>
              </DialogHeader>
              <ConferenceForm />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {conferences.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No conferences found. Add your first conference!</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Fees</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conferences.map((conference) => (
                <TableRow key={conference.id}>
                  <TableCell className="font-medium">{conference.title}</TableCell>
                  <TableCell>{conference.venue}</TableCell>
                  <TableCell>
                    {conference.date_from} to {conference.date_to}
                  </TableCell>
                  <TableCell>
                    Regular: ₹{conference.registration_fee}<br />
                    Early Bird: ₹{conference.early_bird_fee}
                  </TableCell>
                  <TableCell>
                    <Badge variant={conference.is_active ? "default" : "secondary"}>
                      {conference.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(conference)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(conference.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {editingConference && (
          <Dialog open={!!editingConference} onOpenChange={() => setEditingConference(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Conference</DialogTitle>
                <DialogDescription>Update conference details</DialogDescription>
              </DialogHeader>
              <ConferenceForm />
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminConferencesTab;
