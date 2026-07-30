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

## Current Focus — 2026-07-30 (Sessione 4)

### Completato (Sessione 4 - 2026-07-30)
- **Diagnosi dashboard ferma al 25/07:** 60/61 spedizioni già delivered, 1 in_transit ferma dal 14/07. Nessun bug — sistema funzionante correttamente ma senza nuovi dati.
- **Fix cron `refresh-tracking`:** `last_update` ora aggiornato sempre (prima saltato su status invariato). Commit 13e470a su develop, preview deploy triggerato.
- **Verifica completa:** 0 errori runtime Vercel, FedEx API OK, Supabase OK. typecheck ✅ 36/36 test ✅ build ✅
- **Import 12 spedizioni mancanti:** Scoperta API interna FedEx `visibilitieslist`, confronto FedEx(61) vs Supabase(73), importate 12 tracking numbers mancanti via Python script
- **`/api/discover`:** Nuovo endpoint che interroga FedEx visibilitieslist e importa tracking mancanti in Supabase. Accetta session cookies per bypassare Akamai WAF
- **`scripts/discover-fedex.mjs`:** Script Playwright per login FedEx → estrazione cookies → Vercel endpoint
- **Dashboard button "Sync FedEx":** Pulsante + Ultimo sync timestamp + result banner
- **vercel.json:** Aggiunto cron ogni 10 min (`*/10 * * * *`) per discovery automatica

### Completato (precedente)
- **Sessione 3:** DHL tracking integrato, preview funzionante, Git sync develop
- **M1-M7:** Bootstrap, schema Supabase, FedEx API, Dashboard, CSV, 36 test, rebranding, deploy Vercel, paginazione, multi-carrier, mobile responsive, ESM fix
- **UX Gaps:** CSV download, filtri data, PDF export, stats server-side, default 20 per pagina
- **Tech debt:** `updateShipment()` non forza più `last_update`
- **TrackingTimeline:** Componente animato con icone, colori, badge "Ultimo"

### Stato attuale
- Branch `develop` con ultime modifiche (Settings, FedEx auto-discovery, DHL)
- Branch `main` per produzione live su `app-blond-omega-14.vercel.app`
- Preview Vercel funzionante con DHL test attivo
- 36/36 test passati, typecheck ✅ build ✅

### Prossimo step
1. **Ottenere DHL API Key business Vetronaviglio** (Developer Portal → Consumer Key account business)
2. **Aggiornare Vercel Production** con `DHL_API_KEY` + `VITE_DHL_API_KEY` reali
3. **Merge `develop` → `main`** → deploy automatico production
4. **FATT-002** — Emettere fattura post-M2 (€2.040, scadenza 2026-09-10)
5. **Auth/login page** — Supabase Auth + middleware protezione dati
6. **Raccogliere feedback cliente** su app production
