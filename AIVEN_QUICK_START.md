# Migração para Aiven - Guia Rápido

## Passos Rápidos

### 1. Criar Serviço no Aiven (10 min)
1. Acesse [aiven.io](https://aiven.io) e crie uma conta
2. Crie um serviço PostgreSQL
3. Copie a **Service URI** da aba "Overview"

### 2. Exportar do Supabase (5 min)
```bash
# Via Dashboard: Database → Backups → Download
# Salvar arquivo: backup.sql
```

### 3. Configurar Variáveis (2 min)
Edite `.env.local`:
```env
DATABASE_URL="postgres://avnadmin:SENHA@HOST:PORT/defaultdb?sslmode=require"
```

### 4. Importar Dados (5 min)
```bash
# Conectar e importar
psql "postgres://avnadmin:SENHA@HOST:PORT/defaultdb?sslmode=require" < backup.sql
```

### 5. Instalar Dependências (3 min)
```bash
# Opção recomendada: Prisma
npm install @prisma/client prisma
npx prisma init
npx prisma db pull  # Gera schema do banco
npx prisma generate  # Gera cliente
```

### 6. Atualizar Código
**Antes (Supabase):**
```typescript
import { supabase } from '@/integrations/supabase/client';

const { data } = await supabase
  .from('courses')
  .select('*')
  .eq('status', 'approved');
```

**Depois (Prisma):**
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const data = await prisma.course.findMany({
  where: { status: 'approved' }
});
```

### 7. Implementar Auth
```bash
npm install next-auth bcrypt
```

Criar `pages/api/auth/[...nextauth].ts` (ver exemplo no guia completo).

### 8. Deploy
1. Atualizar `DATABASE_URL` no Vercel/Netlify
2. Deploy da aplicação
3. Testar funcionalidades

---

## Checklist de Migração

- [ ] Serviço Aiven criado
- [ ] Service URI copiada
- [ ] Dados exportados do Supabase
- [ ] `.env.local` atualizado
- [ ] Dependências instaladas (Prisma)
- [ ] Dados importados no Aiven
- [ ] Schema Prisma gerado
- [ ] Código atualizado
- [ ] Auth implementado
- [ ] Testes locais OK
- [ ] Deploy em produção
- [ ] Validação final

---

## Links Úteis

- **Guia Completo**: Ver `AIVEN_MIGRATION.md`
- **Aiven Console**: https://console.aiven.io
- **Prisma Docs**: https://www.prisma.io/docs
- **NextAuth Docs**: https://next-auth.js.org

---

## Tempo Estimado Total: 30-45 minutos

## Suporte
Em caso de problemas, consulte o guia completo `AIVEN_MIGRATION.md` ou abra um ticket no suporte do Aiven.
