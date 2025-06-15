
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface MembershipCancellationProps {
  membershipId: string;
  membershipType: string;
  onCancellationSuccess: () => void;
}

const MembershipCancellation = ({ 
  membershipId, 
  membershipType, 
  onCancellationSuccess 
}: MembershipCancellationProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelMembership = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('memberships')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', membershipId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast.success('Membership cancelled successfully');
      onCancellationSuccess();
    } catch (error) {
      console.error('Error cancelling membership:', error);
      toast.error('Failed to cancel membership. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Membership</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel your {membershipType} membership? 
            This action cannot be undone and you will lose access to all membership benefits.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Membership</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancelMembership}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Cancelling...' : 'Cancel Membership'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MembershipCancellation;
