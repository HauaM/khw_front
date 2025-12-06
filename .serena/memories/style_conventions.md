# Style & Conventions

- The app is built with React 18 + TypeScript using Vite; components are typically declared as `const MyComponent: React.FC<MyProps> = ({ ... }) => ...`.
- Tailwind CSS drives styling; classes like `card` or color tokens (Primary Blue `#0066e6`, Success `#10b981`, etc.) appear in the README and existing UI.
- React Query (`@tanstack/react-query`) handles server state while Axios (with interceptors and auto token refresh) takes care of API calls.
- ESLint (with `@typescript-eslint` parser/plugin and the React hooks plugin) enforces lint rules; keep code warnings-free and respect the strict lint script.
- Project structure centralizes shared layouts (`layouts/`), reusable UI in `components/common/`, pages under `pages/`, and routes defined via `src/routes/AppRouter.tsx` (e.g., dashboards, consultations, manuals, reviews, admin).
- Custom hooks live under `hooks/`, utils under `utils/`, and API clients under `lib/api/` with typed request/response interfaces.
