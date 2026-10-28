---
title: "Vetronaviglio Tracking MVP"
slug: vetronaviglio-tracking-mvp
project_type: internal
commercial_status: inactive
operational_status: demo
administrative_status: closed
client: Vetronaviglio s.r.l. (demo tecnica)
owner: Zetabytenexus
is_test: true
last_updated: 2026-10-28
mcp_profile: saas
---

# Vetronaviglio Tracking MVP

Dashboard unificata per il tracking delle spedizioni multi-corriere di Vetronaviglio s.r.l.

## Contesto

Vetronaviglio è un produttore di packaging primario per il beauty (cosmetici, make-up, skin-care, profumeria, pharma). Le spedizioni avvengono attraverso multipli corrieri e attualmente non esiste una vista unica sullo stato delle consegne.

## Obiettivo

MVP di una dashboard web che aggrega i dati di tracking da diversi corrieri (FedEx, DHL, GLS, BRT, ecc.) in un'unica interfaccia, con alert automatici sulle eccezioni.

## Stack tecnico previsto

- **Frontend:** React 19 + TypeScript + Vite + TailwindCSS v4
- **Backend/DB:** Supabase
- **API esterne:** FedEx API (chiave sviluppo disponibile), API corrieri multipli
- **Deploy:** Vercel

## Stato attuale

> **DEMO TECNICA (2026-10-28).** Il progetto è stato un test interno: **non ha generato ricavi** e nessuna fattura è stata emessa. I riferimenti a FATT-001/002/003/004 e agli importi del preventivo 2026-001 restano solo come documentazione della proposta, non come crediti.

- MVP completo (M1-M7), demo tecnica conservata
- Deploy demo su Vercel: `app-blond-omega-14.vercel.app`
- Integrazioni testate: FedEx Track API, DHL Track API, cron daily refresh
- Nessuna fattura emessa, nessun incasso, nessun sollecito
- Prossimi step: nessuno pianificato (demo archiviata); un'eventuale riapertura commerciale va decisa dal CEO
