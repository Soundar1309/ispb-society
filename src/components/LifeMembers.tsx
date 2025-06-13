
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { toast } from 'sonner';

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

const LifeMembers = () => {
  const [lifeMembers, setLifeMembers] = useState<LifeMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<LifeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 6;

  useEffect(() => {
    fetchLifeMembers();
  }, []);

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

  const filterMembers = () => {
    let filtered = lifeMembers;

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (institutionFilter) {
      filtered = filtered.filter(member =>
        member.institution?.toLowerCase().includes(institutionFilter.toLowerCase())
      );
    }

    if (specializationFilter) {
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

  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);
  const startIndex = (currentPage - 1) * membersPerPage;
  const currentMembers = filteredMembers.slice(startIndex, startIndex + membersPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Life Members</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Honoring our distinguished life members who have made significant contributions 
            to plant breeding science and the growth of ISPB.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{lifeMembers.length}</div>
            <div className="text-gray-600">Total Life Members</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">25+</div>
            <div className="text-gray-600">Years of Service</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{getUniqueInstitutions().length}</div>
            <div className="text-gray-600">Institutions</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{getUniqueSpecializations().length}</div>
            <div className="text-gray-600">Specializations</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search by Name</label>
              <Input
                type="text"
                placeholder="Enter member name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Institution</label>
              <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Institutions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Institutions</SelectItem>
                  {getUniqueInstitutions().map((institution) => (
                    <SelectItem key={institution} value={institution!}>
                      {institution}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Specialization</label>
              <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Specializations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Specializations</SelectItem>
                  {getUniqueSpecializations().map((specialization) => (
                    <SelectItem key={specialization} value={specialization!}>
                      {specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-6 mb-8">
          {currentMembers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No members found matching your criteria.</p>
            </div>
          ) : (
            currentMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
                    <div className="flex-shrink-0 mb-4 md:mb-0">
                      <img
                        src={member.image_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                        alt={member.name}
                        className="w-24 h-24 rounded-full object-cover mx-auto md:mx-0"
                      />
                    </div>
                    <div className="flex-grow text-center md:text-left">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                      <p className="text-green-600 font-semibold mb-1">{member.designation}</p>
                      <p className="text-gray-600 mb-2">{member.institution}</p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500">
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
                    <div className="flex-shrink-0 mt-4 md:mt-0">
                      <div className="flex flex-col space-y-2">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium text-center">
                          Life Member
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mb-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Become a Life Member CTA */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Become a Life Member</h2>
          <p className="text-lg mb-6 opacity-90">
            Join our distinguished community of plant breeding professionals and make a lasting impact.
          </p>
          <Button 
            onClick={() => window.location.href = '/membership'}
            className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold"
          >
            Apply for Life Membership
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LifeMembers;
