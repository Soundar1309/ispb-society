
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, CreditCard } from 'lucide-react';

interface MembershipPlan {
  id: string;
  plan_type: string;
  title: string;
  price: number;
  duration_months: number;
  features: string[];
  is_active: boolean;
  created_at: string;
}

interface AdminMembershipPlansTabProps {
  plans: MembershipPlan[];
  onRefresh: () => void;
}

const AdminMembershipPlansTab = ({ plans, onRefresh }: AdminMembershipPlansTabProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    plan_type: '',
    title: '',
    price: '',
    duration_months: '',
    features: '',
    is_active: true
  });

  const resetForm = () => {
    setFormData({
      plan_type: '',
      title: '',
      price: '',
      duration_months: '',
      features: '',
      is_active: true
    });
    setEditingPlan(null);
  };

  const handleEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setFormData({
      plan_type: plan.plan_type,
      title: plan.title,
      price: plan.price.toString(),
      duration_months: plan.duration_months.toString(),
      features: plan.features.join('\n'),
      is_active: plan.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const featuresArray = formData.features
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const planData = {
        plan_type: formData.plan_type,
        title: formData.title,
        price: parseFloat(formData.price),
        duration_months: parseInt(formData.duration_months),
        features: featuresArray,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      };

      if (editingPlan) {
        const { error } = await supabase
          .from('membership_plans')
          .update(planData)
          .eq('id', editingPlan.id);

        if (error) throw error;
        toast.success('Membership plan updated successfully');
      } else {
        const { error } = await supabase
          .from('membership_plans')
          .insert(planData);

        if (error) throw error;
        toast.success('Membership plan created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      onRefresh();
    } catch (error: any) {
      console.error('Error saving membership plan:', error);
      toast.error(error.message || 'Error saving membership plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this membership plan?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('membership_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
      toast.success('Membership plan deleted successfully');
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting membership plan:', error);
      toast.error(error.message || 'Error deleting membership plan');
    }
  };

  const togglePlanStatus = async (planId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('membership_plans')
        .update({ is_active: !currentStatus })
        .eq('id', planId);

      if (error) throw error;
      toast.success(`Membership plan ${!currentStatus ? 'activated' : 'deactivated'}`);
      onRefresh();
    } catch (error: any) {
      console.error('Error updating plan status:', error);
      toast.error(error.message || 'Error updating plan status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Membership Plans</h2>
          <p className="text-gray-600">Manage available membership plans and pricing</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Edit Membership Plan' : 'Create Membership Plan'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="plan_type">Plan Type (ID)</Label>
                <Input
                  id="plan_type"
                  value={formData.plan_type}
                  onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                  placeholder="e.g., annual, lifetime"
                  required
                  disabled={!!editingPlan}
                />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Annual Membership"
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price (INR)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration_months">Duration (Months)</Label>
                <Input
                  id="duration_months"
                  type="number"
                  value={formData.duration_months}
                  onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                  placeholder="12 (0 for lifetime)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter 0 for lifetime membership</p>
              </div>
              <div>
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Access to all conferences&#10;Digital publications&#10;Networking opportunities"
                  rows={4}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Saving...' : editingPlan ? 'Update' : 'Create'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${!plan.is_active ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {plan.title}
                </CardTitle>
                <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                  {plan.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <CardDescription>
                Type: {plan.plan_type} | 
                {plan.duration_months > 0 ? ` ${plan.duration_months} months` : ' Lifetime'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold text-green-600">
                ₹{plan.price}
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Features:</h4>
                <ul className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      • {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(plan)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePlanStatus(plan.id, plan.is_active)}
                  className="flex-1"
                >
                  {plan.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(plan.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No membership plans</h3>
            <p className="text-gray-600 mb-4">Create your first membership plan to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminMembershipPlansTab;
