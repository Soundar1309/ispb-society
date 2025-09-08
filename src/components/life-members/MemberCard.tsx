
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface MemberCardProps {
  member: LifeMember;
}

const MemberCard = ({ member }: MemberCardProps) => {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/20 to-blue-100/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500" />
      
      <CardContent className="p-6 relative">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Profile Image */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-lg group-hover:ring-green-100 transition-all duration-300">
              <img
                src={member.image_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                alt={member.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            {/* Life Member Badge */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-1 text-xs font-semibold shadow-lg animate-fade-in">
                Life Member
              </Badge>
            </div>
          </div>

          {/* Member Details */}
          <div className="space-y-2 w-full">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-300 leading-tight">
              {member.name}
            </h3>
            
            {/* Life Member Number */}
            {member.life_member_no && (
              <p className="text-green-600 font-semibold text-sm bg-green-50 px-3 py-1 rounded-full inline-block animate-fade-in">
                {member.life_member_no}
              </p>
            )}
            
            {member.occupation && (
              <p className="text-gray-600 text-sm font-medium leading-relaxed">
                {member.occupation}
              </p>
            )}
            
            {member.address && (
              <p className="text-gray-500 text-xs leading-relaxed">
                {member.address}
              </p>
            )}
          </div>

          {/* Additional Information */}
          <div className="w-full space-y-2 pt-2 border-t border-gray-100">            
            {member.date_of_enrollment && (
              <div className="flex items-center justify-center text-xs text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full mr-2"></div>
                <span className="font-medium">Enrolled {new Date(member.date_of_enrollment).toLocaleDateString()}</span>
              </div>
            )}
            
            {(member.email || member.mobile) && (
              <div className="flex items-center justify-center text-xs text-gray-500 space-x-3">
                {member.email && (
                  <span className="font-medium">{member.email}</span>
                )}
                {member.mobile && (
                  <span className="font-medium">{member.mobile}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-green-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </CardContent>
    </Card>
  );
};

export default MemberCard;
