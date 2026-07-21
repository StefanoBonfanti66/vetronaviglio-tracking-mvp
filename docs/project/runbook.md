# Runbook — Vetronaviglio Tracking MVP

## Ambiente di sviluppo

- **Runtime:** Node.js 20+
- **Package manager:** npm
- **Framework:** Next.js 14+ (App Router)
- **Database:** Supabase (PostgreSQL)
- **Deploy:** Vercel

## Setup locale

```bash
git clone git@github.com:StefanoBonfanti66/vetronaviglio-tracking-mvp.git
cd vetronaviglio-tracking-mvp
cp .env.example .env  # compilare con chiavi Supabase e FedEx
npm install
npm run dev
```

## Variabili d'ambiente richieste

| Variabile | Descrizione | Dove trovarla |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL progetto Supabase | Dashboard Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chiave anon Supabase | Dashboard Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Chiave service role | Dashboard Supabase → Settings → API |
| `FEDEX_API_KEY` | Chiave API FedEx | FedEx Developer Portal |
| `FEDEX_SECRET_KEY` | Secret key FedEx | FedEx Developer Portal |

## Comandi principali

```bash
npm run dev          # Server di sviluppo
npm run build        # Build di produzione
npm run start        # Avvio produzione
npm run lint         # Linting
npm run typecheck    # Type checking
```

## Deploy

Il deploy avviene automaticamente via Vercel al push su `main`.

## Troubleshooting

### Errore di connessione Supabase
Verificare che le chiavi API siano corrette e che il progetto Supabase sia attivo.

### API FedEx non risponde
Controllare le credenziali e lo stato dell'API FedEx Developer Portal.
