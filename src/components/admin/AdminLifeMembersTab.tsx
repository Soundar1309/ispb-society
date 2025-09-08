
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import BulkUploadDialog from './BulkUploadDialog';

interface LifeMember {
  id: string;
  life_member_no: string;
  name: string;
  address: string;
  occupation: string;
  date_of_enrollment: string;
  email: string;
  mobile: string;
  image_url: string;
  is_active: boolean;
}

interface AdminLifeMembersTabProps {
  lifeMembers: LifeMember[];
  onRefresh: () => void;
}

const AdminLifeMembersTab = ({ lifeMembers, onRefresh }: AdminLifeMembersTabProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<LifeMember | null>(null);
  const [formData, setFormData] = useState({
    life_member_no: '',
    name: '',
    address: '',
    occupation: '',
    date_of_enrollment: '',
    email: '',
    mobile: '',
    image_url: ''
  });

  const resetForm = () => {
    setFormData({
      life_member_no: '',
      name: '',
      address: '',
      occupation: '',
      date_of_enrollment: '',
      email: '',
      mobile: '',
      image_url: ''
    });
    setEditingMember(null);
  };

  const handleEdit = (member: LifeMember) => {
    setEditingMember(member);
    setFormData({
      life_member_no: member.life_member_no || '',
      name: member.name || '',
      address: member.address || '',
      occupation: member.occupation || '',
      date_of_enrollment: member.date_of_enrollment || '',
      email: member.email || '',
      mobile: member.mobile || '',
      image_url: member.image_url || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingMember) {
        const { error } = await supabase
          .from('life_members')
          .update(formData)
          .eq('id', editingMember.id);
        
        if (error) throw error;
        toast.success('Life member updated successfully');
      } else {
        const { error } = await supabase
          .from('life_members')
          .insert(formData);
        
        if (error) throw error;
        toast.success('Life member added successfully');
      }
      
      setIsDialogOpen(false);
      resetForm();
      onRefresh();
    } catch (error: any) {
      console.error('Error saving life member:', error);
      toast.error(error.message || 'Error saving life member');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this life member?')) return;
    
    try {
      const { error } = await supabase
        .from('life_members')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Life member deleted successfully');
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting life member:', error);
      toast.error(error.message || 'Error deleting life member');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('life_members')
        .update({ is_active: !isActive })
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`Life member ${!isActive ? 'activated' : 'deactivated'} successfully`);
      onRefresh();
    } catch (error: any) {
      console.error('Error updating life member:', error);
      toast.error(error.message || 'Error updating life member');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Life Members Management</h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)} className="w-full sm:w-auto">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Life Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMember ? 'Edit Life Member' : 'Add New Life Member'}
                </DialogTitle>
                <DialogDescription>
                  {editingMember ? 'Update life member details' : 'Add a new life member'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="life_member_no">Life Member Number</Label>
                    <Input
                      id="life_member_no"
                      value={formData.life_member_no}
                      onChange={(e) => setFormData({ ...formData, life_member_no: e.target.value })}
                      placeholder="LM-001"
                    />
                  </div>
                  
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
                    <Label htmlFor="occupation">Occupation *</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="date_of_enrollment">Date of Enrollment</Label>
                    <Input
                      id="date_of_enrollment"
                      type="date"
                      value={formData.date_of_enrollment}
                      onChange={(e) => setFormData({ ...formData, date_of_enrollment: e.target.value })}
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
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input
                      id="mobile"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">
                    {editingMember ? 'Update' : 'Add'} Life Member
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <BulkUploadDialog
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onSuccess={onRefresh}
      />

      <div className="grid gap-4">
        {lifeMembers.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  {member.image_url && (
                    <img
                      src={member.image_url}
                      alt={member.name}
                      className="w-16 h-16 rounded-full object-cover mx-auto sm:mx-0"
                    />
                  )}
                  <div className="text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      {member.life_member_no && (
                        <Badge variant="outline" className="text-xs">
                          {member.life_member_no}
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{member.occupation}</CardDescription>
                    {member.address && (
                      <p className="text-sm text-gray-600">{member.address}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-center lg:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(member)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(member.id, member.is_active)}
                    className={member.is_active ? '' : 'text-red-600'}
                  >
                    {member.is_active ? 'Active' : 'Hidden'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 space-y-1">
                {member.date_of_enrollment && <p><strong>Date of Enrollment:</strong> {new Date(member.date_of_enrollment).toLocaleDateString()}</p>}
                {member.email && <p><strong>Email:</strong> {member.email}</p>}
                {member.mobile && <p><strong>Mobile:</strong> {member.mobile}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminLifeMembersTab;
