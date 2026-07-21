# Project: Vetronaviglio Tracking MVP

> Dashboard Tracking Spedizioni Multi-corriere per Vetronaviglio s.r.l. (Bareggio, MI)

## Obiettivo
- Scopo: MVP dashboard per tracking spedizioni multi-corriere (FedEx API + gestione manuale)
- Stato attuale: **M5 completato — Pronto per go-live**
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
- Appunti: Deploy Vercel in attesa di token valido

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
5. ~~M5 Testing~~ ✅ 31/31 test passati
6. **Deploy Vercel** — in attesa di token Vercel valido
7. Go-live produzione

## Problemi aperti
- Deploy Vercel bloccato: token non valido, attendere credenziali aggiornate
- App funzionante in locale (npm run dev)

## File toccati (M5)
- `app/README.md` — aggiornato per Vetronaviglio Tracking MVP
- `app/AGENTS.md` — Current Focus aggiornato
- `app/PROJECT_AI_NOTES.md` — questa nota
- `app/src/lib/__tests__/csv.test.ts` — 16 test
- `app/src/lib/__tests__/fedex.test.ts` — 10 test
- `app/src/types/__tests__/tracking.test.ts` — 4 test
- `app/vitest.config.ts` — config Vitest
- `app/package.json` — script test aggiunti
- `app/index.html` — titolo aggiornato

## Prossimo step suggerito
- Deploy Vercel (ottenere token valido)
- Go-live produzione
