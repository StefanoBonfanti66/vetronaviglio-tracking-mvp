import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCarriers, createShipment } from '../lib/shipments'
import type { Carrier } from '../types/tracking'

export default function ShipmentForm() {
  const navigate = useNavigate()
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrierId, setCarrierId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerReference, setCustomerReference] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    getCarriers()
      .then(setCarriers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!trackingNumber || !carrierId) return

    setSubmitting(true)
    setError(null)
    try {
      const shipment = await createShipment({
        tracking_number: trackingNumber,
        carrier_id: carrierId,
        customer_name: customerName || undefined,
        customer_reference: customerReference || undefined,
        order_number: orderNumber || undefined,
        origin: origin || undefined,
        destination: destination || undefined,
        notes: notes || undefined,
      })
      navigate(`/shipments/${shipment.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Caricamento corrieri...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Nuova spedizione</h1>

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
              placeholder="Es. 1234567890"
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
              placeholder="Nome cliente"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Riferimento ordine</label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
              placeholder="N. ordine"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Riferimento cliente</label>
            <input
              type="text"
              value={customerReference}
              onChange={(e) => setCustomerReference(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
              placeholder="Ref. cliente"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Origine</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
              placeholder="Citta origine"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Destinazione</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
              placeholder="Citta destinazione"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
              placeholder="Note opzionali..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={submitting}
            className="bg-brand-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-brand-primary-hover transition-colors disabled:opacity-50"
          >
            {submitting ? 'Salvataggio...' : 'Salva spedizione'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/shipments')}
            className="border border-slate-200 text-slate-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  )
}
