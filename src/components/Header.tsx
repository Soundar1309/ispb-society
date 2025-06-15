
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      setIsAdmin(data && !error);
    };

    checkAdminStatus();
  }, [user]);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Office Bearers', href: '/office-bearers' },
    { name: 'Genesis', href: '/genesis' },
    { name: 'Mandate & Activities', href: '/mandate-activities' },
    { name: 'Publications', href: '/publications' },
    { name: 'Membership', href: '/membership' },
    { name: 'Life Members', href: '/life-members' },
    { name: 'Conference', href: '/conference' },
    { name: 'Contact Us', href: '/contact' },
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-600 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">I</span>
              </div>
              <div className="hidden xs:block sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">ISPB</h1>
                <p className="text-xs text-gray-600 leading-tight">Indian Society of Plant Breeders</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-2 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Menu / Login Button */}
          <div className="hidden md:flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                    <User size={14} className="sm:w-4 sm:h-4" />
                    <span className="max-w-20 sm:max-w-32 truncate">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm">
                <Link to="/auth" className="flex items-center space-x-1 sm:space-x-2">
                  <User size={14} className="sm:w-4 sm:h-4" />
                  <span>Login</span>
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="xl:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-green-50"
            >
              {isMenuOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={20} className="sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="xl:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t max-h-screen overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm sm:text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-sm sm:text-base font-medium text-green-600 hover:bg-green-50 rounded-md"
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-sm sm:text-base font-medium text-green-600 hover:bg-green-50 rounded-md"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm sm:text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-sm sm:text-base font-medium text-green-600 hover:bg-green-50 rounded-md"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
