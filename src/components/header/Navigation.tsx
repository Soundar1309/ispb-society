
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const Navigation = () => {
  return (
    <nav className="hidden lg:flex items-center space-x-8">
      <Link
        to="/"
        className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200"
      >
        Home
      </Link>
      
      <div className="relative group">
        <button className="flex items-center text-gray-700 hover:text-green-600 font-medium transition-colors duration-200">
          About
          <ChevronDown className="ml-1 h-4 w-4" />
        </button>
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="py-2">
            <Link
              to="/genesis"
              className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
            >
              Genesis
            </Link>
            <Link
              to="/mandate-activities"
              className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
            >
              Mandate & Activities
            </Link>
            <Link
              to="/office-bearers"
              className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
            >
              Office Bearers
            </Link>
          </div>
        </div>
      </div>

      <div className="relative group">
        <button className="flex items-center text-gray-700 hover:text-green-600 font-medium transition-colors duration-200">
          Members
          <ChevronDown className="ml-1 h-4 w-4" />
        </button>
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="py-2">
            <Link
              to="/membership"
              className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
            >
              Membership
            </Link>
            <Link
              to="/life-members"
              className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
            >
              Life Members
            </Link>
          </div>
        </div>
      </div>

      <Link
        to="/conference"
        className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200"
      >
        Conference
      </Link>

      <Link
        to="/publications"
        className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200"
      >
        Publications
      </Link>

      <Link
        to="/gallery"
        className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200"
      >
        Gallery
      </Link>

      <Link
        to="/contact"
        className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200"
      >
        Contact
      </Link>
    </nav>
  );
};

export default Navigation;
