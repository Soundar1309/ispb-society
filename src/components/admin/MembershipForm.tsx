
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CalendarProps } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MembershipFormData {
  user_id: string;
  membership_type: string;
  valid_from: Date;
  valid_until: Date;
  amount: number;
}

interface MembershipFormProps {
  initialData?: Partial<MembershipFormData>;
  availableUsers: Array<{ user_id: string; full_name: string; email: string }>;
  onSubmit: (data: MembershipFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const MembershipForm = ({ initialData, availableUsers, onSubmit, onCancel, isEditing = false }: MembershipFormProps) => {
  const [formData, setFormData] = useState<MembershipFormData>({
    user_id: initialData?.user_id || '',
    membership_type: initialData?.membership_type || 'annual',
    valid_from: initialData?.valid_from || new Date(),
    valid_until: initialData?.valid_until || new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    amount: initialData?.amount || 0
  });

  const [validFromOpen, setValidFromOpen] = useState(false);
  const [validUntilOpen, setValidUntilOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{isEditing ? 'Edit Membership' : 'Add Manual Membership'}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user_select">Select User *</Label>
              <Select 
                value={formData.user_id} 
                onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="membership_type">Membership Type *</Label>
              <Select 
                value={formData.membership_type} 
                onValueChange={(value) => setFormData({ ...formData, membership_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="lifetime">Lifetime</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="institutional">Institutional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Valid From *</Label>
              <Popover open={validFromOpen} onOpenChange={setValidFromOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.valid_from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.valid_from ? format(formData.valid_from, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.valid_from}
                    onSelect={(date) => {
                      if (date) {
                        setFormData({ ...formData, valid_from: date });
                        setValidFromOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Valid Until *</Label>
              <Popover open={validUntilOpen} onOpenChange={setValidUntilOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.valid_until && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.valid_until ? format(formData.valid_until, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.valid_until}
                    onSelect={(date) => {
                      if (date) {
                        setFormData({ ...formData, valid_until: date });
                        setValidUntilOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={!formData.user_id}>
              {isEditing ? 'Update Membership' : 'Add Membership'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MembershipForm;
