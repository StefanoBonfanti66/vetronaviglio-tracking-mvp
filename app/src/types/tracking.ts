export type Carrier = {
  id: string
  name: string
  code: string
  api_available: boolean
  api_base_url: string | null
  created_at: string
  updated_at: string
}

export type ShipmentStatus =
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception'
  | 'returned'

export type Shipment = {
  id: string
  tracking_number: string
  carrier_id: string
  status: ShipmentStatus
  status_description: string | null
  origin: string | null
  destination: string | null
  customer_name: string | null
  customer_reference: string | null
  order_number: string | null
  estimated_delivery: string | null
  actual_delivery: string | null
  last_update: string | null
  raw_payload: Record<string, unknown> | null
  notes: string | null
  created_at: string
  updated_at: string
  // Joined fields
  carrier?: Carrier
}

export type TrackingEvent = {
  id: string
  shipment_id: string
  status: string
  description: string | null
  location: string | null
  event_timestamp: string
  raw_event: Record<string, unknown> | null
  created_at: string
}

export type DashboardStats = {
  total_shipments: number
  in_transit: number
  delivered: number
  exceptions: number
  pending: number
}

export const STATUS_LABELS: Record<ShipmentStatus, string> = {
  pending: 'In attesa',
  picked_up: 'Ritirato',
  in_transit: 'In transito',
  out_for_delivery: 'In consegna',
  delivered: 'Consegnato',
  exception: 'Eccezione',
  returned: 'Reso',
}

export const STATUS_COLORS: Record<ShipmentStatus, string> = {
  pending: 'bg-slate-100 text-slate-700',
  picked_up: 'bg-blue-100 text-blue-700',
  in_transit: 'bg-amber-100 text-amber-700',
  out_for_delivery: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  exception: 'bg-red-100 text-red-700',
  returned: 'bg-orange-100 text-orange-700',
}
