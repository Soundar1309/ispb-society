
import { Card } from '@/components/ui/card';
import { Users, Award, Building, GraduationCap } from 'lucide-react';

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

interface StatisticsCardsProps {
  lifeMembers: LifeMember[];
}

const StatisticsCards = ({ lifeMembers }: StatisticsCardsProps) => {
  const getUniqueAddresses = () => {
    const addresses = lifeMembers
      .map(member => member.address)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    return addresses;
  };

  const getUniqueOccupations = () => {
    const occupations = lifeMembers
      .map(member => member.occupation)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    return occupations;
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
          {getUniqueAddresses().length}
        </div>
        <div className="text-xs sm:text-sm text-gray-600">Locations</div>
      </Card>
      <Card className="text-center p-4 sm:p-6">
        <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
        <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
          {getUniqueOccupations().length}
        </div>
        <div className="text-xs sm:text-sm text-gray-600">Occupations</div>
      </Card>
    </div>
  );
};

export default StatisticsCards;
