export default function ValidationResults({ results, fieldHints = {} }) {
  if (!results || results.length === 0) return null

  function getHint(resultId) {
    const field = resultId.replace(/^(value|present)-/, '')
    if (fieldHints[field]) return fieldHints[field]

    const fieldName = field.split('-').at(-1)
    return fieldHints[fieldName] || null
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-700">Validation Results</h3>
      <ul className="flex flex-col gap-1">
        {results.map((result) => {
          const hint = !result.passed ? getHint(result.id) : null
          return (
            <li
              key={result.id}
              className={`flex flex-col gap-1 rounded-md border px-3 py-2 text-sm ${
                result.passed
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}
            >
              <span className="flex items-start gap-2">
                <span aria-hidden="true">{result.passed ? '✓' : '✗'}</span>
                <span>
                  <span className="font-medium">{result.label}:</span> {result.message}
                </span>
              </span>
              {hint && <span className="pl-6 text-xs text-red-700">Hint: {hint}</span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
