import { useState } from 'react'
import SearchBar from '../components/SearchBar'
import ResultCard from '../components/ResultCard'
import ChartDisplay from '../components/ChartDisplay'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [answer, setAnswer] = useState('')
  const [chartData, setChartData] = useState(null)
  const [history, setHistory] = useState([])
  const [q, setQ] = useState('')

  const samples = [
    'Which fertilizer type gives the best results for a crop?',
    'How does rainfall affect wheat yield in Punjab?',
    'Best crops for loamy soil in Haryana',
    'How does the average temperature affect the yield of each crop?',
    'Which state has the highest average temperature over the years?'
  ]

  const onAsk = async (question) => {
    setLoading(true)
    setError('')
    try {
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:5001'
      const res = await fetch(`${base}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Request failed')
      setAnswer(data.answer)
      setChartData(data.chartData)
      setHistory(h => [{ q: question, a: data.answer, c: data.chartData, ts: Date.now() }, ...h].slice(0, 10))
    } catch (e) {
      setError(e.message)
      setAnswer('')
      setChartData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-green-600 to-emerald-500">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Agri Insight</h1>
          <p className="text-white/90 mt-2 max-w-2xl">Ask questions about crops, climate, rainfall, and fertilizers. Get data-backed insights with clear explanations and charts.</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
          <SearchBar value={q} onChange={setQ} onAsk={onAsk} loading={loading} />
          {error && <div className="text-red-600 mt-3">{error}</div>}

          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">Try one of these</div>
            <div className="flex flex-wrap gap-2">
              {samples.map((s, i) => (
                <button key={i} className="px-3 py-1 text-sm border rounded-full hover:bg-gray-100" onClick={() => setQ(s)} disabled={loading}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        {answer && <ResultCard answer={answer} />}
        {chartData && <ChartDisplay data={chartData} />}

        <section className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-white border rounded">
            <div className="font-semibold">Data-backed</div>
            <p className="text-sm text-gray-700 mt-1">Summaries reference your datasets for transparent, reproducible insights.</p>
          </div>
          <div className="p-4 bg-white border rounded">
            <div className="font-semibold">Visual-first</div>
            <p className="text-sm text-gray-700 mt-1">Switch between bar, line, and pie to view trends and distributions.</p>
          </div>
          <div className="p-4 bg-white border rounded">
            <div className="font-semibold">Smart parsing</div>
            <p className="text-sm text-gray-700 mt-1">Understands crop names, soils, fertilizers, rainfall and climate keywords.</p>
          </div>
        </section>

        <div className="h-10" />
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-4 text-sm text-gray-600">© {new Date().getFullYear()} Agri Insight</div>
      </footer>
    </div>
  )
}
