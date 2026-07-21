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
- CI/CD fix: `@vitejs/plugin-react` aggiornato a `^5.2.0` (compatibilità Vite 6.x)
- Documentazione ZBN completa: brief, positioning, pricing, admin-check, preventivo, email preventivo, project plan, kickoff interno/cliente, runbook, ledger, cashflow, solleciti, invoice index
- Struttura `docs/` inizializzata con `_INDEX.md` e `changelog.md`
- FATT-001 (acconto 20% = €2.040) incassata
- **M1 completato:** Schema Supabase, types, lib query, layout, pagine base, typecheck + build OK
- **M2 completato:** FedEx API client (OAuth2, track), types, settings page con test connessione
- **M3 completato:** Dashboard avanzata (grafici pie/bar, timeline eventi, form nuova spedizione, filtri corriere)

### In corso
- Branch `develop` attivo con M1 + M2 + M3
- Stack: React 19 + TypeScript + Vite + TailwindCSS v4 + Supabase + recharts

### Da fare
- Aggiornare `README.md` (ancora template generico triathlon-starter)
- M4: Gestione manuale/CSV spedizioni
- M5: Testing + go-live

### Prossimo step concreto
Commit M3 su `develop`, poi procedere con M4 (Gestione manuale/CSV spedizioni).
