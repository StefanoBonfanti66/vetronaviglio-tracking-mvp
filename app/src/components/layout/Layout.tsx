import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden mb-4 p-2 -ml-1 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
            aria-label="Apri menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
