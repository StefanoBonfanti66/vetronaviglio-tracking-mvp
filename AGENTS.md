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

## Current Focus — 2026-07-21

### Completato
- Bootstrap progetto da template `triathlon-starter`
- **M1:** Schema Supabase, types, lib query, layout, pagine base
- **M2:** FedEx API client (OAuth2, track), settings page
- **M3:** Dashboard avanzata (grafici pie/bar, timeline, form, filtri)
- **M4:** Gestione manuale/CSV spedizioni (ordinamento, modifica/elimina, import/export)
- **M5:** Testing completato — 31 test Vitest, typecheck, build OK
- README.md aggiornato per Vetronaviglio Tracking MVP

### In corso
- Deploy Vercel (in attesa di token valido)
- Branch `develop`

### Prossimo step
- Completare deploy Vercel
- Go-live produzione
