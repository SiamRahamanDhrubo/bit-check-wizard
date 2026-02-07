import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, TrendingUp, DollarSign, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface HelperStat {
  helper: {
    id: string;
    name: string;
    code: string;
  };
  totalCodes: number;
  usedCodes: number;
  soldCodes: number;
  totalRevenue: number;
  byApp: Record<string, { total: number; used: number }>;
}

const AdminSales = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [storedPassword, setStoredPassword] = useState("");

  const [stats, setStats] = useState<HelperStat[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setStoredPassword(password);
    setIsAuthenticated(true);
    setPassword("");
  };

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("helpers", {
        body: { action: "sales-stats", password: storedPassword },
      });

      if (error) throw error;
      if (data.error) {
        if (data.error === "Unauthorized") {
          setIsAuthenticated(false);
          setStoredPassword("");
        }
        throw new Error(data.error);
      }

      setStats(data.stats || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && storedPassword) {
      fetchStats();
    }
  }, [isAuthenticated, storedPassword]);

  const totalStats = stats.reduce(
    (acc, s) => ({
      codes: acc.codes + s.totalCodes,
      used: acc.used + s.usedCodes,
      sold: acc.sold + s.soldCodes,
      revenue: acc.revenue + s.totalRevenue,
    }),
    { codes: 0, used: 0, sold: 0, revenue: 0 }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          <button onClick={() => navigate("/admin/helpers")} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-6">
              <Lock className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Sales Dashboard</h1>
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
                className="w-full px-4 py-3 pr-12 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button onClick={handleLogin} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl">
              Unlock
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate("/admin/helpers")} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Helpers</span>
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            Sales Dashboard
          </h1>
          <p className="text-gray-400">Track helper performance and revenue</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-sm text-gray-400">Total Codes</p>
            <p className="text-2xl font-bold">{totalStats.codes}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-sm text-gray-400">Redeemed</p>
            <p className="text-2xl font-bold text-green-400">{totalStats.used}</p>
            <p className="text-xs text-gray-500">{totalStats.codes > 0 ? Math.round((totalStats.used / totalStats.codes) * 100) : 0}% rate</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-sm text-gray-400">Marked Sold</p>
            <p className="text-2xl font-bold text-blue-400">{totalStats.sold}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-sm text-gray-400">Total Revenue</p>
            <p className="text-2xl font-bold text-yellow-400">${totalStats.revenue.toFixed(2)}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : stats.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No helpers yet. Add helpers and generate codes to see stats.</div>
        ) : (
          <div className="space-y-4">
            {stats.map((stat) => (
              <div key={stat.helper.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{stat.helper.name}</h3>
                    <code className="text-sm text-blue-400">{stat.helper.code}</code>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-400">${stat.totalRevenue.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">revenue</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                    <p className="text-lg font-semibold">{stat.totalCodes}</p>
                    <p className="text-xs text-gray-400">Total Codes</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                    <p className="text-lg font-semibold text-green-400">{stat.usedCodes}</p>
                    <p className="text-xs text-gray-400">Redeemed</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                    <p className="text-lg font-semibold text-blue-400">{stat.soldCodes}</p>
                    <p className="text-xs text-gray-400">Marked Sold</p>
                  </div>
                </div>

                {/* By App Type */}
                <div className="flex gap-3 flex-wrap">
                  {Object.entries(stat.byApp).map(([app, data]) => (
                    <div key={app} className="flex items-center gap-2 bg-gray-900/50 px-3 py-1 rounded-lg text-sm">
                      <span className={`w-2 h-2 rounded-full ${app === "MCD" ? "bg-green-500" : app === "GD" ? "bg-yellow-500" : "bg-red-500"}`} />
                      <span className="text-gray-400">{app}:</span>
                      <span>{data.used}/{data.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSales;
