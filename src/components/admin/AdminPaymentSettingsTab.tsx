import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, Shield, CreditCard, TestTube, AlertCircle, CheckCircle, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PaymentSettings {
  id: string;
  razorpay_key_id: string | null;
  is_test_mode: boolean;
  is_enabled: boolean;
  updated_at: string;
}

const AdminPaymentSettingsTab = () => {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [isTestMode, setIsTestMode] = useState(true);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data as PaymentSettings);
        setKeyId(data.razorpay_key_id || '');
        setIsTestMode(data.is_test_mode ?? true);
        setIsEnabled(data.is_enabled ?? true);
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      toast.error('Failed to load payment settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const updateData: Record<string, unknown> = {
        razorpay_key_id: keyId || null,
        is_test_mode: isTestMode,
        is_enabled: isEnabled,
        updated_at: new Date().toISOString(),
      };

      // Only update encrypted secret if a new one is provided
      if (keySecret) {
        updateData.razorpay_key_secret_encrypted = keySecret;
      }

      if (settings?.id) {
        const { error } = await supabase
          .from('payment_settings')
          .update(updateData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payment_settings')
          .insert(updateData);

        if (error) throw error;
      }

      toast.success('Payment settings saved successfully');
      setKeySecret(''); // Clear secret after save
      fetchSettings();
    } catch (error) {
      console.error('Error saving payment settings:', error);
      toast.error('Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Payment Gateway Settings
              </CardTitle>
              <CardDescription>
                Configure Razorpay payment gateway for membership payments
              </CardDescription>
            </div>
            <Badge variant={isEnabled ? 'default' : 'secondary'} className={isEnabled ? 'bg-green-100 text-green-800' : ''}>
              {isEnabled ? 'Active' : 'Disabled'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${isTestMode ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {isTestMode ? (
                  <TestTube className="h-5 w-5 text-yellow-600" />
                ) : (
                  <Shield className="h-5 w-5 text-green-600" />
                )}
                <span className={`font-medium ${isTestMode ? 'text-yellow-800' : 'text-green-800'}`}>
                  {isTestMode ? 'Test Mode' : 'Live Mode'}
                </span>
              </div>
              <p className={`text-sm ${isTestMode ? 'text-yellow-700' : 'text-green-700'}`}>
                {isTestMode 
                  ? 'Payments are in test mode. No real transactions will be processed.'
                  : 'Payments are live. Real transactions will be processed.'}
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${isEnabled ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className={`h-5 w-5 ${isEnabled ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${isEnabled ? 'text-blue-800' : 'text-gray-600'}`}>
                  Payment Status
                </span>
              </div>
              <p className={`text-sm ${isEnabled ? 'text-blue-700' : 'text-gray-500'}`}>
                {isEnabled 
                  ? 'Payment gateway is enabled and accepting payments.'
                  : 'Payment gateway is disabled. Users cannot make payments.'}
              </p>
            </div>
          </div>

          {/* Toggle Controls */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="test-mode" className="text-base">Test Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use test API keys to simulate payments without real transactions
                </p>
              </div>
              <Switch
                id="test-mode"
                checked={isTestMode}
                onCheckedChange={setIsTestMode}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enabled" className="text-base">Enable Payments</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to make membership payments
                </p>
              </div>
              <Switch
                id="enabled"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
            </div>
          </div>

          {/* API Keys */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-medium">Razorpay API Credentials</h3>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Important Security Note</p>
                  <p>API keys are stored securely as environment secrets. The values shown here are for reference only. To update the actual keys used by the payment gateway, please update them in Supabase Edge Function secrets.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="key-id">Razorpay Key ID</Label>
                <Input
                  id="key-id"
                  placeholder="rzp_test_xxxxxxxxxxxxx or rzp_live_xxxxxxxxxxxxx"
                  value={keyId}
                  onChange={(e) => setKeyId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This is your publishable key from Razorpay Dashboard
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="key-secret">Razorpay Key Secret (Optional)</Label>
                <Input
                  id="key-secret"
                  type="password"
                  placeholder="Enter new secret to update"
                  value={keySecret}
                  onChange={(e) => setKeySecret(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Only enter if you want to update. Leave blank to keep existing secret.
                </p>
              </div>
            </div>
          </div>

          {/* Current Configuration */}
          {settings && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Current Configuration</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Key ID:</span>
                  <p className="font-mono">{settings.razorpay_key_id || 'Not configured'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <p>{new Date(settings.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">1</div>
            <div>
              <p className="font-medium">Get Razorpay API Keys</p>
              <p className="text-muted-foreground">Log in to your Razorpay Dashboard and navigate to Settings → API Keys</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">2</div>
            <div>
              <p className="font-medium">Configure Environment Secrets</p>
              <p className="text-muted-foreground">Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to Supabase Edge Function secrets</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">3</div>
            <div>
              <p className="font-medium">Test Your Integration</p>
              <p className="text-muted-foreground">Enable test mode and make a test payment to verify everything works</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">4</div>
            <div>
              <p className="font-medium">Go Live</p>
              <p className="text-muted-foreground">Once verified, switch to live mode and update to live API keys</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPaymentSettingsTab;
