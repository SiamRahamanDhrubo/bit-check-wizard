import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { action, password, codes, robuxType, userId } = await req.json();

    // Admin actions require password
    if (action === "add" || action === "list" || action === "stats") {
      if (password !== ADMIN_PASSWORD) {
        return new Response(
          JSON.stringify({ error: "Unauthorized: Invalid password" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (action === "add") {
      // Add new Roblox codes (bulk)
      if (!codes || !Array.isArray(codes) || codes.length === 0) {
        return new Response(
          JSON.stringify({ error: "No codes provided" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!robuxType || !["A", "B"].includes(robuxType)) {
        return new Response(
          JSON.stringify({ error: "Invalid robux type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const robuxAmount = robuxType === "A" ? 100 : 500;

      const insertData = codes.map((code: string) => ({
        code: code.trim(),
        robux_type: robuxType,
        robux_amount: robuxAmount,
      }));

      const { data, error } = await supabase
        .from("roblox_codes")
        .insert(insertData)
        .select();

      if (error) {
        console.error("Insert error:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, added: data.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "stats") {
      // Get available codes count per type
      const { data: typeA } = await supabase
        .from("roblox_codes")
        .select("id", { count: "exact" })
        .eq("robux_type", "A")
        .eq("is_used", false);

      const { data: typeB } = await supabase
        .from("roblox_codes")
        .select("id", { count: "exact" })
        .eq("robux_type", "B")
        .eq("is_used", false);

      const { data: usedA } = await supabase
        .from("roblox_codes")
        .select("id", { count: "exact" })
        .eq("robux_type", "A")
        .eq("is_used", true);

      const { data: usedB } = await supabase
        .from("roblox_codes")
        .select("id", { count: "exact" })
        .eq("robux_type", "B")
        .eq("is_used", true);

      return new Response(
        JSON.stringify({
          typeA: { available: typeA?.length || 0, used: usedA?.length || 0 },
          typeB: { available: typeB?.length || 0, used: usedB?.length || 0 },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "claim") {
      // Claim a Roblox code for redemption
      if (!robuxType || !["A", "B"].includes(robuxType)) {
        return new Response(
          JSON.stringify({ error: "Invalid robux type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!userId) {
        return new Response(
          JSON.stringify({ error: "User ID required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get an available code
      const { data: availableCode, error: selectError } = await supabase
        .from("roblox_codes")
        .select("*")
        .eq("robux_type", robuxType)
        .eq("is_used", false)
        .limit(1)
        .single();

      if (selectError || !availableCode) {
        console.error("No available codes:", selectError);
        return new Response(
          JSON.stringify({ error: "No available codes for this type" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Mark as used
      const { error: updateError } = await supabase
        .from("roblox_codes")
        .update({
          is_used: true,
          redeemed_by: userId,
          redeemed_at: new Date().toISOString(),
        })
        .eq("id", availableCode.id);

      if (updateError) {
        console.error("Update error:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to claim code" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          robloxCode: availableCode.code,
          robuxAmount: availableCode.robux_amount,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
