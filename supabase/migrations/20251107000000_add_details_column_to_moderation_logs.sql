-- Add details column to moderation_logs table
ALTER TABLE public.moderation_logs ADD COLUMN IF NOT EXISTS details JSONB;
