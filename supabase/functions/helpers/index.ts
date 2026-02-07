import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD");

// Simple hash for helper passwords
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);
  return base64Encode(hashArray);
}

// Generate random code for helpers
function generateHelperCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "H-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate redemption code
function generateRedemptionCode(
  expiryMonth: number,
  expiryYear: number,
  maxUses: number,
  appType: string,
  robuxType?: string
): { code: string; secretKey1: string; secretKey2: string } {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let secretKey1 = "";
  let secretKey2 = "";
  for (let i = 0; i < 4; i++) {
    secretKey1 += chars.charAt(Math.floor(Math.random() * chars.length));
    secretKey2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const secretKeys = secretKey1 + secretKey2;
  const monthStr = expiryMonth.toString();
  const yearStr = (expiryYear % 100).toString().padStart(2, "0");
  const usesStr = maxUses.toString().padStart(3, "0");
  const typeSuffix = appType === "RB" && robuxType ? robuxType : "";
  const code = `${monthStr}${yearStr}${usesStr}${secretKeys}${appType}${typeSuffix}`;

  return { code, secretKey1, secretKey2 };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, password, ...params } = await req.json();

    // Verify admin password
    if (password !== ADMIN_PASSWORD) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (action) {
      case "list-helpers": {
        const { data, error } = await supabase
          .from("helpers")
          .select("id, name, code, is_active, created_at, last_login_at, notes")
          .order("created_at", { ascending: false });

        if (error) throw error;
        return new Response(
          JSON.stringify({ helpers: data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "create-helper": {
        const { name, helperPassword, notes } = params;
        if (!name || !helperPassword) {
          return new Response(
            JSON.stringify({ error: "Name and password required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const code = generateHelperCode();
        const passwordHash = await hashPassword(helperPassword);

        const { data, error } = await supabase
          .from("helpers")
          .insert({ name, code, password_hash: passwordHash, notes })
          .select("id, name, code")
          .single();

        if (error) throw error;
        return new Response(
          JSON.stringify({ helper: data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update-helper": {
        const { helperId, name, helperPassword, is_active, notes } = params;
        if (!helperId) {
          return new Response(
            JSON.stringify({ error: "Helper ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const updates: Record<string, unknown> = {};
        if (name !== undefined) updates.name = name;
        if (is_active !== undefined) updates.is_active = is_active;
        if (notes !== undefined) updates.notes = notes;
        if (helperPassword) updates.password_hash = await hashPassword(helperPassword);

        const { error } = await supabase
          .from("helpers")
          .update(updates)
          .eq("id", helperId);

        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "delete-helper": {
        const { helperId } = params;
        if (!helperId) {
          return new Response(
            JSON.stringify({ error: "Helper ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabase
          .from("helpers")
          .delete()
          .eq("id", helperId);

        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "generate-batch": {
        const { helperId, batchName, appType, robuxType, count, expiryMonth, expiryYear, maxUses } = params;

        if (!helperId || !batchName || !appType || !count || !expiryMonth || !expiryYear) {
          return new Response(
            JSON.stringify({ error: "Missing required fields" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!["GD", "MCD", "RB"].includes(appType)) {
          return new Response(
            JSON.stringify({ error: "Invalid app type" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (appType === "RB" && !["A", "B"].includes(robuxType)) {
          return new Response(
            JSON.stringify({ error: "Robux type required for RB codes" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create batch
        const { data: batch, error: batchError } = await supabase
          .from("code_batches")
          .insert({
            helper_id: helperId,
            batch_name: batchName,
            app_type: appType,
            robux_type: appType === "RB" ? robuxType : null,
            codes_count: count,
          })
          .select("id")
          .single();

        if (batchError) throw batchError;

        // Generate codes
        const codes: string[] = [];
        const codeInserts = [];

        for (let i = 0; i < count; i++) {
          const { code, secretKey1, secretKey2 } = generateRedemptionCode(
            expiryMonth,
            expiryYear,
            maxUses || 1,
            appType,
            robuxType
          );

          codes.push(code);
          codeInserts.push({
            code,
            app_type: appType,
            expiry_month: expiryMonth,
            expiry_year: expiryYear,
            max_uses: maxUses || 1,
            secret_key1: secretKey1,
            secret_key2: secretKey2,
            helper_id: helperId,
            batch_id: batch.id,
          });
        }

        const { error: codesError } = await supabase
          .from("redemption_codes")
          .insert(codeInserts);

        if (codesError) throw codesError;

        console.log(`Generated batch ${batchName} with ${count} codes for helper ${helperId}`);

        return new Response(
          JSON.stringify({ batchId: batch.id, codes }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "list-batches": {
        const { helperId } = params;
        
        let query = supabase
          .from("code_batches")
          .select(`
            id,
            batch_name,
            app_type,
            robux_type,
            codes_count,
            created_at,
            helper_id,
            helpers(name, code)
          `)
          .order("created_at", { ascending: false });

        if (helperId) {
          query = query.eq("helper_id", helperId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return new Response(
          JSON.stringify({ batches: data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "batch-codes": {
        const { batchId } = params;
        if (!batchId) {
          return new Response(
            JSON.stringify({ error: "Batch ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data, error } = await supabase
          .from("redemption_codes")
          .select("code, is_sold, current_uses, max_uses")
          .eq("batch_id", batchId);

        if (error) throw error;
        return new Response(
          JSON.stringify({ codes: data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "sales-stats": {
        // Get helper stats with code usage
        const { data: helpers, error: helpersError } = await supabase
          .from("helpers")
          .select("id, name, code");

        if (helpersError) throw helpersError;

        const stats = [];
        for (const helper of helpers || []) {
          // Get codes assigned to this helper
          const { data: codes, error: codesError } = await supabase
            .from("redemption_codes")
            .select("id, app_type, current_uses, max_uses, is_sold, sold_price")
            .eq("helper_id", helper.id);

          if (codesError) throw codesError;

          const totalCodes = codes?.length || 0;
          const usedCodes = codes?.filter(c => c.current_uses > 0).length || 0;
          const soldCodes = codes?.filter(c => c.is_sold).length || 0;
          const totalRevenue = codes?.reduce((sum, c) => sum + (c.sold_price || 0), 0) || 0;

          // By app type
          const byApp: Record<string, { total: number; used: number }> = {};
          for (const code of codes || []) {
            if (!byApp[code.app_type]) {
              byApp[code.app_type] = { total: 0, used: 0 };
            }
            byApp[code.app_type].total++;
            if (code.current_uses > 0) byApp[code.app_type].used++;
          }

          stats.push({
            helper,
            totalCodes,
            usedCodes,
            soldCodes,
            totalRevenue,
            byApp,
          });
        }

        return new Response(
          JSON.stringify({ stats }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "mark-sold": {
        const { codeId, soldPrice } = params;
        if (!codeId) {
          return new Response(
            JSON.stringify({ error: "Code ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabase
          .from("redemption_codes")
          .update({ is_sold: true, sold_price: soldPrice || null })
          .eq("id", codeId);

        if (error) throw error;
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
