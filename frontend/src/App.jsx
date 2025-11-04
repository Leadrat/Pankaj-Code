import { Link, Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import ChatPage from './pages/ChatPage'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">🌾</span>
            <span className="font-semibold">Agri Insight</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <NavLink to="/" end className={({isActive}) => isActive ? 'text-green-700 font-medium' : 'text-gray-700 hover:text-green-700'}>Home</NavLink>
            <NavLink to="/chat" className={({isActive}) => isActive ? 'text-green-700 font-medium' : 'text-gray-700 hover:text-green-700'}>Chat</NavLink>
          </div>
        </div>
      </nav>
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>
    </div>
  )
}
