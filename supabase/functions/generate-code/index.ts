import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD");

// Simple XOR encryption with key
function encryptSecret(secret: string, key: string): string {
  const keyBytes = new TextEncoder().encode(key);
  const secretBytes = new TextEncoder().encode(secret);
  const encrypted = new Uint8Array(secretBytes.length);
  
  for (let i = 0; i < secretBytes.length; i++) {
    encrypted[i] = secretBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return base64Encode(encrypted);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password, appType, expiryMonth, expiryYear, maxUses, customSecret1, customSecret2, encryptionKey, robuxType } = await req.json();

    if (password !== ADMIN_PASSWORD) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid password" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!appType || !["GD", "MCD", "RB"].includes(appType)) {
      return new Response(
        JSON.stringify({ error: "Invalid app type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate robuxType for Roblox codes
    if (appType === "RB" && robuxType && !["A", "B"].includes(robuxType)) {
      return new Response(
        JSON.stringify({ error: "Invalid Robux type. Must be A (100) or B (500)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!expiryMonth || expiryMonth < 1 || expiryMonth > 12) {
      return new Response(
        JSON.stringify({ error: "Invalid expiry month" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!expiryYear || expiryYear < 2025 || expiryYear > 2099) {
      return new Response(
        JSON.stringify({ error: "Invalid expiry year" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validMaxUses = Math.max(1, Math.min(999, maxUses || 1));

    // Use custom secrets if provided, otherwise generate random
    let secretKey1: string;
    let secretKey2: string;
    
    if (customSecret1 && customSecret2 && encryptionKey) {
      // Encrypt the custom secrets
      secretKey1 = encryptSecret(customSecret1, encryptionKey).slice(0, 4);
      secretKey2 = encryptSecret(customSecret2, encryptionKey).slice(0, 4);
    } else {
      // Generate random keys
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      secretKey1 = "";
      secretKey2 = "";
      for (let i = 0; i < 4; i++) {
        secretKey1 += chars.charAt(Math.floor(Math.random() * chars.length));
        secretKey2 += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }

    const secretKeys = secretKey1 + secretKey2;
    const monthStr = expiryMonth.toString();
    const yearStr = (expiryYear % 100).toString().padStart(2, "0");
    const usesStr = validMaxUses.toString().padStart(3, "0");
    
    // For Roblox, append the robux type (A or B) at the end
    const typeSuffix = appType === "RB" && robuxType ? robuxType : "";
    const code = `${monthStr}${yearStr}${usesStr}${secretKeys}${appType}${typeSuffix}`;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from("redemption_codes")
      .insert({
        code,
        app_type: appType,
        expiry_month: expiryMonth,
        expiry_year: expiryYear,
        max_uses: validMaxUses,
        secret_key1: secretKey1,
        secret_key2: secretKey2,
      });

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create code" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ code }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
