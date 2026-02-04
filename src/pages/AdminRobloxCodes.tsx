import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Eye, EyeOff, Upload, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AdminRobloxCodes = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [storedPassword, setStoredPassword] = useState("");
  const [robuxType, setRobuxType] = useState<"A" | "B">("A");
  const [codesText, setCodesText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState<{
    typeA: { available: number; used: number };
    typeB: { available: number; used: number };
  } | null>(null);

  const handleLogin = () => {
    setStoredPassword(password);
    setIsAuthenticated(true);
    setPassword("");
    fetchStats(password);
  };

  const fetchStats = async (pwd: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("roblox-codes", {
        body: { action: "stats", password: pwd },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setStats(data);
    } catch (error: any) {
      if (error.message?.includes("Unauthorized")) {
        setIsAuthenticated(false);
        setStoredPassword("");
      }
      console.error("Failed to fetch stats:", error);
    }
  };

  const uploadCodes = async () => {
    if (!codesText.trim()) {
      toast({ title: "Error", description: "Please enter some codes", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      // Split by newlines or commas and clean up
      const codes = codesText
        .split(/[\n,]+/)
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      if (codes.length === 0) {
        throw new Error("No valid codes found");
      }

      const { data, error } = await supabase.functions.invoke("roblox-codes", {
        body: { action: "add", password: storedPassword, codes, robuxType },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Success!",
        description: `Added ${data.added} Roblox codes (Type ${robuxType})`,
      });
      setCodesText("");
      fetchStats(storedPassword);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload codes",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          <button
            onClick={() => navigate("/admin/codes")}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Code Generator</span>
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mb-6">
              <Lock className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Roblox Codes Manager</h1>
            <p className="text-gray-400">Enter password to manage Roblox codes</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 pr-12 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Unlock
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col items-center p-6">
      <div className="max-w-2xl w-full">
        <button
          onClick={() => navigate("/admin/codes")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Code Generator</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Roblox Codes Manager</h1>
          <p className="text-gray-400">Upload real Roblox gift card codes</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-4">
              <h3 className="text-green-400 font-semibold mb-2">Type A (100 Robux)</h3>
              <p className="text-2xl font-bold">{stats.typeA.available} available</p>
              <p className="text-sm text-gray-400">{stats.typeA.used} used</p>
            </div>
            <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-4">
              <h3 className="text-purple-400 font-semibold mb-2">Type B (500 Robux)</h3>
              <p className="text-2xl font-bold">{stats.typeB.available} available</p>
              <p className="text-sm text-gray-400">{stats.typeB.used} used</p>
            </div>
          </div>
        )}

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 space-y-6">
          {/* Robux Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Robux Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setRobuxType("A")}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  robuxType === "A"
                    ? "bg-green-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Type A (100 Robux)
              </button>
              <button
                onClick={() => setRobuxType("B")}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  robuxType === "B"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Type B (500 Robux)
              </button>
            </div>
          </div>

          {/* Codes Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Roblox Gift Card Codes
            </label>
            <textarea
              value={codesText}
              onChange={(e) => setCodesText(e.target.value)}
              placeholder="Paste codes here, one per line or comma-separated..."
              rows={8}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              Enter one code per line or separate with commas
            </p>
          </div>

          {/* Upload Button */}
          <button
            onClick={uploadCodes}
            disabled={isUploading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            {isUploading ? "Uploading..." : "Upload Codes"}
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Where to get Roblox codes?
          </h3>
          <p className="text-sm text-gray-400">
            Purchase Roblox gift cards from retailers like Amazon, Walmart, Target, or the official
            Roblox website. Each card has a unique redemption code that you can add here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRobloxCodes;
