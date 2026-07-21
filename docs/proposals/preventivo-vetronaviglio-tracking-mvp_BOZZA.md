![Logo azienda](../../assets/logo-azienda.png)

INDIRIZZO COMPLETO Via Mazzo,73/B
CAP CITTÀ 20017 RHO (MI) – ITALIA
P.IVA / CF: BNFSFN66B13F704A
Email: [info@zetabytenexus.it](mailto:info@zetabytenexus.it)
Telefono: 335 7388349
Sito web: [www.zetabytenexus.it](https://www.zetabytenexus.it)

---

# Preventivo n. 2026-001

Cliente: Vetronaviglio s.r.l.
Referente: Giuseppe Bonetti
Data: 21/07/2026
Validità: 30 giorni

---

## 1. Contesto e obiettivi

Vetronaviglio s.r.l. produce packaging primario per il Beauty (cosmetici, make-up, skin-care, profumeria, pharma) e spedisce i propri prodotti a brand clienti attraverso multipli corrieri. Attualmente non esiste una dashboard centralizzata per monitorare lo stato delle spedizioni: i portali dei corrieri vanno controllati manualmente, uno per uno, creando tempo perso e mancanza di visibilità su spedizioni ferme, in ritardo o in eccezione.

Obiettivi principali del progetto:
- Centralizzare il tracking delle spedizioni multi-corriere in un'unica dashboard web
- Integrare direttamente l'API FedEx per il tracking automatico
- Gestire manualmente/semi-automaticamente gli altri corrieri (CSV, inserimento manuale)
- Costruire un'architettura modulare estensibile per aggiungere nuovi corrieri senza stravolgimenti

Decisioni aperte da definire in fase di analisi iniziale:
- Numero esatto di corrieri da supportare nell'MVP (oltre FedEx)
- Volumi di spedizioni (giorno/mese) per dimensionare la dashboard
- Eventuale integrazione con sistemi interni esistenti (ERP/gestionale)

---

## 2. Ambito del progetto

### In scope

- **Integrazione FedEx Track API:** autenticazione, chiamate API, normalizzazione eventi, salvataggio payload raw
- **Modello dati unico:** tabelle carriers, shipments, shipment_events, tracking_sources, carrier_credentials su Supabase Postgres
- **Dashboard web (Next.js):** vista principale con ricerca, filtri per stato/carrier, vista dettaglio spedizione
- **Gestione manuale/CSV:** inserimento tracking number per corrieri senza API, import CSV
- **Deploy e documentazione:** setup CI/CD, deploy Vercel, documentazione operativa

### Fuori scope / esclusioni

- Integrazione API con corrieri diversi da FedEx (futura estensione)
- Alerting automatico via email/SMS (futura estensione)
- Reporting e analytics avanzati (futura estensione)
- Integrazione con ERP/gestionale del cliente
- Mobile app
- Hosting e licenze API (a carico del cliente)

---

## 2.b Rischi e dipendenze

- **FedEx API:** dipende dalla disponibilità e stabilità dell'API FedEx; tempi di risposta possono variare
- **Dati di test:** servono dati reali di spedizione per validare il sistema; il cliente deve fornire campioni
- **Feedback cliente:** ritardi nel feedback su prototipi possono slittare le milestone
- **Corrieri italiani minori:** potrebbero non avere API documentate; la gestione manuale copre il gap ma riduce l'automazione

---

## 3. Articolazione per milestone

| Milestone | Descrizione | Ore stimate | Importo |
|----------|-------------|------------:|--------:|
| M1 – Setup infrastruttura | Supabase schema, repo Next.js, CI/CD, auth base | 40h | 1.800 € |
| M2 – FedEx API | Integrazione API, normalizzazione eventi, salvataggio payload | 40h | 2.400 € |
| M3 – Dashboard frontend | Vista principale, filtri, ricerca, vista dettaglio | 40h | 3.200 € |
| M4 – Gestione manuale/CSV | Inserimento manuale, import CSV, gestione corrieri senza API | 20h | 1.600 € |
| M5 – Testing e go-live | QA completa, deploy produzione, documentazione | 20h | 1.200 € |
| **Totale** | | **160h** | **10.200 €** |

Note sulle stime:
- Le ore includono sviluppo, comunicazione, revisioni ragionevoli, test e documentazione interna essenziale.
- Le stime sono basate sulle informazioni attualmente disponibili e potranno essere raffinate in fase di analisi dettagliata.
- Include risk buffer del 15% sulle ore stimate.

---

## 4. Modello di prezzo

Prezzo fisso a milestone (forfait). Ogni milestone ha un deliverable definito e un importo concordato. Il pagamento è legato al completamento e accettazione di ogni milestone.

---

## 5. Condizioni economiche

- Importo complessivo stimato: **10.200 € + IVA (se applicabile)**
- Regime fiscale: Forfettario (IVA fuori campo)
- Pagamento:
  - 20% alla firma (acconto): **2.040 €**
  - 20% a completamento M2 (FedEx API): **2.040 €**
  - 30% a completamento M3 (Dashboard): **3.060 €**
  - 30% a go-live M5: **3.060 €**

Eventuali altre condizioni:
- Termini di pagamento: 30 giorni data fattura
- Validità preventivo: 30 giorni dalla data
- Eventuali change request durante lo sviluppo: preventivate separatamente

---

## 6. Garanzia e manutenzione

- Periodo di garanzia correttiva: **30 giorni** su bug di produzione dopo il go-live.
- Dopo la garanzia:
  - Retainer manutenzione: 500 €/mese per manutenzione e supporto
  - Estensioni corrieri: 800 €/mese per aggiunta nuovo corriere API
  - Full retainer: 1.200 €/mese (manutenzione + 1 estensione/mese)
  - Interventi extra: 70 €/h

---

## 7. Prerequisiti e responsabilità del cliente

Il cliente si impegna a fornire:
- Un referente unico decisionale
- Accesso alle credenziali API FedEx
- Dati di test (campioni di spedizioni reali)
- Feedback su prototipi e rilasci entro 5 giorni lavorativi
- Eventuali integrazioni con sistemi interni (se concordate)

---

## 8. Prossimi passi

1. Call di dettaglio per chiarire requisiti aperti (corrieri, volumi, timeline).
2. Conferma scritta del presente preventivo.
3. Emissione della fattura di acconto e pianificazione attività.

---

_Firmato digitalmente da ZetaByteNexus / Stefano Bonfanti_

---
---
BOZZA — In attesa di revisione CEO
Generato il: 2026-07-21
Fasi completate: brief ✅ | positioning ✅ | pricing ✅ | admin ✅
Prossimo passo: finalizzazione dopo approvazione CEO
---
