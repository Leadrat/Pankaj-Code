import { useState, useCallback } from 'react'
import ChatUI from '../components/ChatUI'
import ChartDisplay from '../components/ChartDisplay'

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const renderChart = useCallback((chartData) => {
    return <ChartDisplay data={chartData} />
  }, [])

  const onSend = async (question) => {
    const userMsg = { role: 'user', text: question }
    setMessages(m => [...m, userMsg])
    setLoading(true)
    try {
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:5001'
      const history = messages.slice(-6).map(m => ({ role: m.role, text: m.text }))
      const res = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history, insight_mode: true, allow_generic: true })
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Request failed')
      if (typeof data.dataInsight !== 'undefined' || typeof data.aiInsight !== 'undefined') {
        const next = []
        if (data.aiInsight) {
          next.push({ role: 'assistant', kind: 'ai', text: `AI Insight 💡: ${data.aiInsight}` })
        }
        if (data.dataInsight) {
          next.push({ role: 'assistant', kind: 'data', text: `Data Insight 📊: ${data.dataInsight}`, chartData: data.chartData, renderChart })
        }
        if (next.length === 0) {
          next.push({ role: 'assistant', text: 'No response' })
        }
        setMessages(m => [...m, ...next])
      } else {
        // Fallback to single answer format
        const botMsg = { role: 'assistant', text: data.answer || 'No response', chartData: data.chartData, renderChart }
        setMessages(m => [...m, botMsg])
      }
    } catch (e) {
      const errMsg = { role: 'assistant', text: `Error: ${e.message}` }
      setMessages(m => [...m, errMsg])
    } finally {
      setLoading(false)
    }
  }

  const onClear = () => setMessages([])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-green-600 to-emerald-500">
        <div className="container mx-auto px-4 py-8 relative">
          <h1 className="text-2xl md:text-3xl font-bold text-white">KrishiBot Chat</h1>
          <p className="text-white/90 mt-1 max-w-2xl">Ask agriculture questions. I analyze your datasets, ground the answer, and show charts.</p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
          <ChatUI messages={messages} onSend={onSend} loading={loading} onClear={onClear} />
        </div>
      </main>
      <footer className="border-t">
        <div className="container mx-auto px-4 py-4 text-sm text-gray-600">Built with ❤️ by Pankaj Joshi</div>
      </footer>
    </div>
  )
}
