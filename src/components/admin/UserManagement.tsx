
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, UserCheck, UserX, Calendar, Mail, Download, Users } from 'lucide-react';
import { toast } from 'sonner';

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  institution?: string | null;
  phone?: string | null;
}

interface UserManagementProps {
  users: any[];
  userRoles: UserRole[];
  onChangeUserRole: (userId: string, newRole: string) => Promise<void>;
}

const UserManagement = ({ users, userRoles, onChangeUserRole }: UserManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Use userRoles for the user management table instead of users
  const displayUsers = userRoles || [];

  const downloadCSV = (data: any[], filename: string, headers: string[]) => {
    try {
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header.toLowerCase().replace(' ', '_')] || '';
            // Escape commas and quotes in CSV
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${filename} downloaded successfully`);
    } catch (error) {
      toast.error('Error downloading CSV file');
    }
  };

  const exportUsers = () => {
    const headers = ['Full Name', 'Email', 'Institution', 'Phone', 'Role', 'Created At'];
    const userData = filteredAndSortedUsers.map(user => ({
      'full_name': user.full_name || 'N/A',
      'email': user.email,
      'institution': user.institution || 'N/A',
      'phone': user.phone || 'N/A',
      'role': user.role,
      'created_at': new Date(user.created_at).toLocaleDateString()
    }));
    
    downloadCSV(userData, `users_export_${new Date().toISOString().split('T')[0]}.csv`, headers);
  };

  const filteredAndSortedUsers = useMemo(() => {
    if (!displayUsers || displayUsers.length === 0) {
      return [];
    }

    let filtered = displayUsers.filter(user => {
      const matchesSearch = searchTerm === '' || 
                           user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.institution?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.full_name || '';
          bValue = b.full_name || '';
          break;
        case 'email':
          aValue = a.email || '';
          bValue = b.email || '';
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [displayUsers, searchTerm, roleFilter, sortBy, sortOrder]);

  const stats = useMemo(() => {
    if (!displayUsers) return { adminCount: 0, memberCount: 0, recentUsers: 0, totalUsers: 0 };
    
    const adminCount = displayUsers.filter(user => user.role === 'admin').length;
    const memberCount = displayUsers.filter(user => user.role === 'member').length;
    const recentUsers = displayUsers.filter(user => {
      const createdDate = new Date(user.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate > weekAgo;
    }).length;

    return { adminCount, memberCount, recentUsers, totalUsers: displayUsers.length };
  }, [displayUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await onChangeUserRole(userId, newRole);
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Show loading state if no users
  if (!displayUsers) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>Loading users...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Export Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage user roles and export user data ({stats.totalUsers} total users)
          </p>
        </div>
        <Button onClick={exportUsers} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Users CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminCount}</div>
            <p className="text-xs text-muted-foreground">Admin users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.memberCount}</div>
            <p className="text-xs text-muted-foreground">Regular members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentUsers}</div>
            <p className="text-xs text-muted-foreground">Recent signups</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>
            Search, filter, and manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or institution..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Administrators</SelectItem>
                <SelectItem value="member">Members</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Summary */}
          {searchTerm || roleFilter !== 'all' ? (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Showing {filteredAndSortedUsers.length} of {stats.totalUsers} users
                {searchTerm && <span> matching "{searchTerm}"</span>}
                {roleFilter !== 'all' && <span> with role "{roleFilter}"</span>}
              </p>
            </div>
          ) : null}

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center gap-1">
                      Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </div>
                  </TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center gap-1">
                      Role {sortBy === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </div>
                  </TableHead>
                  <TableHead>Change Role</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-1">
                      Member Since {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedUsers.length > 0 ? (
                  filteredAndSortedUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{user.full_name || 'No Name'}</div>
                            {user.phone && (
                              <div className="text-xs text-muted-foreground">{user.phone}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.email || 'No email'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.institution || <span className="text-muted-foreground">Not specified</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.role === 'admin' ? 'destructive' : 'default'}
                          className="capitalize"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={user.role} 
                          onValueChange={(value) => handleRoleChange(user.user_id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Change role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="text-sm">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'Unknown'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">No users found</p>
                          <p className="text-sm text-muted-foreground">
                            {displayUsers.length === 0 
                              ? 'No users found in the system.' 
                              : 'No users match your current filters.'
                            }
                          </p>
                        </div>
                        {(searchTerm || roleFilter !== 'all') && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSearchTerm('');
                              setRoleFilter('all');
                            }}
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
