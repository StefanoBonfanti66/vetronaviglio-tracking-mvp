# Agent rules

- Read PROJECT_AI_NOTES.md before doing major work.
- Prefer small diffs.
- Ask before touching secrets, .env, deployment, infra, auth, billing.
- Follow existing code style.
- Update PROJECT_AI_NOTES.md at meaningful checkpoints.

## OpenCode usage in this template
- Treat this repository as a project-scoped OpenCode workspace.
- Personalize `AGENTS.md` after cloning so the rules match the new project.
- Use `PROJECT_AI_NOTES.md` to track decisions, checkpoints, and pending items across sessions.
- If you use custom commands in your OpenCode setup, document project-specific ones here or in the repository docs.

## Current Focus — 2026-07-24 (Sessione 3)

### Completato (Sessione 3 - 2026-07-24)
- **DHL tracking integrato:** `DhlTracker` implementato, factory multi-carrier, endpoint unificato `/api/track`
- **DHL su Preview Vercel:** Deploy preview con chiave test funzionante (`vetronaviglio-tracking-ippyrfw5s-stefano-bonfantis-projects.vercel.app`)
- **Supabase:** `carriers.api_available = true` per DHL
- **Git sync:** `develop` pushato, preview deploy automatico triggerato
- **Workflow corretto:** develop → preview → test → merge main → production

### Completato (precedente)
- Bootstrap progetto da template `triathlon-starter`
- **M1-M5:** Schema Supabase, FedEx API, Dashboard, CSV, Testing (36 test) — go-live produzione
- **Rebranding + Deploy Vercel:** Production live su `app-blond-omega-14.vercel.app`
- **FedEx production:** 61 spedizioni tracciate, cron job daily 06:00 UTC
- **M6 — Server-side pagination:** Paginazione server-side (20/50/100), sort colonne via Supabase, `PaginationBar` UI
- **M7 — Multi-carrier refactor:** `CarrierTracker` interface, factory, `FedExTracker`, `DhlTracker`, unified `/api/track` endpoint, cron dispatches per carrier, UI generica Settings
- **UX Gaps:** CSV template download, filtri data (date_from/date_to), PDF export (window.print + CSS @media print), dashboard stats server-side (head:true), default page size 20
- **Tech debt:** `updateShipment()` non forza più `last_update`
- **TrackingTimeline:** Componente animato con icone per status, colori, tempo relativo, badge "Ultimo"
- **Mobile responsive:** Sidebar collassabile con hamburger + overlay backdrop, card-list per spedizioni su mobile, touch target WCAG 44px, padding adattivo, azioni con icone SVG, tabella overflow-x-auto
- **Fix produzione:** ESM imports `.js` extension per serverless Vercel, vercel.json includeFiles per api/lib/

### Stato attuale
- Branch `develop` — working tree pulito (AGENTS.md + PROJECT_AI_NOTES.md commitati)
- `main` allineato a develop (fix ESM + mobile)
- Produzione live su `app-blond-omega-14.vercel.app` (solo FedEx attivo)
- Preview Vercel funzionante con DHL test attivo
- Architettura multi-carrier completa: FedEx (produzione) + DHL (test su preview, richiede chiave business per production)
- 36/36 test passati, typecheck ✅ build ✅

### Prossimo step
1. **Ottenere DHL API Key business Vetronaviglio** (Developer Portal → Consumer Key account business)
2. **Aggiornare Vercel Production** con `DHL_API_KEY` + `VITE_DHL_API_KEY` reali
3. **Merge `develop` → `main`** → deploy automatico production
4. **FATT-002** — Emettere fattura post-M2 (€2.040, scadenza 2026-09-10)
5. **Auth/login page** — Supabase Auth + middleware protezione dati
6. **Raccogliere feedback cliente** su app production
