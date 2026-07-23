import { useEffect, useState } from 'react'
import { getCarriers } from '../lib/shipments'
import { trackShipment } from '../lib/tracking'
import type { Carrier } from '../types/tracking'

export default function Settings() {
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [loading, setLoading] = useState(true)
  const [testCarrier, setTestCarrier] = useState('fedex')
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState('')
  const [testTrackingNumber, setTestTrackingNumber] = useState('')

  useEffect(() => {
    getCarriers()
      .then(setCarriers)
      .finally(() => setLoading(false))
  }, [])

  const handleTestConnection = async () => {
    if (!testTrackingNumber) {
      setTestStatus('error')
      setTestMessage('Inserisci un numero di tracking per il test')
      return
    }

    setTestStatus('testing')
    setTestMessage('Test connessione in corso...')

    try {
      const result = await trackShipment(testCarrier, testTrackingNumber)
      setTestStatus('success')
      setTestMessage(`OK - Stato: ${result.status_description || result.status}`)
    } catch (error) {
      setTestStatus('error')
      setTestMessage(`Errore: ${error instanceof Error ? error.message : 'Connessione fallita'}`)
    }
  }

  const apiCarriers = carriers.filter(c => c.api_available)

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
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Configurazione API</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">FedEx Environment:</p>
              <p className="font-medium">{import.meta.env.VITE_FEDEX_ENVIRONMENT || 'Non configurato'}</p>
            </div>
            <div>
              <p className="text-slate-500">FedEx Endpoint:</p>
              <p className="font-medium text-xs break-all">{import.meta.env.VITE_FEDEX_BASE_URL || 'Non configurato'}</p>
            </div>
            <div>
              <p className="text-slate-500">FedEx API Key:</p>
              <p className="font-medium">{import.meta.env.VITE_FEDEX_API_KEY ? '••••••••' : 'Non configurato'}</p>
            </div>
            <div>
              <p className="text-slate-500">DHL API Key:</p>
              <p className="font-medium">{import.meta.env.VITE_DHL_API_KEY ? '••••••••' : 'Non configurato'}</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Test connessione</h3>
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <select
                value={testCarrier}
                onChange={(e) => setTestCarrier(e.target.value)}
                className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              >
                {apiCarriers.length > 0 ? (
                  apiCarriers.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))
                ) : (
                  <option value="fedex">FedEx</option>
                )}
              </select>
              <input
                type="text"
                placeholder="Numero di tracking di test"
                value={testTrackingNumber}
                onChange={(e) => setTestTrackingNumber(e.target.value)}
                className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              />
              <button
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                className="px-4 py-2.5 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary-hover disabled:opacity-50 min-h-[44px]"
              >
                {testStatus === 'testing' ? 'Test in corso...' : 'Testa'}
              </button>
            </div>

            {testMessage && (
              <div className={`p-2 rounded text-sm ${
                testStatus === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : testStatus === 'error'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-brand-primary/10 text-brand-primary'
              }`}>
                {testMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
