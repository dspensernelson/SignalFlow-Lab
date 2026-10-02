import { useState } from 'react'
import { Button, Card, SectionLabel } from '../ui'

// Free-text explain-it check. Not graded: the learner answers 3-5 questions
// as if to a client, saves, and only then sees the model answer beside each
// of their own. Answers persist in the track's progress.
export default function ExplainItForm({ title, intro, questions, initialAnswers = {}, onSave }) {
  const [answers, setAnswers] = useState(() => ({ ...initialAnswers }))
  const [revealed, setRevealed] = useState(() => questions.every((_, i) => Boolean(initialAnswers[i]?.trim())))
  const allAnswered = questions.every((_, i) => Boolean(answers[i]?.trim()))

  function save() {
    onSave(answers)
    setRevealed(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <SectionLabel>Explain-it check</SectionLabel>
        <h2 className="mt-0.5 text-lg font-semibold text-sf-text">{title}</h2>
        {intro && <p className="mt-1 text-sm text-sf-muted">{intro}</p>}
      </div>
      <ol className="flex flex-col gap-4">
        {questions.map((q, i) => (
          <li key={i} className="flex flex-col gap-2">
            <label htmlFor={`explain-${i}`} className="text-sm font-medium text-sf-text">
              {i + 1}. {q.q}
            </label>
            <textarea
              id={`explain-${i}`}
              rows={4}
              value={answers[i] || ''}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
              placeholder="Answer in your own words, as if the client asked."
              className="w-full rounded-md border border-sf-border bg-sf-surface p-2.5 font-sans text-sm leading-relaxed text-sf-text focus:border-sf-accent-border focus:outline-none"
            />
            {revealed && (
              <Card tone="info" padding="sm" className="text-sm leading-relaxed text-sf-body">
                <SectionLabel size="xs" className="mb-1">A model answer</SectionLabel>
                {q.modelAnswer}
              </Card>
            )}
          </li>
        ))}
      </ol>
      <div className="flex items-center gap-3">
        <Button variant="primary" size="sm" icon="check" onClick={save} disabled={!allAnswered}>
          {revealed ? 'Save changes' : 'Save and compare'}
        </Button>
        {!allAnswered && <span className="text-xs text-sf-muted">Answer every question to compare with the model answers.</span>}
      </div>
    </div>
  )
}
