# Verification Playbook

How to PROVE a change works, beyond `npm run check`. The check pipeline
(eslint + lesson lint + lesson tests + build) catches data and logic drift;
this playbook covers what only a live browser can prove: layout, the
no-scroll rule, gating behavior, and end-to-end lesson flow. Keep ASCII-only.

## The pipeline first

```powershell
npm run check   # eslint + lint:lessons + test:lessons + build - all green
```

Run it before every commit. A lesson without a fixture in
scripts/lesson-fixtures.json FAILS test:lessons by design - new lessons ship
with fixtures in the same commit.

## Live verification setup

Dev server: `npm run dev` (port 5173). Test at a 1280x800 viewport - the
no-scroll rule is defined at innerHeight >= 800.

Reset to a clean learner state (browser console):

```js
['signalflow_progress','signalflow_artifacts',
 'signalflow_progress_medium','signalflow_artifacts_medium',
 'signalflow_progress_hard','signalflow_artifacts_hard']
  .forEach(k => localStorage.removeItem(k));
localStorage.setItem('signalflow_tier','easy'); // or medium / hard
location.reload();
```

## The no-scroll check (NON-NEGOTIABLE, per changed exercise surface)

The tallest state is the WRONG-ANSWER state - always verify that one:

1. Open the lesson, continue to Exercise.
2. Submit a wrong answer (empty slots / first radio options / wrong values).
3. In the console:

```js
({ scrollH: document.documentElement.scrollHeight,
   clientH: document.documentElement.clientHeight })
```

scrollH must equal clientH (800). If it exceeds: compact the SURFACE (grid
the questions, tighten template line-height, move helper panels to the other
column, trim template blank lines) - never truncate the feedback contract
(inline chips + one Fix-this-next callout). Every new exercise surface built
so far exceeded 800 on its first draft; budget for one compaction pass.

## Gating checks (after touching progress.js or LESSON_PREREQS)

- Fresh easy tier: exactly ONE Start button on the map (the intro lesson).
- Complete the intro: its card flips to View; its unlock children (2-3)
  become the only Start buttons.
- Click a locked lesson: panel shows the Locked badge and names EVERY
  incomplete prerequisite.
- Fresh hard tier: roots match the transitively-collapsed tree (currently
  Market Intake Record + Price Feed).
- Tier switch: each tier keeps separate progress; stats row shows the tier's
  own counts.

## Artifact seeding (testing late-path lessons without playing the front)

Assembly lessons read stored artifacts. Seed the ACTIVE TIER's key
(signalflow_artifacts for easy, _medium / _hard otherwise) with objects
matching the tier canon in curriculum/module-01/<tier>/_OVERVIEW.md, keyed by
nodeId. Example (easy, minimum for morning-brief):

```js
localStorage.setItem('signalflow_artifacts', JSON.stringify({
  'market-intake-record': { hub:'ERCOT', peakPrice:'$187/MWh',
    settledPrice:'$142/MWh', generationFlag:'Wind underperformed',
    approvalRequired:true },
  'clean-price-data': [ { hub:'ERCOT', peakPrice:187, settledPrice:142 },
    { hub:'SPP', peakPrice:96, settledPrice:88 },
    { hub:'MISO', peakPrice:74, settledPrice:70 } ],
  'variance-check': [ { hub:'ERCOT', vsForecast:17, vsPriorDay:22 } ],
  'risk-evaluation': [ { hub:'ERCOT', pctMove:13.3, status:'escalate' },
    { hub:'SPP', pctMove:4.3, status:'normal' },
    { hub:'MISO', pctMove:-5.1, status:'routine' } ],
  'approval-route': { hub:'ERCOT', movePct:'13.3', sentTo:'Desk Manager',
    decision:'approved', decidedBy:'Desk Manager', decidedAt:'6:41 AM' }
})); location.reload();
```

To unlock a late lesson without seeding artifacts, set its prerequisites
complete in the tier's progress key instead:

```js
const p = JSON.parse(localStorage.getItem('signalflow_progress') || '{}');
['analyst-notes','trader-flag'].forEach(id => p[id] = 'complete');
localStorage.setItem('signalflow_progress', JSON.stringify(p));
location.reload();
```

## Per-lesson end-to-end recipe

1. Reach the lesson through the map (proves gating + wiring, not just data).
2. Intro renders; Continue to Exercise.
3. Wrong answer: bounded feedback (chips + ONE Fix-this-next), no page
   scroll, learner input preserved.
4. Correct answer: readiness card; Continue to Takeaway; capability
   statement visible.
5. Back to canvas: node complete, artifact opens in the Artifact Viewer,
   unlock children now READY.
6. Console clean (no errors) throughout.

## Theme + regression sweep (before a module/tier is called done)

- Repeat spot checks in dark mode (localStorage signalflow_theme = 'dark').
- IMPORTANT: clear all test progress/artifacts before handing back - stale
  test state reads as bugs to the next person (it did to us).
