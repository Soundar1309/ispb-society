
import { Link } from 'react-router-dom';
import { User, LogOut, Settings, Shield, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UserMenuProps {
  user: any;
  isAdmin: boolean;
  onSignOut: () => void;
  loading?: boolean;
}

const UserMenu = ({ user, isAdmin, onSignOut, loading }: UserMenuProps) => {
  if (!user) {
    return (
      <div className="hidden md:flex items-center space-x-2">
        <Button asChild variant="ghost">
          <Link to="/auth">Login</Link>
        </Button>
        <Button asChild>
          <Link to="/auth">Sign Up</Link>
        </Button>
      </div>
    );
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="hidden md:block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-green-100 text-green-700">
                {getInitials(user.email)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-56 bg-white border shadow-lg z-50" 
          align="end" 
          forceMount
        >
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium text-sm">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                {loading ? 'Checking role...' : isAdmin ? 'Administrator' : 'Member'}
              </p>
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link to="/dashboard" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link to="/membership" className="flex items-center">
              <CreditCard className="mr-2 h-4 w-4" />
              Membership
            </Link>
          </DropdownMenuItem>
          
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link to="/admin" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Admin Panel
              </Link>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={onSignOut} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;
