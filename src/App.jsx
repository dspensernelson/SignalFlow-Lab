import { Suspense, lazy, useEffect, useState } from 'react'
import BuilderWorkspace from './builder/BuilderWorkspace'
import ModuleSwitch from './builder/ModuleSwitch'
import { Logo } from './components/ui'
import { PROJECTS, getProjectData, loadProject, saveProject, hasProjectData } from './lib/projects'
import { loadTheme, saveTheme, applyTheme } from './lib/theme'

// The app is the builder. The workflow map (world view) loads on demand.
const WorldView = lazy(() => import('./builder/WorldView'))

// Runnable-flow modules, in the order the switcher lists them. Each loads its
// module data and reference solution on demand.
const FLOW_MODULE_LOADERS = {
  'module-02': async () => {
    const [data, ref] = await Promise.all([import('./data/flows/module-02.json'), import('./data/flows/module-02.reference.js')])
    return { moduleData: data.default, loadReference: ref.referenceFlowsFor }
  },
  'module-03': async () => {
    const [data, ref] = await Promise.all([import('./data/flows/module-03.json'), import('./data/flows/module-03.reference.js')])
    return { moduleData: data.default, loadReference: ref.referenceFlowsFor }
  },
  'module-01': async () => {
    const [data, ref] = await Promise.all([import('./data/flows/module-01.json'), import('./data/flows/module-01.reference.js')])
    return { moduleData: data.default, loadReference: ref.referenceFlowsFor }
  },
  'module-04': async () => {
    const [data, ref] = await Promise.all([import('./data/flows/module-04.json'), import('./data/flows/module-04.reference.js')])
    return { moduleData: data.default, loadReference: ref.referenceFlowsFor }
  },
}
const FLOW_MODULE_IDS = Object.keys(FLOW_MODULE_LOADERS)

function readFlowState(project) {
  try {
    return JSON.parse(localStorage.getItem(`signalflow_flows__${project}`) || 'null') || {}
  } catch {
    return {}
  }
}

export default function App() {
  const [project, setProject] = useState(() => {
    const saved = loadProject()
    return FLOW_MODULE_IDS.includes(saved) ? saved : FLOW_MODULE_IDS[0]
  })
  const [view, setView] = useState('builder') // 'builder' | 'world'
  const [theme, setTheme] = useState(() => loadTheme())
  const [flowModule, setFlowModule] = useState(null)

  useEffect(() => {
    let cancelled = false
    FLOW_MODULE_LOADERS[project]().then((mod) => {
      if (!cancelled) setFlowModule({ project, ...mod })
    })
    return () => {
      cancelled = true
    }
  }, [project])

  useEffect(() => {
    applyTheme(theme)
    saveTheme(theme)
  }, [theme])

  function toggleTheme(next) {
    setTheme(next === 'dark' || next === 'light' ? next : theme === 'dark' ? 'light' : 'dark')
  }

  function handleProjectChange(next) {
    if (next === project || !FLOW_MODULE_LOADERS[next]) return
    saveProject(next)
    setProject(next)
    setView('builder')
  }

  const { nodes, phases, edges } = getProjectData(project)

  const headerLeft = (
    <div className="flex items-center gap-3">
      <span className="hidden whitespace-nowrap xl:inline-flex">
        <Logo size={20} uppercase wordmark="SignalFlow Lab" />
      </span>
      <ModuleSwitch projects={PROJECTS} value={project} flowModuleIds={FLOW_MODULE_IDS} hasData={hasProjectData} onChange={handleProjectChange} />
    </div>
  )

  if (!flowModule || flowModule.project !== project) {
    return <div className="flex h-screen items-center justify-center text-sm text-sf-muted">Loading the builder...</div>
  }

  const saved = readFlowState(project)
  return (
    <>
      <BuilderWorkspace
        key={`${project}-${flowModule.nonce || 0}`}
        moduleData={flowModule.moduleData}
        loadReference={flowModule.loadReference}
        theme={theme}
        onToggleTheme={toggleTheme}
        onWorld={() => setView('world')}
        headerLeft={headerLeft}
      />
      {view === 'world' && (
        <Suspense fallback={null}>
          <WorldView
            moduleData={flowModule.moduleData}
            project={PROJECTS.find((p) => p.id === project)}
            nodes={nodes}
            phases={phases}
            edges={edges}
            passed={saved.passed || {}}
            activeBuildId={saved.activeBuildId}
            onOpenBuild={(buildId) => {
              try {
                const key = `signalflow_flows__${project}`
                const st = JSON.parse(localStorage.getItem(key) || 'null')
                if (st) localStorage.setItem(key, JSON.stringify({ ...st, activeBuildId: buildId }))
              } catch {
                // Storage unavailable: the builder simply stays on its build.
              }
              setFlowModule((m) => ({ ...m, nonce: (m.nonce || 0) + 1 }))
              setView('builder')
            }}
            onClose={() => setView('builder')}
          />
        </Suspense>
      )}
    </>
  )
}
