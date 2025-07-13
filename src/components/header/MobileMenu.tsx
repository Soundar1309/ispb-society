
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Shield, CreditCard, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MobileMenuProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  user: any;
  isAdmin: boolean;
  onSignOut: () => void;
  loading?: boolean;
}

const MobileMenu = ({ isMenuOpen, setIsMenuOpen, user, isAdmin, onSignOut, loading }: MobileMenuProps) => {
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Office Bearers', href: '/office-bearers' },
    { name: 'Genesis', href: '/genesis' },
    { name: 'Mandate & Activities', href: '/mandate-activities' },
    { name: 'Contact Us', href: '/contact' },
  ];

  const resourcesNavigation = [
    { name: 'Life Members', href: '/life-members' },
    { name: 'Conference', href: '/conference' },
    { name: 'Publications', href: '/publications' },
    { name: 'Gallery', href: '/gallery' },
  ];

  const isActive = (href: string) => location.pathname === href;

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="xl:hidden">
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 bg-white">
          <div className="flex flex-col h-full">
            {/* User section */}
            {user ? (
              <div className="flex items-center gap-3 p-4 border-b">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-green-100 text-green-700">
                    {getInitials(user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="font-medium text-sm">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {loading ? 'Checking role...' : isAdmin ? 'Administrator' : 'Member'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 border-b">
                <div className="flex flex-col gap-2">
                  <Button asChild variant="ghost" onClick={() => setIsMenuOpen(false)}>
                    <Link to="/auth">Login</Link>
                  </Button>
                  <Button asChild onClick={() => setIsMenuOpen(false)}>
                    <Link to="/auth">Sign Up</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6">
              <div className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-700 hover:text-green-600 hover:bg-green-50/50'
                    }`}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Resources Section */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Resources
                </h3>
                <div className="space-y-2">
                  {resourcesNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-green-50 text-green-700'
                          : 'text-gray-700 hover:text-green-600 hover:bg-green-50/50'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* User menu items */}
              {user && (
                <div className="mt-6 pt-6 border-t">
                  <div className="space-y-2">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50/50"
                    >
                      <User className="h-4 w-4" />
                      Dashboard
                    </Link>
                    
                    <Link
                      to="/life-members"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50/50"
                    >
                      <CreditCard className="h-4 w-4" />
                      Membership
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50/50"
                      >
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        onSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50/50 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileMenu;
