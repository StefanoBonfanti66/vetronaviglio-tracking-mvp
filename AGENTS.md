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

## Current Focus — 2026-07-30 (Sessione 5)

### Completato (Sessione 5 - 2026-07-30)
- **Pagina Settings con gestione credenziali corrieri:** `/settings` riscritta con form per FedEx e DHL (campi password con toggle show/hide, stato corrieri, test connessione)
- **`/api/settings/credentials` (GET/PUT):** Endpoint per leggere e salvare credenziali su Supabase (`carrier_credentials` table)
- **`api/lib/credentials.ts`:** Utility per fetch credenziali da Supabase con fallback env var
- **Tracker con carrierId:** FedExTracker e DhlTracker accettano `carrierId` opzionale e leggono credenziali dal DB
- **`refresh-tracking.ts`:** Cron ora passa `carrier.id` ai tracker
- **Fix critico:** Bug parsing Supabase REST API in credentials endpoint (`{data: carriers}` → array diretto)
- **Merge `develop` → `main`:** Commit `4b88a8e` push su origin/main
- typecheck ✅ 36/36 test ✅ build ✅
- **⚠️ Deploy non partito:** Vercel auto-deploy non ha creato nuovo deploy dopo push su main. Utente deve triggerare manualmente dal Vercel Dashboard selezionando la nuova commit.

### Completato (Sessione 4 - 2026-07-30)
- **Diagnosi dashboard ferma al 25/07:** 60/61 spedizioni già delivered, 1 in_transit ferma dal 14/07. Nessun bug — sistema funzionante correttamente ma senza nuovi dati.
- **Fix cron `refresh-tracking`:** `last_update` ora aggiornato sempre (prima saltato su status invariato). Commit 13e470a su develop, preview deploy triggerato.
- **Verifica completa:** 0 errori runtime Vercel, FedEx API OK, Supabase OK. typecheck ✅ 36/36 test ✅ build ✅
- **Import 12 spedizioni mancanti:** Scoperta API interna FedEx `visibilitieslist`, confronto FedEx(61) vs Supabase(73), importate 12 tracking numbers mancanti via Python script
- **`/api/discover`:** Nuovo endpoint che interroga FedEx visibilitieslist e importa tracking mancanti in Supabase. Accetta session cookies per bypassare Akamai WAF
- **`scripts/discover-fedex.mjs`:** Script Playwright per login FedEx → estrazione cookies → Vercel endpoint
- **Dashboard button "Sync FedEx":** Pulsante + Ultimo sync timestamp + result banner
- **vercel.json:** Aggiunto cron ogni 10 min (`*/10 * * * *`) per discovery automatica

### Completato (pre-sessione 4)
- **Sessione 3:** DHL tracking integrato, preview funzionante, Git sync develop
- **M1-M7:** Bootstrap, schema Supabase, FedEx API, Dashboard, CSV, 36 test, rebranding, deploy Vercel, paginazione, multi-carrier, mobile responsive, ESM fix
- **UX Gaps:** CSV download, filtri data, PDF export, stats server-side, default 20 per pagina
- **Tech debt:** `updateShipment()` non forza più `last_update`
- **TrackingTimeline:** Componente animato con icone, colori, badge "Ultimo"

### Stato attuale
- **2026-07-30 (Sessione 5):** Pagina Settings con gestione credenziali corrieri implementata e merge `develop` → `main` completato. Codice su GitHub main branch SHA `4b88a8e`.
- Page Settings (`/settings`) riscritta: gestione credenziali per corriere (campi password con toggle show/hide), stato corrieri, test connessione
- Endpoint `GET/PUT /api/settings/credentials` per lettura/scrittura credenziali da Supabase (`carrier_credentials` table)
- Tracker (FedExTracker, DhlTracker) ora accettano `carrierId` opzionale e leggono credenziali dal DB con fallback env vars
- Refresh-tracking cron aggiornato per passare `carrier.id` ai tracker
- Bug fix: parsing risposta Supabase REST API in credentials endpoint (array vs `{data: []}`)
- typecheck ✅ 36/36 test ✅ build ✅
- **Deploy Vercel Production:** il merge è stato pushato su main ma Vercel auto-deploy non ha creato un nuovo deploy. L'ultimo deploy visibile usa ancora il vecchio codice. Verificare/V触发are manualmente dal Vercel Dashboard.

### Prossimo step
1. **Eseguire SQL `carrier_credentials` su Supabase** — tabella non ancora creata nel DB (l'utente deve eseguirla nel Supabase Dashboard SQL Editor)
2. **Triggerare deploy Vercel production** manualmente dal Vercel Dashboard selezionando la nuova commit
3. **Verificare Settings page** su produzione con le credenziali configurate
4. **FATT-002** — Emettere fattura post-M2 (€2.040, scadenza 2026-09-10)
5. **Auth/login page** — Supabase Auth + middleware protezione dati
6. **Raccogliere feedback cliente** su app production
