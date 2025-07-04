
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const Navigation = () => {
  return (
    <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
      <Link
        to="/"
        className="text-gray-700 hover:text-green-600 font-medium transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-green-50"
      >
        Home
      </Link>
      
      <div className="relative group">
        <button className="flex items-center text-gray-700 hover:text-green-600 font-medium transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-green-50">
          About
          <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
        </button>
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
          <div className="py-3">
            <Link
              to="/genesis"
              className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-200 font-medium"
            >
              Genesis
            </Link>
            <Link
              to="/mandate-activities"
              className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-200 font-medium"
            >
              Mandate & Activities
            </Link>
            <Link
              to="/office-bearers"
              className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-200 font-medium"
            >
              Office Bearers
            </Link>
          </div>
        </div>
      </div>

      <div className="relative group">
        <button className="flex items-center text-gray-700 hover:text-green-600 font-medium transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-green-50">
          Members
          <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
        </button>
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
          <div className="py-3">
            <Link
              to="/membership"
              className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-200 font-medium"
            >
              Membership
            </Link>
            <Link
              to="/life-members"
              className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-200 font-medium"
            >
              Life Members
            </Link>
          </div>
        </div>
      </div>

      <Link
        to="/conference"
        className="text-gray-700 hover:text-green-600 font-medium transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-green-50"
      >
        Conference
      </Link>

      <Link
        to="/publications"
        className="text-gray-700 hover:text-green-600 font-medium transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-green-50"
      >
        Publications
      </Link>

      <Link
        to="/gallery"
        className="text-gray-700 hover:text-green-600 font-medium transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-green-50"
      >
        Gallery
      </Link>

      <Link
        to="/contact"
        className="text-gray-700 hover:text-green-600 font-medium transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-green-50"
      >
        Contact
      </Link>
    </nav>
  );
};

export default Navigation;
