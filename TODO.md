# TODO: Implementar Botão de Banir Usuário no Painel Admin

## Passos para Implementação
- [x] Adicionar botão "Banir" ao lado do seletor de papel em cada usuário na aba "Usuários"
- [x] Criar função `handleBanUser` que deleta o usuário e todos os dados relacionados
- [x] Testar a funcionalidade para garantir que todos os dados sejam deletados corretamente
- [x] Verificar políticas RLS no Supabase para deleções

## Detalhes da Função handleBanUser
- Exibir confirmação com window.confirm
- Deletar na ordem:
  1. Dados relacionados aos cursos do usuário (comentários, ratings, saves, likes, views)
  2. Para cada curso do usuário: deletar dados relacionados do curso, depois o curso
  3. Deletar comentários, ratings, saves, likes, views feitos pelo usuário
  4. Deletar papéis do usuário (user_roles)
  5. Deletar perfil do usuário (profiles)
- Usar toast para feedback
- Chamar fetchData() para atualizar lista
