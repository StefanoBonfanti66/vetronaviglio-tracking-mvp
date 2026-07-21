import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getShipments, getCarriers } from '../lib/shipments'
import { STATUS_LABELS, STATUS_COLORS } from '../types/tracking'
import type { Shipment, ShipmentStatus, Carrier } from '../types/tracking'

export default function Shipments() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | ''>('')
  const [carrierFilter, setCarrierFilter] = useState('')

  useEffect(() => {
    getCarriers().then(setCarriers).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    getShipments({
      search: search || undefined,
      status: (statusFilter as ShipmentStatus) || undefined,
      carrier_id: carrierFilter || undefined,
      limit: 50,
    })
      .then(({ data, count }) => {
        setShipments(data)
        setCount(count)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [search, statusFilter, carrierFilter])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Spedizioni</h1>
        <Link
          to="/shipments/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nuova spedizione
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Cerca per tracking, cliente, riferimento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ShipmentStatus | '')}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tutti gli stati</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={carrierFilter}
          onChange={(e) => setCarrierFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tutti i corrieri</option>
          {carriers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-slate-400">Caricamento...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-700 font-medium">Errore: {error}</p>
        </div>
      ) : shipments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400">Nessuna spedizione trovata</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Tracking</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Corriere</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Stato</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Destinazione</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Ultimo aggiornamento</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment) => (
                <tr key={shipment.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      to={`/shipments/${shipment.id}`}
                      className="text-sm font-mono text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {shipment.tracking_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{shipment.carrier?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[shipment.status]}`}>
                      {STATUS_LABELS[shipment.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{shipment.customer_name ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{shipment.destination ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {shipment.last_update ? new Date(shipment.last_update).toLocaleString('it-IT') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-xs text-slate-500">{count} spedizioni totali</p>
          </div>
        </div>
      )}
    </div>
  )
}
