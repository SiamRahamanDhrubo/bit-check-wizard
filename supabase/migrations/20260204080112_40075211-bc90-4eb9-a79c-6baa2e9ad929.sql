-- Create uuid_users table for custom UUID authentication
CREATE TABLE public.uuid_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uuid_code TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  ban_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Create user_sessions table for session management
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.uuid_users(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.uuid_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Public can create accounts (signup)
CREATE POLICY "Public can create accounts"
ON public.uuid_users
FOR INSERT
WITH CHECK (true);

-- Users can read their own data (via edge function with service role)
CREATE POLICY "Block direct SELECT on uuid_users"
ON public.uuid_users
FOR SELECT
USING (false);

-- Block direct updates
CREATE POLICY "Block direct UPDATE on uuid_users"
ON public.uuid_users
FOR UPDATE
USING (false);

-- Block direct deletes
CREATE POLICY "Block direct DELETE on uuid_users"
ON public.uuid_users
FOR DELETE
USING (false);

-- Sessions - block all direct access (handled via edge functions)
CREATE POLICY "Block direct SELECT on user_sessions"
ON public.user_sessions
FOR SELECT
USING (false);

CREATE POLICY "Block direct INSERT on user_sessions"
ON public.user_sessions
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Block direct UPDATE on user_sessions"
ON public.user_sessions
FOR UPDATE
USING (false);

CREATE POLICY "Block direct DELETE on user_sessions"
ON public.user_sessions
FOR DELETE
USING (false);

-- Link code redemptions to uuid_users
ALTER TABLE public.code_redemptions ADD COLUMN user_id UUID REFERENCES public.uuid_users(id);

-- Create index for faster lookups
CREATE INDEX idx_uuid_users_uuid_code ON public.uuid_users(uuid_code);
CREATE INDEX idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_code_redemptions_user_id ON public.code_redemptions(user_id);