import { useState } from 'react'
import { Bar, Line, Pie, Bubble } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend)

export default function ChartDisplay({ data }) {
  const initialType = data.type || (data.datasets ? 'line' : 'bar')
  const labels = data.labels || []
  const datasets = data.datasets || [{ label: 'Value', data: data.values || [], backgroundColor: '#16a34a' }]

  const [ctype, setCtype] = useState(initialType)
  const canPie = datasets.length === 1 && (datasets[0].data ?? datasets[0].values ?? []).length > 0
  const canLine = true
  const isBubbleShape = (() => {
    try {
      return datasets.some(ds => {
        const arr = (ds.data ?? ds.values ?? [])
        return arr && arr.length > 0 && typeof arr[0] === 'object' && arr[0] !== null && 'x' in arr[0] && 'y' in arr[0]
      })
    } catch { return false }
  })()

  const palette = (n) => {
    const base = ['#22c55e','#06b6d4','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#eab308','#f97316','#84cc16','#3b82f6','#a855f7','#10b981']
    const out = []
    for (let i = 0; i < n; i++) out.push(base[i % base.length])
    return out
  }

  const chartData = {
    labels,
    datasets: datasets.map((ds, i) => {
      const dataArr = (ds.data ?? ds.values ?? [])
      let bg, border
      if (ctype === 'pie' && datasets.length === 1) {
        // per-slice colors
        bg = palette(dataArr.length)
        border = bg
      } else if (ctype === 'bar' && datasets.length === 1) {
        // colorful single-series bars
        bg = palette(dataArr.length)
        border = bg
      } else if (datasets.length > 1) {
        // per-dataset colors
        const color = palette(datasets.length)[i]
        bg = color
        border = color
      } else {
        bg = ds.backgroundColor || '#16a34a'
        border = ds.borderColor || '#16a34a'
      }
      return {
        label: ds.label || 'Value',
        data: dataArr,
        backgroundColor: bg,
        borderColor: border,
        borderWidth: ctype === 'line' ? 2 : 1,
        pointRadius: ctype === 'line' ? 2 : 0,
        tension: ctype === 'line' ? 0.3 : 0
      }
    })
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' }, title: { display: !!data.title, text: data.title } }
  }

  return (
    <div className="mt-4 p-4 bg-white border rounded">
      <div className="flex gap-2 mb-3">
        <button className={`px-3 py-1 border rounded ${ctype==='bar'?'bg-green-600 text-white':'bg-white'}`} onClick={() => setCtype('bar')}>Bar</button>
        {canPie && <button className={`px-3 py-1 border rounded ${ctype==='pie'?'bg-green-600 text-white':'bg-white'}`} onClick={() => setCtype('pie')}>Pie</button>}
        {canLine && <button className={`px-3 py-1 border rounded ${ctype==='line'?'bg-green-600 text-white':'bg-white'}`} onClick={() => setCtype('line')}>Line</button>}
        {isBubbleShape && <button className={`px-3 py-1 border rounded ${ctype==='bubble'?'bg-green-600 text-white':'bg-white'}`} onClick={() => setCtype('bubble')}>Bubble</button>}
      </div>
      {ctype === 'line' && (
        <div className="h-72"><Line data={chartData} options={commonOptions} /></div>
      )}
      {ctype === 'pie' && (
        <div className="h-56 max-w-md mx-auto"><Pie data={chartData} options={commonOptions} /></div>
      )}
      {ctype === 'bubble' && (
        <div className="h-72"><Bubble data={chartData} options={commonOptions} /></div>
      )}
      {ctype === 'bar' && (
        <div className="h-72"><Bar data={chartData} options={commonOptions} /></div>
      )}
    </div>
  )
}
