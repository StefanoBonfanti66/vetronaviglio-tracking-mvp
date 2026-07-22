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

## Current Focus — 2026-07-22

### Completato
- Bootstrap progetto da template `triathlon-starter`
- **M1:** Schema Supabase, types, lib query, layout, pagine base
- **M2:** FedEx API client (OAuth2, track), settings page
- **M3:** Dashboard avanzata (grafici pie/bar, timeline, form, filtri)
- **M4:** Gestione manuale/CSV spedizioni (ordinamento, modifica/elimina, import/export)
- **M5:** Testing completato — 36 test Vitest, typecheck, build OK
- **Rebranding:** Logo, favicon, colori brand (#0977b4, #35bfae, #162a37), font Segoe UI
- **Deploy Vercel:** Production live su `app-blond-omega-14.vercel.app`
- **Supabase:** Project `vetronaviglio-tracking` creato, schema applicato, carriers seeded
- **CSV fix:** Delimiter detection (tab/comma), alias intestazioni italiane FedEx, BOM stripping, carrier_code opzionale con auto-detect
- **FedEx API proxy:** Serverless routes `/api/fedex/token` + `/api/fedex/track` (CORS fix)
- **FedEx production:** Credenziali production configurate su Vercel (61 spedizioni tracciate con successo)
- **Cron job:** `/api/cron/refresh-tracking` — aggiornamento automatico tracking (daily 06:00 UTC) + pulsante manuale su Dashboard
- **Env vars:** Tutte le env vars configurate su Vercel (Supabase, FedEx prod, CRON_SECRET)
- README.md aggiornato per Vetronaviglio Tracking MVP

### In corso
- Branch `develop` (tracking `origin/main`)
- 15 file modificati uncommitted (csv fix, fedex proxy, cron job, rebranding, deps)

### Prossimo step
- Commit delle modifiche uncommitted (csv fix, fedex proxy, cron job, rebranding)
- Commit di test-spedizioni.csv e app/.gitignore
- Aggiornare PROJECT_AI_NOTES.md con stato finale
