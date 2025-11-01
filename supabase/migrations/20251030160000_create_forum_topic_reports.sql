-- Create forum_topic_reports table
CREATE TABLE IF NOT EXISTS public.forum_topic_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    admin_notes TEXT,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    UNIQUE(topic_id, reporter_id) -- Evita múltiplas denúncias do mesmo usuário
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_forum_topic_reports_topic_id ON public.forum_topic_reports(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_topic_reports_reporter_id ON public.forum_topic_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_forum_topic_reports_status ON public.forum_topic_reports(status);

-- Enable RLS
ALTER TABLE public.forum_topic_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for forum_topic_reports
CREATE POLICY "Users can view their own topic reports"
ON public.forum_topic_reports
FOR SELECT
TO authenticated
USING (auth.uid() = reporter_id);

CREATE POLICY "Admins and moderators can view all topic reports"
ON public.forum_topic_reports
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'moderator'::public.app_role)
    )
);

CREATE POLICY "Users can create topic reports"
ON public.forum_topic_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins and moderators can update topic reports"
ON public.forum_topic_reports
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'moderator'::public.app_role)
    )
);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_forum_topic_report_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_forum_topic_reports_updated_at
BEFORE UPDATE ON public.forum_topic_reports
FOR EACH ROW
EXECUTE FUNCTION update_forum_topic_report_updated_at();

-- Add comment to table
COMMENT ON TABLE public.forum_topic_reports IS 'Tabela para armazenar denúncias de tópicos do fórum';

-- Add comments to columns
COMMENT ON COLUMN public.forum_topic_reports.topic_id IS 'ID do tópico denunciado';
COMMENT ON COLUMN public.forum_topic_reports.reporter_id IS 'ID do usuário que fez a denúncia';
COMMENT ON COLUMN public.forum_topic_reports.reason IS 'Motivo da denúncia';
COMMENT ON COLUMN public.forum_topic_reports.status IS 'Status da denúncia: pending, reviewed, dismissed';
COMMENT ON COLUMN public.forum_topic_reports.admin_notes IS 'Notas do administrador sobre a denúncia';
COMMENT ON COLUMN public.forum_topic_reports.admin_id IS 'ID do administrador que revisou a denúncia';
