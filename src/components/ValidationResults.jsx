import { SectionLabel, ValidationRow } from './ui'

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
      <SectionLabel>Validation Results</SectionLabel>
      <div className="flex flex-col gap-1.5">
        {results.map((result) => (
          <ValidationRow
            key={result.id}
            label={result.label}
            message={result.message}
            passed={result.passed}
            hint={!result.passed ? getHint(result.id) : null}
          />
        ))}
      </div>
    </div>
  )
}
