# AGENTS.md

## Cursor Cloud specific instructions

This is a frontend-only app (Vite + React 18 + TypeScript + MUI v6). There is no backend, database, or Docker; everything runs client-side. Standard commands are documented in `README.md` / `package.json` scripts (`npm run dev`, `npm run build`, `npm run lint`, `npm run preview`).

Notes for future agents:

- Dependencies are installed automatically by the startup update script (`npm install`). Node 22 works.
- Dev server: `npm run dev` serves on `http://localhost:5173/` (not exposed on the network by default; use `--host` to expose).
- Lint (`npm run lint`) uses `oxlint` and currently emits `react(only-export-components)` warnings only — these are non-blocking (exit code 0).
- The MUI X Data Grid Premium shows a "MUI X Missing license key" watermark over tables (e.g. the Policies page) whenever `VITE_MUI_X_LICENSE_KEY` is unset. This is expected without a paid license and does not break functionality. To remove it, set `VITE_MUI_X_LICENSE_KEY` (read in `src/app/config/muiLicense.ts`); the key is applied only if present.
