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

## Current Focus — 2026-07-31 (Sessione 7)

### Completato (Sessione 7 - 2026-07-31)
- **Card stato Dashboard cliccabili:** In transito/Consegnate/Eccezioni → `/shipments?status=<status>` via `useSearchParams` (commit `c564b7b`)
- **Sync FedEx funzionante end-to-end:** Persistenza cookie sessione in `carrier_credentials` con fallback server-side (37a297b); fix crash 500 in produzione da import ESM senza `.js` → ERR_MODULE_NOT_FOUND (91b952a); fix script: navigazione post-login a `fedextracking/` per catturare il token valido + cattura request diagnostica (ef11e9e); `.gitignore` per `scripts/.fedex-session.json` e `scripts/.fedex-requests.json`. Verificato: bottone dashboard → 200, 208 spedizioni FedEx in Supabase
- **Sync DHL risolto via estrazione in-browser:** Scoperto vincolo Akamai — la sessione DHL è legata all'IP del browser che l'ha creata (replay server-side → sempre 200 vuoto). Nuovo branch `/api/discover` `trackingNumbers` (b969705) che importa direttamente i numeri senza chiamare DHL; script `discover-dhl.mjs` riscritto: login → estrazione AWB same-origin → POST tracking numbers (50f7bd7). Import: 5 nuove spedizioni, Supabase 208→213
- **Decision log aggiornato:** PROJECT_AI_NOTES.md sessioni 7 e 7b (commits `3abec24`, `4c9d85e`)
- typecheck ✅ 36/36 test ✅ build ✅

### Completato (Sessione 6 - 2026-07-31)
- **Migration 002 applicata:** Tabella `carrier_credentials` creata su Supabase (ebcxgmaavbhjkwhtkcie) via Management API + 3 policy RLS. File: `supabase/migrations/002_carrier_credentials.sql`
- **Root cause deploy bloccati trovata:** Cron sub-giornaliero `/api/discover` (`*/10`) non ammesso su piano Hobby → ogni deploy falliva. Rimosso da `app/vercel.json` (endpoint + button Sync FedEx ancora funzionanti)
- **Fix `.vercel/project.json` stale:** Ri-linkato al progetto corretto `vetronaviglio-tracking` (prj_MrfNdzjAXveN2gM8gqFAQeTBZmp0) con `vercel link`; aggiunta riga `.env*` a `.gitignore`
- **Deploy production riuscito:** `vercel --prod` → `https://app-blond-omega-14.vercel.app` READY
- **Auto-deploy verificato:** Push `c7adf7d` su main → nuovo deploy production automatico (BUILDING → READY) — problema auto-deploy risolto alla radice
- **Settings page verificata in produzione:** Form FedEx/DHL con toggle password, stato corrieri (FedEx/DHL "API disponibile"), test connessione — tutto OK
- **Commit:** `c7adf7d` push su origin/main (migration + vercel.json + .gitignore)
- typecheck ✅ 36/36 test ✅ build ✅

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
- **2026-07-31 (Sessione 7):** Sync FedEx da dashboard funzionante in produzione (credenziali sessione in `carrier_credentials`), Sync DHL risolto via estrazione in-browser con import tracking numbers. 213 spedizioni in Supabase. Codice su GitHub main branch SHA `4c9d85e`.
- Tabella `carrier_credentials` attiva su Supabase (id, carrier_id, credential_key, credential_value, created_at, updated_at) con RLS (3 policy authenticated); popolata con session cookies FedEx (e si popola con i tracking numbers DHL via script)
- Cron `/api/discover` rimosso da vercel.json (resta il cron daily `/api/cron/refresh-tracking` "0 6 * * *")
- Deploy production live: `https://app-blond-omega-14.vercel.app`
- `/api/discover` supporta: POST fedex cookies (persistenza+fallback), POST dhl trackingNumbers (import diretto), GET auth CRON_SECRET
- Script: `scripts/discover-fedex.mjs` e `scripts/discover-dhl.mjs` (login browser → estrazione → upload all'endpoint); file sessione `.fedex-session.json`/`.dhl-session.json` gitignored
- typecheck ✅ 36/36 test ✅ build ✅

### Prossimo step
1. **Bottone "Sync DHL" in dashboard** — oggi solo FedEx ha il Sync button; valutare con utente se serve anche per DHL
2. **Rimozione credenziali DHL hardcoded** da `scripts/discover-dhl.mjs` (DHL_USER/DHL_PASS fallback `m.colombo@vetronaviglio.it`/`Vetronaviglio1&`) — da concordare
3. **FATT-002** — Emettere fattura post-M2 (€2.040, scadenza 2026-09-10)
4. **Auth/login page** — Supabase Auth + middleware protezione dati
5. **Raccogliere feedback cliente** su app production
