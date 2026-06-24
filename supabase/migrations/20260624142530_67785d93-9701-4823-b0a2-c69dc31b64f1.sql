
GRANT SELECT ON public.listings TO anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}'::text[];
