// Step 1 of the reusable lesson template: prepare the user before the exercise.
export default function LessonIntro({ lesson, onContinue }) {
  const intro = lesson.intro

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">{intro.heading}</h2>
          <div className="mt-4 flex flex-col gap-4">
            {intro.sections.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold text-gray-800">{section.title}</h3>
                <p className="mt-1 text-sm text-gray-700">{section.body}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              JSON Example
            </h3>
            <pre className="mt-2 overflow-auto rounded-md bg-gray-50 p-3 font-mono text-sm text-gray-800">
              {intro.jsonExample}
            </pre>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <dl className="flex flex-col gap-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  You will produce
                </dt>
                <dd className="text-sm font-medium text-gray-800">{intro.artifactName}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Skill you are practicing
                </dt>
                <dd className="text-sm font-medium text-gray-800">{intro.skill}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <div>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Continue to Exercise
        </button>
      </div>
    </div>
  )
}
