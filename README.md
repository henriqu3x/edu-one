# Educa+ - Plataforma de Aprendizado Colaborativo

Uma plataforma educacional colaborativa onde usuários podem compartilhar e descobrir minicursos gratuitos, dicas de estudo e conteúdos criados pela comunidade.

## Sobre o Educa+

O Educa+ é uma plataforma desenvolvida para democratizar o acesso ao conhecimento, permitindo que qualquer pessoa possa compartilhar seu saber através de minicursos interativos, trilhas de aprendizado e discussões no fórum. Nossa missão é criar uma comunidade de aprendizado contínuo e colaborativo.

## Funcionalidades Principais

- **📚 Cursos Interativos**: Crie e consuma minicursos com vídeos, textos e exercícios
- **🛤️ Trilhas de Aprendizado**: Organize cursos em sequências temáticas
- **💬 Fórum da Comunidade**: Discuta tópicos, tire dúvidas e compartilhe experiências
- **👤 Perfis de Usuários**: Sistema de perfis com níveis, pontos e verificação de autores
- **⭐ Sistema de Avaliação**: Avalie e comente cursos
- **🔍 Busca Avançada**: Encontre conteúdos por categoria, dificuldade ou palavras-chave
- **🛡️ Moderação**: Sistema de moderação para manter a qualidade do conteúdo
- **👑 Painel Administrativo**: Gerencie usuários, cursos e configurações da plataforma

## Tecnologias Utilizadas

Este projeto foi construído com tecnologias modernas e robustas:

### Frontend
- **React 18** - Biblioteca JavaScript para interfaces de usuário
- **TypeScript** - Superset tipado do JavaScript
- **Vite** - Build tool e dev server ultrarrápido
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI acessíveis e customizáveis
- **Framer Motion** - Animações e transições suaves
- **React Router** - Roteamento do lado cliente
- **React Query** - Gerenciamento de estado server e cache
- **React Hook Form** - Formulários performáticos
- **Zod** - Validação de schemas

### Backend & Banco de Dados
- **Supabase** - Backend-as-a-Service (Auth, Database, Storage)
- **PostgreSQL** - Banco de dados relacional
- **Prisma** - ORM para TypeScript & Node.js

## Como Contribuir

### Desenvolvimento Local

**Pré-requisitos:**
- Node.js (versão 18 ou superior) - [instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm ou bun

**Passos para desenvolvimento:**

```sh
# 1. Clone o repositório
git clone <URL_DO_SEU_REPOSITORIO>

# 2. Entre no diretório do projeto
cd educa-mais

# 3. Instale as dependências
npm install
# ou
bun install

# 4. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite o .env.local com suas configurações do Supabase

# 5. Execute as migrações do banco (se necessário)
npx supabase db push

# 6. Inicie o servidor de desenvolvimento
npm run dev
# ou
bun run dev
```

O projeto estará disponível em `http://localhost:8080`

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run build:dev` - Build para desenvolvimento
- `npm run lint` - Executa o linter
- `npm run preview` - Preview do build de produção
- `npm run generate-sitemap` - Gera sitemap do site

### Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn/ui)
│   └── ...             # Componentes específicos
├── pages/              # Páginas da aplicação
├── hooks/              # Custom hooks
├── lib/                # Utilitários e configurações
├── integrations/       # Integrações externas (Supabase, etc.)
├── providers/          # Context providers
└── assets/             # Imagens e recursos estáticos

supabase/
├── migrations/         # Migrações do banco de dados
└── functions/          # Edge functions

prisma/                 # Schema do Prisma (opcional)
scripts/                # Scripts utilitários
```

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Contato

Para dúvidas, sugestões ou contribuições, entre em contato através das issues do GitHub ou do fórum da plataforma.
