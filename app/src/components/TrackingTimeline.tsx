import type { TrackingEvent } from '../types/tracking'

const STATUS_ICONS: Record<string, string> = {
  pending: '📦',
  picked_up: '📬',
  in_transit: '🚚',
  out_for_delivery: '📭',
  delivered: '✅',
  exception: '⚠️',
  returned: '↩️',
}

const STATUS_DOT_COLORS: Record<string, string> = {
  pending: 'bg-slate-400',
  picked_up: 'bg-blue-500',
  in_transit: 'bg-amber-500',
  out_for_delivery: 'bg-indigo-500',
  delivered: 'bg-emerald-500',
  exception: 'bg-red-500',
  returned: 'bg-orange-500',
}

const STATUS_LINE_COLORS: Record<string, string> = {
  pending: 'bg-slate-200',
  picked_up: 'bg-blue-200',
  in_transit: 'bg-amber-200',
  out_for_delivery: 'bg-indigo-200',
  delivered: 'bg-emerald-200',
  exception: 'bg-red-200',
  returned: 'bg-orange-200',
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Ora'
  if (diffMins < 60) return `${diffMins} min fa`
  if (diffHours < 24) return `${diffHours} ore fa`
  if (diffDays === 1) return 'Ieri'
  if (diffDays < 7) return `${diffDays} giorni fa`
  return date.toLocaleDateString('it-IT')
}

export default function TrackingTimeline({ events }: { events: TrackingEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-sm">Nessun evento di tracking registrato</p>
      </div>
    )
  }

  return (
    <div className="relative pl-1">
      {events.map((event, index) => {
        const isLatest = index === 0
        const status = event.status.toLowerCase()
        const icon = STATUS_ICONS[status] ?? '📦'
        const dotColor = STATUS_DOT_COLORS[status] ?? 'bg-slate-400'
        const lineColor = STATUS_LINE_COLORS[status] ?? 'bg-slate-200'

        return (
          <div
            key={event.id}
            className="timeline-item flex gap-4 group"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="flex flex-col items-center">
              <div className={`relative w-5 h-5 rounded-full flex items-center justify-center
                ${dotColor} ${isLatest ? 'timeline-dot-latest ring-4 ring-white' : ''}`}
              >
                <span className="text-[10px] leading-none text-white">{icon}</span>
              </div>
              {!isLatest && (
                <div className={`w-0.5 flex-1 ${lineColor} mt-1`} />
              )}
            </div>
            <div className={`pb-6 flex-1 min-w-0 ${isLatest ? '' : ''}`}>
              <div className={`bg-white rounded-lg border transition-all duration-200
                ${isLatest
                  ? 'border-brand-primary/30 shadow-sm shadow-brand-primary/5'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}
              >
                <div className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${isLatest ? 'text-brand-primary-dark' : 'text-slate-700'}`}>
                      {event.description ?? event.status}
                    </p>
                    {isLatest && (
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
                        Ultimo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {event.location && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <span>📍</span>
                        {event.location}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <span>🕐</span>
                      {formatRelativeTime(event.event_timestamp)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(event.event_timestamp).toLocaleString('it-IT')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
