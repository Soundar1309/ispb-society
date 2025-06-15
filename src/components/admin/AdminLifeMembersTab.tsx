
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LifeMember {
  id: string;
  name: string;
  designation: string | null;
  institution: string | null;
  specialization: string | null;
  member_since: string | null;
  image_url: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
}

interface AdminLifeMembersTabProps {
  lifeMembers: LifeMember[];
  onRefresh: () => void;
}

const AdminLifeMembersTab = ({ lifeMembers, onRefresh }: AdminLifeMembersTabProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<LifeMember | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<LifeMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    institution: '',
    specialization: '',
    member_since: '',
    image_url: '',
    email: '',
    phone: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      designation: '',
      institution: '',
      specialization: '',
      member_since: '',
      image_url: '',
      email: '',
      phone: ''
    });
  };

  const handleAddMember = () => {
    resetForm();
    setEditingMember(null);
    setShowForm(true);
  };

  const handleEditMember = (member: LifeMember) => {
    setFormData({
      name: member.name || '',
      designation: member.designation || '',
      institution: member.institution || '',
      specialization: member.specialization || '',
      member_since: member.member_since || '',
      image_url: member.image_url || '',
      email: member.email || '',
      phone: member.phone || ''
    });
    setEditingMember(member);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingMember) {
        // Update existing member
        const { error } = await supabase
          .from('life_members')
          .update(formData)
          .eq('id', editingMember.id);

        if (error) throw error;
        toast.success('Life member updated successfully');
      } else {
        // Add new member
        const { error } = await supabase
          .from('life_members')
          .insert([formData]);

        if (error) throw error;
        toast.success('Life member added successfully');
      }

      setShowForm(false);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Error saving life member:', error);
      toast.error('Error saving life member');
    }
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;

    try {
      const { error } = await supabase
        .from('life_members')
        .update({ is_active: false })
        .eq('id', memberToDelete.id);

      if (error) throw error;
      
      toast.success('Life member deactivated successfully');
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
      onRefresh();
    } catch (error) {
      console.error('Error deactivating life member:', error);
      toast.error('Error deactivating life member');
    }
  };

  const openDeleteDialog = (member: LifeMember) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Life Members Management</CardTitle>
              <CardDescription>Add, edit, and manage life members</CardDescription>
            </div>
            <Button onClick={handleAddMember}>
              <Plus className="h-4 w-4 mr-2" />
              Add Life Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Member Form */}
          {showForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{editingMember ? 'Edit Life Member' : 'Add New Life Member'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="designation">Designation</Label>
                      <Input
                        id="designation"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="institution">Institution</Label>
                      <Input
                        id="institution"
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="member_since">Member Since</Label>
                      <Input
                        id="member_since"
                        value={formData.member_since}
                        onChange={(e) => setFormData({ ...formData, member_since: e.target.value })}
                        placeholder="e.g., 2000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="image_url">Image URL</Label>
                      <Input
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      {editingMember ? 'Update' : 'Add'} Member
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Members List */}
          <div className="space-y-4">
            {lifeMembers.filter(member => member.is_active).map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <img
                    src={member.image_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-green-600 font-medium">{member.designation}</p>
                    <p className="text-gray-600">{member.institution}</p>
                    <div className="flex gap-2 mt-1">
                      {member.specialization && (
                        <Badge variant="outline" className="text-xs">
                          {member.specialization}
                        </Badge>
                      )}
                      {member.member_since && (
                        <Badge variant="outline" className="text-xs">
                          Since {member.member_since}
                        </Badge>
                      )}
                    </div>
                    {(member.email || member.phone) && (
                      <div className="text-sm text-gray-500 mt-1">
                        {member.email && <span className="mr-4">{member.email}</span>}
                        {member.phone && <span>{member.phone}</span>}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditMember(member)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDeleteDialog(member)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {lifeMembers.filter(member => member.is_active).length === 0 && (
              <p className="text-center text-gray-500 py-8">No active life members found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Life Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate {memberToDelete?.name}? 
              This will hide them from the public life members page.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Deactivate
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLifeMembersTab;
