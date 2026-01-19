import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Copy, Check, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AdminCodes = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [appType, setAppType] = useState<"GD" | "MCD">("MCD");
  const [expiryMonth, setExpiryMonth] = useState(1);
  const [expiryYear, setExpiryYear] = useState(2027);
  const [maxUses, setMaxUses] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [storedPassword, setStoredPassword] = useState("");

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
      const { data, error } = await supabase.functions.invoke("generate-code", {
        body: {
          password: storedPassword,
          appType,
          expiryMonth,
          expiryYear,
          maxUses,
        },
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
            <div className="grid grid-cols-2 gap-3">
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
            </div>
          </div>

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
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Format: [Expiry MMY][Uses 3 digits][Keys 8 chars][App]
        </p>
      </div>
    </div>
  );
};

export default AdminCodes;
