import { supabase } from '../supabaseClient'
import type { Carrier, Shipment, TrackingEvent, DashboardStats, ShipmentStatus } from '../types/tracking'

export async function getCarriers(): Promise<Carrier[]> {
  const { data, error } = await supabase
    .from('carriers')
    .select('*')
    .order('name')

  if (error) throw error
  return data ?? []
}

export async function getShipments(filters?: {
  status?: ShipmentStatus
  carrier_id?: string
  search?: string
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
  sort_field?: string
  sort_dir?: 'asc' | 'desc'
}): Promise<{ data: Shipment[]; count: number }> {
  let query = supabase
    .from('shipments')
    .select('*, carrier:carriers(*)', { count: 'exact' })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.carrier_id) {
    query = query.eq('carrier_id', filters.carrier_id)
  }
  if (filters?.search) {
    query = query.or(`tracking_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_reference.ilike.%${filters.search}%`)
  }
  if (filters?.date_from) {
    query = query.gte('last_update', filters.date_from)
  }
  if (filters?.date_to) {
    query = query.lte('last_update', filters.date_to)
  }

  const sortField = filters?.sort_field ?? 'last_update'
  const sortDir = filters?.sort_dir ?? 'desc'

  if (sortField === 'carrier') {
    query = query.order('name', { foreignTable: 'carriers', ascending: sortDir === 'asc' })
    query = query.order('last_update', { ascending: false })
  } else {
    query = query.order(sortField, { ascending: sortDir === 'asc', nullsFirst: false })
  }

  if (filters?.limit) {
    query = query.range(filters.offset ?? 0, (filters.offset ?? 0) + filters.limit - 1)
  }

  const { data, error, count } = await query

  if (error) throw error
  return { data: data ?? [], count: count ?? 0 }
}

export async function getShipmentById(id: string): Promise<Shipment | null> {
  const { data, error } = await supabase
    .from('shipments')
    .select('*, carrier:carriers(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getTrackingEvents(shipmentId: string): Promise<TrackingEvent[]> {
  const { data, error } = await supabase
    .from('tracking_events')
    .select('*')
    .eq('shipment_id', shipmentId)
    .order('event_timestamp', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [total, inTransit, delivered, exceptions, pending] = await Promise.all([
    supabase.from('shipments').select('*', { count: 'exact', head: true }),
    supabase.from('shipments').select('*', { count: 'exact', head: true }).in('status', ['in_transit', 'picked_up', 'out_for_delivery']),
    supabase.from('shipments').select('*', { count: 'exact', head: true }).eq('status', 'delivered'),
    supabase.from('shipments').select('*', { count: 'exact', head: true }).eq('status', 'exception'),
    supabase.from('shipments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  if (total.error) throw total.error
  if (inTransit.error) throw inTransit.error
  if (delivered.error) throw delivered.error
  if (exceptions.error) throw exceptions.error
  if (pending.error) throw pending.error

  return {
    total_shipments: total.count ?? 0,
    in_transit: inTransit.count ?? 0,
    delivered: delivered.count ?? 0,
    exceptions: exceptions.count ?? 0,
    pending: pending.count ?? 0,
  }
}

export async function getCarrierStats(): Promise<{ name: string; count: number }[]> {
  const carriers = await getCarriers()
  const counts = await Promise.all(
    carriers.map(c =>
      supabase.from('shipments').select('*', { count: 'exact', head: true }).eq('carrier_id', c.id)
    )
  )
  return carriers
    .map((c, i) => ({ name: c.name, count: counts[i].count ?? 0 }))
    .filter(c => c.count > 0)
}

export async function createShipment(shipment: {
  tracking_number: string
  carrier_id: string
  customer_name?: string
  customer_reference?: string
  order_number?: string
  origin?: string
  destination?: string
  notes?: string
}): Promise<Shipment> {
  const { data, error } = await supabase
    .from('shipments')
    .insert({
      ...shipment,
      status: 'pending' as ShipmentStatus,
    })
    .select('*, carrier:carriers(*)')
    .single()

  if (error) throw error
  return data
}

export async function updateShipment(
  shipmentId: string,
  updates: {
    tracking_number?: string
    carrier_id?: string
    status?: ShipmentStatus
    status_description?: string
    customer_name?: string
    customer_reference?: string
    order_number?: string
    origin?: string
    destination?: string
    notes?: string
    last_update?: string
  }
): Promise<Shipment> {
  const { data, error } = await supabase
    .from('shipments')
    .update(updates)
    .eq('id', shipmentId)
    .select('*, carrier:carriers(*)')
    .single()

  if (error) throw error
  return data
}

export async function updateShipmentStatus(
  shipmentId: string,
  status: ShipmentStatus,
  statusDescription?: string
): Promise<Shipment> {
  return updateShipment(shipmentId, {
    status,
    status_description: statusDescription,
    last_update: new Date().toISOString(),
  })
}

export async function deleteShipment(shipmentId: string): Promise<void> {
  const { error } = await supabase
    .from('shipments')
    .delete()
    .eq('id', shipmentId)

  if (error) throw error
}

export async function createShipmentsBulk(
  shipments: Array<{
    tracking_number: string
    carrier_id: string
    customer_name?: string
    customer_reference?: string
    order_number?: string
    origin?: string
    destination?: string
    notes?: string
  }>
): Promise<Shipment[]> {
  const { data, error } = await supabase
    .from('shipments')
    .insert(shipments.map(s => ({ ...s, status: 'pending' as ShipmentStatus })))
    .select('*, carrier:carriers(*)')

  if (error) throw error
  return data ?? []
}
