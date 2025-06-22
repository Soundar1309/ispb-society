
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface UserMembership {
  id: string;
  membership_type: string;
  status: string;
  payment_status: string;
  valid_from: string;
  valid_until: string;
  amount: number;
  is_manual: boolean;
}

interface MembershipStatusCardProps {
  user: any;
  userMembership: UserMembership | null;
  membershipLoading: boolean;
  onRefresh: () => void;
}

const MembershipStatusCard = ({ user, userMembership, membershipLoading, onRefresh }: MembershipStatusCardProps) => {
  const getMembershipStatusBadge = (membership: UserMembership) => {
    const isActive = membership.status === 'active' && 
      (membership.payment_status === 'paid' || 
       membership.payment_status === 'manual' || 
       membership.is_manual);

    if (isActive) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Inactive</Badge>;
    }
  };

  if (!user) return null;

  return (
    <Card className="mb-6 sm:mb-8">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">Your Membership Status</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Current membership information
        </CardDescription>
      </CardHeader>
      <CardContent>
        {membershipLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-green-600 mr-2" />
            <span className="text-gray-600">Loading membership status...</span>
          </div>
        ) : userMembership ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <p className="font-medium text-base sm:text-lg capitalize">
                {userMembership.membership_type.replace('_', ' ')} Membership
              </p>
              <p className="text-sm text-gray-500">
                Amount: ₹{userMembership.amount}
              </p>
              {userMembership.valid_from && userMembership.valid_until ? (
                <p className="text-sm text-gray-500">
                  Valid: {new Date(userMembership.valid_from).toLocaleDateString()} to {new Date(userMembership.valid_until).toLocaleDateString()}
                </p>
              ) : userMembership.valid_from ? (
                <p className="text-sm text-gray-500">
                  Valid from: {new Date(userMembership.valid_from).toLocaleDateString()}
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  Lifetime membership
                </p>
              )}
              {userMembership.is_manual && (
                <p className="text-sm text-blue-600">
                  Admin verified membership
                </p>
              )}
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              {getMembershipStatusBadge(userMembership)}
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRefresh}
                className="text-xs sm:text-sm"
              >
                Refresh Status
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <p className="text-gray-500 mb-4 text-sm sm:text-base">
              You don't have an active membership
            </p>
            <Button asChild size="sm" className="text-sm sm:text-base px-4 sm:px-6">
              <a href="/membership">Join ISPB</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MembershipStatusCard;
