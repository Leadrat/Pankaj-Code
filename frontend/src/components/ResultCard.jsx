export default function ResultCard({ answer }) {
  return (
    <div className="mt-4 p-4 bg-white border rounded">
      <div className="font-medium">Insight</div>
      <p className="mt-1 text-gray-800">{answer}</p>
    </div>
  )
}
