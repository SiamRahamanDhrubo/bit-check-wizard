import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Copy, Check, Lock, Eye, EyeOff, Users, Key, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AdminCodes = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [appType, setAppType] = useState<"GD" | "MCD" | "RB">("MCD");
  const [robuxType, setRobuxType] = useState<"A" | "B">("A");
  const [expiryMonth, setExpiryMonth] = useState(1);
  const [expiryYear, setExpiryYear] = useState(2027);
  const [maxUses, setMaxUses] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [storedPassword, setStoredPassword] = useState("");
  const [useCustomSecrets, setUseCustomSecrets] = useState(false);
  const [customSecret1, setCustomSecret1] = useState("");
  const [customSecret2, setCustomSecret2] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");

  const handleLogin = async () => {
    // Store password for later use with edge function
    // The actual validation happens server-side
    setStoredPassword(password);
    setIsAuthenticated(true);
    setPassword("");
    toast({
      title: "Proceeding...",
      description: "Password will be validated when generating codes.",
    });
  };

  const generateCode = async () => {
    setIsGenerating(true);
    
    try {
      const body: Record<string, unknown> = {
        password: storedPassword,
        appType,
        expiryMonth,
        expiryYear,
        maxUses,
        ...(appType === "RB" && { robuxType }),
      };
      
      if (useCustomSecrets && customSecret1 && customSecret2 && encryptionKey) {
        body.customSecret1 = customSecret1;
        body.customSecret2 = customSecret2;
        body.encryptionKey = encryptionKey;
      }
      
      const { data, error } = await supabase.functions.invoke("generate-code", {
        body,
      });
      
      if (error) {
        throw new Error(error.message || "Failed to generate code");
      }
      
      if (data.error) {
        if (data.error.includes("Unauthorized")) {
          setIsAuthenticated(false);
          setStoredPassword("");
          throw new Error("Invalid password. Please try again.");
        }
        throw new Error(data.error);
      }
      
      setGeneratedCode(data.code);
      toast({
        title: "Code Generated!",
        description: "Your redemption code has been created.",
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate code",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Password login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mb-6">
              <Lock className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Admin Access</h1>
            <p className="text-gray-400">Enter password to generate codes</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Go Back</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Generate Codes</h1>
          <p className="text-gray-400">Create redemption codes for apps</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 space-y-6">
          {/* App Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              App Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setAppType("MCD")}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  appType === "MCD"
                    ? "bg-green-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Minecraft
              </button>
              <button
                onClick={() => setAppType("GD")}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  appType === "GD"
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Geometry Dash
              </button>
              <button
                onClick={() => setAppType("RB")}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  appType === "RB"
                    ? "bg-red-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Roblox
              </button>
            </div>
          </div>

          {/* Robux Type (only for Roblox) */}
          {appType === "RB" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Robux Amount
              </label>
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
          )}

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Expiry Date
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(parseInt(e.target.value))}
                className="px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i, 1).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
              <select
                value={expiryYear}
                onChange={(e) => setExpiryYear(parseInt(e.target.value))}
                className="px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {[2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Max Uses */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Maximum Uses
            </label>
            <input
              type="number"
              min={1}
              max={999}
              value={maxUses}
              onChange={(e) => setMaxUses(Math.max(1, Math.min(999, parseInt(e.target.value) || 1)))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Custom Secrets Toggle */}
          <div className="border-t border-gray-700 pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomSecrets}
                onChange={(e) => setUseCustomSecrets(e.target.checked)}
                className="w-5 h-5 rounded bg-gray-900 border-gray-600 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Use Custom Encrypted Secrets
              </span>
            </label>
          </div>

          {/* Custom Secrets Fields */}
          {useCustomSecrets && (
            <div className="space-y-4 p-4 bg-gray-900/50 rounded-xl border border-purple-500/30">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Encryption Key
                </label>
                <input
                  type="password"
                  value={encryptionKey}
                  onChange={(e) => setEncryptionKey(e.target.value)}
                  placeholder="Your encryption key"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Secret 1
                  </label>
                  <input
                    type="text"
                    value={customSecret1}
                    onChange={(e) => setCustomSecret1(e.target.value.slice(0, 4))}
                    placeholder="4 chars"
                    maxLength={4}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Secret 2
                  </label>
                  <input
                    type="text"
                    value={customSecret2}
                    onChange={(e) => setCustomSecret2(e.target.value.slice(0, 4))}
                    placeholder="4 chars"
                    maxLength={4}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Secrets will be XOR encrypted with your key
              </p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generateCode}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {isGenerating ? "Generating..." : "Generate Code"}
          </button>

          {/* Generated Code Display */}
          {generatedCode && (
            <div className="mt-4 p-4 bg-gray-900 rounded-xl border border-green-500/30">
              <p className="text-sm text-gray-400 mb-2">Generated Code:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-lg font-mono text-green-400 tracking-wider break-all">
                  {generatedCode}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Management Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => navigate('/admin/helpers')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Helpers
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Key className="w-5 h-5" />
              UUID Users
            </button>
            <button
              onClick={() => navigate('/admin/roblox-codes')}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Gift className="w-5 h-5" />
              Roblox Codes
            </button>
            <button
              onClick={() => navigate('/admin/sales')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Sales
            </button>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Format: [Expiry MMY][Uses 3 digits][Keys 8 chars][App][Type for RB]
        </p>
      </div>
    </div>
  );
};

export default AdminCodes;
