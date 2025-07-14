
import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter } from 'lucide-react';
import { debounce } from 'lodash';

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  institutionFilter: string;
  setInstitutionFilter: (filter: string) => void;
  specializationFilter: string;
  setSpecializationFilter: (filter: string) => void;
  lifeMembers: any[];
}

const SearchAndFilter = ({
  searchTerm,
  setSearchTerm,
  institutionFilter,
  setInstitutionFilter,
  specializationFilter,
  setSpecializationFilter,
  lifeMembers
}: SearchAndFilterProps) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Debounced search to improve performance while typing
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
    }, 300),
    [setSearchTerm]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    debouncedSearch(value);
  };

  // Get unique institutions and specializations for filters
  const institutions = Array.from(new Set(
    lifeMembers
      .map(member => member.institution)
      .filter(Boolean)
  )).sort();

  const specializations = Array.from(new Set(
    lifeMembers
      .map(member => member.specialization)
      .filter(Boolean)
  )).sort();

  return (
    <Card className="mb-6 sm:mb-8">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, institution, or designation..."
              value={localSearchTerm}
              onChange={handleSearchChange}
              className="pl-10 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            />
          </div>

          {/* Institution Filter */}
          <div className="w-full lg:w-64">
            <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
              <SelectTrigger className="focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200">
                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Filter by Institution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Institutions</SelectItem>
                {institutions.map((institution) => (
                  <SelectItem key={institution} value={institution}>
                    {institution}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Specialization Filter */}
          <div className="w-full lg:w-64">
            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
              <SelectTrigger className="focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200">
                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Filter by Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map((specialization) => (
                  <SelectItem key={specialization} value={specialization}>
                    {specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchAndFilter;
