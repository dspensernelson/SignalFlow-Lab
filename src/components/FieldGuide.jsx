import { SectionLabel, FieldGuideRow } from './ui'

// Field-level teaching reference for the exercise's left column.
export default function FieldGuide({ fields }) {
  if (!fields || fields.length === 0) return null

  return (
    <div className="rounded-xl border border-sf-border bg-sf-surface p-4 shadow-sf-sm">
      <SectionLabel>Field Guide</SectionLabel>
      <div className="mt-3">
        {fields.map((field) => (
          <FieldGuideRow
            key={field.field}
            field={field.field}
            type={field.type}
            meaning={field.meaning}
            example={`Example: ${field.example}`}
            hint={field.hint}
          />
        ))}
      </div>
    </div>
  )
}
