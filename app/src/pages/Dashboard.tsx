import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardStats, getShipments } from '../lib/shipments'
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

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getShipments({ limit: 5 }),
    ])
      .then(([statsData, shipmentsData]) => {
        setStats(statsData)
        setRecentShipments(shipmentsData.data)

        // Calcola stats per corriere
        const carrierMap = new Map<string, number>()
        shipmentsData.data.forEach((s) => {
          const name = s.carrier?.name ?? 'Sconosciuto'
          carrierMap.set(name, (carrierMap.get(name) ?? 0) + 1)
        })
        setCarrierStats(
          Array.from(carrierMap.entries()).map(([name, count]) => ({ name, count }))
        )
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

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
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

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
          <Link to="/shipments" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
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
