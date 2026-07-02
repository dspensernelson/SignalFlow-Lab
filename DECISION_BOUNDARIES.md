# Decision Boundaries

Who decides what. A builder (human or model) working from the playbook makes
implementation choices freely; the decisions below are the OWNER's, and a
builder who hits one STOPS AND ASKS instead of choosing. The most damaging
failure mode for a delegated builder is not a wrong answer - it is a
confidently invented product decision. Keep this file ASCII-only.

## Owner-only decisions (stop and ask)

1. Doctrine: anything in PRODUCT_DOCTRINE.md, including the no-scroll rule,
   the artifact model, and the node taxonomy.
2. Scenario selection and charters: which module is next, its org, roles,
   and signature concept cluster (MODULE_AUTHORING_PLAYBOOK step 1).
3. Map shape: adding/removing/splitting nodes or edges on an approved map;
   changing phases; changing the unlock tree (LESSON_PREREQS).
4. New interaction types or validators, and ANY change to an existing
   validator's matching rules (they are frozen; additions require an
   ENGINE_ADDITIONS_SPEC-grade spec approved first).
5. Tier curation: which nodes get medium/hard variants; difficulty postures.
6. Canon changes to an APPROVED canon (fixing a discovered contradiction is
   allowed but must be logged in DECISION_LOG.md and reflected in canon.json
   in the same commit).
7. Storage/progress semantics: localStorage keys, progress model, gating
   behavior.
8. Anything outward-facing: pushing to new remotes, deploys, publishing.

## Builder decisions (choose and proceed, log if notable)

- Lesson copy phrasing within the script's contract and canon.
- Fixture and canon-assertion additions for new lessons.
- Layout/compaction choices needed to satisfy the no-scroll rule (document
  what was compacted in the commit message).
- Test/lint tooling improvements that do not weaken existing checks.
- Bug fixes with an obvious correct behavior (log in DECISION_LOG if the fix
  changes anything a learner can observe).

## How to stop and ask

State: what you were doing, the decision you hit, 2-3 options with your
recommendation, and what is blocked until answered. Then work on something
unblocked. Never proceed on an owner decision because waiting is slow.

## Standing constraints (not decisions - never violate)

- Validators are additive; matching rules never change.
- Exercise screens never page-scroll at innerHeight >= 800, including the
  wrong-answer state (verify live, wrong answer first).
- `npm run check` green before every commit.
- Repo docs ASCII-only.
- Every unit of work leaves the app demoable.
- Local-first: no backend, no login, no telemetry, no AI grading.
