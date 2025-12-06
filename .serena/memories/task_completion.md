# Task Completion Checklist

- Run `yarn lint` (or `npm run lint`) after changes so ESLint reports zero warnings/errors.
- Run `yarn build` (or `npm run build`) to verify TypeScript checks and Vite bundling before finishing work.
- Fire up `yarn dev` to exercise the UI if you touched pages/layouts; ensure data flows (React Query/Axios) render correctly.
- Update docs (e.g., README) whenever you introduce new workflows, routes, or environment variables.
- Double-check `git status`/`git diff` before committing; use `git add -p` to stage relevant hunks.
- Leave short notes on the PR/issue about testing performed (lint/build/dev preview) so reviewers understand the verification steps.
