import { useEffect, useState } from 'react'
import { getCarriers } from '../lib/shipments'
import { trackShipment } from '../lib/tracking'
import type { Carrier } from '../types/tracking'

type CredField = { key: string; label: string; sensitive: boolean; placeholder: string | null; set: boolean }
type CredCarrier = { carrierId: string; name: string; fields: CredField[] }

export default function Settings() {
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [credConfig, setCredConfig] = useState<Record<string, CredCarrier>>({})
  const [loading, setLoading] = useState(true)
  const [editingCarrier, setEditingCarrier] = useState<string | null>(null)
  const [credForm, setCredForm] = useState<Record<string, string>>({})
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [testCarrier, setTestCarrier] = useState('fedex')
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState('')
  const [testTrackingNumber, setTestTrackingNumber] = useState('')

  useEffect(() => {
    Promise.all([
      getCarriers(),
      fetch('/api/settings/credentials').then(r => r.json()).then(d => d.credentials || {}).catch(() => ({})),
    ])
      .then(([carriersData, credData]) => {
        setCarriers(carriersData)
        setCredConfig(credData)
      })
      .finally(() => setLoading(false))
  }, [])

  function startEdit(carrierCode: string, config: CredCarrier) {
    const vals: Record<string, string> = {}
    config.fields.forEach(f => vals[f.key] = '')
    setCredForm(vals)
    setEditingCarrier(carrierCode)
    setSaveMsg(null)
  }

  function toggleVisibility(key: string) {
    setVisibleFields(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function handleSave() {
    if (!editingCarrier) return
    setSaving(true)
    setSaveMsg(null)
    try {
      const res = await fetch('/api/settings/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrierCode: editingCarrier, credentials: credForm }),
      })
      if (!res.ok) throw new Error(await res.text())
      setSaveMsg({ type: 'success', text: 'Credenziali salvate con successo' })
      // Refresh config
      const r2 = await fetch('/api/settings/credentials').then(r => r.json())
      if (r2.credentials) setCredConfig(r2.credentials)
      setTimeout(() => setEditingCarrier(null), 1500)
    } catch (err) {
      setSaveMsg({ type: 'error', text: err instanceof Error ? err.message : 'Errore durante il salvataggio' })
    } finally {
      setSaving(false)
    }
  }

  const apiCarriers = carriers.filter(c => c.api_available)

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Impostazioni</h1>

      {/* Credenziali corrieri */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Credenziali corrieri</h2>
        <p className="text-sm text-slate-500 mb-4">
          Gestisci le chiavi API dei corrieri. Le credenziali vengono usate dal sistema per tracciare le spedizioni in automatico.
        </p>

        {loading ? (
          <p className="text-slate-400 text-sm">Caricamento...</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(credConfig).map(([code, config]) => (
              <div key={code} className="border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-t-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{config.name}</p>
                    <p className="text-xs text-slate-400">Codice: {code}</p>
                  </div>
                  <button
                    onClick={() => startEdit(code, config)}
                    className="text-sm text-brand-primary hover:text-brand-primary-hover font-medium"
                  >
                    {config.fields.some(f => f.set) ? 'Modifica' : 'Configura'}
                  </button>
                </div>

                {editingCarrier === code && (
                  <div className="p-4 border-t border-slate-200 space-y-3">
                    {config.fields.map(field => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {field.label}
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              type={visibleFields.has(field.key) ? 'text' : 'password'}
                              value={credForm[field.key] || ''}
                              onChange={e => setCredForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                              placeholder={field.set ? '•••••••• (lascia vuoto per mantenere)' : field.placeholder || 'Inserisci valore'}
                              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40 pr-10"
                            />
                            {field.sensitive && (
                              <button
                                type="button"
                                onClick={() => toggleVisibility(field.key)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                              >
                                {visibleFields.has(field.key) ? '🙈' : '👁'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-primary-hover disabled:opacity-50"
                      >
                        {saving ? 'Salvataggio...' : 'Salva'}
                      </button>
                      <button
                        onClick={() => setEditingCarrier(null)}
                        className="border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50"
                      >
                        Annulla
                      </button>
                    </div>
                    {saveMsg && (
                      <div className={`p-2 rounded text-sm ${
                        saveMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {saveMsg.text}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Corrieri configurati */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Stato corrieri</h2>
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

      {/* Test connessione */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Test connessione</h2>
        <div className="space-y-4">
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
              onClick={async () => {
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
              }}
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
  )
}
