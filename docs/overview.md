---
title: "Vetronaviglio Tracking MVP"
slug: vetronaviglio-tracking-mvp
project_type: internal
commercial_status: active
operational_status: production
administrative_status: active
client: Vetronaviglio s.r.l.
owner: Zetabytenexus
last_updated: 2026-07-31
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

- MVP completo (M1-M7) e go-live confermato
- Production live su Vercel: `app-blond-omega-14.vercel.app`
- Integrazioni attive: FedEx Track API, DHL Track API, cron daily refresh
- FATT-001 incassata; FATT-002/003/004 da emettere
- Prossimi step: credenziali corrieri reali in Settings, auth/login, feedback cliente
