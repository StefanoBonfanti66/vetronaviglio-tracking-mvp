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
  limit?: number
  offset?: number
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

  query = query.order('last_update', { ascending: false })

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
  const { data, error } = await supabase
    .from('shipments')
    .select('status')

  if (error) throw error

  const shipments = data ?? []
  return {
    total_shipments: shipments.length,
    in_transit: shipments.filter(s => s.status === 'in_transit' || s.status === 'picked_up' || s.status === 'out_for_delivery').length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
    exceptions: shipments.filter(s => s.status === 'exception').length,
    pending: shipments.filter(s => s.status === 'pending').length,
  }
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

export async function updateShipmentStatus(
  shipmentId: string,
  status: ShipmentStatus,
  statusDescription?: string
): Promise<Shipment> {
  const { data, error } = await supabase
    .from('shipments')
    .update({
      status,
      status_description: statusDescription ?? null,
      last_update: new Date().toISOString(),
    })
    .eq('id', shipmentId)
    .select('*, carrier:carriers(*)')
    .single()

  if (error) throw error
  return data
}
