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

## Current Focus — 2026-07-23

### Completato
- Bootstrap progetto da template `triathlon-starter`
- **M1-M5:** Schema Supabase, FedEx API, Dashboard, CSV, Testing (36 test) — go-live produzione
- **Rebranding + Deploy Vercel:** Production live su `app-blond-omega-14.vercel.app`
- **FedEx production:** 61 spedizioni tracciate, cron job daily 06:00 UTC
- **M6 — Server-side pagination:** Paginazione server-side (20/50/100), sort colonne via Supabase, `PaginationBar` UI
- **M7 — Multi-carrier refactor:** `CarrierTracker` interface, factory, `FedExTracker`, `DhlTracker`, unified `/api/track` endpoint, cron dispatches per carrier, UI generica Settings

### Stato attuale
- Branch `develop` — working tree pulito
- Produzione live, 61 spedizioni tracciate, 36/36 test passati
- Architettura multi-carrier pronta: FedEx (attivo) + DHL (placeholder, richiede `DHL_API_KEY`)
- Vecchi endpoint `/api/fedex/*` rimossi — usare `/api/track`

### Prossimo step
- Configurare DHL API key su Vercel per abilitare secondo carrier
- Emettere FATT-002 (post-M2, €2.040)
- Auth/login page
- Raccogliere feedback cliente
