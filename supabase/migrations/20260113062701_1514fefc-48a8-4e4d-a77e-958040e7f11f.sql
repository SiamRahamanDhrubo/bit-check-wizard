-- Create table for redemption codes
CREATE TABLE public.redemption_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  code TEXT NOT NULL UNIQUE,
  app_type TEXT NOT NULL CHECK (app_type IN ('GD', 'MCD')),
  expiry_month INTEGER NOT NULL CHECK (expiry_month >= 1 AND expiry_month <= 12),
  expiry_year INTEGER NOT NULL CHECK (expiry_year >= 2025 AND expiry_year <= 2099),
  max_uses INTEGER NOT NULL DEFAULT 1 CHECK (max_uses >= 1),
  current_uses INTEGER NOT NULL DEFAULT 0,
  secret_key1 TEXT NOT NULL,
  secret_key2 TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create table for tracking redemptions
CREATE TABLE public.code_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  code_id UUID REFERENCES public.redemption_codes(id) ON DELETE CASCADE NOT NULL,
  device_identifier TEXT,
  ip_address TEXT
);

-- Enable RLS
ALTER TABLE public.redemption_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_redemptions ENABLE ROW LEVEL SECURITY;

-- Public can validate codes (read)
CREATE POLICY "Public can read active codes" 
ON public.redemption_codes 
FOR SELECT 
USING (is_active = true);

-- Public can insert redemptions
CREATE POLICY "Public can redeem codes" 
ON public.code_redemptions 
FOR INSERT 
WITH CHECK (true);

-- Public can read redemptions
CREATE POLICY "Public can read redemptions" 
ON public.code_redemptions 
FOR SELECT 
USING (true);

-- Create function to increment usage count
CREATE OR REPLACE FUNCTION public.increment_code_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.redemption_codes 
  SET current_uses = current_uses + 1
  WHERE id = NEW.code_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-increment usage
CREATE TRIGGER on_redemption_increment_usage
AFTER INSERT ON public.code_redemptions
FOR EACH ROW
EXECUTE FUNCTION public.increment_code_usage();