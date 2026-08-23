# SignalFlow Lab - Reimagine Brief

A handoff to a fresh session. You have no prior context and you do not need any.
This brief gives you the destination and the evidence. It deliberately does not
give you a design. How to get there is your work, not mine.

Repo: this directory. Live: https://signal-flow-lab.vercel.app
Owner: Spenser. He cares about outcomes, not internals. He will not adjudicate
architecture arguments, so do not bring him any.

---

## 1. What this product is trying to be

A learner spends time in this app and walks into the company they already work
for able to say, credibly, "I can help automate our world."

Not "I learned JSON." Not "I finished a course." They can look at a messy manual
process at their job, see the automation inside it, and build it in whatever
tool their employer actually uses.

---

## 2. Where it is today

Three of ten planned modules are built and live: an energy-market morning brief,
an accounts-payable invoice desk, and an HR onboarding run. 129 lessons. The app
is a local-first React site with no backend; all state is in localStorage. It
deploys to Vercel from the main branch. `npm run check` runs eight gates and is
green.

The curriculum has real strengths. The business scenarios are detailed and
genuinely messy (a duplicate invoice, a backordered laptop, a moved start date).
There are 154 canon assertions keeping every number consistent. There are 53
hand-authored workflow-map nodes, each carrying what the thing is in the lab and
what it would be at work, what access you would need, and how you would rebuild
it by hand. Every lesson names what KIND of automation action it is and which
real tools fit it. None of that is the problem.

### The problem, measured

Every interaction type in the product, and what the learner's hands actually do:

| Interaction | Share of 129 lessons | What you physically do |
|---|---|---|
| jsonEditor | 51.9% | type JSON into a textarea |
| choiceCheck | 22.5% | pick a radio button |
| templateSlots | 7.8% | type into inline blanks |
| handoffForm | 7.0% | pick from dropdowns |
| tagSource | 3.9% | pick from a dropdown |
| artifactImport | 2.3% | upload files built elsewhere |
| connectorConfig | 2.3% | pick from dropdowns |
| runInspect | 2.3% | pick from dropdowns |

100% of the curriculum is type-a-value or pick-a-value. There is no exception.

The learner never runs anything. Not once, in 129 lessons. There is no execution
of any kind anywhere in the codebase. The app has exactly one verb, in
`src/lib/validators.js`:

    validateAnswer(answer, validation) -> does your value match the author's value

The owner's reaction, verbatim: "Is that really what automation is? ... are we
still just picking drop-downs and typing shit? That didn't feel useful."

He is right. Automation is a thing you assemble and run and watch break. This
app is a worksheet that grades values. The interaction design is downstream of
that seam; the seam is the actual issue.

### Other measured facts you will want

- Difficulty does not ratchet. Share of graded answers that appear VERBATIM in
  the text the learner is reading: Easy 83%, Medium 72%, Hard 76%. Hard is not
  harder by this measure; much of the curriculum is transcription.
- One validator (`jsonPolicy`, 11 lessons) accepts deliberately wrong answers.
  A policy that catches none of the fraud a lesson asks it to catch passes 18 of
  18 checks. The other validators do reject garbage; there is a harness that
  proves it (`npm run test:validators`).
- Vocabulary is taught late or never: 111 cases of a domain term being used
  before the lesson that defines it. The owner himself could not read his own
  module 2 without asking what a term meant.
- About 19% of lesson bytes are the validation layer. The other 80% is scenario,
  teaching prose, and transfer material.
- About 19% of the map nodes are "inspection" lessons, which are quizzes about a
  source rather than the construction of anything.

---

## 3. Where it needs to get to

The learner should be doing the thing, not describing the thing.

Four capabilities define done. They are outcomes. Nothing here says how.

**A. Assemble.** A learner builds a working automation out of parts, rather than
writing down a description of one. What they end up with is a thing that exists
and can be pointed at, not an answer that was checked.

**B. Run.** A learner runs what they built and watches it execute. Correctness is
established by the thing actually working on real input, not by matching an
answer key. If it works, it works; if it does not, that is visible.

**C. Break it and fix it.** A learner meets input that defeats what they built,
sees how and where it fails, and repairs it. Failure is a normal, legible part
of the loop rather than a wrong answer.

**D. Flip the tool skin.** The same workflow can be seen and built in more than
one real tool's idiom - Power Automate, Make, n8n, Zapier, Power Apps / Copilot
Studio, Python, LangGraph. A learner recognizes that a trigger is a trigger by
watching the same trigger wear different costumes. Whatever they build should
feel like a thing they would meet in the field, not a bespoke classroom object.

Capability D is the owner's idea and he is right about it: it is what makes the
underlying invariant visible, by contrast, instead of merely asserted.

---

## 4. What you may change

Everything.

The validation seam, the artifact model, the lesson file format, the map format,
the component architecture, the progress model, the tier system, the number of
modules, the interaction types. If it is in the way, it goes.

There is a body of governance documentation in this repo: `PRODUCT_DOCTRINE.md`,
`AUTONOMY_CHARTER.md`, `DECISION_BOUNDARIES.md`, `MODULE_AUTHORING_PLAYBOOK.md`,
`LESSON_DESIGN_FRAMEWORK.md`, `CURRICULUM_MASTER_PLAN.md`, and a long
`DECISION_LOG.md`. Several of those documents declare themselves frozen and
declare rules non-negotiable.

Treat all of it as EVIDENCE, NOT LAW. It is an excellent record of why things
are the way they are, and reading it will save you from re-deriving decisions
that were made for good reasons. But it was written to protect a design that the
owner has now said does not achieve his goal. A rule that stands between the
learner and the four capabilities above is a rule to bring to the owner for
removal, not a constraint to design around.

Two rules in particular are worth examining rather than inheriting, because they
shaped almost everything: that a lesson is complete when a validator matches the
learner's value against the author's, and that every screen where work happens
must fit without scrolling.

### The content question, and my recommendation

You are not obliged to preserve the 129 lessons.

My read, offered as input and not instruction: the WORLD is an asset and the
INTERACTION LAYER is a liability. The scenarios, the messes, the canon numbers,
the map topology, and the tool mappings are expensive, tool-agnostic, and would
be costly to reproduce. They also get more useful in a model where things
actually run, because they stop being prompts and become the input a learner's
work is tested against. The validation layer and the quiz-shaped lessons are the
part that produced the problem.

So I would carry the world across and let a meaningful fraction of the lessons
die - not preserve all 129, and not start from an empty page. But you are closer
to the new design than I am, and if the world does not fit it, say so and throw
it away. Do not preserve anything out of politeness to prior work.

---

## 5. Decisions that belong to the owner, not to you

Surface these; do not assume them.

- Whether the app stays local-first with no backend. Today it is a static site
  with localStorage and no accounts. Some ways of achieving the capabilities
  above may want more than that.
- Whether grading must stay fully deterministic and offline. Today it is, by
  rule, and there is no AI in the runtime.
- Whether the ten-module curriculum plan survives, and in what order. Three
  modules are built; a reorder has been discussed and never done.
- Any change that alters what the learner's finished work IS, since that is the
  heart of what he is asking you to change.

---

## 6. How we will know it worked

Not by a passing test suite. The owner has never completed a module of his own
product; the single most useful signal available is his reaction while using it.

It worked if he does the thing and says some version of: "that felt like
building an automation." It has not worked if he says some version of what he
said this time: "are we still just picking drop-downs and typing shit."

Build toward that sentence.

---

## 7. Practical notes

- `npm run check` currently runs eight gates: eslint, a map lint, a lesson lint,
  a giveaway lint, a glossary lint, a lesson regression suite, a validator
  garbage-audit, and the build. Several were added specifically to measure the
  problems described above. Keep, replace, or delete them on their merits.
- `src/data/automationTaxonomy.json` holds nine action kinds and seven tools,
  with a named phrasing for every kind/tool pair. It was built to power prose,
  but it is the closest thing here to a cross-tool Rosetta table, which may
  matter for capability D.
- `REMEDIATION_PLAN.md` describes an incremental repair plan for the current
  design. Large parts of it are probably moot if the seam changes. Read it for
  the problem statements, not the remedies.
- The main branch is deployed automatically. There is a git history rewrite in
  this repo's recent past; if git behaves strangely, check whether your local
  main is on an orphaned line before assuming something is broken.

Keep repo docs ASCII-only, and use " - " rather than em-dashes; the terminal
here mangles non-ASCII.
