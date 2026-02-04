-- Create table to store real Roblox redeem codes
CREATE TABLE public.roblox_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  robux_type TEXT NOT NULL CHECK (robux_type IN ('A', 'B')),
  robux_amount INTEGER NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  redeemed_by UUID REFERENCES public.uuid_users(id),
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.roblox_codes ENABLE ROW LEVEL SECURITY;

-- Block direct access - all operations go through edge functions
CREATE POLICY "Block direct SELECT on roblox_codes"
ON public.roblox_codes
FOR SELECT
USING (false);

CREATE POLICY "Block direct INSERT on roblox_codes"
ON public.roblox_codes
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Block direct UPDATE on roblox_codes"
ON public.roblox_codes
FOR UPDATE
USING (false);

CREATE POLICY "Block direct DELETE on roblox_codes"
ON public.roblox_codes
FOR DELETE
USING (false);

-- Add index for faster lookups
CREATE INDEX idx_roblox_codes_available ON public.roblox_codes(robux_type, is_used) WHERE is_used = false;