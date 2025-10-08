
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
                  className="border-l-4 border-green-500 hover:shadow-md transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-4">
                      {/* Profile Image */}
                      <div className="flex-shrink-0">
                        <img 
                          src={member.image_url || '/placeholder.svg'} 
                          alt={member.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border-2 border-gray-200"
                        />
                      </div>
                      
                      {/* Member Details */}
                      <div className="flex-1 min-w-0">
                        {/* Name and Member Number Row - Top */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                            {member.name}
                          </h3>
                          {member.life_member_no && (
                            <span className="px-3 py-1.5 text-xs sm:text-sm font-bold bg-green-100 text-green-800 rounded-md border-2 border-green-300 whitespace-nowrap shadow-sm">
                              {member.life_member_no}
                            </span>
                          )}
                        </div>
                        
                        {/* Contact Info - Highlighted */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                          {member.email && (
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 text-base">📧</span>
                              <a 
                                href={`mailto:${member.email}`}
                                className="text-sm font-semibold text-blue-600 hover:underline truncate"
                              >
                                {member.email}
                              </a>
                            </div>
                          )}
                          {member.mobile && (
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 text-base">📱</span>
                              <a 
                                href={`tel:${member.mobile}`}
                                className="text-sm font-semibold text-green-700 hover:underline"
                              >
                                {member.mobile}
                              </a>
                            </div>
                          )}
                        </div>
                        
                        {/* Additional Details */}
                        <div className="space-y-1 text-sm text-gray-600">
                          {member.occupation && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">💼</span>
                              <span>{member.occupation}</span>
                            </div>
                          )}
                          {member.address && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">📍</span>
                              <span>{member.address}</span>
                            </div>
                          )}
                          {member.date_of_enrollment && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">📅</span>
                              <span>Enrolled: {new Date(member.date_of_enrollment).toLocaleDateString('en-IN')}</span>
                            </div>
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
