
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Logo from './header/Logo';
import Navigation from './header/Navigation';
import UserMenu from './header/UserMenu';
import MobileMenu from './header/MobileMenu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      setCheckingAdmin(true);
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        setIsAdmin(data && !error);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error during sign out:', error);
      // Still close the menu even if sign out fails
      setIsMenuOpen(false);
    }
  };

  // Don't render anything while checking authentication
  if (loading) {
    return (
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <Logo />
            <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          <Logo />
          <Navigation />
          <div className="flex items-center space-x-4">
            <UserMenu 
              user={user} 
              isAdmin={isAdmin} 
              onSignOut={handleSignOut}
              loading={checkingAdmin}
            />
            <MobileMenu 
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              user={user}
              isAdmin={isAdmin}
              onSignOut={handleSignOut}
              loading={checkingAdmin}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
