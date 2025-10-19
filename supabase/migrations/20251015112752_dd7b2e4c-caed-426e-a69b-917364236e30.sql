-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create enum for content status
CREATE TYPE public.content_status AS ENUM ('pending', 'approved', 'rejected');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is moderator by email
CREATE OR REPLACE FUNCTION public.is_moderator_email(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = _user_id
      AND email LIKE '%.moderador.educamais@%.com'
  )
$$;

-- Function to auto-assign moderator role based on email
CREATE OR REPLACE FUNCTION public.auto_assign_moderator_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email LIKE '%.moderador.educamais@%.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'moderator')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for auto-assigning moderator role
CREATE TRIGGER auto_assign_moderator_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_moderator_role();

-- Add status column to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS status content_status DEFAULT 'pending';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES auth.users(id);

-- Create course_ratings table
CREATE TABLE public.course_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (course_id, user_id)
);

-- Enable RLS on course_ratings
ALTER TABLE public.course_ratings ENABLE ROW LEVEL SECURITY;

-- Add average rating to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- Function to update course rating stats
CREATE OR REPLACE FUNCTION public.update_course_rating_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.courses
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.course_ratings
      WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.course_ratings
      WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
    )
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for updating rating stats
CREATE TRIGGER update_course_rating_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.course_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_course_rating_stats();

-- Create moderation_logs table
CREATE TABLE public.moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  moderator_id UUID REFERENCES auth.users(id) NOT NULL,
  action content_status NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on moderation_logs
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Update courses RLS policies
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON public.courses;

CREATE POLICY "Approved courses are viewable by everyone"
  ON public.courses FOR SELECT
  USING (
    status = 'approved' 
    OR author_id = auth.uid() 
    OR public.has_role(auth.uid(), 'moderator')
    OR public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for course_ratings
CREATE POLICY "Ratings are viewable by everyone"
  ON public.course_ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create ratings"
  ON public.course_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON public.course_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
  ON public.course_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for moderation_logs
CREATE POLICY "Moderators can view moderation logs"
  ON public.moderation_logs FOR SELECT
  USING (
    public.has_role(auth.uid(), 'moderator')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Moderators can create moderation logs"
  ON public.moderation_logs FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'moderator')
    OR public.has_role(auth.uid(), 'admin')
  );