# Project Plan — Vetronaviglio Tracking MVP

- **Data:** 2026-07-21
- **Cliente:** Vetronaviglio s.r.l.
- **Importo:** €10.200 (forfait, 5 milestone)
- **Preventivo:** 2026-001

---

## Sintesi del brief

Vetronaviglio è un produttore di packaging beauty che spedisce ai brand clienti attraverso multipli corrieri. Non esiste una dashboard centralizzata per il tracking: i portali dei corrieri vanno controllati manualmente. L'obiettivo è sviluppare un MVP di dashboard web che aggreghi il tracking da diversi corrieri (FedEx API + gestione manuale per gli altri).

---

## Obiettivi del progetto

1. Dashboard unica per visualizzare lo stato di tutte le spedizioni multi-corriere
2. Integrazione diretta con FedEx Track API per tracking automatico
3. Gestione manuale/semi-automatica per corrieri senza API (CSV, inserimento manuale)
4. Architettura modulare estensibile per aggiungere nuovi corrieri in futuro

---

## Macro-fasi operative

### Fase 1 — Setup infrastruttura (M1)
- Creazione schema Supabase Postgres
- Setup repo Next.js con CI/CD
- Auth base e configurazione ambiente
- **Durata stimata:** 1 settimana

### Fase 2 — Integrazione FedEx API (M2)
- Autenticazione e chiamate API FedEx
- Normalizzazione eventi di tracking
- Salvataggio payload raw
- **Durata stimata:** 1-2 settimane

### Fase 3 — Dashboard frontend (M3)
- Vista principale con ricerca e filtri per stato/carrier
- Vista dettaglio singola spedizione
- UX pulita e intuitiva
- **Durata stimata:** 2 settimane

### Fase 4 — Gestione manuale/CSV (M4)
- Form di inserimento manuale tracking number
- Import CSV per corrieri senza API
- Gestione corrieri custom
- **Durata stimata:** 1 settimana

### Fase 5 — Testing e go-live (M5)
- QA completa su tutti i flussi
- Deploy produzione su Vercel
- Documentazione operativa
- **Durata stimata:** 1 settimana

---

## Milestone e collegamento alle milestone economiche

| Fase | Milestone economica | Importo | Scadenza pagamento |
|------|---------------------|---------|-------------------|
| Avvio progetto | Acconto 20% | €2.040 | All'accettazione |
| Completamento M2 | FedEx API funzionante | €2.040 | Al completamento |
| Completamento M3 | Dashboard funzionante | €3.060 | Al completamento |
| Completamento M5 | Go-live | €3.060 | Al completamento |

**Totale:** €10.200 | **Timeline stimata:** 6-7 settimane
