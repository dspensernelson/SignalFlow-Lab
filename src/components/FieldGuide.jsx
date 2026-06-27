// Field-level teaching reference for the exercise's left column.
export default function FieldGuide({ fields }) {
  if (!fields || fields.length === 0) return null

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Field Guide</h3>
      <ul className="mt-3 flex flex-col gap-3">
        {fields.map((field) => (
          <li key={field.field} className="border-t border-gray-100 pt-3 first:border-t-0 first:pt-0">
            <div className="flex items-center justify-between gap-2">
              <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">
                {field.field}
              </code>
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {field.type}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-700">{field.meaning}</p>
            <p className="mt-1 text-xs text-gray-500">
              Example: <span className="font-mono text-gray-700">{field.example}</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">Hint: {field.hint}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
