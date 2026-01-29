-- Drop the restrictive policy and recreate as permissive
DROP POLICY IF EXISTS "Allow public inserts on leads" ON public.leads;

CREATE POLICY "Allow public inserts on leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);