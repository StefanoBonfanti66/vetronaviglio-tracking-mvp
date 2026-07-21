import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getShipmentById, getTrackingEvents } from '../lib/shipments'
import { STATUS_LABELS, STATUS_COLORS } from '../types/tracking'
import type { Shipment, TrackingEvent } from '../types/tracking'

function TimelineItem({ event, isLast }: { event: TrackingEvent; isLast: boolean }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow" />
        {!isLast && <div className="w-0.5 flex-1 bg-slate-200 mt-1" />}
      </div>
      <div className={`pb-6 ${isLast ? '' : ''}`}>
        <p className="text-sm font-medium text-slate-700">{event.description ?? event.status}</p>
        <div className="flex items-center gap-3 mt-1">
          {event.location && (
            <span className="text-xs text-slate-500">📍 {event.location}</span>
          )}
          <span className="text-xs text-slate-400">
            {new Date(event.event_timestamp).toLocaleString('it-IT')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function ShipmentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [events, setEvents] = useState<TrackingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      getShipmentById(id),
      getTrackingEvents(id),
    ])
      .then(([shipmentData, eventsData]) => {
        setShipment(shipmentData)
        setEvents(eventsData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Caricamento...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-700 font-medium">Errore: {error}</p>
        <Link to="/shipments" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          ← Torna alle spedizioni
        </Link>
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500">Spedizione non trovata</p>
        <Link to="/shipments" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          ← Torna alle spedizioni
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/shipments" className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Torna alle spedizioni
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-mono">{shipment.tracking_number}</h1>
          <p className="text-sm text-slate-500 mt-1">{shipment.carrier?.name ?? 'Corriere sconosciuto'}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[shipment.status]}`}>
            {STATUS_LABELS[shipment.status]}
          </span>
          <button
            onClick={() => navigate(`/shipments/${id}/edit`)}
            className="border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Modifica
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">Dettagli</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase">Cliente</dt>
                <dd className="text-sm text-slate-700 mt-1">{shipment.customer_name ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase">Riferimento ordine</dt>
                <dd className="text-sm text-slate-700 mt-1">{shipment.order_number ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase">Riferimento cliente</dt>
                <dd className="text-sm text-slate-700 mt-1">{shipment.customer_reference ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase">Origine</dt>
                <dd className="text-sm text-slate-700 mt-1">{shipment.origin ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase">Destinazione</dt>
                <dd className="text-sm text-slate-700 mt-1">{shipment.destination ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase">Consegna prevista</dt>
                <dd className="text-sm text-slate-700 mt-1">
                  {shipment.estimated_delivery
                    ? new Date(shipment.estimated_delivery).toLocaleDateString('it-IT')
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase">Consegna effettiva</dt>
                <dd className="text-sm text-slate-700 mt-1">
                  {shipment.actual_delivery
                    ? new Date(shipment.actual_delivery).toLocaleDateString('it-IT')
                    : '—'}
                </dd>
              </div>
              {shipment.notes && (
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase">Note</dt>
                  <dd className="text-sm text-slate-700 mt-1">{shipment.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">Cronologia eventi</h2>
            {events.length === 0 ? (
              <p className="text-slate-400 text-sm">Nessun evento di tracking registrato.</p>
            ) : (
              <div className="pl-1">
                {events.map((event, index) => (
                  <TimelineItem
                    key={event.id}
                    event={event}
                    isLast={index === events.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
