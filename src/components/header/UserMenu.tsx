
import { Link } from 'react-router-dom';
import { User, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
            <Button variant="outline" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <User size={14} className="sm:w-4 sm:h-4" />
              <span className="max-w-20 sm:max-w-32 truncate">
                {user.user_metadata?.full_name || user.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to="/dashboard" className="flex items-center">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link to="/admin" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Admin Panel
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button asChild className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm">
          <Link to="/auth" className="flex items-center space-x-1 sm:space-x-2">
            <User size={14} className="sm:w-4 sm:h-4" />
            <span>Login</span>
          </Link>
        </Button>
      )}
    </div>
  );
};

export default UserMenu;
