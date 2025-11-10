-- Remover o trigger duplicado que está causando contagem dupla de seguidores
DROP TRIGGER IF EXISTS trail_follower_change_trigger ON public.trail_followers;

-- Remover as funções que não são mais necessárias
DROP FUNCTION IF EXISTS public.handle_trail_follower_change();
DROP FUNCTION IF EXISTS public.increment_follower_count(uuid);
DROP FUNCTION IF EXISTS public.decrement_follower_count(uuid);
