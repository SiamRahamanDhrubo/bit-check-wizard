import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Plus, Copy, Check, Download, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Helper {
  id: string;
  name: string;
  code: string;
}

interface Batch {
  id: string;
  batch_name: string;
  app_type: string;
  robux_type: string | null;
  codes_count: number;
  created_at: string;
  helper_id: string;
  helpers: { name: string; code: string } | null;
}

const AdminBatches = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [storedPassword, setStoredPassword] = useState("");

  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Batch generation form
  const [showForm, setShowForm] = useState(false);
  const [selectedHelper, setSelectedHelper] = useState("");
  const [batchName, setBatchName] = useState("");
  const [appType, setAppType] = useState<"GD" | "MCD" | "RB">("MCD");
  const [robuxType, setRobuxType] = useState<"A" | "B">("A");
  const [count, setCount] = useState(5);
  const [expiryMonth, setExpiryMonth] = useState(1);
  const [expiryYear, setExpiryYear] = useState(2027);
  const [maxUses, setMaxUses] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // View batch codes
  const [viewingBatch, setViewingBatch] = useState<string | null>(null);
  const [batchCodes, setBatchCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleLogin = () => {
    setStoredPassword(password);
    setIsAuthenticated(true);
    setPassword("");
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [helpersRes, batchesRes] = await Promise.all([
        supabase.functions.invoke("helpers", {
          body: { action: "list-helpers", password: storedPassword },
        }),
        supabase.functions.invoke("helpers", {
          body: { action: "list-batches", password: storedPassword },
        }),
      ]);

      if (helpersRes.error) throw helpersRes.error;
      if (batchesRes.error) throw batchesRes.error;
      if (helpersRes.data.error) throw new Error(helpersRes.data.error);
      if (batchesRes.data.error) throw new Error(batchesRes.data.error);

      setHelpers(helpersRes.data.helpers || []);
      setBatches(batchesRes.data.batches || []);
    } catch (error: any) {
      if (error.message === "Unauthorized") {
        setIsAuthenticated(false);
        setStoredPassword("");
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && storedPassword) {
      fetchData();
    }
  }, [isAuthenticated, storedPassword]);

  const generateBatch = async () => {
    if (!selectedHelper || !batchName) {
      toast({ title: "Error", description: "Select helper and enter batch name", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("helpers", {
        body: {
          action: "generate-batch",
          password: storedPassword,
          helperId: selectedHelper,
          batchName,
          appType,
          robuxType: appType === "RB" ? robuxType : undefined,
          count,
          expiryMonth,
          expiryYear,
          maxUses,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({ title: "Batch Generated!", description: `${count} codes created` });
      setBatchCodes(data.codes);
      setViewingBatch(data.batchId);
      setShowForm(false);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const viewBatchCodes = async (batchId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("helpers", {
        body: { action: "batch-codes", password: storedPassword, batchId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setBatchCodes(data.codes.map((c: any) => c.code));
      setViewingBatch(batchId);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const copyAllCodes = () => {
    navigator.clipboard.writeText(batchCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCodes = () => {
    const batch = batches.find((b) => b.id === viewingBatch);
    const filename = `${batch?.batch_name || "codes"}_${new Date().toISOString().split("T")[0]}.txt`;
    const blob = new Blob([batchCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getAppColor = (app: string) => {
    switch (app) {
      case "MCD": return "bg-green-500";
      case "GD": return "bg-yellow-500 text-black";
      case "RB": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          <button onClick={() => navigate("/admin/helpers")} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6">
              <Lock className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Code Batches</h1>
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
                className="w-full px-4 py-3 pr-12 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button onClick={handleLogin} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl">
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
        <button onClick={() => navigate("/admin/helpers")} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Helpers</span>
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Package className="w-8 h-8" />
              Code Batches
            </h1>
            <p className="text-gray-400">Generate bulk codes for helpers</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-xl flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Generate Batch
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 mb-6 space-y-4">
            <h3 className="text-lg font-semibold">Generate New Batch</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Helper</label>
                <select
                  value={selectedHelper}
                  onChange={(e) => setSelectedHelper(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white"
                >
                  <option value="">Select helper...</option>
                  {helpers.map((h) => (
                    <option key={h.id} value={h.id}>{h.name} ({h.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Batch Name</label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="e.g., Week 1 Minecraft"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">App Type</label>
              <div className="grid grid-cols-3 gap-3">
                {(["MCD", "GD", "RB"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setAppType(type)}
                    className={`py-2 px-4 rounded-xl font-medium transition-all ${appType === type ? getAppColor(type) : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                  >
                    {type === "MCD" ? "Minecraft" : type === "GD" ? "Geometry Dash" : "Roblox"}
                  </button>
                ))}
              </div>
            </div>

            {appType === "RB" && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Robux Amount</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setRobuxType("A")}
                    className={`py-2 px-4 rounded-xl font-medium ${robuxType === "A" ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"}`}
                  >
                    Type A (100 Robux)
                  </button>
                  <button
                    onClick={() => setRobuxType("B")}
                    className={`py-2 px-4 rounded-xl font-medium ${robuxType === "B" ? "bg-purple-500 text-white" : "bg-gray-700 text-gray-300"}`}
                  >
                    Type B (500 Robux)
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Count</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={count}
                  onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Expiry Month</label>
                <select value={expiryMonth} onChange={(e) => setExpiryMonth(parseInt(e.target.value))} className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white">
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{new Date(2000, i, 1).toLocaleString("default", { month: "short" })}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Expiry Year</label>
                <select value={expiryYear} onChange={(e) => setExpiryYear(parseInt(e.target.value))} className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white">
                  {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Max Uses</label>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={maxUses}
                  onChange={(e) => setMaxUses(Math.max(1, Math.min(999, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={generateBatch} disabled={isGenerating} className="bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-6 rounded-xl disabled:opacity-50">
                {isGenerating ? "Generating..." : "Generate Codes"}
              </button>
              <button onClick={() => setShowForm(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-xl">
                Cancel
              </button>
            </div>
          </div>
        )}

        {viewingBatch && batchCodes.length > 0 && (
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-green-500/30 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-400">Generated Codes ({batchCodes.length})</h3>
              <div className="flex gap-2">
                <button onClick={copyAllCodes} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg">
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy All"}
                </button>
                <button onClick={downloadCodes} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button onClick={() => setViewingBatch(null)} className="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-lg">
                  Close
                </button>
              </div>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 max-h-64 overflow-y-auto font-mono text-sm">
              {batchCodes.map((code, i) => (
                <div key={i} className="text-gray-300 py-1">{code}</div>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : batches.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No batches yet. Generate one!</div>
        ) : (
          <div className="space-y-3">
            {batches.map((batch) => (
              <div key={batch.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{batch.batch_name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${getAppColor(batch.app_type)}`}>
                      {batch.app_type}{batch.robux_type || ""}
                    </span>
                    <span className="text-sm text-gray-400">{batch.codes_count} codes</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Helper: {batch.helpers?.name || "Unassigned"} • {new Date(batch.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => viewBatchCodes(batch.id)} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm">
                  View Codes
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBatches;
