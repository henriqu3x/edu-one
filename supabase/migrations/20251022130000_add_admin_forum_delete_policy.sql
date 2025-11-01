-- Allow admins to delete forum topics
CREATE POLICY "Admins can delete forum topics"
  ON public.forum_topics FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));
