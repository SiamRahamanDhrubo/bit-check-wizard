import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  uuid_code?: string;
  display_name?: string;
  avatar_url?: string;
  auth_type: 'uuid' | 'oauth';
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (uuid_code: string, password: string) => Promise<{ error?: string }>;
  signup: (password: string) => Promise<{ error?: string; uuid_code?: string }>;
  loginWithGoogle: () => Promise<{ error?: string }>;
  loginWithMicrosoft: () => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = 'uuid_session_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for Supabase auth changes (OAuth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await setOAuthUser(session.user);
      } else if (!localStorage.getItem(SESSION_KEY)) {
        // Only clear user if no UUID session either
        setUser(null);
      }
    });

    // Check for existing sessions
    initSession();

    return () => subscription.unsubscribe();
  }, []);

  const initSession = async () => {
    // Check Supabase OAuth session first
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await setOAuthUser(session.user);
      setIsLoading(false);
      return;
    }

    // Fall back to UUID session
    await validateUUIDSession();
  };

  const setOAuthUser = async (supabaseUser: SupabaseUser) => {
    setUser({
      id: supabaseUser.id,
      display_name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email || '',
      avatar_url: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || '',
      auth_type: 'oauth',
    });
  };

  const validateUUIDSession = async () => {
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
        setUser({ id: data.user_id, uuid_code: data.uuid_code, auth_type: 'uuid' });
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

      if (error) return { error: 'Failed to connect to server' };
      if (data.error) return { error: data.error };

      localStorage.setItem(SESSION_KEY, data.session_token);
      setUser({ id: data.user_id, uuid_code: data.uuid_code, auth_type: 'uuid' });
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

      if (error) return { error: 'Failed to connect to server' };
      if (data.error) return { error: data.error };

      localStorage.setItem(SESSION_KEY, data.session_token);
      setUser({ id: data.user_id, uuid_code: data.uuid_code, auth_type: 'uuid' });
      return { uuid_code: data.uuid_code };
    } catch (err) {
      return { error: 'Signup failed' };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) return { error: error.message };
      return {};
    } catch (err) {
      return { error: 'Google login failed' };
    }
  };

  const loginWithMicrosoft = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: { 
          redirectTo: window.location.origin,
          scopes: 'openid profile email',
        },
      });
      if (error) return { error: error.message };
      return {};
    } catch (err) {
      return { error: 'Microsoft login failed' };
    }
  };

  const logout = async () => {
    // Logout from UUID session
    const sessionToken = localStorage.getItem(SESSION_KEY);
    if (sessionToken) {
      await supabase.functions.invoke('uuid-auth', {
        body: { action: 'logout', session_token: sessionToken },
      });
      localStorage.removeItem(SESSION_KEY);
    }

    // Logout from Supabase OAuth
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, loginWithGoogle, loginWithMicrosoft, logout }}>
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
