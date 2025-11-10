-- Função para calcular o nível com base nos pontos
CREATE OR REPLACE FUNCTION public.calculate_level(points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Fórmula de progressão: level = floor(√(points / 100))
  -- Isso significa que serão necessários 100 pontos para o nível 1, 400 para o nível 2, 900 para o nível 3, etc.
  -- Usando points::numeric para garantir precisão na divisão
  RETURN floor(sqrt(points::numeric / 100));
  
  -- Tabela de referência:
  -- Nível 1: 0-99 pontos
  -- Nível 2: 100-399 pontos
  -- Nível 3: 400-899 pontos
  -- Nível 4: 900-1599 pontos
  -- E assim por diante...
END;
$$ LANGUAGE plpgsql;

-- Função para adicionar pontos ao perfil do usuário
CREATE OR REPLACE FUNCTION public.add_user_points(
  user_id UUID,
  points_to_add INTEGER
)
RETURNS VOID AS $$
DECLARE
  current_points INTEGER;
  new_points INTEGER;
  current_level INTEGER;
  new_level INTEGER;
BEGIN
  -- Atualiza os pontos do usuário e retorna o novo valor
  UPDATE public.profiles
  SET 
    total_points = total_points + points_to_add,
    updated_at = now()
  WHERE id = user_id
  RETURNING total_points, level INTO current_points, current_level;
  
  -- Calcula o novo nível
  new_level := public.calculate_level(current_points);
  
  -- Se o nível mudou, atualiza o nível do usuário
  IF new_level > current_level THEN
    UPDATE public.profiles
    SET level = new_level
    WHERE id = user_id;
    
    -- Aqui você pode adicionar notificações ou outras ações quando o usuário sobe de nível
    RAISE NOTICE 'Usuário % subiu para o nível %', user_id, new_level;
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função que será chamada pelo trigger após a inserção de um novo curso
CREATE OR REPLACE FUNCTION public.on_course_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Adiciona 100 pontos ao criar um curso
  PERFORM public.add_user_points(NEW.author_id, 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cria o trigger que chama a função quando um novo curso é criado
CREATE TRIGGER on_course_created_trigger
AFTER INSERT ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.on_course_created();

-- Adiciona comentários para documentação
COMMENT ON FUNCTION public.calculate_level(INTEGER) IS 'Calcula o nível do usuário com base nos pontos';
COMMENT ON FUNCTION public.add_user_points(UUID, INTEGER) IS 'Adiciona pontos ao perfil do usuário e atualiza o nível se necessário';
COMMENT ON FUNCTION public.on_course_created() IS 'Função de trigger que é chamada após a criação de um novo curso';

-- Permissões
GRANT EXECUTE ON FUNCTION public.calculate_level(INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.add_user_points(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.on_course_created() TO authenticated;
