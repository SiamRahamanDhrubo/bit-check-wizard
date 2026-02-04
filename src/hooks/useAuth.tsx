import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthUser {
  id: string;
  uuid_code: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (uuid_code: string, password: string) => Promise<{ error?: string }>;
  signup: (password: string) => Promise<{ error?: string; uuid_code?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = 'uuid_session_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    validateSession();
  }, []);

  const validateSession = async () => {
    const sessionToken = localStorage.getItem(SESSION_KEY);
    if (!sessionToken) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('uuid-auth', {
        body: { action: 'validate', session_token: sessionToken },
      });

      if (error || !data?.valid) {
        localStorage.removeItem(SESSION_KEY);
        setUser(null);
      } else {
        setUser({ id: data.user_id, uuid_code: data.uuid_code });
      }
    } catch (err) {
      console.error('Session validation error:', err);
      localStorage.removeItem(SESSION_KEY);
    }
    setIsLoading(false);
  };

  const login = async (uuid_code: string, password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('uuid-auth', {
        body: { action: 'login', uuid_code, password },
      });

      if (error) {
        return { error: 'Failed to connect to server' };
      }

      if (data.error) {
        return { error: data.error };
      }

      localStorage.setItem(SESSION_KEY, data.session_token);
      setUser({ id: data.user_id, uuid_code: data.uuid_code });
      return {};
    } catch (err) {
      return { error: 'Login failed' };
    }
  };

  const signup = async (password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('uuid-auth', {
        body: { action: 'signup', password },
      });

      if (error) {
        return { error: 'Failed to connect to server' };
      }

      if (data.error) {
        return { error: data.error };
      }

      localStorage.setItem(SESSION_KEY, data.session_token);
      setUser({ id: data.user_id, uuid_code: data.uuid_code });
      return { uuid_code: data.uuid_code };
    } catch (err) {
      return { error: 'Signup failed' };
    }
  };

  const logout = async () => {
    const sessionToken = localStorage.getItem(SESSION_KEY);
    if (sessionToken) {
      await supabase.functions.invoke('uuid-auth', {
        body: { action: 'logout', session_token: sessionToken },
      });
    }
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
