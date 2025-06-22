
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MembershipCTA = () => {
  return (
    <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
      <CardContent className="text-center p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Become a Life Member</h2>
        <p className="text-sm sm:text-lg mb-6 opacity-90 max-w-2xl mx-auto">
          Join our distinguished community of plant breeding professionals and make a lasting impact.
        </p>
        <Button 
          onClick={() => window.location.href = '/membership'}
          className="bg-white text-green-600 hover:bg-gray-100 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold"
        >
          Apply for Life Membership
        </Button>
      </CardContent>
    </Card>
  );
};

export default MembershipCTA;
