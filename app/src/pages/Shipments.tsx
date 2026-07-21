import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getShipments, getCarriers, createShipmentsBulk } from '../lib/shipments'
import { parseCSV, validateCSV, shipmentsToCSV, downloadCSV } from '../lib/csv'
import { STATUS_LABELS, STATUS_COLORS } from '../types/tracking'
import type { Shipment, ShipmentStatus, Carrier } from '../types/tracking'

type SortField = 'tracking_number' | 'carrier' | 'status' | 'customer_name' | 'destination' | 'last_update'
type SortDir = 'asc' | 'desc'

export default function Shipments() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | ''>('')
  const [carrierFilter, setCarrierFilter] = useState('')
  const [sortField, setSortField] = useState<SortField>('last_update')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const [importOpen, setImportOpen] = useState(false)
  const [importPreview, setImportPreview] = useState<Array<{ tracking_number: string; carrier_id: string; customer_name?: string }>>([])
  const [importErrors, setImportErrors] = useState<Array<{ row: number; message: string }>>([])
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getCarriers().then(setCarriers).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    getShipments({
      search: search || undefined,
      status: (statusFilter as ShipmentStatus) || undefined,
      carrier_id: carrierFilter || undefined,
      limit: 200,
    })
      .then(({ data, count }) => {
        setShipments(data)
        setCount(count)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [search, statusFilter, carrierFilter])

  const sorted = [...shipments].sort((a, b) => {
    let cmp = 0
    switch (sortField) {
      case 'tracking_number':
        cmp = a.tracking_number.localeCompare(b.tracking_number)
        break
      case 'carrier':
        cmp = (a.carrier?.name ?? '').localeCompare(b.carrier?.name ?? '')
        break
      case 'status':
        cmp = a.status.localeCompare(b.status)
        break
      case 'customer_name':
        cmp = (a.customer_name ?? '').localeCompare(b.customer_name ?? '')
        break
      case 'destination':
        cmp = (a.destination ?? '').localeCompare(b.destination ?? '')
        break
      case 'last_update':
        cmp = (a.last_update ?? '').localeCompare(b.last_update ?? '')
        break
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <span className="text-slate-300 ml-1">↕</span>
    return <span className="text-brand-primary ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  function handleExport() {
    const csv = shipmentsToCSV(sorted)
    const date = new Date().toISOString().slice(0, 10)
    downloadCSV(csv, `spedizioni-vetronaviglio-${date}.csv`)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportErrors([])
    setImportPreview([])

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const rows = parseCSV(text)
      const { valid, errors } = validateCSV(rows, carriers)
      setImportPreview(valid)
      setImportErrors(errors)
    }
    reader.readAsText(file)
  }

  async function handleImport() {
    if (importPreview.length === 0) return
    setImporting(true)
    setError(null)
    try {
      await createShipmentsBulk(importPreview)
      setImportOpen(false)
      setImportPreview([])
      setImportErrors([])
      if (fileInputRef.current) fileInputRef.current.value = ''
      const { data, count } = await getShipments({
        search: search || undefined,
        status: (statusFilter as ShipmentStatus) || undefined,
        carrier_id: carrierFilter || undefined,
        limit: 200,
      })
      setShipments(data)
      setCount(count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante l\'importazione')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Spedizioni</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setImportOpen(true)}
            className="border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Importa CSV
          </button>
          <button
            onClick={handleExport}
            disabled={sorted.length === 0}
            className="border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Esporta CSV
          </button>
          <Link
            to="/shipments/new"
            className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-primary-hover transition-colors"
          >
            + Nuova spedizione
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Cerca per tracking, cliente, riferimento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ShipmentStatus | '')}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
        >
          <option value="">Tutti gli stati</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={carrierFilter}
          onChange={(e) => setCarrierFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
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
      ) : sorted.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400">Nessuna spedizione trovata</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th onClick={() => handleSort('tracking_number')} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase cursor-pointer hover:text-slate-700 select-none">
                  Tracking <SortIcon field="tracking_number" />
                </th>
                <th onClick={() => handleSort('carrier')} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase cursor-pointer hover:text-slate-700 select-none">
                  Corriere <SortIcon field="carrier" />
                </th>
                <th onClick={() => handleSort('status')} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase cursor-pointer hover:text-slate-700 select-none">
                  Stato <SortIcon field="status" />
                </th>
                <th onClick={() => handleSort('customer_name')} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase cursor-pointer hover:text-slate-700 select-none">
                  Cliente <SortIcon field="customer_name" />
                </th>
                <th onClick={() => handleSort('destination')} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase cursor-pointer hover:text-slate-700 select-none">
                  Destinazione <SortIcon field="destination" />
                </th>
                <th onClick={() => handleSort('last_update')} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase cursor-pointer hover:text-slate-700 select-none">
                  Ultimo aggiornamento <SortIcon field="last_update" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((shipment) => (
                <tr key={shipment.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      to={`/shipments/${shipment.id}`}
                      className="text-sm font-mono text-brand-primary hover:text-brand-primary-hover hover:underline"
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

      {/* Import Modal */}
      {importOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Importa spedizioni da CSV</h3>

            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-2">
                Il file CSV deve contenere le colonne: <code className="bg-slate-100 px-1 rounded">tracking_number</code> e <code className="bg-slate-100 px-1 rounded">carrier_code</code> (obbligatorie).
                Colonne opzionali: customer_name, customer_reference, order_number, origin, destination, notes.
              </p>
              <p className="text-xs text-slate-500">
                Codici corriere validi: {carriers.map(c => c.code).join(', ')}
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm mb-4"
            />

            {importErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 max-h-40 overflow-y-auto">
                {importErrors.map((err, i) => (
                  <p key={i} className="text-xs text-red-700">Riga {err.row}: {err.message}</p>
                ))}
              </div>
            )}

            {importPreview.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-emerald-700 font-medium">
                  {importPreview.length} spedizioni pronte per l'importazione
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setImportOpen(false)
                  setImportPreview([])
                  setImportErrors([])
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Annulla
              </button>
              <button
                onClick={handleImport}
                disabled={importPreview.length === 0 || importing}
                className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-primary-hover disabled:opacity-50"
              >
                {importing ? 'Importazione...' : `Importa ${importPreview.length} spedizioni`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
