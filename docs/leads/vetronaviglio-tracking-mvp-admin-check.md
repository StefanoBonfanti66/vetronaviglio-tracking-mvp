# Check Fiscale e Amministrativo — Vetronaviglio Tracking MVP

- **Data:** 2026-07-21
- **Progetto:** MVP Dashboard Tracking Spedizioni Multi-corriere
- **Cliente:** Vetronaviglio s.r.l.
- **Importo:** €10.200 IVA esclusa (5 milestone, forfait)

---

## 1. Temi Fiscali/Legali da Validare con il Commercialista Umano

### 1.1. IVA
- Aliquota standard per prestazioni software B2B in Italia: **22%**
- Sul totale €10.200 → €2.244 IVA → totale fatturato €12.444
- Il cliente (srl) potrà detrarre l'IVA
- **Verificare:** eventuale regime forfettario del prestatore (IVA fuori campo)

### 1.2. Regime Fiscale del Prestatore

**Scenario A — Regime Forfettario (se applicabile):**
- Soglia ricavi: €85.000
- Imposta sostitutiva: 5% (primi 5 anni) o 15%
- Coefficiente redditività (ATECO 62.01.00): 67%
- Esempio: €10.200 × 67% = €6.834 imponibile × 5% = **€341,70** imposta
- No IVA, no ritenuta d'acconto
- **Attenzione:** non si deducono costi effettivi, non si recupera IVA su acquisti

**Scenario B — Regime Ordinario:**
- IVA 22% da applicare e gestire in liquidazione
- IRPEF progressiva sul reddito effettivo
- Ritenuta d'acconto 20% (€2.040) trattenuta dal cliente
- Netto incassato prima imposte: €8.160
- **Attenzione:** maggiore complessità amministrativa

### 1.3. Contributi INPS
- **Gestione Separata INPS:** ~26,23% sul reddito imponibile
- **INPS Artigiani/Commercianti:** minimale fisso + aliquota sul reddito eccedente
- **Da verificare:** inquadramento esatto di Stefano Bonfanti

### 1.4. Implicazioni Cash-Flow
- Pagamenti distribuiti (20/20/30/30) → liquidità più omogenea
- Allineare scadenze fiscali con incassi previsti
- Accantonare fondi per imposte e contributi

---

## 2. Checklist Amministrativa Interna

- [ ] Anagrafica cliente completa (P.IVA, indirizzo, SDI/PEC)
- [ ] Preventivo approvato per iscritto
- [ ] Eventuale Ordine d'Acquisto dal cliente
- [ ] Fatture elettroniche conforme per ogni milestone

---

## 3. Osservazioni

- **Milestone chiare:** definire criteri di accettazione oggettivi per ogni milestone
- **Contratto scritto:** raccomandato per SOW, milestone, proprietà intellettuale, change request, clausole di recesso
- **Ritenuta d'acconto:** punto critico — se regime ordinario, riduce cash flow del 20%
- **Tempistiche incasso vs scadenze fiscali:** monitorare attivamente

---

## 4. Proposta Fatturazione

### Schema milestone-based (consigliato)

| # | Fattura | Importo | Quando |
|---|---|---|---|
| F1 | Acconto 20% | €2.040 | All'accettazione preventivo, prima dell'avvio |
| F2 | M2 — FedEx API | €2.040 | Completamento integrazione FedEx |
| F3 | M3 — Dashboard | €3.060 | Completamento dashboard funzionante |
| F4 | M5 — Go-live | €3.060 | Rilascio in produzione |
| | **Totale** | **€10.200** | |

### Termini di pagamento
- Consigliati: **30 giorni data fattura**
- Per clienti affidabili: valutare 60 giorni (richiede validazione CEO)

### Gestione ritardi
1. Promemoria automatico 7 giorni prima scadenza
2. Sollecito formale via email il giorno dopo scadenza
3. Escalation a @amministrazione/CEO dopo 15 giorni (sospensione lavori, interessi di mora)

---

## Decisione CEO richiesta

**Validare:**
1. Regime fiscale del prestatore (forfettario vs ordinario) — impatta IVA e ritenuta
2. Termini di pagamento (30gg vs 60gg)
3. Schema fatturazione milestone-based (4 fatture) vs alternativa (acconto + saldo)
4. Gestione ritardi oltre il sollecito standard
