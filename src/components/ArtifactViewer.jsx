export default function ArtifactViewer({ node, artifact, onBack }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 text-left">
      <header className="flex flex-col gap-1">
        <button
          type="button"
          onClick={onBack}
          className="w-fit text-sm text-blue-600 hover:underline"
        >
          &larr; Back to Canvas
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">{node.label} Artifact</h1>
        <p className="text-sm text-gray-500">{node.artifactName}</p>
      </header>

      {artifact === undefined || artifact === null ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No artifact was found for this step yet. Complete the lesson to generate one.
        </div>
      ) : (
        <pre className="overflow-auto rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-800">
          {typeof artifact === 'string' ? artifact : JSON.stringify(artifact, null, 2)}
        </pre>
      )}
    </div>
  )
}
