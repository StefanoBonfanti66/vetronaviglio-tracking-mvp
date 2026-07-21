# Client Intake — Vetronaviglio Tracking MVP

- **Data:** 2026-07-21
- **Contatto:** Giuseppe Bonetti <bonettig85@gmail.com>
- **Riferimento:** Lead da email a info@zetabytenexus.it
- **Tipo Lead:** Delivery

---

## 1. Client & Business Context
- **Tipo azienda:** Vetronaviglio s.r.l. — produttore di packaging primario per il Beauty (cosmetici, make-up, skin-care, profumeria, pharma). Fondata nel 1991, ~34 dipendenti, Bareggio (MI). Fatturato ~$7.4M.
- **Prodotti/servizi:** Flaconi, barattoli, tappi, dispenser, accessori in plastica e vetro. Personalizzazione (serigrafia, pad printing, hot foil stamping, metallizzazione). Materiali sostenibili (PCR, bio-based, R-Pet). Full-service: design → produzione → decorazione → spedizione.
- **Mercati:** Italia e (presumibilmente) Europa. Clienti: brand cosmetici B2B.
- **Volumi:** Non specificati — da chiedere. Spedizioni B2B verso brand clienti.
- **CEO:** Bettina Solito De Solis
- **E-commerce B2B:** vetronaviglio.eu (low MOQ)

## 2. Current Situation
- **Sistemi attuali:** Non dichiarati esplicitamente. Si deduce che usano portali diversi di corrieri (FedEx + altri) gestiti manualmente o semi-automaticamente
- **Problema principale:** Mancanza di una dashboard centralizzata per monitorare lo stato delle spedizioni B2B verso i clienti brand. Controllo manuale su portali diversi = tempo perso e mancanza di visibilità su spedizioni ferme/ritardate/in eccezione. Impatto: rischio disservizio verso clienti brand che aspettano il packaging per le loro produzioni/lanci.
- **Nota:** Vetronaviglio NON è un'azienda di logistica. È un produttore che spedisce i propri prodotti. Il tracking è un problema operativo secondario rispetto alla core business (packaging cosmetico).

## 3. Goals & Success Criteria
- **Obiettivi dichiarati:**
  - Centralizzare tracking spedizioni multi-corriere in un'unica dashboard
  - Integrazione diretta con API FedEx per tracking automatico
  - Gestione manuale/semi-automatica per altri corrieri (CSV, inserimento manuale)
  - Modello dati unico che normalizza stati di tracking (pending, in_transit, delivered, exception, returned)
- **Criteri di successo:** Ridurre tempo di controllo portali diversi, visibilità immediata su eccezioni, estensibilità ad altri carrier senza stravolgere architettura
- **Vincoli di tempo:** Non specificati
- **Vincoli di budget:** Non specificati

## 4. Constraints
- **Tecnici:** Stack proposto = Supabase Postgres (backend/DB) + Next.js (frontend) + modulo FedEx Track API. Possibilità di aggiungere connettori API per altri corrieri in fase successiva
- **Organizzativi:** Non dichiarati
- **Compliance:** Non dichiarati

---

## A. Systems & Integrations
- **FedEx Track API:** Integrazione diretta con autenticazione e chiamate API, salvataggio payload raw e normalizzazione eventi
- **Altri corrieri:** Gestione manuale/semi-automatica (inserimento tracking number, import CSV/email). Possibilità di aggiungere API in futuro
- **Modello dati:** Tabelle previste: carriers, shipments, shipment_events, tracking_sources, carrier_credentials

## B. Architecture Options & Constraints
- **Cloud:** Supabase Postgres come DB e backend
- **Frontend:** Next.js (interfaccia web)
- **Estensibilità:** Architettura pensata per aggiungere nuovi carrier senza stravolgimenti

---

## Intake Summary (uso interno)

**Chi è il cliente:** Vetronaviglio s.r.l., azienda di logistica/spedizioni multi-corriere.

**Problema principale:** Nessuna dashboard centralizzata per monitorare spedizioni across multipli corrieri. Controllo manuale su portali diversi.

**Sistemi coinvolti:** FedEx API (integrazione diretta), altri corrieri (gestione manuale/CSV). Stack proposto: Supabase + Next.js.

**Vincoli tempo/budget:** Non ancora definiti.

**Incertezze maggiori:** Volumi di spedizioni, numero corrieri da supportare, budget disponibile, tempistiche richieste, existenza di sistemi interni già in uso.

---

## Domande chiave per prossima call

1. **Volumi:** Quante spedizioni/giorno o mese gestite attualmente? Quanti corrieri attivi oltre FedEx?
2. **Stato sistemi attuali:** Esistono già strumenti interni o è tutto manuale? Hanno un ERP/gestionale integrato?
3. **Priorità:** Go-live rapido (MVP funzionale) vs. qualità/architettura solida? Qual è la timeline desiderata?
4. **Budget:** Ha un range di investimento in mente? Preferisce preventivo a forfait o ore?
5. **Corrieri:** Oltre FedEx, quali altri corrieri? Hanno API disponibili o solo gestione manuale?
6. **Dati:** Da dove vengono i dati di tracking attualmente? Export manuali, email, API?
7. **Referente tecnico:** Chi gestisce l'aspetto IT in Vetronaviglio? C'è un team interno o siamo point of contact unici?
8. **MVP scope:** Quali funzionalità minime per il MVP? Solo dashboard read-only o anche azioni (es. apertura ticket eccezione)?
9. **Pilota:** Sono disposti a testare con un sottoinsieme di spedizioni prima del roll-out completo?
10. **Integrazione esistente:** FedEx è l'unico corriere con API o anche gli altri ne hanno?
