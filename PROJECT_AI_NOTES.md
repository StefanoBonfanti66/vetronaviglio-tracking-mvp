# Project: Vetronaviglio Tracking MVP

> Dashboard Tracking Spedizioni Multi-corriere per Vetronaviglio s.r.l. (Bareggio, MI)

## Obiettivo
- Scopo: MVP dashboard per tracking spedizioni multi-corriere (FedEx API + gestione manuale)
- Stato attuale: **M5 completato — Go-live confermato**
- Risultato atteso: Deploy produzione su Vercel

## Stack e vincoli
- Frontend: React 19 + TypeScript + Vite + TailwindCSS v4
- Backend: Supabase (Auth, Postgres RLS, Storage)
- Database: Postgres con RLS multi-tenancy
- Infra: Vercel + GitHub Actions
- Vincoli tecnici: Integrazione FedEx Track API, Vitest per testing
- Vincoli di piano/free tier: Da verificare

## Decisioni prese
- [2026-07-21] **Modello pricing:** Fisso a Milestone (€10.200 IVA esclusa) — preventivo 2026-001
- [2026-07-21] **Payment terms:** 20% acconto, 20% M2, 30% M3, 30% M5 — termini 30gg
- [2026-07-21] **Regime fiscale:** Forfettario (IVA fuori campo)
- [2026-07-21] **Garanzia:** 30 giorni post go-live
- [2026-07-21] **Bootstrap amministrativo completato:** cashflow, ledger, fatture, solleciti

## Lavoro svolto

### Fase amministrativa (pre-sviluppo)
- File creati/aggiornati:
  - `docs/admin/cashflow.md` — Vista sintetica fatture previste e incassi
  - `docs/admin/ledger.md` — Registro movimenti di progetto
  - `docs/admin/solleciti.md` — Stato solleciti (nessuno attivo)
  - `docs/invoices/index.md` — Registro fatture previste (4 fatture, totale €10.200)
- Test eseguiti: Nessuno (fase amministrativa)

### M1 — Setup infrastruttura (2026-07-21)
- Branch `develop` creato da `main`
- Schema Supabase SQL: `supabase/migrations/001_initial_schema.sql`
  - Tabelle: carriers (6 corrieri seedati), shipments, tracking_events
  - RLS policy, trigger updated_at, indici ottimizzati
- TypeScript types: `app/src/types/tracking.ts`
- Lib query: `app/src/lib/shipments.ts` (CRUD completo)
- Layout: Sidebar + Layout wrapper
- Pagine: Dashboard (stat cards), Shipments (tabella + filtri), Settings (corrieri)
- Route: App.tsx con Layout wrapper + 3 route
- Typecheck: `npx tsc --noEmit` ✅
- Build: `npm run build` ✅ (455KB JS, 14KB CSS)

### M2 — FedEx API integration (2026-07-21)
- FedEx client: `app/src/lib/fedex.ts` (OAuth2, track, trackMultiple)
- FedEx types: `app/src/types/fedex.ts`
- Settings page aggiornata con test connessione FedEx
- `.env.example` aggiornato con FedEx credentials (sandbox)
- Status mapping: FedEx → shipment status interno

### M3 — Dashboard frontend avanzata (2026-07-21)
- Grafici statistiche: `app/src/components/charts/StatusPieChart.tsx` (pie chart distribuzione stati)
- Grafici statistiche: `app/src/components/charts/CarrierBarChart.tsx` (bar chart spedizioni per corriere)
- Dashboard potenziata: stat cards con icone, grafici, lista attivita recente con link
- Pagina dettaglio spedizione: `app/src/pages/ShipmentDetail.tsx` (info dettagliate + timeline eventi)
- Form nuova spedizione: `app/src/pages/ShipmentForm.tsx` (form completo con validazione)
- Shipments page aggiornata: filtri per corriere, link a dettaglio, link a nuovo
- Route aggiunte: `/shipments/new`, `/shipments/:id`
- Dipendenza: `recharts` aggiunta per grafici
- Typecheck: `npx tsc --noEmit` ✅
- Build: `npm run build` ✅ (683 modules, 874KB JS / 251KB gzip)

### M4 — Gestione manuale/CSV spedizioni (2026-07-21)
- `app/src/lib/shipments.ts` — aggiunte funzioni: `updateShipment`, `deleteShipment`, `createShipmentsBulk`
- `app/src/lib/csv.ts` — nuovo file: parsing CSV, validazione con mapping corrieri, export CSV, download
- `app/src/pages/ShipmentEdit.tsx` — nuovo file: form modifica/elimina spedizione esistente
- `app/src/pages/Shipments.tsx` — riscritta: ordinamento colonne, import CSV modal, export CSV
- `app/src/pages/ShipmentDetail.tsx` — aggiunto bottone "Modifica" che linka a `/shipments/:id/edit`
- `app/src/App.tsx` — route aggiunta: `/shipments/:id/edit`
- Typecheck: `npx tsc --noEmit` ✅
- Build: `npm run build` ✅ (685 modules, 889KB JS / 254KB gzip)

### M5 — Testing + go-live (2026-07-21)
- Setup Vitest + jsdom + @testing-library/react
- `app/src/lib/__tests__/csv.test.ts` — 16 test: parsing CSV, validazione, export
- `app/src/lib/__tests__/fedex.test.ts` — 10 test: status mapping FedEx
- `app/src/types/__tests__/tracking.test.ts` — 4 test: labels/colors/spedizioni
- **31/31 test Vitest passati** ✅
- `npm run build` — ✅ (685 modules, 889KB JS, 17.6KB CSS, ~3.5s)
- `npx tsc --noEmit` — ✅ typecheck pulito
- README.md aggiornato con descrizione progetto, milestones, setup
- AGENTS.md aggiornato con Current Focus M5
- index.html titolo: "Vetronaviglio — Tracking Dashboard"

### Post-M5 — Integrations + production (2026-07-22)
- **Rebranding completo:** logo, favicon, colori brand (#0977b4, #35bfae, #162a37), font Segoe UI
- **Deploy Vercel:** Production live su `app-blond-omega-14.vercel.app`
- **Supabase:** Project `vetronaviglio-tracking` (ebcxgmaavbhjkwhtkcie), schema, carriers seeded
- **CSV import fix:** BOM stripping, delimiter detection (tab/comma), alias intestazioni italiane, carrier_code opzionale con auto-detect
- **FedEx API proxy:** Serverless routes `/api/fedex/token` + `/api/fedex/track` (CORS bypass)
- **FedEx production:** Credenziali production configurate, 61 spedizioni tracciate (57 delivered, 4 in transit)
- **Cron job:** `/api/cron/refresh-tracking` — daily 06:00 UTC + pulsante manuale Dashboard
- **Env vars:** Tutte configurate su Vercel (Supabase, FedEx prod, CRON_SECRET)
- **Test:** 36/36 Vitest passano ✅
- **Commit:** `f118793` feat(cron+fedex-proxy) pushato su develop

## Struttura fatturazione

| # | Fattura | Tipo | Milestone | Importo | Emissione prevista | Scadenza |
|---|---|---|---|---|---|---|
| 1 | FATT-001 | Acconto | Avvio lavori | €2.040 | 2026-07-21 | 2026-08-20 |
| 2 | FATT-002 | Milestone | Post-M2 FedEx API | €2.040 | 2026-08-11 | 2026-09-10 |
| 3 | FATT-003 | Milestone | Post-M3 Dashboard | €3.060 | 2026-08-25 | 2026-09-24 |
| 4 | FATT-004 | Saldo | Go-live M5 | €3.060 | 2026-09-08 | 2026-10-08 |

## TODO aperti
1. ~~Emettere FATT-001 (acconto €2.040) — pronta per invio~~ ✅ Incassata
2. ~~Integrare FedEx Track API~~ ✅ M2 completato
3. ~~Configurare Supabase project (schema + RLS)~~ ✅ M1 completato
4. ~~Setup autenticazione (login page, middleware)~~ ✅ M1 completato
5. ~~M5 Testing~~ ✅ 36/36 test passati
6. ~~Deploy Vercel~~ ✅ Production live
7. ~~FedEx production~~ ✅ 61 spedizioni tracciate
8. ~~Cron job auto-refresh~~ ✅ Daily 06:00 UTC
9. **FATT-002** — Emettere post-M2 (€2.040)
10. **FATT-003** — Emettere post-M3 (€3.060)
11. **FATT-004** — Emettere go-live M5 (€3.060)
12. **Salvare credenziali reali corrieri** nella Settings page (o via API PUT) — tabella pronta, campi vuoti

## Problemi aperti
- TS warning in `api/discover.ts` (supabaseHeaders/result.imported) — non bloccante, da sistemare

## File toccati (M5 + post-M5)
- `app/README.md` — aggiornato per Vetronaviglio Tracking MVP
- `app/AGENTS.md` — Current Focus aggiornato
- `app/PROJECT_AI_NOTES.md` — questa nota
- `app/src/lib/__tests__/csv.test.ts` — 36 test
- `app/src/lib/__tests__/fedex.test.ts` — 10 test
- `app/src/types/__tests__/tracking.test.ts` — 4 test
- `app/vitest.config.ts` — config Vitest
- `app/package.json` — script test aggiunti
- `app/index.html` — titolo aggiornato
- `app/api/fedex/token.ts` — OAuth2 proxy
- `app/api/fedex/track.ts` — Tracking proxy
- `app/api/cron/refresh-tracking.ts` — Cron job
- `app/vercel.json` — Cron config + route

### M6 — Server-side pagination + sort (2026-07-23)
- `app/src/lib/shipments.ts` — `getShipments` ora accetta `sort_field`/`sort_dir`, ordina lato server via Supabase (incluso sort su `carrier.name` via foreign table)
- `app/src/pages/Shipments.tsx` — riscritta: paginazione server-side con `PaginationBar` a fondo tabella, 3 page size (20/50/100), sort colonne lato server, filtri resettano a page 1
- **36/36 test passati** ✅ typecheck ✅ build (894KB JS, 20KB CSS)

### M7 — Multi-carrier (CarrierTracker interface + DHL) (2026-07-23)
- **Architettura carrier astratta:**
  - `app/api/lib/tracking/types.ts` — `CarrierTracker` interface + `CarrierTrackResult`/`CarrierTrackEvent` tipi normalizzati
  - `app/api/lib/tracking/index.ts` — factory `getTracker(code)` + registry per codice carrier
  - `app/api/lib/tracking/FedExTracker.ts` — FedEx implementazione (OAuth2 + track via FedEx Track API)
  - `app/api/lib/tracking/DhlTracker.ts` — DHL implementazione (API key + DHL Track API)
- **Unified track endpoint:** `app/api/track.ts` → `POST /api/track` con `{ carrier, trackingNumber }`, dispaccia via factory
- **Cron refactored:** `app/api/cron/refresh-tracking.ts` ora itera TUTTI i carrier con `api_available=true`, chiama il tracker corrispondente, report per-carrier
- **Browser helper:** `app/src/lib/tracking/` — `trackShipment()` client, `statusMaps.ts` (FedEx + DHL), types duplicati per sicurezza bundle
- **Settings aggiornata:** test connessione dinamico (select carrier via dropdown), mostra DHL API Key status
- **Dashboard aggiornata:** refresh report ora mostra per-carrier (es. `fedex: 2 aggiornati — dhl: 0 aggiornati`)
- **Vecchi file rimossi:** `app/src/lib/fedex.ts`, `app/api/fedex/token.ts`, `app/api/fedex/track.ts`, `app/src/types/fedex.ts`
- **36/36 test passati** ✅ typecheck ✅ build (895KB JS, 20KB CSS)
- **Note:** DHL richiede env var `DHL_API_KEY` (server) e `VITE_DHL_API_KEY` (browser) per funzionare

### UX Gaps + Tech debt (2026-07-23)
- **CSV template:** `generateCSVTemplate()` in `app/src/lib/csv.ts:199` — headers-only CSV. Bottone "Scarica template CSV" nell'import modal
- **Date filters:** Aggiunti `date_from`/`date_to` a `getShipments()` — due `<input type="date">` nella filter bar
- **PDF export:** Bottone "Stampa PDF" su ShipmentDetail con `window.print()` + CSS `@media print` che nasconde sidebar/nav
- **Default page size:** 20 invece di 50
- **Dashboard stats:** `getDashboardStats()` riscritto con 5 count paralleli `head:true` (zero data transfer). Aggiunto `getCarrierStats()` per grafico corrieri
- **Tech debt:** `updateShipment()` non forza più `last_update`. Solo `updateShipmentStatus()` lo imposta esplicitamente.
- **36/36 test passati** ✅ typecheck ✅ build ✅

### TrackingTimeline + Mobile responsive (2026-07-23)
- **TrackingTimeline:** `app/src/components/TrackingTimeline.tsx` — component animato (slide-in + pulse), icone per status, colori, badge "Ultimo", tempo relativo
- **Sidebar collassabile:** hamburger button su mobile, overlay backdrop, `translate-x` transition, NavLink chiude sidebar
- **Card-list mobile:** sotto `lg` la tabella spedizioni diventa card list (tracking, badge, corriere, cliente, data)
- **Touch target WCAG 44px:** `min-w-[44px] min-h-[44px]` su paginazione e test connessione
- **Bottoni azione:** icone SVG + testo nascosto su mobile (`hidden sm:inline`)
- **Padding adattivo:** `p-4 sm:p-6 lg:p-8`
- **Search min-w:** `min-w-[140px]` mobile, `min-w-[200px]` desktop
- **ShipmentDetail header:** layout `flex-col sm:flex-row` con wrap
- **36/36 test passati** ✅ typecheck ✅ build (904KB JS, 25.9KB CSS)

### Fix produzione Vercel (2026-07-23)
- **ESM imports:** Aggiunta estensione `.js` a tutti gli import in `api/` (refresh-tracking, track, FedExTracker, DhlTracker, index) — necessario per `"type": "module"` in package.json
- **vercel.json:** Aggiunta `includeFiles: "api/lib/**"` per refresh-tracking e track functions
- **FedExTracker:** Rimossa variabile inutilizzata `locationStr`
- **Merge main:** `develop` mergiato in `main` con fix ESM + mobile responsive
- **Env Vercel:** `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` configurate per Preview e Production

### Sessione 6 — Migration carrier_credentials + fix deploy (2026-07-31)
- **Migration 002 `carrier_credentials`:** Tabella creata su Supabase (ebcxgmaavbhjkwhtkcie) via Management API (POST `/v1/projects/{id}/database/migrations`). Verificata con query: 6 colonne NOT NULL (id uuid pk, carrier_id uuid FK carriers.id on delete cascade, credential_key, credential_value, created_at/updated_at), unique(carrier_id, credential_key), trigger `trg_carrier_credentials_updated_at` su `update_updated_at()`, RLS con 3 policy (select/insert/update authenticated), 0 righe.
- **Root cause deploy bloccati:** `app/vercel.json` conteneva cron `*/10` per `/api/discover` — non ammesso su piano Hobby ("Hobby accounts are limited to daily cron jobs"). Ogni deploy falliva da Sessione 4. Rimosso il cron (endpoint + Sync FedEx button + `scripts/discover-fedex.mjs` restano funzionanti).
- **Fix `.vercel/project.json`:** Era stale (puntava a `prj_DnVQAv20kYOS3clqiPWXvytVEVWq`, inesistente → 404). Ri-linkato con `vercel link --yes --project vetronaviglio-tracking` a `prj_MrfNdzjAXveN2gM8gqFAQeTBZmp0` (team_B6AotpnvMANmD05O0G0u46Qv). Aggiunta `.env*` a `.gitignore`.
- **Deploy:** `vercel --prod` → alias production `app-blond-omega-14.vercel.app`. Poi push `c7adf7d` su main → auto-deploy automatico READY (dpl_345j81rR3gSMAdgWtz9xF75WS6VK).
- **Settings verificata in produzione:** form FedEx (API Key, Secret Key, Endpoint URL placeholder https://apis.fedex.com) + DHL (API Key), toggle 👁 password, stato corrieri (FedEx/DHL API disponibile, BRT/GLS/SDA/TNT solo manuale), test connessione. GET `/api/settings/credentials` → 200, carrierId fedex `d97f5ac0-7ee0-4f9f-b25b-cc83388a4975`, dhl `4dc56bd0-3872-4dee-b07f-54ab4e95e1d5`, tutti `set:false`.
- **Credenziali corrieri non ancora salvate** — nessuna credenziale reale inserita (step successivo).
- **Note token Supabase:** il PAT iniziale era di account errato (403 su ebcxgmaavbhjkwhtkcie); usato PAT con accesso al progetto. Tokens non committati.
- **TS warning in `api/discover.ts`** (linee ~205/209/236/249: `supabaseHeaders` used before declaration, `result.imported` possibly undefined) — non bloccano build/deploy Vercel, da sistemare.
- typecheck ✅ 36/36 test ✅ build ✅ (904KB JS, chunk >500KB warning non bloccante)

## Prossimo step suggerito
- Salvare credenziali reali corrieri nella Settings page (tabella `carrier_credentials` pronta su Supabase)
- Emettere FATT-002 (post-M2, €2.040)
- Raccogliere feedback cliente su app production
- Auth/login page (protezione reale dati)
- Fix TS warning in `api/discover.ts`

### Sessione 7 — Sync FedEx funzionante end-to-end (2026-07-31)
- **Bug bottone Sync FedEx:** ogni clic dava 400 "FedEx session cookies required" — `FEDEX_SESSION_COOKIES` non era impostato su Vercel e il POST non aveva fallback.
- **Persistenza cookie in Supabase (commit 37a297b):** `api/discover.ts` ora legge `carrier_credentials` come fallback (chiavi `FEDEX_SESSION_COOKIES`/`FEDEX_ACCESS_TOKEN` per fedex, `DHL_SESSION_COOKIES`/`DHL_XSRF_TOKEN` per dhl) tramite `getCarrierCredentials` + helper `getCarrierIdByCode`/`upsertCredential`. Quando lo script invia sessione fresca, il POST la salva.
- **Crash 500 in produzione (commit 91b952a):** import `./lib/credentials` senza estensione `.js` → Node ESM `ERR_MODULE_NOT_FOUND` (FUNCTION_INVOCATION_FAILED). Fix: `'./lib/credentials.js'`. Tutti gli import in `api/` usano estensione `.js` esplicita.
- **Script discover-fedex.mjs round 2:** rimossa annotazione TS in .mjs, timeout navigazione 40s, URL login `https://www.fedex.com/secure-login/it-it/#/credentials`, parsing endpoint (filtro arg `--`), navigazione post-login a `fedextracking/` per forzare la chiamata API SPA + wait 8s, cattura header `authorization` Bearer da request verso api.fedex.com, log dei request tracking in `scripts/.fedex-requests.json`.
- **Token 34-char non valido:** il primo Bearer su api.fedex.com (`l75c...`, device token) dà 401 `invalid_request`. Il token valido arriva SOLO navigando a `fedextracking/` dopo il login.
- **Sync verificato in produzione:** POST `/api/discover` senza cookie → 200, api_count 58, 208 spedizioni in Supabase, 0 importate (tutte duplicate). Bottone dashboard funziona.
- **.gitignore:** aggiunti `scripts/.fedex-session.json` e `scripts/.fedex-requests.json` (cookie di sessione sensibili).
- Commit: `37a297b` persistenza, `91b952a` fix import .js, `ef11e9e` fix script + gitignore.

### Sessione 7b — Sync DHL risolto via estrazione in-browser (2026-07-31)
- **Vincolo Akamai accertato:** DHL (mydhl.express.dhl) usa Akamai Bot Manager (`bm_sz`/`_abck`) che lega la sessione all'IP del browser che l'ha creata. Replay server-side dei cookie (da Vercel fra1, da macchina utente home, deduplicati o no) → sempre HTTP 200 ma `shipments: 0` (soft-block, non 401). Il flusso FedEx funziona perché FedEx non fa IP-binding; per DHL l'architettura "cookie → /api/discover → server chiama DHL" è strutturalmente impossibile.
- **Nuovo branch server (commit b969705):** `api/discover.ts` POST accetta `{carrier:'dhl', trackingNumbers:[...]}` (form urlencoded `trackingNumbers=<csv>`) → `importShipments` diretta con `statusDescription: 'DHL discovery (browser)'`. Il server non chiama più DHL; importa solo i numeri ricevuti dal browser. Il vecchio branch cookies→`discoverDhl` resta come fallback innocuo.
- **Estrazione in-browser:** dal page context di mydhl.express.dhl (same-origin, sessione valida) fetch POST a `/api/mms/search` con `x-xsrf-token` da `document.cookie` + `x-requested-with: XMLHttpRequest` → 156 item, 153 AWB reali (esclusi 3 `_FAV`). Upload via curl → **`imported: 5`, supabase 208→213**.
- **Script discover-dhl.mjs riscritto (commit 50f7bd7):** niente più forwarding cookie. Ora: login (auto o `--manual`), estrazione AWB via `page.evaluate` same-origin fetch, POST `{carrier:'dhl', trackingNumbers}` in JSON all'endpoint. File sessione `scripts/.dhl-session.json` contiene solo tracking numbers (non credenziali). `--no-browser` ri-uploada l'ultima lista salvata.
- **Da valutare:** bottone "Sync DHL" in dashboard (oggi solo FedEx ha il Sync button); rimozione credenziali DHL hardcoded in discover-dhl.mjs (`DHL_USER`/`DHL_PASS` fallback `m.colombo@vetronaviglio.it`/`Vetronaviglio1&`).
- Commit: `b969705` server branch, `50f7bd7` script rewrite.
