
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const Navigation = () => {
  const location = useLocation();
  const [showAboutDropdown, setShowAboutDropdown] = useState(false);

  const isActive = (href: string) => location.pathname === href;
  
  const aboutMenuItems = [
    { name: 'Office Bearers', href: '/office-bearers' },
    { name: 'Genesis', href: '/genesis' },
    { name: 'Mandate & Activities', href: '/mandate-activities' },
  ];

  return (
    <nav className="hidden xl:flex items-center space-x-1">
      <Link
        to="/"
        className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group ${
          isActive('/')
            ? 'bg-green-50 text-green-700 shadow-sm'
            : 'text-gray-700 hover:text-green-600 hover:bg-green-50/50'
        }`}
      >
        <span className="relative z-10">Home</span>
        {isActive('/') && (
          <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-green-50 rounded-lg"></div>
        )}
        <div className="absolute inset-0 bg-green-100 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 opacity-0 group-hover:opacity-100"></div>
      </Link>

      {/* About Dropdown */}
      <div 
        className="relative"
        onMouseEnter={() => setShowAboutDropdown(true)}
        onMouseLeave={() => setShowAboutDropdown(false)}
      >
        <button
          className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group flex items-center ${
            aboutMenuItems.some(item => isActive(item.href))
              ? 'bg-green-50 text-green-700 shadow-sm'
              : 'text-gray-700 hover:text-green-600 hover:bg-green-50/50'
          }`}
        >
          <span className="relative z-10">About</span>
          <ChevronDown className="ml-1 h-4 w-4" />
          {aboutMenuItems.some(item => isActive(item.href)) && (
            <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-green-50 rounded-lg"></div>
          )}
          <div className="absolute inset-0 bg-green-100 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 opacity-0 group-hover:opacity-100"></div>
        </button>
        
        {showAboutDropdown && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {aboutMenuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-4 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  isActive(item.href)
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-green-50/50 hover:text-green-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link
        to="/life-members"
        className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group ${
          isActive('/life-members')
            ? 'bg-green-50 text-green-700 shadow-sm'
            : 'text-gray-700 hover:text-green-600 hover:bg-green-50/50'
        }`}
      >
        <span className="relative z-10">Life Members</span>
        {isActive('/life-members') && (
          <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-green-50 rounded-lg"></div>
        )}
        <div className="absolute inset-0 bg-green-100 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 opacity-0 group-hover:opacity-100"></div>
      </Link>

      <Link
        to="/conference"
        className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group ${
          isActive('/conference')
            ? 'bg-green-50 text-green-700 shadow-sm'
            : 'text-gray-700 hover:text-green-600 hover:bg-green-50/50'
        }`}
      >
        <span className="relative z-10">Conference</span>
        {isActive('/conference') && (
          <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-green-50 rounded-lg"></div>
        )}
        <div className="absolute inset-0 bg-green-100 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 opacity-0 group-hover:opacity-100"></div>
      </Link>

      <Link
        to="/contact"
        className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group ${
          isActive('/contact')
            ? 'bg-green-50 text-green-700 shadow-sm'
            : 'text-gray-700 hover:text-green-600 hover:bg-green-50/50'
        }`}
      >
        <span className="relative z-10">Contact Us</span>
        {isActive('/contact') && (
          <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-green-50 rounded-lg"></div>
        )}
        <div className="absolute inset-0 bg-green-100 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 opacity-0 group-hover:opacity-100"></div>
      </Link>
    </nav>
  );
};

export default Navigation;
