import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, Users, Ban, Trash2, RefreshCw, Shield, ShieldOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  uuid_code: string;
  is_banned: boolean;
  ban_reason: string | null;
  created_at: string;
  last_login_at: string | null;
  redemption_count: number;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [storedPassword, setStoredPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleLogin = () => {
    setStoredPassword(password);
    setIsAuthenticated(true);
    setPassword('');
    loadUsers(password);
  };

  const loadUsers = async (pwd?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: { action: 'list', password: pwd || storedPassword },
      });

      if (error || data.error) {
        if (data?.error?.includes('Unauthorized')) {
          setIsAuthenticated(false);
          setStoredPassword('');
          toast({ title: 'Error', description: 'Invalid password', variant: 'destructive' });
          return;
        }
        throw new Error(data?.error || 'Failed to load users');
      }

      setUsers(data.users || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const banUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: { action: 'ban', password: storedPassword, user_id: userId, ban_reason: banReason || 'Banned by admin' },
      });

      if (error || data.error) {
        throw new Error(data?.error || 'Failed to ban user');
      }

      toast({ title: 'User Banned', description: 'User has been banned successfully' });
      setBanReason('');
      setSelectedUser(null);
      loadUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: { action: 'unban', password: storedPassword, user_id: userId },
      });

      if (error || data.error) {
        throw new Error(data?.error || 'Failed to unban user');
      }

      toast({ title: 'User Unbanned', description: 'User has been unbanned' });
      loadUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: { action: 'delete', password: storedPassword, user_id: userId },
      });

      if (error || data.error) {
        throw new Error(data?.error || 'Failed to delete user');
      }

      toast({ title: 'User Deleted', description: 'User has been deleted' });
      loadUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          <button
            onClick={() => navigate('/admin/codes')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-6">
              <Lock className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Manage Users</h1>
            <p className="text-gray-400">Enter admin password to continue</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 pr-12 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Unlock
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/admin/codes')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Codes</span>
          </button>

          <button
            onClick={() => loadUsers()}
            disabled={isLoading}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-400 mt-2">{users.length} registered users</p>
        </div>

        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border ${
                user.is_banned ? 'border-red-500/30' : 'border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <code className="text-lg font-mono text-purple-400">{user.uuid_code}</code>
                    {user.is_banned && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
                        <Ban className="w-3 h-3" /> Banned
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Created: {new Date(user.created_at).toLocaleDateString()} • 
                    Last login: {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'} • 
                    Redemptions: {user.redemption_count}
                  </div>
                  {user.is_banned && user.ban_reason && (
                    <div className="text-sm text-red-400 mt-1">Reason: {user.ban_reason}</div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {user.is_banned ? (
                    <button
                      onClick={() => unbanUser(user.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors"
                    >
                      <ShieldOff className="w-4 h-4" /> Unban
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm transition-colors"
                    >
                      <Shield className="w-4 h-4" /> Ban
                    </button>
                  )}
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>

              {selectedUser === user.id && !user.is_banned && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      placeholder="Ban reason (optional)"
                      className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm"
                    />
                    <button
                      onClick={() => banUser(user.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Confirm Ban
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        setBanReason('');
                      }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {users.length === 0 && !isLoading && (
            <div className="text-center py-12 text-gray-500">
              No users found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
