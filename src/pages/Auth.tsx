import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Loader2, User, Lock, Copy, Check, Eye, EyeOff } from 'lucide-react';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
    <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
    <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
    <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
  </svg>
);

const Auth = () => {
  const navigate = useNavigate();
  const { user, isLoading, login, signup, loginWithGoogle, loginWithMicrosoft } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [uuidCode, setUuidCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUUID, setNewUUID] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const handleLogin = async () => {
    if (!uuidCode.trim() || !password) {
      toast({ title: 'Error', description: 'Please enter your UUID and password', variant: 'destructive' });
      return;
    }
    
    setIsSubmitting(true);
    const result = await login(uuidCode.trim(), password);
    setIsSubmitting(false);

    if (result.error) {
      toast({ title: 'Login Failed', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'Welcome back!', description: 'You have been logged in successfully' });
      navigate('/');
    }
  };

  const handleSignup = async () => {
    if (!password || password.length < 4) {
      toast({ title: 'Error', description: 'Password must be at least 4 characters', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    const result = await signup(password);
    setIsSubmitting(false);

    if (result.error) {
      toast({ title: 'Signup Failed', description: result.error, variant: 'destructive' });
    } else if (result.uuid_code) {
      setNewUUID(result.uuid_code);
      toast({ title: 'Account Created!', description: 'Save your UUID - you will need it to log in' });
    }
  };

  const handleGoogleLogin = async () => {
    const result = await loginWithGoogle();
    if (result.error) {
      toast({ title: 'Google Login Failed', description: result.error, variant: 'destructive' });
    }
  };

  const handleMicrosoftLogin = async () => {
    const result = await loginWithMicrosoft();
    if (result.error) {
      toast({ title: 'Microsoft Login Failed', description: result.error, variant: 'destructive' });
    }
  };

  const copyUUID = () => {
    if (newUUID) {
      navigator.clipboard.writeText(newUUID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const proceedToApp = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  // Show UUID after signup
  if (newUUID) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-6">
              <Check className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Account Created!</h1>
            <p className="text-gray-400">Save your UUID below - you'll need it to log in</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <p className="text-sm text-gray-400 mb-2">Your UUID:</p>
            <div className="flex items-center gap-2 bg-gray-900 p-4 rounded-xl border border-green-500/30">
              <code className="flex-1 text-lg font-mono text-green-400 tracking-wider">
                {newUUID}
              </code>
              <button onClick={copyUUID} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
            <p className="text-amber-400 text-sm mt-4 text-center">
              ⚠️ Write this down! You cannot recover it if lost.
            </p>
            <button
              onClick={proceedToApp}
              className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Continue to App
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6">
            <User className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-400">
            {mode === 'login' 
              ? 'Sign in to continue' 
              : 'Choose a password to get your UUID'}
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 space-y-4">
          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:bg-gray-100 hover:scale-[1.02]"
            >
              <GoogleIcon />
              Continue with Google
            </button>
            <button
              onClick={handleMicrosoftLogin}
              className="w-full flex items-center justify-center gap-3 bg-[#2F2F2F] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:bg-[#3F3F3F] hover:scale-[1.02]"
            >
              <MicrosoftIcon />
              Continue with Microsoft
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-gray-500 text-sm">or use UUID</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          {/* UUID Login */}
          {mode === 'login' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">UUID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={uuidCode}
                  onChange={(e) => setUuidCode(e.target.value.toUpperCase())}
                  placeholder="UUID-XXXX-XXXX"
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())}
                placeholder="Enter password"
                className="w-full pl-10 pr-12 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            onClick={mode === 'login' ? handleLogin : handleSignup}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {mode === 'login' ? 'Logging in...' : 'Creating account...'}
              </>
            ) : (
              mode === 'login' ? 'Log In with UUID' : 'Create UUID Account'
            )}
          </button>

          <div className="text-center pt-4 border-t border-gray-700">
            {mode === 'login' ? (
              <p className="text-gray-400">
                Don't have a UUID?{' '}
                <button onClick={() => setMode('signup')} className="text-purple-400 hover:text-purple-300 font-medium">
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-gray-400">
                Already have a UUID?{' '}
                <button onClick={() => setMode('login')} className="text-purple-400 hover:text-purple-300 font-medium">
                  Log in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
