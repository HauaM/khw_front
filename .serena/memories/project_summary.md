# Project Summary

- Purpose: Front-end for the 광주은행 KWH 지식관리시스템 (helpdesk wiki knowledge management).
- Stack: React 18, TypeScript, Vite, React Router, Tailwind CSS, React Query, Axios, ESLint, Tailwind/PostCSS tooling.
- App structure: entry `src/main.tsx` → `App.tsx` wraps `AppRouter` inside `QueryClientProvider`; `routes/AppRouter.tsx` defines dashboards, consultations (create/search/detail), manuals (search/history), review tasks, admin sections, and auth paths.
- Supporting folders: `components/` (common UI), `pages/` (per-feature screens, e.g., `consultations/`, `manuals/`, `reviews/`), `layouts/`, `lib/` (e.g., Axios client + query client), `hooks/`, `utils/`, `types/`, `styles/globals.css` for base styles.
