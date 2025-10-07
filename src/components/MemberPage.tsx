
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CreditCard, Calendar, CheckCircle } from 'lucide-react';

const MemberPage = () => {
  const { user } = useAuth();
  type MembershipRecord = {
    id: string;
    membership_type: string;
    valid_from: string;
    valid_until: string;
    amount: number;
    status: 'active' | 'pending' | 'failed' | 'expired' | 'cancelled' | string;
    payment_status: 'paid' | 'manual' | 'pending' | 'failed' | string;
  };
  const [memberships, setMemberships] = useState<MembershipRecord[]>([]);
  const [selectedMembershipType, setSelectedMembershipType] = useState('');

  const membershipPlans = [
    {
      type: 'lifetime',
      title: 'Lifetime Membership',
      price: 5000,
      duration: 'Lifetime',
      features: [
        'All annual benefits',
        'Priority conference registration',
        'Exclusive member events',
        'Legacy member recognition',
        'No renewal required'
      ]
    }
  ];

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Fetch active memberships
      const { data: membershipData } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      setMemberships((membershipData as MembershipRecord[]) || []);
    })();
  }, [user]);

  const handleSelectPlan = (membershipType: string) => {
    // Check if user already has active membership
    if (memberships.length > 0) {
      toast.error('You already have an active membership');
      return;
    }

    setSelectedMembershipType(membershipType);
    // Redirect to payment page to initiate Razorpay flow
    window.location.href = `/payment?type=${encodeURIComponent(membershipType)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'paid':
      case 'manual':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'expired':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to access membership details.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Membership</h1>
          <p className="text-gray-600">Manage your ISPB membership and access exclusive benefits</p>
        </div>

        {/* Current Membership Status */}
        {memberships.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Current Membership
              </CardTitle>
            </CardHeader>
            <CardContent>
              {memberships.map((membership: MembershipRecord) => (
                <div key={membership.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold capitalize">{membership.membership_type}</h3>
                    <p className="text-sm text-gray-600">
                      Valid: {membership.valid_from} to {membership.valid_until}
                    </p>
                    <p className="text-sm text-gray-500">Amount: ₹{membership.amount}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(membership.status)}>
                      {membership.status}
                    </Badge>
                    <Badge className={getStatusColor(membership.payment_status)}>
                      {membership.payment_status === 'manual' ? 'Admin Added' : membership.payment_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Membership Plans */}
        {memberships.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {membershipPlans.map((plan) => (
              <Card key={plan.type} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {plan.title}
                  </CardTitle>
                  <CardDescription>{plan.duration}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold text-green-600">
                    ₹{plan.price}
                    {plan.type === 'annual' && <span className="text-sm text-gray-500">/year</span>}
                  </div>
                  
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => handleSelectPlan(plan.type)}
                    className="w-full"
                  >
                    Select Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Member Benefits */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Member Benefits</CardTitle>
            <CardDescription>Exclusive advantages of ISPB membership</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Conference Access</h3>
                <p className="text-sm text-gray-600">Priority registration and discounted rates for all ISPB conferences</p>
              </div>
              <div className="text-center">
                <CreditCard className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Digital Resources</h3>
                <p className="text-sm text-gray-600">Priority in Publication and Concession in Publication Fee. </p>
              </div>
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Professional Network</h3>
                <p className="text-sm text-gray-600">Connect with plant breeding experts and researchers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberPage;
