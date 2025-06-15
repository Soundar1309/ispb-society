
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

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
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-green-50"
        >
          {isMenuOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={20} className="sm:w-6 sm:h-6" />}
        </button>
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
    </>
  );
};

export default MobileMenu;
