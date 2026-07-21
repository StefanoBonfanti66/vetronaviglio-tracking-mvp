# Project: Vetronaviglio Tracking MVP

> Dashboard Tracking Spedizioni Multi-corriere per Vetronaviglio s.r.l. (Bareggio, MI)

## Obiettivo
- Scopo: MVP dashboard per tracking spedizioni multi-corriere (FedEx API + gestione manuale)
- Stato attuale: **M2 completato — Fase sviluppo in corso**
- Risultato atteso della sessione: Commit M2, proseguire con M3

## Stack e vincoli
- Frontend: React 19 + TypeScript + Vite + TailwindCSS
- Backend: Supabase (Auth, Postgres RLS, Storage)
- Database: Postgres con RLS multi-tenancy
- Infra: Vercel + GitHub Actions
- Vincoli tecnici: Integrazione FedEx Track API
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

## Struttura fatturazione

| # | Fattura | Tipo | Milestone | Importo | Emissione prevista | Scadenza |
|---|---|---|---|---|---|---|
| 1 | FATT-001 | Acconto | Avvio lavori | €2.040 | 2026-07-21 | 2026-08-20 |
| 2 | FATT-002 | Milestone | Post-M2 FedEx API | €2.040 | 2026-08-11 | 2026-09-10 |
| 3 | FATT-003 | Milestone | Post-M3 Dashboard | €3.060 | 2026-08-25 | 2026-09-24 |
| 4 | FATT-004 | Saldo | Go-live M5 | €3.060 | 2026-09-08 | 2026-10-08 |

## TODO aperti
1. ~~Emettere FATT-001 (acconto €2.040) — pronta per invio~~ ✅ Incassata
2. Verificare P.IVA e dati fiscali Vetronaviglio s.r.l.
3. ~~Integrare FedEx Track API (chiave sviluppo disponibile)~~ ✅ M2 completato
4. Configurare Supabase project (schema + RLS)
5. Setup autenticazione (login page, middleware)
6. Definire costi diretti (hosting, licenze)

## Problemi aperti
- Problema: Nessun problema noto
- Ipotesi: Cliente accetta incarico e paga acconto
- Blocco attuale: Nessuno

## File toccati
- `docs/admin/cashflow.md`
- `docs/admin/ledger.md`
- `docs/admin/solleciti.md`
- `docs/invoices/index.md`
- `supabase/migrations/001_initial_schema.sql`
- `app/src/types/tracking.ts`
- `app/src/types/fedex.ts`
- `app/src/lib/shipments.ts`
- `app/src/lib/fedex.ts`
- `app/src/components/layout/Sidebar.tsx`
- `app/src/components/layout/Layout.tsx`
- `app/src/pages/Dashboard.tsx`
- `app/src/pages/Shipments.tsx`
- `app/src/pages/Settings.tsx`
- `app/src/App.tsx`
- `.env.example`

## Prossimo step suggerito
- Commit M2 su branch `develop`
- M3: Dashboard frontend avanzata
- M4: Gestione manuale/CSV spedizioni
