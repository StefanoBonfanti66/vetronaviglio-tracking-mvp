-- Vetronaviglio Tracking MVP — Initial Schema
-- Migration: 001_initial_schema

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- CARRIERS
-- ============================================
create table carriers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text not null unique,
  api_available boolean not null default false,
  api_base_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table carriers is 'Corrieri supportati dalla piattaforma';
comment on column carriers.code is 'Codice interno corriere (es. FedEx, DHL, GLS, BRT)';
comment on column carriers.api_available is 'True se il corriere dispone di API di tracking';

-- Seed corrieri principali
insert into carriers (name, code, api_available) values
  ('FedEx', 'fedex', true),
  ('DHL', 'dhl', false),
  ('GLS', 'gls', false),
  ('BRT', 'brt', false),
  ('SDA', 'sda', false),
  ('TNT', 'tnt', false);

-- ============================================
-- SHIPMENTS
-- ============================================
create table shipments (
  id uuid primary key default uuid_generate_v4(),
  tracking_number text not null,
  carrier_id uuid not null references carriers(id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception', 'returned')),
  status_description text,
  origin text,
  destination text,
  customer_name text,
  customer_reference text,
  order_number text,
  estimated_delivery timestamptz,
  actual_delivery timestamptz,
  last_update timestamptz,
  raw_payload jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tracking_number, carrier_id)
);

comment on table shipments is 'Spedizioni monitorate dalla piattaforma';
comment on column shipments.status is 'Stato corrente della spedizione';
comment on column shipments.raw_payload is 'Payload JSON grezzo dalla risposta API del corriere';

-- Index per ricerche frequenti
create index idx_shipments_tracking_number on shipments(tracking_number);
create index idx_shipments_carrier_id on shipments(carrier_id);
create index idx_shipments_status on shipments(status);
create index idx_shipments_customer_reference on shipments(customer_reference);
create index idx_shipments_last_update on shipments(last_update desc);

-- ============================================
-- TRACKING EVENTS
-- ============================================
create table tracking_events (
  id uuid primary key default uuid_generate_v4(),
  shipment_id uuid not null references shipments(id) on delete cascade,
  status text not null,
  description text,
  location text,
  event_timestamp timestamptz not null,
  raw_event jsonb,
  created_at timestamptz not null default now()
);

comment on table tracking_events is 'Cronologia eventi di tracking per ogni spedizione';

create index idx_tracking_events_shipment_id on tracking_events(shipment_id);
create index idx_tracking_events_timestamp on tracking_events(event_timestamp desc);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_shipments_updated_at
  before update on shipments
  for each row execute function update_updated_at();

create trigger trg_carriers_updated_at
  before update on carriers
  for each row execute function update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table carriers enable row level security;
alter table shipments enable row level security;
alter table tracking_events enable row level security;

-- Policy: authenticated users can read all data
create policy "Authenticated users can view carriers"
  on carriers for select using (auth.role() = 'authenticated');

create policy "Authenticated users can view shipments"
  on shipments for select using (auth.role() = 'authenticated');

create policy "Authenticated users can view tracking_events"
  on tracking_events for select using (auth.role() = 'authenticated');

-- Policy: authenticated users can insert/update shipments
create policy "Authenticated users can insert shipments"
  on shipments for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update shipments"
  on shipments for update using (auth.role() = 'authenticated');

-- Policy: authenticated users can insert tracking events
create policy "Authenticated users can insert tracking_events"
  on tracking_events for insert with check (auth.role() = 'authenticated');
