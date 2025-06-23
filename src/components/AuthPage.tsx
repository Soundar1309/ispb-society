
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;
    const institution = formData.get('institution') as string;
    const designation = formData.get('designation') as string;
    const specialization = formData.get('specialization') as string;

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            institution: institution,
            designation: designation,
            specialization: specialization,
          },
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Registration successful! You can now sign in.');
        // Auto-switch to sign in tab after successful registration
        const signInTab = document.querySelector('[data-value="signin"]') as HTMLElement;
        if (signInTab) {
          signInTab.click();
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-600 to-orange-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl sm:text-2xl">I</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">ISPB Portal</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Indian Society of Plant Breeders</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin" data-value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Sign In</CardTitle>
                <CardDescription className="text-sm">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email address"
                      required
                      disabled={isLoading}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Input
                      name="password"
                      type="password"
                      placeholder="Password"
                      required
                      disabled={isLoading}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <Button type="submit" className="w-full text-sm sm:text-base py-2 sm:py-3" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Sign Up</CardTitle>
                <CardDescription className="text-sm">
                  Create your account to join ISPB
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Input
                      name="fullName"
                      type="text"
                      placeholder="Full Name"
                      required
                      disabled={isLoading}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email address"
                      required
                      disabled={isLoading}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Input
                      name="phone"
                      type="tel"
                      placeholder="Phone Number"
                      required
                      disabled={isLoading}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Input
                      name="institution"
                      type="text"
                      placeholder="Institution/Organization"
                      required
                      disabled={isLoading}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Input
                      name="designation"
                      type="text"
                      placeholder="Designation/Position"
                      required
                      disabled={isLoading}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Input
                      name="specialization"
                      type="text"
                      placeholder="Specialization/Field of Study"
                      required
                      disabled={isLoading}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Input
                      name="password"
                      type="password"
                      placeholder="Password (min 6 characters)"
                      required
                      minLength={6}
                      disabled={isLoading}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <Button type="submit" className="w-full text-sm sm:text-base py-2 sm:py-3" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Sign Up'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthPage;
