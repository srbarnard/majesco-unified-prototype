# AGENTS.md

## Cursor Cloud specific instructions

This is a frontend-only app (Vite + React 18 + TypeScript + MUI v6). There is no backend, database, or Docker; everything runs client-side. Standard commands are documented in `README.md` / `package.json` scripts (`npm run dev`, `npm run build`, `npm run lint`, `npm run preview`).

### Live demo

- Production Vercel project: **product-concept-lab**
- Shared URL: **https://product-concept-lab.vercel.app/** (Submissions: https://product-concept-lab.vercel.app/submissions)
- Older names (`majesco-unified-prototype.vercel.app`, `pc-prototype.vercel.app`) are not this app’s production deploy.

### Notes for future agents

- Dependencies are installed automatically by the startup update script (`npm install`). Node 22 works.
- Dev server: `npm run dev` serves on **http://localhost:5200/** (`strictPort` — fails if 5200 is taken; kill the old process instead of starting another port). Submissions: http://localhost:5200/submissions
- Prefer verifying UI changes in the browser yourself after HMR; avoid asking the user to hard-refresh. If Fast Refresh fails, restart the single `:5200` server rather than spawning new ports.
- The MUI X Data Grid Premium shows a "MUI X Missing license key" watermark over tables (e.g. the Policies page) whenever `VITE_MUI_X_LICENSE_KEY` is unset. This is expected without a paid license and does not break functionality. To remove it, set `VITE_MUI_X_LICENSE_KEY` (read in `src/app/config/muiLicense.ts`); the key is applied only if present.
- Production build is `tsc -b && vite build` — unused imports fail the Vercel deploy (`noUnusedLocals`).
