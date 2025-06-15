
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
  );
};

export default Navigation;
