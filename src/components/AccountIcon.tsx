import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, LogOut, Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AccountIcon = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    if (!isOpen) {
      setIsSpinning(true);
      setTimeout(() => {
        setIsSpinning(false);
        setIsOpen(true);
      }, 500);
    } else {
      setIsOpen(false);
    }
  };

  const copyUUID = () => {
    if (user?.uuid_code) {
      navigator.clipboard.writeText(user.uuid_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({ title: 'Logged out', description: 'You have been logged out successfully' });
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={handleClick}
        className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 ${
          isSpinning ? 'animate-spin' : ''
        }`}
      >
        <User className="w-6 h-6 text-white" />
      </button>

      {isOpen && (
        <div className="absolute top-14 left-0 bg-gray-800/95 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl p-4 min-w-[280px] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="mb-3">
            <p className="text-xs text-gray-400 mb-1">Your UUID</p>
            <div className="flex items-center gap-2 bg-gray-900 p-2 rounded-lg">
              <code className="text-sm font-mono text-purple-400 flex-1">{user.uuid_code}</code>
              <button
                onClick={copyUUID}
                className="p-1 hover:bg-gray-800 rounded transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountIcon;
