import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import ComingSoon from './pages/ComingSoon'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/forecast" element={<Dashboard />} />
      <Route path="/favorites" element={<ComingSoon title="Favoritos" />} />
      <Route path="/about" element={<ComingSoon title="Sobre" />} />
      <Route path="*" element={<ComingSoon title="Página não encontrada" />} />
    </Routes>
  )
}
