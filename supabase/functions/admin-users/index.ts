import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { action, password, user_id, ban_reason } = await req.json();

    // Verify admin password
    const adminPassword = Deno.env.get('ADMIN_PASSWORD');
    if (!adminPassword || password !== adminPassword) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'list') {
      const { data: users, error } = await supabase
        .from('uuid_users')
        .select('id, uuid_code, is_banned, ban_reason, created_at, last_login_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('List users error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch users' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get redemption counts for each user
      const { data: redemptions } = await supabase
        .from('code_redemptions')
        .select('user_id');

      const redemptionCounts: Record<string, number> = {};
      redemptions?.forEach(r => {
        if (r.user_id) {
          redemptionCounts[r.user_id] = (redemptionCounts[r.user_id] || 0) + 1;
        }
      });

      const usersWithCounts = users?.map(u => ({
        ...u,
        redemption_count: redemptionCounts[u.id] || 0
      }));

      return new Response(
        JSON.stringify({ users: usersWithCounts }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'ban') {
      if (!user_id) {
        return new Response(
          JSON.stringify({ error: 'User ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('uuid_users')
        .update({ is_banned: true, ban_reason: ban_reason || 'Banned by admin' })
        .eq('id', user_id);

      if (error) {
        console.error('Ban user error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to ban user' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Delete all sessions for banned user
      await supabase.from('user_sessions').delete().eq('user_id', user_id);

      console.log('User banned:', user_id);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'unban') {
      if (!user_id) {
        return new Response(
          JSON.stringify({ error: 'User ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('uuid_users')
        .update({ is_banned: false, ban_reason: null })
        .eq('id', user_id);

      if (error) {
        console.error('Unban user error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to unban user' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('User unbanned:', user_id);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'delete') {
      if (!user_id) {
        return new Response(
          JSON.stringify({ error: 'User ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('uuid_users')
        .delete()
        .eq('id', user_id);

      if (error) {
        console.error('Delete user error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to delete user' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('User deleted:', user_id);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get_redemptions') {
      if (!user_id) {
        return new Response(
          JSON.stringify({ error: 'User ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: redemptions, error } = await supabase
        .from('code_redemptions')
        .select(`
          id,
          redeemed_at,
          code_id,
          redemption_codes (
            code,
            app_type
          )
        `)
        .eq('user_id', user_id)
        .order('redeemed_at', { ascending: false });

      if (error) {
        console.error('Get redemptions error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch redemptions' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ redemptions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Admin error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
