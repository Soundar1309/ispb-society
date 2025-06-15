
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileMenuProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  user: any;
  isAdmin: boolean;
  onSignOut: () => Promise<void>;
}

const MobileMenu = ({ isMenuOpen, setIsMenuOpen, user, isAdmin, onSignOut }: MobileMenuProps) => {
  const location = useLocation();

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
    await onSignOut();
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="xl:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-300"
        >
          {isMenuOpen ? (
            <X size={24} className="text-gray-700" />
          ) : (
            <Menu size={24} className="text-gray-700" />
          )}
        </Button>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 xl:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed top-16 lg:top-20 left-0 right-0 bg-white border-b border-gray-200 shadow-xl z-50 xl:hidden">
            <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="px-4 py-6 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                      isActive(item.href)
                        ? 'bg-green-50 text-green-700 shadow-sm'
                        : 'text-gray-700 hover:text-green-600 hover:bg-green-50/50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* User Section */}
                <div className="pt-4 mt-4 border-t border-gray-200">
                  {user ? (
                    <>
                      <div className="px-4 py-3 bg-gray-50 rounded-xl mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                            <User size={18} className="text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.user_metadata?.full_name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50/50 rounded-xl transition-all duration-300"
                      >
                        <LayoutDashboard className="mr-3 h-5 w-5" />
                        Dashboard
                      </Link>
                      
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50/50 rounded-xl transition-all duration-300"
                        >
                          <Settings className="mr-3 h-5 w-5" />
                          Admin Panel
                        </Link>
                      )}
                      
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50/50 rounded-xl transition-all duration-300"
                      >
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/auth"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <User className="mr-2 h-5 w-5" />
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileMenu;
