-- Vetronaviglio Tracking MVP — Carrier Credentials
-- Migration: 002_carrier_credentials

-- ============================================
-- CARRIER_CREDENTIALS
-- ============================================
create table carrier_credentials (
  id uuid primary key default uuid_generate_v4(),
  carrier_id uuid not null references carriers(id) on delete cascade,
  credential_key text not null,
  credential_value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(carrier_id, credential_key)
);

comment on table carrier_credentials is 'Credenziali API per corriere (API key, secret, ecc.)';
comment on column carrier_credentials.credential_key is 'Chiave credenziale (es. FEDEX_API_KEY, DHL_API_KEY)';
comment on column carrier_credentials.credential_value is 'Valore credenziale (secret, mai esposto in log)';

create index idx_carrier_credentials_carrier_id on carrier_credentials(carrier_id);

-- Trigger aggiornamento updated_at
create trigger trg_carrier_credentials_updated_at
  before update on carrier_credentials
  for each row execute function update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table carrier_credentials enable row level security;

-- Policy: authenticated users can read credentials
create policy "Authenticated users can view carrier_credentials"
  on carrier_credentials for select using (auth.role() = 'authenticated');

-- Policy: authenticated users can insert/update credentials
create policy "Authenticated users can insert carrier_credentials"
  on carrier_credentials for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update carrier_credentials"
  on carrier_credentials for update using (auth.role() = 'authenticated');
