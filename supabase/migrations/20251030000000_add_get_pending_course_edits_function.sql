CREATE OR REPLACE FUNCTION public.get_pending_course_edits()
RETURNS TABLE (
  id UUID,
  course_id UUID,
  author_id UUID,
  title TEXT,
  description TEXT,
  original_description TEXT,
  category_id UUID,
  difficulty_level TEXT,
  original_difficulty_level TEXT, -- <<< ADDED THIS COLUMN
  content_url TEXT,
  thumbnail_url TEXT,
  original_thumbnail_url TEXT,
  tags TEXT[],
  original_tags TEXT[],
  video_type TEXT,
  original_video_type TEXT,
  video_urls TEXT[],
  original_video_urls TEXT[],
  status TEXT,
  rejection_reason TEXT,
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  course_title TEXT,
  author_name TEXT,
  author_username TEXT,
  author_avatar_url TEXT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ce.id,
    ce.course_id,
    ce.author_id,
    ce.title,
    ce.description,
    c.description AS original_description,
    ce.category_id,
    ce.difficulty_level,
    c.difficulty_level AS original_difficulty_level, -- <<< The corresponding SELECT column
    ce.content_url,
    ce.thumbnail_url,
    c.thumbnail_url AS original_thumbnail_url,
    ce.tags,
    c.tags AS original_tags,
    ce.video_type,
    c.video_type AS original_video_type,
    ce.video_urls,
    c.video_urls AS original_video_urls,
    ce.status::TEXT,
    ce.rejection_reason,
    ce.moderated_at,
    ce.moderated_by,
    ce.created_at,
    ce.updated_at,
    c.title AS course_title,
    p.full_name AS author_name,
    p.username AS author_username,
    p.avatar_url AS author_avatar_url
  FROM 
    course_edits ce
    JOIN courses c ON ce.course_id = c.id
    JOIN profiles p ON ce.author_id = p.id
  WHERE 
    ce.status = 'pending'
    AND (
      -- Allow moderators and admins to see all pending edits
      public.has_role(auth.uid(), 'moderator'::public.app_role) 
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
    )
  ORDER BY 
    ce.created_at DESC;
$$;