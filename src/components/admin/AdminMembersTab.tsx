
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
}

const AdminMembersTab = ({ members, userRoles }: AdminMembersTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registered Users Overview</CardTitle>
        <CardDescription>View and manage all registered users from the user_roles table</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member: UserRole) => (
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
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminMembersTab;
