-- Create function to auto-assign admin role based on email pattern
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-assign admin role if email matches pattern *.admin.educamais@*.com
  IF NEW.email LIKE '%.admin.educamais@%.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign admin role on user creation
DROP TRIGGER IF EXISTS auto_assign_admin_role_trigger ON auth.users;
CREATE TRIGGER auto_assign_admin_role_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_admin_role();