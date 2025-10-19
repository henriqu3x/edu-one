-- Allow moderators and admins to update courses for moderation purposes
CREATE POLICY "Moderators can update courses for moderation"
  ON public.courses FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'moderator')
    OR public.has_role(auth.uid(), 'admin')
  );