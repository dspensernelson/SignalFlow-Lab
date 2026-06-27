// Step 3 of the lesson template: reinforce what was learned and show the artifact.
export default function LessonTakeaway({ lesson, artifact, onReturnToCanvas }) {
  const takeaway = lesson.takeaway

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <section className="lg:col-span-2 rounded-lg border border-green-300 bg-green-50 p-5">
        <h2 className="text-lg font-semibold text-green-900">{takeaway.heading}</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {takeaway.points.map((point, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-green-900">
              <span aria-hidden="true">✓</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onReturnToCanvas}
          className="mt-5 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Return to Canvas
        </button>
      </section>

      <aside className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Artifact produced
        </h3>
        <p className="mt-1 text-sm font-medium text-gray-800">{takeaway.artifactName}</p>
        {artifact && (
          <pre className="mt-3 overflow-auto rounded-md bg-gray-50 p-3 text-sm text-gray-800">
            {typeof artifact === 'string' ? artifact : JSON.stringify(artifact, null, 2)}
          </pre>
        )}
      </aside>
    </div>
  )
}
