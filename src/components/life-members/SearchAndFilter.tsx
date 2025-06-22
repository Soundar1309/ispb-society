
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  institutionFilter: string;
  setInstitutionFilter: (filter: string) => void;
  specializationFilter: string;
  setSpecializationFilter: (filter: string) => void;
  lifeMembers: LifeMember[];
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

  return (
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
  );
};

export default SearchAndFilter;
