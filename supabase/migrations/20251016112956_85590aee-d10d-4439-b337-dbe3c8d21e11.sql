-- Create triggers to update course counters automatically

-- Function to update like count
CREATE OR REPLACE FUNCTION public.update_course_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.courses
    SET like_count = like_count + 1
    WHERE id = NEW.course_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.courses
    SET like_count = GREATEST(0, like_count - 1)
    WHERE id = OLD.course_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function to update save count
CREATE OR REPLACE FUNCTION public.update_course_save_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.courses
    SET save_count = save_count + 1
    WHERE id = NEW.course_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.courses
    SET save_count = GREATEST(0, save_count - 1)
    WHERE id = OLD.course_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function to update view count
CREATE OR REPLACE FUNCTION public.update_course_view_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.courses
  SET view_count = view_count + 1
  WHERE id = NEW.course_id;
  RETURN NEW;
END;
$$;

-- Create triggers for likes
DROP TRIGGER IF EXISTS update_course_like_count_trigger ON public.course_likes;
CREATE TRIGGER update_course_like_count_trigger
  AFTER INSERT OR DELETE ON public.course_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_course_like_count();

-- Create triggers for saves
DROP TRIGGER IF EXISTS update_course_save_count_trigger ON public.course_saves;
CREATE TRIGGER update_course_save_count_trigger
  AFTER INSERT OR DELETE ON public.course_saves
  FOR EACH ROW
  EXECUTE FUNCTION public.update_course_save_count();

-- Create triggers for views
DROP TRIGGER IF EXISTS update_course_view_count_trigger ON public.course_views;
CREATE TRIGGER update_course_view_count_trigger
  AFTER INSERT ON public.course_views
  FOR EACH ROW
  EXECUTE FUNCTION public.update_course_view_count();