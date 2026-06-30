import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auto-logout time in milliseconds (30 minutes)
const AUTO_LOGOUT_TIME = 30 * 60 * 1000;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(async (isAutoLogout = false) => {
    try {
      // Check if there's an active session before attempting to sign out
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error signing out:', error);
          // Don't throw error for session missing, just log it
          if (error.message !== 'Auth session missing!') {
            throw error;
          }
        }
      }

      // Clear local state regardless of API response
      setSession(null);
      setUser(null);

      if (isAutoLogout === true) {
        toast.info("You have been logged out due to inactivity.");
      }
    } catch (error) {
      console.error('Error signing out:', error);
      // Clear local state even if sign out fails
      setSession(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Inactivity Auto-Logout Effect
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      if (session) {
        timeoutId = setTimeout(() => {
          signOut(true); // pass flag for auto-logout
        }, AUTO_LOGOUT_TIME);
      }
    };

    if (session) {
      // Start the timer when session exists
      resetTimer();

      // Events to track user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      events.forEach((event) => {
        document.addEventListener(event, resetTimer, { passive: true });
      });

      return () => {
        clearTimeout(timeoutId);
        events.forEach((event) => {
          document.removeEventListener(event, resetTimer);
        });
      };
    }
  }, [session, signOut]);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
