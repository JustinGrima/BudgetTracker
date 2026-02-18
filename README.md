# Fiscal Dashboard (Local-First)

Personal household fiscal tracker built with Next.js + Prisma (SQLite).

## Setup

1. Install dependencies
2. Create `.env` from `.env.example`
3. Run migrations and seed data
4. Start the app

```bash
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

## Environment

```env
DATABASE_URL="file:./prisma/dev.db"
```

## Notes

- Local-only single household usage.
- No authentication/RBAC by design.
- All write API operations generate `AuditEvent` rows.
