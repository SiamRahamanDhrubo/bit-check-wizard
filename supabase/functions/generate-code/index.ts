import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Server-side admin password - NOT exposed to client
const ADMIN_PASSWORD = "Dhrubo2222MCEDITSITE";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password, appType, expiryMonth, expiryYear, maxUses } = await req.json();

    // Validate admin password server-side
    if (password !== ADMIN_PASSWORD) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid password" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate input
    if (!appType || !["GD", "MCD"].includes(appType)) {
      return new Response(
        JSON.stringify({ error: "Invalid app type" }),
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

    // Generate secret keys (8 chars total, 4 each)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let secretKeys = "";
    for (let i = 0; i < 8; i++) {
      secretKeys += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Build the code
    const monthStr = expiryMonth.toString();
    const yearStr = (expiryYear % 100).toString().padStart(2, "0");
    const usesStr = validMaxUses.toString().padStart(3, "0");
    const code = `${monthStr}${yearStr}${usesStr}${secretKeys}${appType}`;

    const secretKey1 = secretKeys.slice(0, 4);
    const secretKey2 = secretKeys.slice(4, 8);

    // Use service role to bypass RLS
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
