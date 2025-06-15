
import { Link } from 'react-router-dom';
import { User, LogOut, Settings, LayoutDashboard, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface UserMenuProps {
  user: any;
  isAdmin: boolean;
  onSignOut: () => Promise<void>;
}

const UserMenu = ({ user, isAdmin, onSignOut }: UserMenuProps) => {
  return (
    <div className="hidden md:flex items-center">
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="max-w-32 truncate text-sm font-medium text-gray-700">
                {user.user_metadata?.full_name || user.email}
              </span>
              <ChevronDown size={14} className="text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 shadow-lg border-gray-200 rounded-xl">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {user.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <DropdownMenuItem asChild className="py-3">
              <Link to="/dashboard" className="flex items-center cursor-pointer">
                <LayoutDashboard className="mr-3 h-4 w-4 text-green-600" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem asChild className="py-3">
                <Link to="/admin" className="flex items-center cursor-pointer">
                  <Settings className="mr-3 h-4 w-4 text-orange-600" />
                  <span>Admin Panel</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut} className="py-3 text-red-600 focus:text-red-600 cursor-pointer">
              <LogOut className="mr-3 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button 
          asChild 
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-2"
        >
          <Link to="/auth" className="flex items-center space-x-2">
            <User size={16} />
            <span className="font-medium">Login</span>
          </Link>
        </Button>
      )}
    </div>
  );
};

export default UserMenu;
