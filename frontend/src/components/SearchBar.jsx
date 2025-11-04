export default function SearchBar({ value, onChange, onAsk, loading }) {
  const submit = (e) => {
    e.preventDefault()
    const q = (value || '').trim()
    if (!q) return
    onAsk(q)
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        className="flex-1 border rounded px-3 py-2"
        placeholder="Ask an agriculture question..."
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >{loading ? 'Analyzing...' : 'Ask'}</button>
    </form>
  )
}
