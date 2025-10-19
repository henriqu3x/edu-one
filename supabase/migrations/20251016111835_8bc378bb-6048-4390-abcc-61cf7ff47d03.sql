-- Fix function search path for security
DROP FUNCTION IF EXISTS public.update_course_rating_stats() CASCADE;
CREATE OR REPLACE FUNCTION public.update_course_rating_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Recreate trigger
DROP TRIGGER IF EXISTS update_course_rating_stats_trigger ON public.course_ratings;
CREATE TRIGGER update_course_rating_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.course_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_course_rating_stats();

-- Fix handle_new_user function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();