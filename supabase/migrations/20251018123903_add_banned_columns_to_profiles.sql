-- Add banned columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS banned boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS banned_at timestamp with time zone;

-- Create index for banned users
CREATE INDEX IF NOT EXISTS idx_profiles_banned ON public.profiles(banned) WHERE banned = true;

-- Update RLS policies to allow banned users to be checked during login
-- This policy allows anyone to read the banned status (needed for login check)
DROP POLICY IF EXISTS "Users can view own banned status" ON public.profiles;
CREATE POLICY "Users can view own banned status"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);
