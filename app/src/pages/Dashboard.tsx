import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardStats, getShipments, getCarrierStats } from '../lib/shipments'
import { STATUS_LABELS, STATUS_COLORS } from '../types/tracking'
import type { DashboardStats, Shipment } from '../types/tracking'
import StatusPieChart from '../components/charts/StatusPieChart'
import CarrierBarChart from '../components/charts/CarrierBarChart'

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentShipments, setRecentShipments] = useState<Shipment[]>([])
  const [carrierStats, setCarrierStats] = useState<{ name: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshResult, setRefreshResult] = useState<string | null>(null)
  const [syncingFedEx, setSyncingFedEx] = useState(false)
  const [fedExSyncResult, setFedExSyncResult] = useState<string | null>(null)
  const lastFedExSync = localStorage.getItem('fedex_last_sync')

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getShipments({ limit: 5 }),
      getCarrierStats(),
    ])
      .then(([statsData, shipmentsData, carrierData]) => {
        setStats(statsData)
        setRecentShipments(shipmentsData.data)
        setCarrierStats(carrierData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    setRefreshResult(null)
    try {
      const res = await fetch('/api/cron/refresh-tracking', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setRefreshResult(`Errore: ${data.error}`)
      } else {
        const lines: string[] = []
        if (data.carriers) {
          for (const [code, r] of Object.entries(data.carriers) as [string, { updated: number; unchanged: number; errors: number }][]) {
            lines.push(`${code}: ${r.updated} aggiornati, ${r.unchanged} invariati, ${r.errors} errori`)
          }
        }
        setRefreshResult(`${lines.join(' — ')} (${data.duration_ms}ms)`)
        // Reload data after refresh
        const [statsData, shipmentsData, carrierData] = await Promise.all([
          getDashboardStats(),
          getShipments({ limit: 5 }),
          getCarrierStats(),
        ])
        setStats(statsData)
        setRecentShipments(shipmentsData.data)
        setCarrierStats(carrierData)
      }
    } catch (err) {
      setRefreshResult(`Errore di connessione: ${err instanceof Error ? err.message : 'sconosciuto'}`)
    } finally {
      setRefreshing(false)
    }
  }

  const handleFedExSync = async () => {
    setSyncingFedEx(true)
    setFedExSyncResult(null)
    try {
      const res = await fetch('/api/discover', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          setFedExSyncResult('Sessione FedEx scaduta — esegui `node scripts/discover-fedex.mjs` per ri-login')
        } else {
          setFedExSyncResult(`Errore: ${data.error}`)
        }
      } else {
        localStorage.setItem('fedex_last_sync', new Date().toISOString())
        const msg = data.imported > 0
          ? `Sync FedEx: ${data.imported} nuove spedizioni importate (${data.fedex_count} da FedEx, ${data.supabase_before} in DB)`
          : `Sync FedEx: tutto sincronizzato (${data.fedex_count} spedizioni FedEx, nessuna nuova)`
        setFedExSyncResult(`${msg} (${data.duration_ms}ms)`)
        const [statsData, shipmentsData, carrierData] = await Promise.all([
          getDashboardStats(),
          getShipments({ limit: 5 }),
          getCarrierStats(),
        ])
        setStats(statsData)
        setRecentShipments(shipmentsData.data)
        setCarrierStats(carrierData)
      }
    } catch (err) {
      setFedExSyncResult(`Errore di connessione: ${err instanceof Error ? err.message : 'sconosciuto'}`)
    } finally {
      setSyncingFedEx(false)
    }
  }

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
        <p className="text-red-700 font-medium">Errore nel caricamento</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          {lastFedExSync && (
            <p className="text-xs text-slate-400 mt-1">Ultimo sync FedEx: {new Date(lastFedExSync).toLocaleString('it-IT')}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleFedExSync}
            disabled={syncingFedEx}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className={`w-4 h-4 ${syncingFedEx ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {syncingFedEx ? 'Sync...' : 'Sync FedEx'}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Aggiornamento...' : 'Aggiorna tracking'}
          </button>
        </div>
      </div>
      {refreshResult && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${refreshResult.startsWith('Errore') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {refreshResult}
        </div>
      )}
      {fedExSyncResult && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${fedExSyncResult.startsWith('Errore') || fedExSyncResult.startsWith('Sessione') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {fedExSyncResult}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Totale spedizioni" value={stats?.total_shipments ?? 0} color="text-slate-800" icon="📦" />
        <StatCard label="In transito" value={stats?.in_transit ?? 0} color="text-amber-600" icon="🚚" />
        <StatCard label="Consegnate" value={stats?.delivered ?? 0} color="text-emerald-600" icon="✅" />
        <StatCard label="Eccezioni" value={stats?.exceptions ?? 0} color="text-red-600" icon="⚠️" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Distribuzione per stato</h2>
          <StatusPieChart stats={stats!} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Spedizioni per corriere</h2>
          <CarrierBarChart data={carrierStats} />
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-700">Attivita recente</h2>
          <Link to="/shipments" className="text-sm text-brand-primary hover:text-brand-primary-hover font-medium">
            Vedi tutte →
          </Link>
        </div>
        {recentShipments.length === 0 ? (
          <p className="text-slate-400 text-sm">Nessuna spedizione recente.</p>
        ) : (
          <div className="space-y-3">
            {recentShipments.map((shipment) => (
              <Link
                key={shipment.id}
                to={`/shipments/${shipment.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-mono font-medium text-slate-700">{shipment.tracking_number}</p>
                    <p className="text-xs text-slate-500">{shipment.carrier?.name ?? '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[shipment.status]}`}>
                    {STATUS_LABELS[shipment.status]}
                  </span>
                  <span className="text-xs text-slate-500">
                    {shipment.last_update ? new Date(shipment.last_update).toLocaleString('it-IT') : '—'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
