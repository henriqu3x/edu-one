-- Create course_edits table for pending course edits
CREATE TABLE public.course_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('iniciante', 'intermediario', 'avancado')),
  content_url TEXT,
  thumbnail_url TEXT,
  tags TEXT[],
  video_type TEXT CHECK (video_type IN ('external', 'cloudinary_single', 'cloudinary_playlist')),
  video_urls TEXT[],
  status content_status DEFAULT 'pending',
  rejection_reason TEXT,
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on course_edits
ALTER TABLE public.course_edits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_edits
CREATE POLICY "Authors can view their own course edits"
  ON public.course_edits FOR SELECT
  USING (author_id = auth.uid());

CREATE POLICY "Moderators can view all course edits"
  ON public.course_edits FOR SELECT
  USING (
    public.has_role(auth.uid(), 'moderator')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Authors can create edits for their approved courses"
  ON public.course_edits FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = course_id
      AND author_id = auth.uid()
      AND status = 'approved'
    )
  );

CREATE POLICY "Authors can update their pending edits"
  ON public.course_edits FOR UPDATE
  USING (
    author_id = auth.uid()
    AND status = 'pending'
  );

CREATE POLICY "Moderators can update edit status"
  ON public.course_edits FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'moderator')
    OR public.has_role(auth.uid(), 'admin')
  );

-- Function to apply approved edit to course
CREATE OR REPLACE FUNCTION public.apply_course_edit(edit_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  edit_record public.course_edits%ROWTYPE;
BEGIN
  -- Get the edit record
  SELECT * INTO edit_record FROM public.course_edits WHERE id = edit_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Edit not found';
  END IF;

  IF edit_record.status != 'approved' THEN
    RAISE EXCEPTION 'Edit must be approved before applying';
  END IF;

  -- Update the course with edit data
  UPDATE public.courses
  SET
    title = edit_record.title,
    description = edit_record.description,
    category_id = edit_record.category_id,
    difficulty_level = edit_record.difficulty_level,
    content_url = edit_record.content_url,
    thumbnail_url = edit_record.thumbnail_url,
    tags = edit_record.tags,
    video_type = edit_record.video_type,
    video_urls = edit_record.video_urls,
    updated_at = now()
  WHERE id = edit_record.course_id;

  -- Mark edit as applied (optional, could delete instead)
  UPDATE public.course_edits
  SET status = 'applied', updated_at = now()
  WHERE id = edit_id;
END;
$$;

-- Function to check if course has pending edit
CREATE OR REPLACE FUNCTION public.has_pending_edit(_course_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.course_edits
    WHERE course_id = _course_id
    AND status = 'pending'
  )
$$;
