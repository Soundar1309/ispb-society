
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
  fee: number;
  early_bird_fee: number;
  early_bird_deadline: string;
  is_active: boolean;
  link?: string;
  deadline?: string;
}

interface AdminConferencesTabProps {
  conferences: Conference[];
  onRefresh: () => void;
}

const AdminConferencesTab = ({ conferences, onRefresh }: AdminConferencesTabProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingConference, setEditingConference] = useState<Conference | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    date_from: '',
    date_to: '',
    fee: '',
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
      fee: '',
      early_bird_fee: '',
      early_bird_deadline: '',
      link: '',
      deadline: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const conferenceData = {
        ...formData,
        fee: formData.fee ? parseFloat(formData.fee) : null,
        early_bird_fee: formData.early_bird_fee ? parseFloat(formData.early_bird_fee) : null,
        is_active: true
      };

      if (editingConference) {
        const { error } = await supabase
          .from('conferences')
          .update(conferenceData)
          .eq('id', editingConference.id);

        if (error) throw error;
        toast.success('Conference updated successfully');
        setEditingConference(null);
      } else {
        const { error } = await supabase
          .from('conferences')
          .insert(conferenceData);

        if (error) throw error;
        toast.success('Conference added successfully');
        setIsAddDialogOpen(false);
      }

      resetForm();
      onRefresh();
    } catch (error: any) {
      console.error('Error saving conference:', error);
      toast.error('Error saving conference: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (conference: Conference) => {
    setEditingConference(conference);
    setFormData({
      title: conference.title,
      description: conference.description || '',
      venue: conference.venue || '',
      date_from: conference.date_from || '',
      date_to: conference.date_to || '',
      fee: conference.fee?.toString() || '',
      early_bird_fee: conference.early_bird_fee?.toString() || '',
      early_bird_deadline: conference.early_bird_deadline || '',
      link: conference.link || '',
      deadline: conference.deadline || ''
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this conference?')) return;

    try {
      const { error } = await supabase
        .from('conferences')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Conference deleted successfully');
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting conference:', error);
      toast.error('Error deleting conference: ' + error.message);
    }
  };

  const ConferenceForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Basic Information Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Basic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Conference Title *</label>
            <Input
              placeholder="e.g., 16th ISPB International Congress"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full"
            />
          </div>
          
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Conference Description</label>
            <Textarea
              placeholder="Detailed description of the conference, its objectives, and key highlights..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Venue</label>
            <Input
              placeholder="e.g., India International Centre, New Delhi"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Conference Website (Optional)</label>
            <Input
              type="url"
              placeholder="https://conference.ispb.org.in"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Dates & Deadlines Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Dates & Deadlines</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Conference Start Date</label>
            <Input
              type="date"
              value={formData.date_from}
              onChange={(e) => setFormData({ ...formData, date_from: e.target.value })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Conference End Date</label>
            <Input
              type="date"
              value={formData.date_to}
              onChange={(e) => setFormData({ ...formData, date_to: e.target.value })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Registration Deadline</label>
            <Input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Last date for conference registration</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Early Bird Deadline</label>
            <Input
              type="date"
              value={formData.early_bird_deadline}
              onChange={(e) => setFormData({ ...formData, early_bird_deadline: e.target.value })}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Deadline for early bird pricing</p>
          </div>
        </div>
      </div>
      
      {/* Fee Structure Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Fee Structure</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Regular Registration Fee (₹)</label>
            <Input
              type="number"
              placeholder="5000"
              value={formData.fee}
              onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Standard registration fee</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Early Bird Fee (₹)</label>
            <Input
              type="number"
              placeholder="4000"
              value={formData.early_bird_fee}
              onChange={(e) => setFormData({ ...formData, early_bird_fee: e.target.value })}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Discounted fee for early registrations</p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
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
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : editingConference ? 'Update Conference' : 'Add Conference'}
        </Button>
      </div>
    </form>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl text-gray-900">Conference Management</CardTitle>
            <CardDescription>Manage ISPB conferences, symposiums, and events</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add New Conference
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">Add New Conference</DialogTitle>
                <DialogDescription>Create a new ISPB conference or event with complete details</DialogDescription>
              </DialogHeader>
              <ConferenceForm />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {conferences.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Conferences Found</h3>
            <p className="text-gray-500 mb-4">Start by adding your first ISPB conference or event</p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Conference
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="min-w-[250px] font-semibold">Conference Details</TableHead>
                  <TableHead className="min-w-[150px] font-semibold">Venue & Dates</TableHead>
                  <TableHead className="min-w-[140px] font-semibold">Registration Info</TableHead>
                  <TableHead className="min-w-[100px] font-semibold">Status</TableHead>
                  <TableHead className="min-w-[120px] font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conferences.map((conference) => (
                  <TableRow key={conference.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="space-y-2">
                        <div className="font-semibold text-gray-900">{conference.title}</div>
                        {conference.description && (
                          <div className="text-sm text-gray-600 line-clamp-2">
                            {conference.description.length > 100 
                              ? `${conference.description.substring(0, 100)}...`
                              : conference.description
                            }
                          </div>
                        )}
                        {conference.link && (
                          <a 
                            href={conference.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Conference Website
                          </a>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        {conference.venue && (
                          <div className="font-medium text-gray-900">{conference.venue}</div>
                        )}
                        <div className="text-sm text-gray-600">
                          {conference.date_from && conference.date_to ? (
                            <div>
                              <div>📅 {new Date(conference.date_from).toLocaleDateString()} - {new Date(conference.date_to).toLocaleDateString()}</div>
                            </div>
                          ) : (
                            <div className="text-gray-400">Dates not set</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {conference.fee && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Regular:</span>
                            <span className="text-green-600 font-semibold">₹{conference.fee}</span>
                          </div>
                        )}
                        {conference.early_bird_fee && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Early Bird:</span>
                            <span className="text-orange-600 font-semibold">₹{conference.early_bird_fee}</span>
                          </div>
                        )}
                        {conference.deadline && (
                          <div className="text-red-600 text-xs font-medium">
                            ⏰ Deadline: {new Date(conference.deadline).toLocaleDateString()}
                          </div>
                        )}
                        {conference.early_bird_deadline && (
                          <div className="text-orange-600 text-xs">
                            ⚡ Early Bird: {new Date(conference.early_bird_deadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge 
                        variant={conference.is_active ? "default" : "secondary"}
                        className={conference.is_active ? "bg-green-100 text-green-800" : ""}
                      >
                        {conference.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(conference)}
                          className="hover:bg-blue-50 hover:border-blue-300"
                          title="Edit Conference"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(conference.id)}
                          className="hover:bg-red-50 hover:border-red-300 text-red-600"
                          title="Delete Conference"
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
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">Edit Conference</DialogTitle>
                <DialogDescription>Update conference details and information</DialogDescription>
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
