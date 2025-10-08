
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Users } from 'lucide-react';
import StatisticsCards from '@/components/life-members/StatisticsCards';
import MembershipCTA from '@/components/life-members/MembershipCTA';

interface LifeMember {
  id: string;
  life_member_no: string | null;
  name: string;
  address: string | null;
  occupation: string | null;
  date_of_enrollment: string | null;
  image_url: string | null;
  email: string | null;
  mobile: string | null;
}

const LifeMembers = () => {
  const { user } = useAuth();
  const [lifeMembers, setLifeMembers] = useState<LifeMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<LifeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 50;

  useEffect(() => {
    fetchLifeMembers();
  }, [user]);

  useEffect(() => {
    filterMembers();
  }, [lifeMembers, searchTerm]);

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


  const filterMembers = () => {
    let filtered = lifeMembers;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchLower) ||
        member.address?.toLowerCase().includes(searchLower) ||
        member.occupation?.toLowerCase().includes(searchLower) ||
        member.life_member_no?.toLowerCase().includes(searchLower)
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


        {/* Statistics */}
        <div className="animate-fade-in">
          <StatisticsCards lifeMembers={lifeMembers} />
        </div>

        {/* Search */}
        <Card className="mb-6 sm:mb-8 animate-slide-in-right">
          <CardContent className="p-4 sm:p-6">
            <div className="relative">
              <Input
                placeholder="Search by name, address, occupation, or member number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <div className="space-y-3 mb-6 sm:mb-8">
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
            <div className="space-y-4">
              {currentMembers.map((member, index) => (
                <Card 
                  key={member.id} 
                  className="hover:shadow-lg transition-all duration-300 animate-fade-in border-l-4 border-green-500"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Profile Image */}
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <img 
                            src={member.image_url || '/placeholder.svg'} 
                            alt={member.name}
                            className="w-20 h-20 rounded-full object-cover border-4 border-green-100 shadow-md"
                          />
                          {member.life_member_no && (
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-lg">
                              {member.life_member_no}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Member Details */}
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Name - Prominent */}
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                          {member.name}
                        </h3>

                        {/* Contact Info - Highlighted */}
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                          {member.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-green-600 font-semibold">📧</span>
                              <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline font-medium">
                                {member.email}
                              </a>
                            </div>
                          )}
                          {member.mobile && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-green-600 font-semibold">📱</span>
                              <a href={`tel:${member.mobile}`} className="text-blue-600 hover:underline font-medium">
                                {member.mobile}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Additional Details */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                          {member.occupation && (
                            <span className="inline-flex items-center gap-1">
                              <span className="text-gray-400">💼</span>
                              {member.occupation}
                            </span>
                          )}
                          {member.address && (
                            <span className="inline-flex items-center gap-1">
                              <span className="text-gray-400">📍</span>
                              {member.address}
                            </span>
                          )}
                          {member.date_of_enrollment && (
                            <span className="inline-flex items-center gap-1">
                              <span className="text-gray-400">📅</span>
                              Enrolled: {new Date(member.date_of_enrollment).toLocaleDateString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
