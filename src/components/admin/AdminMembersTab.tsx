
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  full_name: string;
  email: string;
  institution?: string;
}

interface AdminMembersTabProps {
  members: UserRole[];
  userRoles: UserRole[];
  onAddMember?: (memberData: any) => void;
}

const AdminMembersTab = ({ members, userRoles, onAddMember }: AdminMembersTabProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    full_name: '',
    email: '',
    institution: '',
    phone: '',
    designation: '',
    specialization: '',
    role: 'member'
  });

  // Filter to show only users with active memberships
  const enrolledMembers = members.filter(member => {
    // This would need to be updated to check actual membership status
    // For now, showing all members as enrolled
    return true;
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddMember) {
      onAddMember(newMember);
      setNewMember({
        full_name: '',
        email: '',
        institution: '',
        phone: '',
        designation: '',
        specialization: '',
        role: 'member'
      });
      setShowAddForm(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Enrolled Members</CardTitle>
            <CardDescription>View and manage members with active memberships</CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Member</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={newMember.full_name}
                      onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="institution">Institution</Label>
                    <Input
                      id="institution"
                      value={newMember.institution}
                      onChange={(e) => setNewMember({ ...newMember, institution: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newMember.phone}
                      onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={newMember.designation}
                      onChange={(e) => setNewMember({ ...newMember, designation: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={newMember.specialization}
                      onChange={(e) => setNewMember({ ...newMember, specialization: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={newMember.role} onValueChange={(value) => setNewMember({ ...newMember, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Add Member</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {enrolledMembers.map((member: UserRole) => (
            <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {member.full_name ? member.full_name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">{member.full_name || 'No Name'}</h3>
                  <p className="text-sm text-gray-600">{member.email}</p>
                  <p className="text-sm text-gray-500">{member.institution || 'No institution'}</p>
                </div>
              </div>
              <Badge variant="outline" className="capitalize">
                {member.role}
              </Badge>
            </div>
          ))}
          {enrolledMembers.length === 0 && (
            <p className="text-center text-gray-500 py-8">No enrolled members found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminMembersTab;
