# Pricing — Vetronaviglio Tracking MVP

- **Data:** 2026-07-21
- **Lead:** Vetronaviglio s.r.l. — MVP Tracking Spedizioni Multi-corriere
- **Tipo servizio:** Delivery — MVP Custom Software (forfait)

---

## Assunzioni

| Voce | Stima |
|---|---|
| Lead Developer / Architetto | 40h |
| Frontend Developer | 32h |
| Backend / Supabase | 24h |
| Integrazione FedEx API | 16h |
| Testing & QA | 12h |
| PM / Coordinate | 8h |
| **Totale ore stimate** | **132h** |
| Risk buffer (15%) | ~20h |
| **Ore totali con buffer** | **~152h** |

**Note:**
- Stime basate su MVP con scope definito (dashboard + FedEx API + gestione manuale)
- Non include: hosting Supabase/Vercel, licenze FedEx API (a carico del cliente)
- Estensioni future (altri corrieri con API, alerting avanzato, reporting) trattate separatamente

---

## Modello 1 — Fisso a Milestone (PREFERITO)

### Struttura

| # | Milestone | Deliverable | Importo |
|---|---|---|---|
| M1 | Setup infrastruttura + Modello dati | Supabase schema, repo Next.js, CI/CD, auth base | €1.800 |
| M2 | Integrazione FedEx Track API | Chiamate API, normalizzazione eventi, salvataggio payload raw | €2.400 |
| M3 | Dashboard frontend | Vista principale, filtri per stato/carrier, ricerca, vista dettaglio | €3.200 |
| M4 | Gestione manuale/CSV | Inserimento tracking manuale, import CSV, gestione corrieri senza API | €1.600 |
| M5 | Testing, deploy, go-live | QA completa, deploy produzione, documentazione operativa | €1.200 |
| | **Totale progetto** | | **€10.200** |

### Payment Terms

| Momento | Importo | Note |
|---|---|---|
| Accetto incarico | €2.040 (20%) | Acconto — avvio lavori |
| Completamento M2 | €2.040 (20%) | Dopo integrazione FedEx funzionante |
| Completamento M3 | €3.060 (30%) | Dopo dashboard funzionante |
| Go-live M5 | €3.060 (30%) | Saldo a consegna |

### Timeline stimata
- M1: 1 settimana
- M2: 1-2 settimane
- M3: 2 settimane
- M4: 1 settimana
- M5: 1 settimana
- **Totale: ~6-7 settimane**

---

## Modello 2 — Ibrido Forfait + Retainer (ALTERNATIVO)

### Fase MVP (Forfait)

Stessa struttura del Modello 1, ma con importi leggermente ridotti perché il retainer copre le estensioni:

| # | Milestone | Importo |
|---|---|---|
| M1 | Setup + Modello dati | €1.600 |
| M2 | FedEx API | €2.100 |
| M3 | Dashboard frontend | €2.800 |
| M4 | Gestione manuale | €1.400 |
| M5 | Testing + Go-live | €1.100 |
| | **Totale MVP** | **€9.000** |

### Retainer mensile opzionale (post-MVP)

| Servizio | Importo/mese | Include |
|---|---|---|
| Manutenzione + Supporto | €500/mese | Bug fix, monitoraggio, supporto tecnico |
| Estensioni corrieri | €800/mese | Aggiunta nuovo corriere API + normalizzazione |
| Full retainer | €1.200/mese | Manutenzione + 1 estensione corriere/mese |

### Payment Terms (Modello 2)

| Momento | Importo |
|---|---|
| Accetto incarico | €1.800 (20%) |
| Completamento M2 | €1.800 (20%) |
| Completamento M3 | €2.700 (30%) |
| Go-live M5 | €2.700 (30%) |

---

## Confronto Modelli

| Criterio | Modello 1 (Fisso) | Modello 2 (Ibrido) |
|---|---|---|
| Investimento iniziale | €10.200 | €9.000 + retainer |
| Costo totale anno 1 (con 2 estensioni) | €10.200 + est. separate | €9.000 + €19.200 retainer = €28.200 |
| Adatto a... | MVP puro, poi manutenzione interna | MVP + crescita continua con ZBN |
| Flessibilità estensioni | Ogni est. è nuovo preventivo | Retainer include estensioni |
| Rischio ZBN | Medio (scope fisso) | Basso (retainer ricorrente) |

---

## Raccomandazione

**Modello 1 (Fisso a Milestone)** come scelta primaria:
- Scope MVP chiaro e limitato
- Il cliente non ha ancora definito budget/timeline
- Importi accessibili per un'azienda da €7.4M di fatturato
- Estensioni future trattabili separatamente quando il cliente valuta il ROI del MVP

**Modello 2** come alternativa se il cliente mostra interesse a una relazione di lungo periodo con manutenzione attiva.

---

## Note per prezzo finale

- Gli importi sopra sono **IVA esclusa**
- Validità preventivo: 30 giorni dalla data
- Eventuali change request durante lo sviluppo: preventivati separatamente
- Il cliente fornisce: accessi FedEx API, feedback tempestivi (max 5 giorni lavorativi per review), materiale contenuti (logo, brand guidelines se richieste)
