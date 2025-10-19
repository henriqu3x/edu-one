-- Add status column to course_reports table (using existing report_status type if it exists, otherwise create it)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
        CREATE TYPE public.report_status AS ENUM ('pending', 'dismissed', 'resolved');
    END IF;
END $$;

-- Add status column to course_reports table if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'course_reports' 
                   AND column_name = 'status') THEN
        ALTER TABLE public.course_reports
        ADD COLUMN status report_status NOT NULL DEFAULT 'pending';
    END IF;
END $$;

-- Add moderated_at column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'course_reports' 
                   AND column_name = 'moderated_at') THEN
        ALTER TABLE public.course_reports
        ADD COLUMN moderated_at timestamp with time zone;
    END IF;
END $$;

-- Add moderated_by column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'course_reports' 
                   AND column_name = 'moderated_by') THEN
        ALTER TABLE public.course_reports
        ADD COLUMN moderated_by uuid;
    END IF;
END $$;

-- Drop existing policies before recreating them
DROP POLICY IF EXISTS "Users can view own reports" ON public.course_reports;
DROP POLICY IF EXISTS "Moderators can view all reports" ON public.course_reports;
DROP POLICY IF EXISTS "Moderators can update reports" ON public.course_reports;

-- Create policies
CREATE POLICY "Users can view own reports"
ON public.course_reports
FOR SELECT
USING (auth.uid() = reporter_id);

CREATE POLICY "Moderators can view all reports"
ON public.course_reports
FOR SELECT
USING (has_role(auth.uid(), 'moderator') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Moderators can update reports"
ON public.course_reports
FOR UPDATE
USING (has_role(auth.uid(), 'moderator') OR has_role(auth.uid(), 'admin'));