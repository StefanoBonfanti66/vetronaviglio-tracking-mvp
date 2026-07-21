import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Shipments from './pages/Shipments'
import ShipmentDetail from './pages/ShipmentDetail'
import ShipmentForm from './pages/ShipmentForm'
import ShipmentEdit from './pages/ShipmentEdit'
import Settings from './pages/Settings'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/shipments" element={<Shipments />} />
        <Route path="/shipments/new" element={<ShipmentForm />} />
        <Route path="/shipments/:id" element={<ShipmentDetail />} />
        <Route path="/shipments/:id/edit" element={<ShipmentEdit />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
