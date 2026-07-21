import { useEffect, useState } from 'react'
import { getDashboardStats } from '../lib/shipments'
import type { DashboardStats } from '../types/tracking'

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Totale spedizioni" value={stats?.total_shipments ?? 0} color="text-slate-800" />
        <StatCard label="In transito" value={stats?.in_transit ?? 0} color="text-amber-600" />
        <StatCard label="Consegnate" value={stats?.delivered ?? 0} color="text-emerald-600" />
        <StatCard label="Eccezioni" value={stats?.exceptions ?? 0} color="text-red-600" />
      </div>

      <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Attivita recente</h2>
        <p className="text-slate-400 text-sm">Le ultime aggiornamenti delle spedizioni appariranno qui.</p>
      </div>
    </div>
  )
}
