import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple hash function for password (using Web Crypto API)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateUUID(): string {
  // Generate a readable UUID code like "UUID-XXXX-XXXX"
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'UUID-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  code += '-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateSessionToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { action, uuid_code, password, session_token } = await req.json();

    if (action === 'signup') {
      if (!password || password.length < 4) {
        return new Response(
          JSON.stringify({ error: 'Password must be at least 4 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const newUUID = generateUUID();
      const passwordHash = await hashPassword(password);

      const { data: user, error: insertError } = await supabase
        .from('uuid_users')
        .insert({
          uuid_code: newUUID,
          password_hash: passwordHash,
        })
        .select('id, uuid_code')
        .single();

      if (insertError) {
        console.error('Signup error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create account' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create session
      const sessionToken = generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 day session

      await supabase.from('user_sessions').insert({
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
      });

      // Update last login
      await supabase
        .from('uuid_users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id);

      console.log('User signed up:', newUUID);

      return new Response(
        JSON.stringify({ 
          success: true, 
          uuid_code: newUUID,
          session_token: sessionToken,
          user_id: user.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'login') {
      if (!uuid_code || !password) {
        return new Response(
          JSON.stringify({ error: 'UUID and password required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const passwordHash = await hashPassword(password);

      const { data: user, error: fetchError } = await supabase
        .from('uuid_users')
        .select('id, uuid_code, is_banned, ban_reason')
        .eq('uuid_code', uuid_code.toUpperCase())
        .eq('password_hash', passwordHash)
        .single();

      if (fetchError || !user) {
        console.log('Login failed for:', uuid_code);
        return new Response(
          JSON.stringify({ error: 'Invalid UUID or password' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (user.is_banned) {
        return new Response(
          JSON.stringify({ error: `Account banned: ${user.ban_reason || 'No reason provided'}` }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create session
      const sessionToken = generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await supabase.from('user_sessions').insert({
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
      });

      // Update last login
      await supabase
        .from('uuid_users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id);

      console.log('User logged in:', uuid_code);

      return new Response(
        JSON.stringify({ 
          success: true, 
          uuid_code: user.uuid_code,
          session_token: sessionToken,
          user_id: user.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'validate') {
      if (!session_token) {
        return new Response(
          JSON.stringify({ valid: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: session, error } = await supabase
        .from('user_sessions')
        .select('user_id, expires_at')
        .eq('session_token', session_token)
        .single();

      if (error || !session) {
        return new Response(
          JSON.stringify({ valid: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (new Date(session.expires_at) < new Date()) {
        // Session expired, delete it
        await supabase.from('user_sessions').delete().eq('session_token', session_token);
        return new Response(
          JSON.stringify({ valid: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get user info
      const { data: user } = await supabase
        .from('uuid_users')
        .select('id, uuid_code, is_banned')
        .eq('id', session.user_id)
        .single();

      if (!user || user.is_banned) {
        return new Response(
          JSON.stringify({ valid: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          valid: true, 
          uuid_code: user.uuid_code,
          user_id: user.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'logout') {
      if (session_token) {
        await supabase.from('user_sessions').delete().eq('session_token', session_token);
      }
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Auth error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
