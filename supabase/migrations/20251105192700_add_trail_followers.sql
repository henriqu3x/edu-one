-- Tabela para armazenar os seguidores das trilhas
CREATE TABLE public.trail_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id UUID REFERENCES public.learning_trails(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(trail_id, user_id) -- Garante que um usuário só pode seguir uma trilha uma vez
);

-- Índice para melhorar consultas de seguidores
CREATE INDEX idx_trail_followers_trail_id ON public.trail_followers(trail_id);
CREATE INDEX idx_trail_followers_user_id ON public.trail_followers(user_id);

-- Função para seguir uma trilha
CREATE OR REPLACE FUNCTION public.follow_trail(
  p_trail_id UUID
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  v_follower_count INTEGER;
BEGIN
  -- Tenta inserir o seguidor
  INSERT INTO public.trail_followers (trail_id, user_id)
  VALUES (p_trail_id, auth.uid())
  ON CONFLICT (trail_id, user_id) DO NOTHING
  RETURNING 1 INTO result;
  
  -- Se inseriu com sucesso, incrementa o contador
  IF FOUND THEN
    UPDATE public.learning_trails
    SET follower_count = follower_count + 1
    WHERE id = p_trail_id
    RETURNING follower_count INTO v_follower_count;
    
    -- Adiciona pontos ao usuário por seguir uma trilha
    PERFORM public.add_user_points(auth.uid(), 50);
  END IF;
  
  -- Retorna o novo número de seguidores
  SELECT follower_count INTO v_follower_count
  FROM public.learning_trails
  WHERE id = p_trail_id;
  
  RETURN jsonb_build_object(
    'success', FOUND,
    'follower_count', v_follower_count,
    'is_following', TRUE
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM, 'success', FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para deixar de seguir uma trilha
CREATE OR REPLACE FUNCTION public.unfollow_trail(
  p_trail_id UUID
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  v_follower_count INTEGER;
BEGIN
  -- Remove o seguidor
  DELETE FROM public.trail_followers
  WHERE trail_id = p_trail_id
  AND user_id = auth.uid()
  RETURNING 1 INTO result;
  
  -- Se removeu com sucesso, decrementa o contador
  IF FOUND THEN
    UPDATE public.learning_trails
    SET follower_count = GREATEST(0, follower_count - 1)
    WHERE id = p_trail_id
    RETURNING follower_count INTO v_follower_count;
  END IF;
  
  -- Retorna o novo número de seguidores
  SELECT follower_count INTO v_follower_count
  FROM public.learning_trails
  WHERE id = p_trail_id;
  
  RETURN jsonb_build_object(
    'success', FOUND,
    'follower_count', COALESCE(v_follower_count, 0),
    'is_following', FALSE
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM, 'success', FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se um usuário segue uma trilha
CREATE OR REPLACE FUNCTION public.is_following_trail(
  p_trail_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.trail_followers
    WHERE trail_id = p_trail_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Visualização para listar as trilhas que um usuário segue
CREATE OR REPLACE VIEW public.user_followed_trails AS
SELECT 
  lt.id,
  lt.title,
  lt.description,
  lt.follower_count,
  lt.created_at,
  lt.updated_at,
  tf.user_id as follower_id,
  tf.created_at as followed_at
FROM public.learning_trails lt
JOIN public.trail_followers tf ON lt.id = tf.trail_id
WHERE tf.user_id = auth.uid();

-- Permissões
GRANT SELECT, INSERT, DELETE ON public.trail_followers TO authenticated;
GRANT SELECT ON public.user_followed_trails TO authenticated;
GRANT EXECUTE ON FUNCTION public.follow_trail(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unfollow_trail(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_following_trail(UUID) TO authenticated;

-- Políticas de segurança
ALTER TABLE public.trail_followers ENABLE ROW LEVEL SECURITY;

-- Políticas para trail_followers
CREATE POLICY "Usuários podem ver seus próprios seguidores de trilhas"
  ON public.trail_followers
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Usuários podem seguir trilhas"
  ON public.trail_followers
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem deixar de seguir suas próprias trilhas"
  ON public.trail_followers
  FOR DELETE
  USING (user_id = auth.uid());

-- Política para learning_trails
CREATE POLICY "Qualquer um pode ver as trilhas"
  ON public.learning_trails
  FOR SELECT
  USING (true);

-- Adiciona um trigger para atualizar o updated_at
CREATE OR REPLACE FUNCTION public.update_trail_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trail_updated_at
BEFORE UPDATE ON public.learning_trails
FOR EACH ROW
EXECUTE FUNCTION public.update_trail_updated_at();
