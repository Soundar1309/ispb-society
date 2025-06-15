
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
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

  return (
    <nav className="hidden xl:flex items-center space-x-1">
      {navigation.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group ${
            isActive(item.href)
              ? 'bg-green-50 text-green-700 shadow-sm'
              : 'text-gray-700 hover:text-green-600 hover:bg-green-50/50'
          }`}
        >
          <span className="relative z-10">{item.name}</span>
          {isActive(item.href) && (
            <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-green-50 rounded-lg"></div>
          )}
          <div className="absolute inset-0 bg-green-100 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 opacity-0 group-hover:opacity-100"></div>
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;
