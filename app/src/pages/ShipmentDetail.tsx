import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getShipmentById, getTrackingEvents } from '../lib/shipments'
import { STATUS_LABELS, STATUS_COLORS } from '../types/tracking'
import type { Shipment, TrackingEvent } from '../types/tracking'
import TrackingTimeline from '../components/TrackingTimeline'

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
        <Link to="/shipments" className="text-sm text-brand-primary hover:underline mt-2 inline-block">
          ← Torna alle spedizioni
        </Link>
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500">Spedizione non trovata</p>
        <Link to="/shipments" className="text-sm text-brand-primary hover:underline mt-2 inline-block">
          ← Torna alle spedizioni
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/shipments" className="no-print text-sm text-brand-primary hover:text-brand-primary-hover mb-4 inline-block">
        ← Torna alle spedizioni
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-slate-800 font-mono">{shipment.tracking_number}</h1>
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[shipment.status]}`}>
            {STATUS_LABELS[shipment.status]}
          </span>
          <p className="text-sm text-slate-500 w-full sm:w-auto">{shipment.carrier?.name ?? 'Corriere sconosciuto'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="no-print inline-flex items-center gap-1.5 border border-slate-200 text-slate-700 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            <span className="hidden sm:inline">Stampa PDF</span>
          </button>
          <button
            onClick={() => navigate(`/shipments/${id}/edit`)}
            className="no-print inline-flex items-center gap-1.5 border border-slate-200 text-slate-700 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
            </svg>
            <span className="hidden sm:inline">Modifica</span>
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
            <TrackingTimeline events={events} />
          </div>
        </div>
      </div>
    </div>
  )
}
