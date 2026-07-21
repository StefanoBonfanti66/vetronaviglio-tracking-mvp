# Vetronaviglio Tracking MVP

Dashboard unificata multi-corriere per Vetronaviglio s.r.l. (Bareggio, MI).

Stack: React 19 + TypeScript + Vite + TailwindCSS v4 + Supabase + recharts.

## Milestones

- **M1** — Schema Supabase, types, lib query, layout, pagine base
- **M2** — FedEx API client (OAuth2, track), settings page
- **M3** — Dashboard avanzata (grafici pie/bar, timeline, form spedizione, filtri)
- **M4** — Gestione manuale/CSV spedizioni (ordinamento, modifica/elimina, import/export)
- **M5** — Testing + go-live ✅

## Funzionalità

- Dashboard con statistiche e grafici (stato spedizioni, corrieri)
- Tabella spedizioni con ricerca, filtri, ordinamento
- Dettaglio spedizione con timeline eventi
- Creazione/modifica/eliminazione spedizioni
- Import/export CSV
- Integrazione API FedEx (sandbox)
- Gestione corrieri e test connessione

## Struttura

```
app/
├── src/
│   ├── components/   # Layout, grafici
│   ├── lib/          # Query DB, API FedEx, CSV
│   ├── pages/        # Dashboard, Spedizioni, Settings
│   └── types/        # TypeScript definitions
├── supabase/         # Schema e migrazioni
└── docs/             # Documentazione progetto
```

## Setup

```bash
cd app
cp ../.env.example .env
# Inserire VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY in .env
npm install
npm run dev
```

## Scripts

| Comando | Descrizione |
|---|---|
| `npm run dev` | Sviluppo con hot-reload |
| `npm run build` | Build produzione (tsc + vite) |
| `npm run test` | Test unitari (vitest) |
| `npm run typecheck` | Controllo tipi TypeScript |

## Test

31 test Vitest (csv.test.ts, fedex.test.ts, tracking.test.ts).
