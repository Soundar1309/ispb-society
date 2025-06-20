import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Users, Award, Building, GraduationCap } from 'lucide-react';

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
}

interface UserMembership {
  id: string;
  membership_type: string;
  status: string;
  payment_status: string;
  valid_from: string;
  valid_until: string;
  amount: number;
  is_manual: boolean;
}

const LifeMembers = () => {
  const { user } = useAuth();
  const [lifeMembers, setLifeMembers] = useState<LifeMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<LifeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState('all');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [userMembership, setUserMembership] = useState<UserMembership | null>(null);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const membersPerPage = 6;

  useEffect(() => {
    fetchLifeMembers();
    if (user) {
      fetchUserMembership();
    }
  }, [user]);

  useEffect(() => {
    filterMembers();
  }, [lifeMembers, searchTerm, institutionFilter, specializationFilter]);

  const fetchLifeMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('life_members')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching life members:', error);
        toast.error('Failed to load life members');
      } else {
        setLifeMembers(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMembership = async () => {
    if (!user?.id) return;
    
    setMembershipLoading(true);
    try {
      console.log('Fetching membership for user:', user.id);
      
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching user membership:', error);
        toast.error('Failed to load membership status');
      } else {
        console.log('Membership data:', data);
        if (data && data.length > 0) {
          setUserMembership(data[0]);
        } else {
          setUserMembership(null);
        }
      }
    } catch (error) {
      console.error('Error fetching membership:', error);
      toast.error('An unexpected error occurred while fetching membership');
    } finally {
      setMembershipLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = lifeMembers;

    if (searchTerm.trim()) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.institution?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.designation?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (institutionFilter && institutionFilter !== 'all') {
      filtered = filtered.filter(member =>
        member.institution?.toLowerCase().includes(institutionFilter.toLowerCase())
      );
    }

    if (specializationFilter && specializationFilter !== 'all') {
      filtered = filtered.filter(member =>
        member.specialization?.toLowerCase().includes(specializationFilter.toLowerCase())
      );
    }

    setFilteredMembers(filtered);
    setCurrentPage(1);
  };

  const getUniqueInstitutions = () => {
    const institutions = lifeMembers
      .map(member => member.institution)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    return institutions;
  };

  const getUniqueSpecializations = () => {
    const specializations = lifeMembers
      .map(member => member.specialization)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    return specializations;
  };

  const getMembershipStatusBadge = (membership: UserMembership) => {
    if (membership.is_manual) {
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Admin Added</Badge>;
    }

    if (membership.status === 'active' && membership.payment_status === 'paid') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    }
    
    if (membership.payment_status === 'manual') {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Verified</Badge>;
    }
    
    if (membership.payment_status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Payment Pending</Badge>;
    }
    
    if (membership.payment_status === 'failed') {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Payment Failed</Badge>;
    }
    
    if (membership.status === 'expired') {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Expired</Badge>;
    }
    
    if (membership.status === 'cancelled') {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Cancelled</Badge>;
    }
    
    const statusText = `${membership.status} (${membership.payment_status})`;
    return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{statusText}</Badge>;
  };

  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);
  const startIndex = (currentPage - 1) * membersPerPage;
  const currentMembers = filteredMembers.slice(startIndex, startIndex + membersPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading life members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-8 lg:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Life Members & Membership
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Honoring our distinguished life members and providing membership services for ISPB.
          </p>
        </div>

        {/* Membership Status Card for logged in users */}
        {user && (
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Your Membership Status</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Current membership information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {membershipLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-green-600 mr-2" />
                  <span className="text-gray-600">Loading membership status...</span>
                </div>
              ) : userMembership ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-2">
                    <p className="font-medium text-base sm:text-lg capitalize">
                      {userMembership.membership_type.replace('_', ' ')} Membership
                    </p>
                    <p className="text-sm text-gray-500">
                      Amount: ₹{userMembership.amount}
                    </p>
                    {userMembership.valid_from && userMembership.valid_until ? (
                      <p className="text-sm text-gray-500">
                        Valid: {new Date(userMembership.valid_from).toLocaleDateString()} to {new Date(userMembership.valid_until).toLocaleDateString()}
                      </p>
                    ) : userMembership.valid_from ? (
                      <p className="text-sm text-gray-500">
                        Valid from: {new Date(userMembership.valid_from).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Lifetime membership
                      </p>
                    )}
                    {userMembership.is_manual && (
                      <p className="text-sm text-blue-600">
                        Admin verified membership
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2">
                    {getMembershipStatusBadge(userMembership)}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={fetchUserMembership}
                      className="text-xs sm:text-sm"
                    >
                      Refresh Status
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-gray-500 mb-4 text-sm sm:text-base">
                    You don't have an active membership
                  </p>
                  <Button asChild size="sm" className="text-sm sm:text-base px-4 sm:px-6">
                    <a href="/membership">Join ISPB</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Card className="text-center p-4 sm:p-6">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
              {lifeMembers.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Total Life Members</div>
          </Card>
          <Card className="text-center p-4 sm:p-6">
            <Award className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">25+</div>
            <div className="text-xs sm:text-sm text-gray-600">Years of Service</div>
          </Card>
          <Card className="text-center p-4 sm:p-6">
            <Building className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
              {getUniqueInstitutions().length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Institutions</div>
          </Card>
          <Card className="text-center p-4 sm:p-6">
            <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
              {getUniqueSpecializations().length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Specializations</div>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search by Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter member name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Institution
                </label>
                <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                  <SelectTrigger className="text-sm sm:text-base">
                    <SelectValue placeholder="All Institutions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Institutions</SelectItem>
                    {getUniqueInstitutions().map((institution) => (
                      <SelectItem key={institution} value={institution!}>
                        {institution}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Specialization
                </label>
                <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                  <SelectTrigger className="text-sm sm:text-base">
                    <SelectValue placeholder="All Specializations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specializations</SelectItem>
                    {getUniqueSpecializations().map((specialization) => (
                      <SelectItem key={specialization} value={specialization!}>
                        {specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
          {currentMembers.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-base sm:text-lg">
                  No members found matching your criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            currentMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <div className="flex-shrink-0 self-center sm:self-start">
                      <img
                        src={member.image_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                        alt={member.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mx-auto sm:mx-0"
                      />
                    </div>
                    <div className="flex-grow text-center sm:text-left">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                        {member.name}
                      </h3>
                      {member.designation && (
                        <p className="text-green-600 font-semibold mb-1 text-sm sm:text-base">
                          {member.designation}
                        </p>
                      )}
                      {member.institution && (
                        <p className="text-gray-600 mb-2 text-sm sm:text-base">
                          {member.institution}
                        </p>
                      )}
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                        {member.specialization && (
                          <span className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            {member.specialization}
                          </span>
                        )}
                        {member.member_since && (
                          <span className="flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Member since {member.member_since}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 self-center sm:self-start">
                      <Badge className="bg-green-100 text-green-800 px-3 py-1 text-xs font-medium">
                        Life Member
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mb-6 sm:mb-8">
            <Pagination>
              <PaginationContent className="flex-wrap">
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={`cursor-pointer text-sm sm:text-base ${
                      currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                    }`}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  if (totalPages <= 5) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer text-sm sm:text-base"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={`cursor-pointer text-sm sm:text-base ${
                      currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
                    }`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Become a Life Member CTA */}
        <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
          <CardContent className="text-center p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Become a Life Member</h2>
            <p className="text-sm sm:text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Join our distinguished community of plant breeding professionals and make a lasting impact.
            </p>
            <Button 
              onClick={() => window.location.href = '/membership'}
              className="bg-white text-green-600 hover:bg-gray-100 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold"
            >
              Apply for Life Membership
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LifeMembers;
