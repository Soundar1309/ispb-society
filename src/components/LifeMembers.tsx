import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Users } from 'lucide-react';
import StatisticsCards from '@/components/life-members/StatisticsCards';
import MembershipCTA from '@/components/life-members/MembershipCTA';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

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
      let allMembers: LifeMember[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('life_members')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
          console.error('Error fetching life members:', error);
          toast.error('Failed to load life members');
          hasMore = false; // Stop fetching on error
        } else {
          if (data && data.length > 0) {
            allMembers = [...allMembers, ...data];
            // If we got fewer records than requested, we've reached the end
            if (data.length < pageSize) {
              hasMore = false;
            } else {
              page++;
            }
          } else {
            hasMore = false;
          }
        }
      }

      // Sort members by Life Member Number (continuous order)
      // Extract number from strings like "LM-001", "LM-105"
      allMembers.sort((a, b) => {
        const getNumber = (str: string | null) => {
          if (!str) return Number.MAX_SAFE_INTEGER; // Put missing numbers at the end
          const match = str.match(/(\d+)/); // Extract first sequence of digits
          return match ? parseInt(match[0], 10) : Number.MAX_SAFE_INTEGER;
        };

        const numA = getNumber(a.life_member_no);
        const numB = getNumber(b.life_member_no);

        if (numA !== numB) {
          return numA - numB;
        }
        // If both have no number (or same number), keep original order (which is created_at asc)
        return 0;
      });

      setLifeMembers(allMembers);
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
      <div className="min-h-screen py-6 sm:py-8 lg:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Life Members & Membership
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto px-4">
              Honoring our distinguished life members and providing membership services for ISPB.
            </p>
          </div>

          {/* Statistics skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>

          {/* Search skeleton */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6">
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          {/* Members list skeleton */}
          <LoadingSkeleton variant="list" count={8} />
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
                    className={`cursor-pointer text-sm sm:text-base ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                      }`}
                  />
                </PaginationItem>
                {/* Dynamic Pagination Items */}
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 5;

                  if (totalPages <= maxVisiblePages) {
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Always show 1
                    pages.push(1);

                    // Logic for ellipses and window
                    if (currentPage > 3) {
                      pages.push('ellipsis-start');
                    }

                    // Window around current
                    const start = Math.max(2, currentPage - 1);
                    const end = Math.min(totalPages - 1, currentPage + 1);

                    for (let i = start; i <= end; i++) {
                      if (i > 1 && i < totalPages) {
                        pages.push(i);
                      }
                    }

                    if (currentPage < totalPages - 2) {
                      pages.push('ellipsis-end');
                    }

                    // Always show last
                    if (totalPages > 1) {
                      pages.push(totalPages);
                    }
                  }

                  return pages.map((page, index) => {
                    if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page as number)}
                          isActive={currentPage === page}
                          className="cursor-pointer text-sm sm:text-base"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  });
                })()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={`cursor-pointer text-sm sm:text-base ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
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
