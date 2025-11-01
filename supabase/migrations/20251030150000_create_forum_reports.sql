-- Create forum_reports table
CREATE TABLE IF NOT EXISTS public.forum_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reply_id UUID NOT NULL REFERENCES public.forum_replies(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    admin_notes TEXT,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_forum_reports_reply_id ON public.forum_reports(reply_id);
CREATE INDEX IF NOT EXISTS idx_forum_reports_reporter_id ON public.forum_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_forum_reports_status ON public.forum_reports(status);

-- Enable RLS
ALTER TABLE public.forum_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for forum_reports
CREATE POLICY "Users can view their own reports"
ON public.forum_reports
FOR SELECT
TO authenticated
USING (auth.uid() = reporter_id);

CREATE POLICY "Admins and moderators can view all reports"
ON public.forum_reports
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'moderator'::public.app_role)
    )
);

CREATE POLICY "Users can create reports"
ON public.forum_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins and moderators can update reports"
ON public.forum_reports
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
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_forum_reports_updated_at
BEFORE UPDATE ON public.forum_reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE public.forum_reports IS 'Tabela para armazenar denúncias de respostas do fórum';

-- Add comments to columns
COMMENT ON COLUMN public.forum_reports.reply_id IS 'ID da resposta denunciada';
COMMENT ON COLUMN public.forum_reports.reporter_id IS 'ID do usuário que fez a denúncia';
COMMENT ON COLUMN public.forum_reports.reason IS 'Motivo da denúncia';
COMMENT ON COLUMN public.forum_reports.status IS 'Status da denúncia: pending, reviewed, dismissed';
COMMENT ON COLUMN public.forum_reports.admin_notes IS 'Notas do administrador sobre a denúncia';
COMMENT ON COLUMN public.forum_reports.admin_id IS 'ID do administrador que revisou a denúncia';

-- Create a function to check if a user has already reported a reply
CREATE OR REPLACE FUNCTION has_user_reported(p_reply_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.forum_reports
        WHERE reply_id = p_reply_id AND reporter_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql STABLE;
