-- Create table for download links
CREATE TABLE public.download_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  os TEXT NOT NULL,
  architecture TEXT,
  music TEXT,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.download_links ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Public read access to download links" 
ON public.download_links 
FOR SELECT 
USING (true);

-- Insert initial download links
INSERT INTO public.download_links (os, architecture, music, url) VALUES
-- Windows links
('windows', '32-bit', null, 'https://mega.nz/file/XYdkhKQD#5FExUMIAoweOuSJvkngtEC3zYn5zdlDhZfjzuQ0ErP8'),
('windows', '64-bit', null, 'https://mega.nz/file/iV1zwSZJ#_Oo5mZiiOpB-vuzaR9pvIIbyp4ycWufA6OQwYTGfUyU'),

-- Android - Newer phones (ARM-v8a)
('android', 'arm-v8a', 'without', 'https://mega.nz/file/DV8QXThZ#YpHlfO7bmu0f14uaGl1U6NWPeMWJuUxlSWI57QKwdwA'),
('android', 'arm-v8a', 'with', 'https://mega.nz/file/zYchjDYB#uZxM1EJaQ8rQDln3vVlbeAuLc5LOEt3FjsY3KKTyRD4'),

-- Android - Older phones
('android', 'older', 'without', 'https://mega.nz/file/GUliyITS#ffOihBwOBuKJy_VhAVtcCxClK8zIsGYu_FQrjk_tRo8'),
('android', 'older', 'with', 'https://mega.nz/file/zFcUAaSS#opIEBiH-g5unwMRlnS8rZXwl6v4a_FNAfIqHyUNWmhE');