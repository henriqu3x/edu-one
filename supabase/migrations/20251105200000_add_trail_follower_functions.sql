-- Função para incrementar o contador de seguidores de uma trilha
CREATE OR REPLACE FUNCTION public.increment_follower_count(trail_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE learning_trails
  SET follower_count = COALESCE(follower_count, 0) + 1
  WHERE id = trail_id;
END;
$$ LANGUAGE plpgsql;

-- Função para decrementar o contador de seguidores de uma trilha
CREATE OR REPLACE FUNCTION public.decrement_follower_count(trail_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE learning_trails
  SET follower_count = GREATEST(0, COALESCE(follower_count, 0) - 1)
  WHERE id = trail_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger para garantir que o contador seja atualizado automaticamente
CREATE OR REPLACE FUNCTION public.handle_trail_follower_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM public.increment_follower_count(NEW.trail_id);
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM public.decrement_follower_count(OLD.trail_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger
DROP TRIGGER IF EXISTS trail_follower_change_trigger ON public.trail_followers;

CREATE TRIGGER trail_follower_change_trigger
AFTER INSERT OR DELETE ON public.trail_followers
FOR EACH ROW
EXECUTE FUNCTION public.handle_trail_follower_change();
