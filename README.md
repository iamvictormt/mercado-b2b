# Mercado B2B

Plataforma bilingue de compras empresariais para São Tomé e Príncipe, construída com Next.js e PostgreSQL.

## Desenvolvimento

Requer Node.js 20.9 ou superior.

```bash
npm install
npm run dev
```

## Banco de dados

O backend usa Prisma ORM 7 com o driver PostgreSQL `pg`. Não há SDK, autenticação ou cliente browser de terceiros ligado ao banco; o acesso acontece apenas no servidor através de `src/lib/prisma.ts`.

O host atual apresenta uma cadeia de certificado autoassinada neste ambiente. Por isso, `DATABASE_SSL_REJECT_UNAUTHORIZED=false` mantém a ligação cifrada por TLS sem exigir uma CA local. Remova essa opção ou defina `true` em ambientes que ofereçam uma cadeia pública válida.

1. Copie `.env.example` para `.env`.
2. Substitua `CHANGE_ME` pela senha do PostgreSQL codificada para URL.
3. Valide e crie a primeira migração:

```bash
npm run db:validate
npm run db:migrate -- --name init
```

Para aplicar migrações já criadas noutro ambiente:

```bash
npm run db:deploy
```

O esquema inicial em `prisma/schema.prisma` inclui empresas, utilizadores, produtos, cotações, itens de cotação, pedidos de pesquisa e favoritos.

## Imagens

Os uploads usam o SDK oficial do Cloudinary exclusivamente no servidor. Configure no `.env` a variável copiada do painel do Cloudinary:

```bash
CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@CLOUD_NAME"
```

O endpoint aceita JPEG, PNG, WebP e AVIF até 8 MB. Imagens de produtos exigem administrador; imagens de pedidos de pesquisa exigem apenas uma sessão válida. A chave secreta nunca é enviada ao browser.

## Autenticação

A autenticação é própria e não depende de serviços externos. As palavras-passe usam `scrypt`, e as sessões são tokens opacos guardados como hash no PostgreSQL e enviados ao browser por cookie `HttpOnly`.

| Método | Rota                 | Função                           |
| ------ | -------------------- | -------------------------------- |
| POST   | `/api/auth/register` | Cria utilizador e inicia sessão  |
| POST   | `/api/auth/login`    | Valida credenciais               |
| POST   | `/api/auth/logout`   | Termina a sessão atual           |
| GET    | `/api/auth/session`  | Devolve o utilizador autenticado |

As páginas `/account` e `/admin` exigem sessão. O painel administrativo também exige `role = ADMIN`.

## API de negócio

| Método                  | Rota                         | Acesso                       |
| ----------------------- | ---------------------------- | ---------------------------- |
| GET, POST               | `/api/products`              | público / administrador      |
| GET, PATCH, DELETE      | `/api/products/:id-ou-slug`  | público / administrador      |
| GET, POST               | `/api/favorites`             | utilizador autenticado       |
| DELETE                  | `/api/favorites/:productId`  | utilizador autenticado       |
| GET, PUT                | `/api/account/company`       | utilizador autenticado       |
| GET                     | `/api/companies`             | administrador                |
| GET, PATCH              | `/api/companies/:id`         | administrador                |
| GET, POST               | `/api/quotes`                | utilizador autenticado       |
| GET, PATCH              | `/api/quotes/:id`            | proprietário / administrador |
| GET, POST               | `/api/sourcing-requests`     | utilizador autenticado       |
| GET, PATCH              | `/api/sourcing-requests/:id` | proprietário / administrador |
| POST (`multipart/form`) | `/api/uploads/cloudinary`    | utilizador autenticado       |

`DELETE /api/products/:id-ou-slug` remove o produto e a respetiva imagem. Os itens de cotações anteriores mantêm o nome e o preço guardados no momento do pedido.

## Comandos

```bash
npm run dev          # servidor local
npm run lint         # análise estática
npm run build        # build de produção
npm run db:generate  # regenera o Prisma Client
npm run db:validate  # valida o esquema Prisma
npm run db:studio    # abre o Prisma Studio
```

## Estrutura

- `prisma/schema.prisma`: modelo do banco.
- `prisma.config.ts`: configuração da CLI e migrações.
- `src/lib/prisma.ts`: cliente PostgreSQL exclusivo do servidor.
- `src/server/repositories`: consultas de domínio.
- `src/app`: rotas, layouts e metadados do Next.js App Router.
- `src/components/storefront.tsx`: navegação, rodapé, idioma e apresentação partilhada dos produtos.
