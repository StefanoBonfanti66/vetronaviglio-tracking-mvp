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

## Current Focus — 2026-07-31 (Sessione 6)

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
- **2026-07-31 (Sessione 6):** Migration `carrier_credentials` applicata su Supabase, root cause deploy bloccati risolto (cron sub-giornaliero non ammesso su Hobby), auto-deploy Vercel funzionante. Codice su GitHub main branch SHA `c7adf7d`.
- Tabella `carrier_credentials` attiva su Supabase (id, carrier_id, credential_key, credential_value, created_at, updated_at) con RLS (3 policy authenticated)
- Cron `/api/discover` rimosso da vercel.json (resta il cron daily `/api/cron/refresh-tracking` "0 6 * * *")
- `.vercel/project.json` ri-linkato al progetto corretto `vetronaviglio-tracking` (root = app)
- Deploy production live: `https://app-blond-omega-14.vercel.app`
- Settings page verificata in produzione: form FedEx (API Key, Secret Key, Endpoint URL) e DHL (API Key), toggle password, stato corrieri, test connessione
- Endpoint `GET /api/settings/credentials` → HTTP 200 con carrierId FedEx/DHL e campi `set:false` (nessuna credenziale salvata)
- typecheck ✅ 36/36 test ✅ build ✅

### Prossimo step
1. **Salvare credenziali reali corrieri** nella Settings page (o via API PUT) — campi attualmente vuoti
2. **FATT-002** — Emettere fattura post-M2 (€2.040, scadenza 2026-09-10)
3. **Auth/login page** — Supabase Auth + middleware protezione dati
4. **Raccogliere feedback cliente** su app production
5. **Fix TS warning in `api/discover.ts`** (supabaseHeaders/result.imported) — non bloccante per build
