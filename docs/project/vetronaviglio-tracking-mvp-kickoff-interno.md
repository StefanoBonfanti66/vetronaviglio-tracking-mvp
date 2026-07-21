# Kickoff Interno — Vetronaviglio Tracking MVP

- **Data:** 2026-07-21
- **Progetto:** MVP Dashboard Tracking Spedizioni Multi-corriere
- **Cliente:** Vetronaviglio s.r.l.

---

## Scopo del progetto

Vetronaviglio produce packaging beauty e spedisce ai brand clienti attraverso multipli corrieri. Il tracking è attualmente manuale su portali diversi. Sviluppiamo un MVP di dashboard web che centralizza il tracking — da FedEx (API diretta) ai corrieri gestiti manualmente — in un'unica interfaccia. L'architettura è modulare per crescere con il cliente senza riscrivere nulla.

---

## Ruoli e responsabilità

| Ruolo | Persona | Responsabilità |
|-------|---------|----------------|
| Referente cliente | Giuseppe Bonetti | Requisiti, feedback, fornitura credenziali API e dati di test |
| Project Owner | Stefano Bonfanti | Decisioni strategiche, relazione con cliente, validità preventivo |
| Lead Developer | Stefano Bonfanti | Architettura, sviluppo backend/frontend, integrazione API |
| PM interno | Stefano Bonfanti | Tracking milestone, comunicazione con cliente, gestione rischi |

**Nota:** In questo progetto Stefano ricopre tutti i ruoli interni. Il cliente fornisce un referente unico decisionale.

---

## Tool e canali

| Tool | Uso |
|------|-----|
| GitHub | Repo codice, issue, PR, CI/CD |
| Supabase | Database, auth, API |
| Vercel | Deploy frontend |
| Gmail | Comunicazioni ufficiali con cliente |
| Call/video | Check periodici con cliente |
| OpenCode | Sviluppo assistito, gestione docs |

---

## Rischi principali

| Rischio | Impatto | Mitigazione |
|---------|---------|-------------|
| Ritardi feedback cliente | Slittamento milestone | Comunicare tempistiche chiare, max 5gg per review |
| FedEx API instabile | Blocco integrazione | Fallback su dati mock per sviluppo, test in produzione |
| Corrieri senza API | Copertura parziale | Gestione manuale/CSV come soluzione intermedia |
| Scope creep | Aumento costi/tempi | Ogni modifica è preventivata separatamente |
| Dati test insufficienti | Dashboard non validata | Richiedere campioni reali al cliente in fase di avvio |
