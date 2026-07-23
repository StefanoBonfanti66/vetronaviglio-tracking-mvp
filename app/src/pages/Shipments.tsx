import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getShipments, getCarriers, createShipmentsBulk } from '../lib/shipments'
import { parseCSV, validateCSV, shipmentsToCSV, downloadCSV, generateCSVTemplate, detectCarrierFromHeaders } from '../lib/csv'
import { STATUS_LABELS, STATUS_COLORS } from '../types/tracking'
import type { Shipment, ShipmentStatus, Carrier } from '../types/tracking'

type SortField = 'tracking_number' | 'carrier' | 'status' | 'customer_name' | 'destination' | 'last_update'
type SortDir = 'asc' | 'desc'

const PAGE_SIZES = [20, 50, 100]
const MAX_VISIBLE_PAGES = 7

function PaginationBar({
  page,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: {
  page: number
  totalPages: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}) {
  const startItem = (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, totalCount)

  const pages: (number | 'ellipsis')[] = []
  if (totalPages <= MAX_VISIBLE_PAGES) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('ellipsis')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push('ellipsis')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>{startItem}–{endItem} di {totalCount}</span>
        <span className="text-slate-300">|</span>
        <span>Righe:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="border border-slate-200 rounded text-xs px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-2.5 py-1 text-xs font-medium rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ‹ Prev
        </button>
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e-${i}`} className="px-1 text-xs text-slate-400">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
                p === page
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-2.5 py-1 text-xs font-medium rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next ›
        </button>
      </div>
    </div>
  )
}

export default function Shipments() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | ''>('')
  const [carrierFilter, setCarrierFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortField, setSortField] = useState<SortField>('last_update')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const [importOpen, setImportOpen] = useState(false)
  const [importPreview, setImportPreview] = useState<Array<{ tracking_number: string; carrier_id: string; customer_name?: string }>>([])
  const [importErrors, setImportErrors] = useState<Array<{ row: number; message: string }>>([])
  const [importing, setImporting] = useState(false)
  const [importCarrierCode, setImportCarrierCode] = useState('')
  const [importNeedsCarrier, setImportNeedsCarrier] = useState(false)
  const [pendingCsvRows, setPendingCsvRows] = useState<string[][]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getCarriers().then(setCarriers).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const offset = (page - 1) * pageSize
    getShipments({
      search: search || undefined,
      status: (statusFilter as ShipmentStatus) || undefined,
      carrier_id: carrierFilter || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      sort_field: sortField,
      sort_dir: sortDir,
      limit: pageSize,
      offset,
    })
      .then(({ data, count }) => {
        setShipments(data)
        setCount(count)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [search, statusFilter, carrierFilter, dateFrom, dateTo, sortField, sortDir, page, pageSize])

  function handleSort(field: SortField) {
    if (sortField === field) {
      const newDir = sortDir === 'asc' ? 'desc' : 'asc'
      setSortDir(newDir)
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setPage(1)
  }

  function handleFilterChange(setter: (...args: any[]) => void, ...args: any[]) {
    setter(...args)
    setPage(1)
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <span className="text-slate-300 ml-1">↕</span>
    return <span className="text-brand-primary ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  function handleExport() {
    const csv = shipmentsToCSV(shipments)
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
      if (rows.length < 2) {
        setImportErrors([{ row: 0, message: 'File vuoto o senza dati' }])
        return
      }
      const headers = rows[0].map(h => h.toLowerCase().trim())
      const hasCarrier = headers.includes('carrier_code')
      setPendingCsvRows(rows)
      if (hasCarrier) {
        setImportNeedsCarrier(false)
        const { valid, errors } = validateCSV(rows, carriers)
        setImportPreview(valid)
        setImportErrors(errors)
      } else {
        const detected = detectCarrierFromHeaders(rows)
        if (detected && carriers.length > 0) {
          const { valid, errors } = validateCSV(rows, carriers, detected)
          setImportPreview(valid)
          setImportErrors(errors)
        } else {
          setImportNeedsCarrier(true)
          setImportCarrierCode(detected ?? '')
          setImportErrors([{ row: 0, message: 'Colonna "carrier_code" non trovata — seleziona il corriere qui sotto' }])
        }
      }
    }
    reader.readAsText(file)
  }

  function handleCarrierConfirm() {
    if (!importCarrierCode || pendingCsvRows.length === 0) return
    const { valid, errors } = validateCSV(pendingCsvRows, carriers, importCarrierCode)
    setImportPreview(valid)
    setImportErrors(errors.filter(e => !e.message.includes('carrier_code')))
    setImportNeedsCarrier(false)
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
      setImportNeedsCarrier(false)
      setImportCarrierCode('')
      setPendingCsvRows([])
      if (fileInputRef.current) fileInputRef.current.value = ''
      const offset = (page - 1) * pageSize
      const { data, count } = await getShipments({
        search: search || undefined,
        status: (statusFilter as ShipmentStatus) || undefined,
        carrier_id: carrierFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        sort_field: sortField,
        sort_dir: sortDir,
        limit: pageSize,
        offset,
      })
      setShipments(data)
      setCount(count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante l\'importazione')
    } finally {
      setImporting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(count / pageSize))

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
            disabled={shipments.length === 0}
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
          onChange={(e) => handleFilterChange(setSearch, e.target.value)}
          className="flex-1 min-w-[200px] border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
        />
        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange(setStatusFilter, e.target.value as ShipmentStatus | '')}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
        >
          <option value="">Tutti gli stati</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={carrierFilter}
          onChange={(e) => handleFilterChange(setCarrierFilter, e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
        >
          <option value="">Tutti i corrieri</option>
          {carriers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => handleFilterChange(setDateFrom, e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
          title="Dal"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => handleFilterChange(setDateTo, e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-transparent"
          title="Al"
        />
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
              {shipments.map((shipment) => (
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
          <PaginationBar
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalCount={count}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        </div>
      )}

      {/* Import Modal */}
      {importOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Importa spedizioni da CSV</h3>

            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-2">
                Il file CSV deve contenere la colonna <code className="bg-slate-100 px-1 rounded">tracking_number</code> (obbligatoria).
                Se manca <code className="bg-slate-100 px-1 rounded">carrier_code</code>, potrai selezionare il corriere dopo il caricamento.
                Supporta file con separatori virgola o tab, e intestazioni in italiano (es. "Numero di monitoraggio").
              </p>
              <p className="text-xs text-slate-500 mb-2">
                Codici corriere validi: {carriers.map(c => c.code).join(', ')}
              </p>
              <button
                onClick={() => {
                  const csv = generateCSVTemplate()
                  downloadCSV(csv, `template-spedizioni.csv`)
                }}
                className="text-xs text-brand-primary hover:text-brand-primary-hover hover:underline font-medium"
              >
                Scarica template CSV
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm mb-4"
            />

            {importNeedsCarrier && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Seleziona corriere per questo import</label>
                <div className="flex gap-2">
                  <select
                    value={importCarrierCode}
                    onChange={(e) => setImportCarrierCode(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                  >
                    <option value="">-- Seleziona corriere --</option>
                    {carriers.map(c => (
                      <option key={c.id} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleCarrierConfirm}
                    disabled={!importCarrierCode}
                    className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-primary-hover disabled:opacity-50"
                  >
                    Conferma
                  </button>
                </div>
              </div>
            )}

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
                  setImportNeedsCarrier(false)
                  setImportCarrierCode('')
                  setPendingCsvRows([])
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
