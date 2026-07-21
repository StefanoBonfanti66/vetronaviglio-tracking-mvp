import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCarriers, getShipmentById, updateShipment, deleteShipment } from '../lib/shipments'
import type { Carrier, ShipmentStatus } from '../types/tracking'
import { STATUS_LABELS } from '../types/tracking'

export default function ShipmentEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDelete, setShowDelete] = useState(false)

  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrierId, setCarrierId] = useState('')
  const [status, setStatus] = useState<ShipmentStatus>('pending')
  const [customerName, setCustomerName] = useState('')
  const [customerReference, setCustomerReference] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!id) return
    Promise.all([getCarriers(), getShipmentById(id)])
      .then(([carriersData, shipment]) => {
        setCarriers(carriersData)
        if (!shipment) {
          setError('Spedizione non trovata')
          return
        }
        setTrackingNumber(shipment.tracking_number)
        setCarrierId(shipment.carrier_id)
        setStatus(shipment.status)
        setCustomerName(shipment.customer_name ?? '')
        setCustomerReference(shipment.customer_reference ?? '')
        setOrderNumber(shipment.order_number ?? '')
        setOrigin(shipment.origin ?? '')
        setDestination(shipment.destination ?? '')
        setNotes(shipment.notes ?? '')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!id || !trackingNumber || !carrierId) return

    setSubmitting(true)
    setError(null)
    try {
      await updateShipment(id, {
        tracking_number: trackingNumber,
        carrier_id: carrierId,
        status,
        customer_name: customerName || undefined,
        customer_reference: customerReference || undefined,
        order_number: orderNumber || undefined,
        origin: origin || undefined,
        destination: destination || undefined,
        notes: notes || undefined,
      })
      navigate(`/shipments/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!id) return
    setSubmitting(true)
    try {
      await deleteShipment(id)
      navigate('/shipments')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante l\'eliminazione')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Caricamento...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Modifica spedizione</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Tracking number *</label>
            <input
              type="text"
              required
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Corriere *</label>
            <select
              required
              value={carrierId}
              onChange={(e) => setCarrierId(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
            >
              <option value="">Seleziona corriere</option>
              {carriers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Stato</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Riferimento ordine</label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Riferimento cliente</label>
            <input
              type="text"
              value={customerReference}
              onChange={(e) => setCustomerReference(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Origine</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Destinazione</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={submitting}
            className="bg-brand-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-brand-primary-hover transition-colors disabled:opacity-50"
          >
            {submitting ? 'Salvataggio...' : 'Salva modifiche'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/shipments/${id}`)}
            className="border border-slate-200 text-slate-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Annulla
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Elimina
          </button>
        </div>
      </form>

      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Conferma eliminazione</h3>
            <p className="text-sm text-slate-600 mb-6">
              Vuoi eliminare la spedizione <strong>{trackingNumber}</strong>? L'azione è irreversibile.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDelete(false)}
                className="border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Annulla
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Eliminazione...' : 'Elimina'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
