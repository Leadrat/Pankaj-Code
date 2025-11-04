import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function ChatUI({ messages, onSend, loading, onClear }) {
  const inputRef = useRef(null)
  const endRef = useRef(null)
  const loadingPhrases = [
    'KrishiBot is understanding your question…',
    'KrishiBot is thinking…',
    'Analyzing your data…',
    'Generating insights…'
  ]
  const idxRef = useRef(0)
  const [ , forceUpdate ] = useState({})

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!loading) return
    idxRef.current = 0
    const t = setInterval(() => {
      idxRef.current = (idxRef.current + 1) % loadingPhrases.length
      // force a re-render
      forceUpdate({})
    }, 900)
    return () => clearInterval(t)
  }, [loading])

  const handleSubmit = (e) => {
    e.preventDefault()
    const v = inputRef.current.value.trim()
    if (!v || loading) return
    onSend(v)
    inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col h-[calc(100vh-160px)]">
      <div className="flex-1 overflow-y-auto space-y-4 p-2">
        {/* Welcome */}
        {messages.length === 0 && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center">🌾</div>
            <div className="bg-white border rounded-2xl px-4 py-3 shadow-sm max-w-xl">
              <div className="font-semibold">Hi! I’m KrishiBot</div>
              <div className="text-sm text-gray-700 mt-1">Ask me about crops, fertilizers, or rainfall trends. I’ll use your datasets and show charts.</div>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
            <div className={`flex items-start gap-3 max-w-3xl ${m.role==='user'?'flex-row-reverse':''}`}>
              <div className={`w-10 h-10 rounded-full ${m.role==='user'?'bg-green-600 text-white':'bg-white border'} flex items-center justify-center`}>{m.role==='user'?'🧑':'🤖'}</div>
              <div className={`${m.role==='user'
                  ? 'bg-green-600 text-white border-green-600'
                  : m.kind==='ai'
                    ? 'bg-blue-50 text-blue-900 border-blue-300'
                    : m.kind==='data'
                      ? 'bg-green-50 text-green-900 border-green-300'
                      : 'bg-white text-gray-900 border-gray-200'
                } rounded-2xl px-4 py-3 shadow-sm border`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.text}</div>
                {m.chartData && m.renderChart && (
                  <div className="mt-3">{m.renderChart(m.chartData)}</div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 text-gray-700 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm">{loadingPhrases[idxRef.current]}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
        <input ref={inputRef} placeholder="Type your question…" className="flex-1 border rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
        <button type="submit" disabled={loading} className="px-5 py-3 rounded-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">Send</button>
        <button type="button" onClick={onClear} className="px-4 py-3 rounded-full border">Clear Chat</button>
      </form>
    </div>
  )
}
