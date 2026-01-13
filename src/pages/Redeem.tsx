import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Gift, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Redeem = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appType = searchParams.get("app") || "MCD";
  
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<"success" | "error" | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const parseCode = (inputCode: string) => {
    // Code format: [expiry MMY][max uses 3 digits][encrypted keys][app suffix]
    // Example: 127002ABCD1234MCD
    const cleanCode = inputCode.trim().toUpperCase();
    
    // Get app suffix (last 2-3 chars)
    const suffix = cleanCode.slice(-3);
    const appPrefix = suffix === "MCD" ? "MCD" : (cleanCode.slice(-2) === "GD" ? "GD" : null);
    
    if (!appPrefix) return null;
    
    const suffixLength = appPrefix.length;
    const codeWithoutSuffix = cleanCode.slice(0, -suffixLength);
    
    // First 3 chars = expiry (e.g., 127 = Jan 2027)
    const expiryPart = codeWithoutSuffix.slice(0, 3);
    const expiryMonth = parseInt(expiryPart.slice(0, 1), 10) || parseInt(expiryPart.slice(0, 2), 10);
    const expiryYear = 2000 + parseInt(expiryPart.slice(-2), 10);
    
    // Next 3 chars = max uses
    const maxUses = parseInt(codeWithoutSuffix.slice(3, 6), 10);
    
    // Rest = encrypted secret keys
    const encryptedKeys = codeWithoutSuffix.slice(6);
    
    return {
      expiryMonth,
      expiryYear,
      maxUses,
      encryptedKeys,
      appType: appPrefix,
      fullCode: cleanCode
    };
  };

  const validateCode = async () => {
    setIsValidating(true);
    setValidationResult(null);
    
    try {
      const parsed = parseCode(code);
      
      if (!parsed) {
        throw new Error("Invalid code format");
      }
      
      // Check if code exists and is valid
      const { data: codeData, error: codeError } = await supabase
        .from("redemption_codes")
        .select("*")
        .eq("code", parsed.fullCode)
        .eq("is_active", true)
        .single();
      
      if (codeError || !codeData) {
        throw new Error("Code not found or inactive");
      }
      
      // Check if code has expired
      const now = new Date();
      const expiryDate = new Date(codeData.expiry_year, codeData.expiry_month - 1, 1);
      if (now > expiryDate) {
        throw new Error("Code has expired");
      }
      
      // Check if max uses reached
      if (codeData.current_uses >= codeData.max_uses) {
        throw new Error("Code has reached maximum uses");
      }
      
      // Record the redemption
      const { error: redemptionError } = await supabase
        .from("code_redemptions")
        .insert({
          code_id: codeData.id,
          device_identifier: navigator.userAgent
        });
      
      if (redemptionError) {
        throw new Error("Failed to redeem code");
      }
      
      // Get download URL based on app type
      const { data: downloadData } = await supabase
        .from("download_links")
        .select("url")
        .eq("os", codeData.app_type === "MCD" ? "android" : "windows")
        .limit(1)
        .single();
      
      setDownloadUrl(downloadData?.url || null);
      setValidationResult("success");
      
      toast({
        title: "Code Redeemed!",
        description: "Your download is ready.",
      });
      
    } catch (error: any) {
      setValidationResult("error");
      toast({
        title: "Invalid Code",
        description: error.message || "Please check your code and try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getAppName = () => {
    return appType === "MCD" ? "Minecraft" : "Geometry Dash";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Go Back</span>
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6">
            <Gift className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Redeem Code</h1>
          <p className="text-gray-400">
            Enter your redemption code for {getAppName()}
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Redemption Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g., 127002ABCD1234MCD"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-lg tracking-wider"
              disabled={isValidating || validationResult === "success"}
            />
          </div>

          {validationResult === "success" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-green-400 bg-green-400/10 p-4 rounded-xl">
                <CheckCircle className="w-6 h-6" />
                <span className="font-medium">Code redeemed successfully!</span>
              </div>
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl text-center transition-all duration-200 transform hover:scale-105"
                >
                  Download Now
                </a>
              )}
            </div>
          ) : validationResult === "error" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-red-400 bg-red-400/10 p-4 rounded-xl">
                <XCircle className="w-6 h-6" />
                <span className="font-medium">Invalid or expired code</span>
              </div>
              <button
                onClick={() => {
                  setValidationResult(null);
                  setCode("");
                }}
                className="w-full bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:bg-gray-600"
              >
                Try Again
              </button>
            </div>
          ) : (
            <button
              onClick={validateCode}
              disabled={!code.trim() || isValidating}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Validating...
                </>
              ) : (
                "Redeem Code"
              )}
            </button>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Code format: [Expiry][Uses][Keys][App]
        </p>
      </div>
    </div>
  );
};

export default Redeem;
