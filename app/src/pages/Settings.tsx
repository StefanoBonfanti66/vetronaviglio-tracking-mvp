import { useEffect, useState } from 'react'
import { getCarriers } from '../lib/shipments'
import type { Carrier } from '../types/tracking'

export default function Settings() {
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCarriers()
      .then(setCarriers)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Impostazioni</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Corrieri configurati</h2>

        {loading ? (
          <p className="text-slate-400 text-sm">Caricamento...</p>
        ) : (
          <div className="space-y-3">
            {carriers.map((carrier) => (
              <div
                key={carrier.id}
                className="flex items-center justify-between p-3 border border-slate-100 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700">{carrier.name}</p>
                  <p className="text-xs text-slate-400">Codice: {carrier.code}</p>
                </div>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    carrier.api_available
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {carrier.api_available ? 'API disponibile' : 'Solo manuale'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Configurazione FedEx API</h2>
        <p className="text-sm text-slate-500">
          La chiave API FedEx dovra essere configurata nelle variabili d&apos;ambiente.
          Consulta il runbook per istruzioni dettagliate.
        </p>
      </div>
    </div>
  )
}
