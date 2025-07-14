
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Users } from 'lucide-react';
import MembershipStatusCard from '@/components/life-members/MembershipStatusCard';
import StatisticsCards from '@/components/life-members/StatisticsCards';
import SearchAndFilter from '@/components/life-members/SearchAndFilter';
import MemberCard from '@/components/life-members/MemberCard';
import MembershipCTA from '@/components/life-members/MembershipCTA';

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
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchLower) ||
        member.institution?.toLowerCase().includes(searchLower) ||
        member.designation?.toLowerCase().includes(searchLower) ||
        member.specialization?.toLowerCase().includes(searchLower)
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
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Life Members & Membership
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto px-4">
            Honoring our distinguished life members and providing membership services for ISPB.
          </p>
        </div>

        {/* Membership Status Card */}
        <div className="animate-scale-in">
          <MembershipStatusCard
            user={user}
            userMembership={userMembership}
            membershipLoading={membershipLoading}
            onRefresh={fetchUserMembership}
          />
        </div>

        {/* Statistics */}
        <div className="animate-fade-in">
          <StatisticsCards lifeMembers={lifeMembers} />
        </div>

        {/* Search and Filter */}
        <div className="animate-slide-in-right">
          <SearchAndFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            institutionFilter={institutionFilter}
            setInstitutionFilter={setInstitutionFilter}
            specializationFilter={specializationFilter}
            setSpecializationFilter={setSpecializationFilter}
            lifeMembers={lifeMembers}
          />
        </div>

        {/* Members List */}
        <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
          {currentMembers.length === 0 ? (
            <Card className="py-12 animate-fade-in">
              <CardContent className="text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-base sm:text-lg">
                  No members found matching your criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {currentMembers.map((member, index) => (
                <div 
                  key={member.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <MemberCard member={member} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mb-6 sm:mb-8">
            <Pagination>
              <PaginationContent className="flex-wrap gap-2">
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

        {/* CTA Section */}
        <MembershipCTA />
      </div>
    </div>
  );
};

export default LifeMembers;
