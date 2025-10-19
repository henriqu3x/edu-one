# Guia de Migração: Supabase para Aiven PostgreSQL

Este guia detalha como migrar sua aplicação Educamais+ do Supabase para o Aiven PostgreSQL.

## Índice
1. [Preparação no Aiven](#1-preparação-no-aiven)
2. [Exportar Dados do Supabase](#2-exportar-dados-do-supabase)
3. [Configurar Banco Aiven](#3-configurar-banco-aiven)
4. [Atualizar Aplicação](#4-atualizar-aplicação)
5. [Migrar Dados](#5-migrar-dados)
6. [Testar e Validar](#6-testar-e-validar)

---

## 1. Preparação no Aiven

### 1.1 Criar Conta no Aiven
1. Acesse [Aiven.io](https://aiven.io)
2. Crie uma conta gratuita ou faça login
3. Acesse o Console do Aiven

### 1.2 Criar Serviço PostgreSQL
1. No Console, clique em "Create Service"
2. Selecione **PostgreSQL**
3. Escolha:
   - **Cloud Provider**: AWS, Google Cloud ou Azure
   - **Região**: Escolha a mais próxima dos seus usuários
   - **Plan**: Startup (gratuito) ou Business conforme necessidade
4. Nomeie seu serviço (ex: `educamais-db`)
5. Clique em "Create Service"
6. Aguarde ~10 minutos para o serviço ficar pronto

### 1.3 Obter Credenciais de Conexão
Após o serviço estar "Running":
1. Clique no serviço criado
2. Vá para a aba "Overview"
3. Anote as seguintes informações:
   - **Service URI** (URL completa de conexão)
   - **Host**
   - **Port**
   - **Database**
   - **Username**
   - **Password**

Exemplo de Service URI:
```
postgres://avnadmin:senha123@educamais-db-project.aivencloud.com:12345/defaultdb?sslmode=require
```

---

## 2. Exportar Dados do Supabase

### 2.1 Via Dashboard Supabase
1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **Database** → **Backups**
4. Clique em "Download" no backup mais recente
5. Salve o arquivo `.sql`

### 2.2 Via CLI (Alternativa)
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Exportar schema
supabase db dump --db-url "sua-url-do-supabase" > backup-schema.sql

# Exportar dados
supabase db dump --data-only --db-url "sua-url-do-supabase" > backup-data.sql
```

---

## 3. Configurar Banco Aiven

### 3.1 Acessar Banco via psql
```bash
# Instalar PostgreSQL client (se necessário)
# Ubuntu/Debian
sudo apt-get install postgresql-client

# MacOS
brew install postgresql

# Conectar ao Aiven
psql "postgres://avnadmin:SENHA@HOST:PORT/defaultdb?sslmode=require"
```

### 3.2 Criar Estrutura do Banco

#### 3.2.1 Criar Schemas
```sql
-- Criar schemas necessários
CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS auth;
```

#### 3.2.2 Criar Tipos Enumerados
```sql
-- Tipos customizados
CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE content_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE moderation_action AS ENUM ('approved', 'rejected');
```

#### 3.2.3 Importar Schema
```bash
# Importar o schema exportado do Supabase
psql "postgres://avnadmin:SENHA@HOST:PORT/defaultdb?sslmode=require" < backup-schema.sql
```

### 3.3 Configurar Extensões
```sql
-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

---

## 4. Atualizar Aplicação

### 4.1 Instalar Dependências
```bash
# Instalar cliente PostgreSQL para Node.js
npm install pg
npm install @types/pg --save-dev

# OU usar Prisma (recomendado)
npm install @prisma/client
npm install prisma --save-dev
```

### 4.2 Criar Arquivo de Configuração

**Opção A: Usando `pg` direto**

Crie `src/lib/database.ts`:
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export default pool;
```

**Opção B: Usando Prisma (Recomendado)**

```bash
# Inicializar Prisma
npx prisma init

# Editar prisma/schema.prisma
```

Arquivo `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Profile {
  id                String   @id @default(uuid())
  username          String   @unique
  full_name         String?
  bio               String?
  avatar_url        String?
  level             Int      @default(1)
  total_points      Int      @default(0)
  is_verified_author Boolean @default(false)
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  courses           Course[]
  course_likes      CourseLike[]
  course_saves      CourseSave[]
  course_ratings    CourseRating[]
  comments          Comment[]
  
  @@map("profiles")
}

model Category {
  id         String   @id @default(uuid())
  name       String
  slug       String   @unique
  icon       String?
  created_at DateTime @default(now())
  
  courses    Course[]
  
  @@map("categories")
}

// ... adicione os demais models conforme seu schema
```

Gerar cliente Prisma:
```bash
npx prisma generate
npx prisma db push
```

### 4.3 Atualizar Variáveis de Ambiente

Crie/Edite `.env.local`:
```env
# Aiven Database
DATABASE_URL="postgres://avnadmin:SENHA@HOST:PORT/defaultdb?sslmode=require"

# Se usar Prisma
DATABASE_DIRECT_URL="postgres://avnadmin:SENHA@HOST:PORT/defaultdb?sslmode=require"

# Manter outras variáveis necessárias
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4.4 Remover Dependências do Supabase

```bash
# Remover pacotes Supabase (opcional, se não for mais usar)
npm uninstall @supabase/supabase-js
```

### 4.5 Atualizar Código da Aplicação

**Exemplo de conversão - Antes (Supabase):**
```typescript
import { supabase } from '@/integrations/supabase/client';

// Buscar cursos
const { data, error } = await supabase
  .from('courses')
  .select('*')
  .eq('status', 'approved');
```

**Depois (com pg):**
```typescript
import { query } from '@/lib/database';

// Buscar cursos
const result = await query(
  'SELECT * FROM courses WHERE status = $1',
  ['approved']
);
const data = result.rows;
```

**Depois (com Prisma):**
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Buscar cursos
const data = await prisma.course.findMany({
  where: { status: 'approved' }
});
```

### 4.6 Implementar Autenticação

Como o Aiven não tem auth embutido, você precisará implementar:

**Opção 1: NextAuth.js (Recomendado)**
```bash
npm install next-auth
```

Criar `pages/api/auth/[...nextauth].ts`:
```typescript
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { query } from "@/lib/database";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const result = await query(
          'SELECT * FROM auth.users WHERE email = $1',
          [credentials.email]
        );

        const user = result.rows[0];

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.encrypted_password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.raw_user_meta_data?.full_name
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth"
  }
});
```

**Opção 2: Auth.js / Lucia Auth**

---

## 5. Migrar Dados

### 5.1 Importar Dados Completos
```bash
# Importar backup de dados
psql "postgres://avnadmin:SENHA@HOST:PORT/defaultdb?sslmode=require" < backup-data.sql
```

### 5.2 Verificar Importação
```sql
-- Conectar ao banco
psql "postgres://avnadmin:SENHA@HOST:PORT/defaultdb?sslmode=require"

-- Verificar contagem de registros
SELECT 'profiles' as table_name, COUNT(*) FROM profiles
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'categories', COUNT(*) FROM categories;

-- Verificar estrutura
\dt
```

---

## 6. Testar e Validar

### 6.1 Testes Locais
```bash
# Rodar aplicação em desenvolvimento
npm run dev

# Testar funcionalidades:
# - Login/Registro
# - Listar cursos
# - Criar curso
# - Curtir/Salvar
# - Comentários
# - Painel Admin
```

### 6.2 Checklist de Validação

- [ ] Conexão com banco estabelecida
- [ ] Todas as tabelas criadas
- [ ] Dados migrados corretamente
- [ ] Autenticação funcionando
- [ ] CRUD de cursos
- [ ] Sistema de curtidas/salvamentos
- [ ] Comentários
- [ ] Ratings
- [ ] Painel de moderação
- [ ] Painel admin

### 6.3 Performance

Adicionar índices para otimizar consultas:
```sql
-- Índices importantes
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_author ON courses(author_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_course_likes_user ON course_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_course_likes_course ON course_likes(course_id);
```

---

## 7. Segurança

### 7.1 Configurar Firewall do Aiven
1. No console Aiven, vá em seu serviço
2. Clique em "VPC" ou "Allowed IP Addresses"
3. Adicione os IPs permitidos:
   - Seu IP de desenvolvimento
   - IPs do servidor de produção
   - IPs do Vercel/Netlify (se aplicável)

### 7.2 Rotação de Senhas
Configure rotação periódica de senhas no Aiven:
1. Vá em "Users" no console
2. Clique em "Reset Password"
3. Atualize `.env` com nova senha

### 7.3 Backup Automático
Aiven faz backups automáticos, mas configure também:
```bash
# Script de backup local (adicionar ao cron)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump "postgres://avnadmin:SENHA@HOST:PORT/defaultdb" > backup_$DATE.sql
```

---

## 8. Deploy em Produção

### 8.1 Atualizar Variáveis de Ambiente
No Vercel/Netlify:
```
DATABASE_URL=postgres://avnadmin:SENHA@HOST:PORT/defaultdb?sslmode=require
```

### 8.2 Executar Migrations
```bash
# Se usando Prisma
npx prisma migrate deploy

# Se usando migrations SQL
psql $DATABASE_URL < migrations/*.sql
```

---

## 9. Monitoramento

### 9.1 Logs do Aiven
- Acesse "Logs" no console do Aiven
- Configure alertas para:
  - Uso de CPU > 80%
  - Conexões > 90% do limite
  - Erros de query

### 9.2 Métricas
- Monitore:
  - Query performance
  - Connection pool usage
  - Disk usage
  - Memory usage

---

## 10. Rollback (Caso Necessário)

Se precisar voltar ao Supabase:

1. **Manter Supabase ativo** durante período de transição
2. **Backup dos dados do Aiven** antes de rollback
3. **Reverter código** para versão com Supabase
4. **Importar dados** do Aiven de volta ao Supabase (se necessário)

```bash
# Exportar dados do Aiven
pg_dump "postgres://avnadmin:SENHA@HOST:PORT/defaultdb" > rollback-backup.sql

# Importar no Supabase
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres" < rollback-backup.sql
```

---

## Recursos Adicionais

- [Documentação Aiven PostgreSQL](https://docs.aiven.io/docs/products/postgresql)
- [Migração PostgreSQL Best Practices](https://www.postgresql.org/docs/current/backup.html)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Prisma Docs](https://www.prisma.io/docs/)

---

## Suporte

Em caso de dúvidas:
1. Consulte a [documentação do Aiven](https://docs.aiven.io)
2. Abra um ticket no suporte do Aiven
3. Consulte a comunidade PostgreSQL

---

**Data de criação:** $(date)
**Versão:** 1.0
