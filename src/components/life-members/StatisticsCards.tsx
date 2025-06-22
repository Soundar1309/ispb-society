
import { Card } from '@/components/ui/card';
import { Users, Award, Building, GraduationCap } from 'lucide-react';

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

interface StatisticsCardsProps {
  lifeMembers: LifeMember[];
}

const StatisticsCards = ({ lifeMembers }: StatisticsCardsProps) => {
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
  );
};

export default StatisticsCards;
