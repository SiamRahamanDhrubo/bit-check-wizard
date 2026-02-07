-- Create helpers table
CREATE TABLE public.helpers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE, -- Helper's unique code for identification
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Create code batches table (groups of codes assigned to helpers)
CREATE TABLE public.code_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    helper_id UUID REFERENCES public.helpers(id) ON DELETE SET NULL,
    batch_name TEXT NOT NULL,
    app_type TEXT NOT NULL, -- GD, MCD, RB
    robux_type TEXT, -- A or B (only for RB)
    codes_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Link redemption_codes to helpers and batches
ALTER TABLE public.redemption_codes 
ADD COLUMN helper_id UUID REFERENCES public.helpers(id) ON DELETE SET NULL,
ADD COLUMN batch_id UUID REFERENCES public.code_batches(id) ON DELETE SET NULL,
ADD COLUMN sold_price DECIMAL(10,2),
ADD COLUMN is_sold BOOLEAN NOT NULL DEFAULT false;

-- Enable RLS
ALTER TABLE public.helpers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_batches ENABLE ROW LEVEL SECURITY;

-- Block direct access (use edge functions)
CREATE POLICY "Block direct SELECT on helpers" ON public.helpers FOR SELECT USING (false);
CREATE POLICY "Block direct INSERT on helpers" ON public.helpers FOR INSERT WITH CHECK (false);
CREATE POLICY "Block direct UPDATE on helpers" ON public.helpers FOR UPDATE USING (false);
CREATE POLICY "Block direct DELETE on helpers" ON public.helpers FOR DELETE USING (false);

CREATE POLICY "Block direct SELECT on code_batches" ON public.code_batches FOR SELECT USING (false);
CREATE POLICY "Block direct INSERT on code_batches" ON public.code_batches FOR INSERT WITH CHECK (false);
CREATE POLICY "Block direct UPDATE on code_batches" ON public.code_batches FOR UPDATE USING (false);
CREATE POLICY "Block direct DELETE on code_batches" ON public.code_batches FOR DELETE USING (false);