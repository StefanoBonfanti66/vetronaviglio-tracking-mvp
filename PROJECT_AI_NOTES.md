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

## Problemi aperti
- Nessuno — app funzionante in produzione

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

## Prossimo step suggerito
- Configurare DHL API key su Vercel (env `DHL_API_KEY`)
- Emettere FATT-002 (post-M2, €2.040)
- Raccogliere feedback cliente su app production
- Auth/login page (protezione reale dati)
