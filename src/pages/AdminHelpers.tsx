import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Users, Eye, EyeOff, Trash2, Edit, Power, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Helper {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
  notes: string | null;
}

const AdminHelpers = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [storedPassword, setStoredPassword] = useState("");
  
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // New helper form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newHelperPassword, setNewHelperPassword] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const handleLogin = () => {
    setStoredPassword(password);
    setIsAuthenticated(true);
    setPassword("");
  };

  const fetchHelpers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("helpers", {
        body: { action: "list-helpers", password: storedPassword },
      });

      if (error) throw error;
      if (data.error) {
        if (data.error === "Unauthorized") {
          setIsAuthenticated(false);
          setStoredPassword("");
        }
        throw new Error(data.error);
      }

      setHelpers(data.helpers || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && storedPassword) {
      fetchHelpers();
    }
  }, [isAuthenticated, storedPassword]);

  const createHelper = async () => {
    if (!newName || !newHelperPassword) {
      toast({ title: "Error", description: "Name and password required", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("helpers", {
        body: {
          action: "create-helper",
          password: storedPassword,
          name: newName,
          helperPassword: newHelperPassword,
          notes: newNotes,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({ title: "Helper Created!", description: `Code: ${data.helper.code}` });
      setNewName("");
      setNewHelperPassword("");
      setNewNotes("");
      setShowAddForm(false);
      fetchHelpers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleActive = async (helperId: string, currentActive: boolean) => {
    try {
      const { data, error } = await supabase.functions.invoke("helpers", {
        body: {
          action: "update-helper",
          password: storedPassword,
          helperId,
          is_active: !currentActive,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({ title: currentActive ? "Helper Deactivated" : "Helper Activated" });
      fetchHelpers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteHelper = async (helperId: string, name: string) => {
    if (!confirm(`Delete helper "${name}"? Their codes will remain but be unassigned.`)) return;

    try {
      const { data, error } = await supabase.functions.invoke("helpers", {
        body: { action: "delete-helper", password: storedPassword, helperId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({ title: "Helper Deleted" });
      fetchHelpers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          <button onClick={() => navigate("/admin/codes")} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Admin</span>
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-6">
              <Lock className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Helper Management</h1>
            <p className="text-gray-400">Enter admin password</p>
          </div>

          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Admin password"
                className="w-full px-4 py-3 pr-12 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button onClick={handleLogin} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl">
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
        <button onClick={() => navigate("/admin/codes")} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Admin</span>
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="w-8 h-8" />
              Helpers
            </h1>
            <p className="text-gray-400">Manage your code resellers</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/admin/batches")}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-xl"
            >
              Code Batches
            </button>
            <button
              onClick={() => navigate("/admin/sales")}
              className="bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-xl"
            >
              Sales Dashboard
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-xl flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Helper
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 mb-6">
            <h3 className="text-lg font-semibold mb-4">New Helper</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Helper name"
                className="px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                value={newHelperPassword}
                onChange={(e) => setNewHelperPassword(e.target.value)}
                placeholder="Password for helper"
                className="px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <input
              type="text"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Notes (optional)"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex gap-3">
              <button onClick={createHelper} className="bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-6 rounded-xl">
                Create Helper
              </button>
              <button onClick={() => setShowAddForm(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-xl">
                Cancel
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : helpers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No helpers yet. Add one to get started!</div>
        ) : (
          <div className="space-y-4">
            {helpers.map((helper) => (
              <div key={helper.id} className={`bg-gray-800/50 rounded-xl p-4 border ${helper.is_active ? "border-gray-700" : "border-red-500/30"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{helper.name}</h3>
                      <code className="text-sm bg-gray-900 px-2 py-1 rounded text-blue-400">{helper.code}</code>
                      {!helper.is_active && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Inactive</span>}
                    </div>
                    {helper.notes && <p className="text-sm text-gray-400 mt-1">{helper.notes}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      Created: {new Date(helper.created_at).toLocaleDateString()}
                      {helper.last_login_at && ` • Last login: ${new Date(helper.last_login_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleActive(helper.id, helper.is_active)}
                      className={`p-2 rounded-lg ${helper.is_active ? "bg-yellow-600 hover:bg-yellow-500" : "bg-green-600 hover:bg-green-500"}`}
                      title={helper.is_active ? "Deactivate" : "Activate"}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteHelper(helper.id, helper.name)}
                      className="p-2 bg-red-600 hover:bg-red-500 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHelpers;
