import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Calendar, ExternalLink } from 'lucide-react';
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
  link?: string;
  deadline?: string;
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
    early_bird_deadline: '',
    link: '',
    deadline: ''
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
      early_bird_deadline: '',
      link: '',
      deadline: ''
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
      early_bird_deadline: conference.early_bird_deadline || '',
      link: conference.link || '',
      deadline: conference.deadline || ''
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this conference?')) {
      onDeleteConference(id);
    }
  };

  const ConferenceForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">Conference Title *</label>
          <Input
            placeholder="Conference Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            placeholder="Conference Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Venue</label>
          <Input
            placeholder="Conference Venue"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Conference Link</label>
          <Input
            type="url"
            placeholder="https://conference-website.com"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Conference Start Date</label>
          <Input
            type="date"
            value={formData.date_from}
            onChange={(e) => setFormData({ ...formData, date_from: e.target.value })}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Conference End Date</label>
          <Input
            type="date"
            value={formData.date_to}
            onChange={(e) => setFormData({ ...formData, date_to: e.target.value })}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Registration Deadline</label>
          <Input
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Early Bird Deadline</label>
          <Input
            type="date"
            value={formData.early_bird_deadline}
            onChange={(e) => setFormData({ ...formData, early_bird_deadline: e.target.value })}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Registration Fee (₹)</label>
          <Input
            type="number"
            placeholder="5000"
            value={formData.registration_fee}
            onChange={(e) => setFormData({ ...formData, registration_fee: e.target.value })}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Early Bird Fee (₹)</label>
          <Input
            type="number"
            placeholder="4000"
            value={formData.early_bird_fee}
            onChange={(e) => setFormData({ ...formData, early_bird_fee: e.target.value })}
          />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            if (editingConference) {
              setEditingConference(null);
            } else {
              setIsAddDialogOpen(false);
            }
            resetForm();
          }}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          {editingConference ? 'Update Conference' : 'Add Conference'}
        </Button>
      </div>
    </form>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Conference Management</CardTitle>
            <CardDescription>Add, edit, and manage conferences</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Conference
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Title</TableHead>
                  <TableHead className="min-w-[150px]">Venue</TableHead>
                  <TableHead className="min-w-[180px]">Dates</TableHead>
                  <TableHead className="min-w-[120px]">Fees</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conferences.map((conference) => (
                  <TableRow key={conference.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-1">
                        <span>{conference.title}</span>
                        {conference.link && (
                          <a 
                            href={conference.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Link
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{conference.venue}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{conference.date_from} to {conference.date_to}</div>
                        {conference.deadline && (
                          <div className="text-red-600 text-xs">Deadline: {conference.deadline}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Regular: ₹{conference.registration_fee}</div>
                        <div>Early Bird: ₹{conference.early_bird_fee}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={conference.is_active ? "default" : "secondary"}>
                        {conference.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(conference)}
                          className="w-full sm:w-auto"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(conference.id)}
                          className="w-full sm:w-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {editingConference && (
          <Dialog open={!!editingConference} onOpenChange={() => setEditingConference(null)}>
            <DialogContent className="max-w-4xl">
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
