# Positioning — Vetronaviglio Tracking MVP

- **Data:** 2026-07-21
- **Lead:** Vetronaviglio s.r.l. — MVP Tracking Spedizioni Multi-corriere
- **Fonte:** Email Giuseppe Bonetti (21/07/2026)
- **Aggiornamento:** Ricerca web 21/07/2026

---

## 1. Chi è il cliente

**Vetronaviglio s.r.l.** è un'azienda manifatturiera italiana fondata nel 1991 da Cristina Solito de Solis, oggi guidata da **Bettina Solito De Solis** (CEO). Sede: Via Don Severino Fracassi 31/39, Bareggio (MI). ~34 dipendenti, fatturato ~$7.4M (D&B).

**Settore:** Packaging primario per il Beauty — cosmetici, make-up, skin-care, body-care, profumeria, home fragrances, pharma. Produttore di flaconi, barattoli, tappi, dispenser, accessori in plastica e vetro, con personalizzazione (serigrafia, pad printing, hot foil stamping, verniciatura, metallizzazione).

**Specialità:** Full-service (design, produzione, decorazione, riempimento). Materiali sostenibili (PCR, bio-based, R-Pet, bambù). Presenza a LUXEPACK Monaco. E-commerce B2B: vetronaviglio.eu (low MOQ).

**Slogan:** *"ITALIAN PACKAGING FOR BEAUTY — DESIGNed IN MILAN"*
**Filosofia:** *"Il tuo progetto è il mio progetto"* — design company con ciclo completo.

> ⚠️ **Nota:** Vetronaviglio NON è un'azienda di logistica. È un produttore di packaging cosmetico che **spedisce i propri prodotti** ai clienti B2B (brand cosmetici) attraverso multipli corrieri. Il tracking spedizioni è un problema operativo secondario rispetto alla loro core business.

---

## 2. Il problema reale

Vetronaviglio produce e spedisce packaging cosmetico a clienti in Italia e (presumibilmente) Europa. Le spedizioni avvengono attraverso multipli corrieri (FedEx confermato, altri da definire).

**Problema dichiarato:** Nessuna dashboard centralizzata per monitorare lo stato delle spedizioni B2B. I portali dei corrieri vanno controllati manualmente, uno per uno. Questo crea:
- Tempo perso nell'operatività quotidiana
- Mancanza di visibilità su spedizioni ferme, in ritardo o in eccezione
- Rischio di disservizio verso i clienti brand (che aspettano il packaging per le loro produzioni)

**Impatto business:** Le spedizioni di packaging non sono marginali per Vetronaviglio — sono il collante tra la produzione e i clienti brand. Un ritardo non comunicato o non monitorato può causare:
- Disservizio verso brand clienti (che fermano produzione o lanci)
- Danno reputazionale nel settore beauty (dove i tempi di lancio sono stretti)
- Costi operativi nascosti (tempo personale dedicato al tracking manuale)

---

## 3. Servizio ZBN adatto

**Delivery — MVP Custom Software (forfait)**

Il progetto si inquadra nella nostra offerta di sviluppo software su misura, con focus su:
- **Integrazione API:** modulo dedicato per FedEx Track API (autenticazione, chiamate, normalizzazione eventi)
- **Backend/DB:** Supabase Postgres per modello dati unico multi-carrier (tabelle: carriers, shipments, shipment_events, tracking_sources, carrier_credentials)
- **Frontend:** dashboard web (Next.js) con ricerca, filtri per stato/carrier, vista dettaglio spedizione, gestione eccezioni
- **Estensibilità:** architettura modulare per aggiungere nuovi corrieri (API o manuale) senza stravolgimenti

**Perché forfait:** scope chiaro (MVP), milestone definite, output misurabile (dashboard funzionante con FedEx + gestione manuale).

---

## 4. Value Proposition

> **Ogni spedizione, ogni corriere, un'unica dashboard. Zero tempo perso, zero eccezioni nascoste.**
>
> ZetaByteNexus sviluppa un sistema tracking su misura che centralizza lo stato di tutte le spedizioni Vetronaviglio — dai corrieri con API (FedEx) a quelli gestiti manualmente — in un'unica interfaccia web. Il risultato: l'operatore controlla una sola schermata invece di 5 portali, le eccezioni vengono fuori subito, e il sistema cresce con voi senza riscrivere nulla.

---

## 5. Posizionamento vs. alternative

| Opzione | Pro | Contro |
|---|---|---|
| **Make (ZBN MVP)** | Su misura per i processi Vetronaviglio, estensibile, dati sotto controllo, nessun costo ricorrente SaaS | Investimento iniziale da definire |
| **Buy (SaaS tipo Ship24, AfterShip)** | Più rapido da avviare, costo mensile prevedibile | Limiti di customizzazione, dipendenza da vendor, costi ricorrenti che crescono con i volumi, possibili limiti su corrieri italiani minori |
| **Status quo (manuale)** | Zero investimento | Tempo perso ogni giorno, errori, rischio disservizio verso clienti brand |

**Vantaggio ZBN vs. SaaS:**
- Vetronaviglio ha un processo produttivo unico (full-service: design → produzione → decorazione → spedizione). Un SaaS generico non si adatta ai loro flussi specifici.
- I corrieri italiani minori potrebbero non essere supportati dai SaaS internazionali.
- I dati di tracking sono dati operativi sensibili (clienti brand, volumi, tempistiche). Mantenerli in-house è un vantaggio competitivo.

---

## 6. Summary riutilizzabile

**Per email/proposta:**
> Vetronaviglio spedisce packaging cosmetico a brand clienti attraverso multipli corrieri. ZetaByteNexus sviluppa un MVP di dashboard tracking che centralizza lo stato di ogni spedizione — da FedEx ai corrieri gestiti manualmente — in un'unica interfaccia. Stack: Supabase + Next.js. Architettura modulare, pronta per crescere con voi.

**Per call commerciale:**
> Il problema è semplice: tempo perso a controllare 5 portali diversi per sapere dove sono le vostre spedizioni. La soluzione è una dashboard unica, semplice da usare, che mostra tutto in un colpo d'occhio. Si parte da FedEx come pilota, poi si aggiungono gli altri corrieri uno alla volta.

**Per LinkedIn/presentazione:**
> Vetronaviglio è un produttore di packaging beauty che spedisce ai suoi brand clienti attraverso multipli corrieri. Il tracking manuale su portali diversi crea ritardi e mancanza di visibilità. ZBN sviluppa una dashboard centralizzata che risolve il problema in tempi rapidi.

---


