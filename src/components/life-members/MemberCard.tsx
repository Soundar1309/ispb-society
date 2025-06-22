
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface MemberCardProps {
  member: LifeMember;
}

const MemberCard = ({ member }: MemberCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
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
  );
};

export default MemberCard;
