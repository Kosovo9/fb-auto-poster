# Facebook Auto-Poster 🚀

Sistema automatizado para postear en múltiples grupos de Facebook sin esfuerzo.

## Stack
- **Frontend**: Next.js 14 + React + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Automation**: Playwright + GitHub Actions
- **Hosting**: Railway

## Características
✅ Agregar múltiples grupos de Facebook
✅ Programar posteos para fechas/horas específicas
✅ Dashboard en tiempo real
✅ Automatización 24/7 sin PC prendida
✅ Reintentos inteligentes
✅ Logs detallados

## Instalación Local
1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Configurar `.env.local`
4. Ejecutar: `npm run dev`

## Variables de Entorno
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
