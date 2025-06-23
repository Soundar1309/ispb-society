
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Download, Hash } from 'lucide-react';
import { toast } from 'sonner';
import MembershipForm from './MembershipForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MemberWithUserData {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  institution?: string;
  designation?: string;
  specialization?: string;
  phone?: string;
  membership_type: string;
  membership_status: string;
  payment_status: string;
  valid_from: string;
  valid_until: string;
  is_manual?: boolean;
  membership_id?: string;
  amount?: number;
  member_code?: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  full_name: string;
  email: string;
  institution?: string;
}

interface AdminMembersTabProps {
  members: MemberWithUserData[];
  userRoles: UserRole[];
  onAddMembership?: (membershipData: any) => void;
  onUpdateMembership?: (membershipId: string, membershipData: any) => void;
  onDeleteMembership?: (membershipId: string) => void;
}

const AdminMembersTab = ({ 
  members, 
  userRoles, 
  onAddMembership, 
  onUpdateMembership, 
  onDeleteMembership 
}: AdminMembersTabProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberWithUserData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<MemberWithUserData | null>(null);

  // Get users who don't have active memberships for the add form
  const availableUsers = userRoles.filter(user => 
    !members.some(member => member.user_id === user.user_id)
  ).map(user => ({
    user_id: user.user_id,
    full_name: user.full_name || 'Unknown User',
    email: user.email || 'No email'
  }));

  const exportMembersCSV = () => {
    try {
      const headers = [
        'Member Code',
        'Full Name',
        'Email', 
        'Institution',
        'Phone',
        'Membership Type',
        'Status',
        'Payment Status',
        'Valid From',
        'Valid Until',
        'Amount',
        'Is Manual'
      ];

      const csvData = members.map(member => [
        member.member_code || 'N/A',
        member.full_name || 'N/A',
        member.email || 'N/A',
        member.institution || 'N/A',
        member.phone || 'N/A',
        member.membership_type || 'N/A',
        member.membership_status || 'N/A',
        member.payment_status || 'N/A',
        member.valid_from || 'N/A',
        member.valid_until || 'N/A',
        member.amount?.toString() || '0',
        member.is_manual ? 'Yes' : 'No'
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `members_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Members CSV exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error exporting CSV file');
    }
  };

  const handleAddMembership = (membershipData: any) => {
    if (onAddMembership) {
      const newMembership = {
        ...membershipData,
        status: 'active',
        payment_status: 'manual',
        is_manual: true,
        valid_from: membershipData.valid_from.toISOString().split('T')[0],
        valid_until: membershipData.valid_until.toISOString().split('T')[0]
      };
      onAddMembership(newMembership);
      setShowForm(false);
    }
  };

  const handleEditMembership = (member: MemberWithUserData) => {
    setEditingMember(member);
  };

  const handleUpdateMembership = (membershipData: any) => {
    if (editingMember && onUpdateMembership) {
      const updatedMembership = {
        ...membershipData,
        valid_from: membershipData.valid_from.toISOString().split('T')[0],
        valid_until: membershipData.valid_until.toISOString().split('T')[0]
      };
      onUpdateMembership(editingMember.membership_id || editingMember.id, updatedMembership);
      setEditingMember(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (memberToDelete && onDeleteMembership) {
      onDeleteMembership(memberToDelete.membership_id || memberToDelete.id);
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  const openDeleteDialog = (member: MemberWithUserData) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Enrolled Members</CardTitle>
              <CardDescription>Manage members with active memberships and member codes</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportMembersCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={() => setShowForm(true)} disabled={availableUsers.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Add Membership
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-6">
              <MembershipForm
                availableUsers={availableUsers}
                onSubmit={handleAddMembership}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {editingMember && (
            <div className="mb-6">
              <MembershipForm
                initialData={{
                  user_id: editingMember.user_id,
                  membership_type: editingMember.membership_type,
                  valid_from: new Date(editingMember.valid_from),
                  valid_until: new Date(editingMember.valid_until),
                  amount: editingMember.amount || 0,
                  member_code: editingMember.member_code
                }}
                availableUsers={[{
                  user_id: editingMember.user_id,
                  full_name: editingMember.full_name,
                  email: editingMember.email
                }]}
                onSubmit={handleUpdateMembership}
                onCancel={() => setEditingMember(null)}
                isEditing={true}
              />
            </div>
          )}

          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {member.full_name ? member.full_name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{member.full_name}</h3>
                      {member.member_code && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-mono">
                          <Hash className="h-3 w-3" />
                          {member.member_code}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <p className="text-sm text-gray-500">{member.institution || 'No institution'}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="capitalize text-xs">
                        {member.membership_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Valid until: {member.valid_until ? new Date(member.valid_until).toLocaleDateString() : 'N/A'}
                      </Badge>
                      {member.is_manual && (
                        <Badge variant="secondary" className="text-xs">
                          Manual
                        </Badge>
                      )}
                      {member.membership_type === 'lifetime' && (
                        <Badge variant="default" className="text-xs bg-yellow-100 text-yellow-800">
                          Lifetime
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {member.role}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditMembership(member)}
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
            {members.length === 0 && (
              <p className="text-center text-gray-500 py-8">No enrolled members found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Membership</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the membership for {memberToDelete?.full_name}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMembersTab;
