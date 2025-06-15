
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
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
  );
};

export default Logo;
