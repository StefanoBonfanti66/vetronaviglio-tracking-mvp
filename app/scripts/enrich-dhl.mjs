import { readFileSync } from 'fs';
const SUPABASE_URL = 'https://ebcxgmaavbhjkwhtkcie.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViY3hnbWFhdmJoamt3aHRrY2llIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDYzNzQ4MiwiZXhwIjoyMTAwMjEzNDgyfQ.hLs9R7OlMj81xKhZ-o6B76EyQ5LCL-TOsuVRlQJ_sLo';
const DHL_ID = '4dc56bd0-3872-4dee-b07f-54ab4e95e1d5';

const data = JSON.parse(readFileSync('/tmp/dhl-complete.json', 'utf-8'));
const lookup = {};
for (const s of data) lookup[s.tracking] = s;

const res = await fetch(`${SUPABASE_URL}/rest/v1/shipments?carrier_id=eq.${DHL_ID}&select=id,tracking_number,status,origin,destination,customer_name,notes`,
  { headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` } }
);
const dbShips = await res.json();
console.log(`Found ${dbShips.length} DHL in DB`);

const VETRO = 'VETRONAVIGLIO SRL';
let updated = 0;
let eventsAdded = 0;

for (const db of dbShips) {
  const d = lookup[db.tracking_number];
  if (!d) { console.log(`No DHL data for ${db.tracking_number}`); continue; }

  // Determine customer_name: outbound = toCompany, inbound = fromCompany
  const isOutbound = d.fromCompany === VETRO;
  const customerName = isOutbound ? d.toCompany : d.fromCompany;

  const updates = {};
  if (db.origin !== d.fromCity) updates.origin = d.fromCity;
  const dest = `${d.toCity}, ${d.toCountry}`;
  if (db.destination !== dest) updates.destination = dest;
  if (db.customer_name !== customerName) updates.customer_name = customerName;
  if (!db.notes && d.description) updates.notes = d.description;

  if (Object.keys(updates).length > 0) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/shipments?id=eq.${db.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Prefer': 'return=minimal' },
      body: JSON.stringify(updates)
    });
    if (r.ok) updated++;
    else console.error(`Update fail ${db.tracking_number}: ${await r.text()}`);
  }

  // Delete old basic tracking events and create proper ones
  // First check if events exist
  const evRes = await fetch(`${SUPABASE_URL}/rest/v1/tracking_events?shipment_id=eq.${db.id}&select=id`,
    { headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` } }
  );
  const existingEvents = await evRes.json();

  if (existingEvents.length === 1 && existingEvents[0].id) {
    // Replace the basic event with enriched one
    const eventStatus = d.status === 'DELIVERED' ? 'delivered' :
                        d.status === 'IN_TRANSIT' ? 'in_transit' :
                        d.status === 'READY_TO_SHIP' ? 'pending' : 'in_transit';

    const eventLocation = isOutbound
      ? `${d.toCity}, ${d.toCountry}`  // shipment destination
      : `${d.fromCity}, ${d.fromCountry}`; // for inbound: supplier location

    const r = await fetch(`${SUPABASE_URL}/rest/v1/tracking_events?id=eq.${existingEvents[0].id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        status: eventStatus,
        description: d.description || d.statusDesc,
        location: eventLocation,
        event_timestamp: d.createdAt || db.last_update,
      })
    });
    if (r.ok) eventsAdded++;
  }
}

console.log(`Updated ${updated} shipments`);
console.log(`Updated ${eventsAdded} tracking events`);
