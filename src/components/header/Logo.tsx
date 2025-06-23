import { Link } from 'react-router-dom';
import logoImg from '../../assets/ispb-logo.png';

const Logo = () => {
  return (
    <div className="flex-shrink-0">
      <Link to="/" className="flex items-center space-x-3 group">
        <div className="relative">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
             <img src={logoImg} alt="ISPB Logo" className="w-34 object-contain rounded-full" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-br from-green-600 to-orange-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-300">
            ISPB
          </h1>
          <p className="text-xs lg:text-sm text-gray-600 leading-tight">
            Indian Society of Plant Breeders
          </p>
        </div>
      </Link>
    </div>
  );
};

export default Logo;
