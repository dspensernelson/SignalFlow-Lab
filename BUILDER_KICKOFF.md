# Builder Kickoff - start here

SignalFlow Lab teaches workplace automation by having the learner BUILD
flows, RUN them on a day of real-looking data, watch them break on a messier
day, fix them, and see the same flow in Power Automate, Make, n8n, Zapier and
Python. That is the product since the 2026-08 reimagine (REIMAGINE_BRIEF.md).
The earlier worksheet lessons are retired; git history has them.

## Read, in this order

1. REIMAGINE_BRIEF.md - why the product changed and what done looks like.
2. FLOW_MODULE_PLAYBOOK.md - how a module is built as flows, and the owner's
   design rules (simple, minimal text, one "Fix this next").
3. README.md (Status) and the top of DECISION_LOG.md - where things stand.
4. src/data/flows/module-03.json and module-03.reference.js - a complete
   worked module.
5. AUTONOMY_CHARTER.md - standing approvals and prohibitions. Where it
   protects the retired worksheet design (validators, lesson lints, the
   no-scroll rule for lesson exercises), it no longer applies.
6. OPEN_QUESTIONS.md - anything parked for the owner.

## Session startup

1. `git status`, `git log --oneline -5`.
2. `npm run check` - green before touching anything. If red, fixing it is
   the first task.

## The work queue (owner-approved order)

1. DONE - Beacon (module-02) as flows.
2. DONE - Harbor (module-03) as flows, with engine wave 1 (For each, update
   a row, add-or-replace keys, count()).
3. DONE - Meridian (module-01) as flows; the worksheet path (lesson
   workspace, validators, lesson lints) is removed.
4. DONE - Relay (module-04) and Ledger (module-05) as flows.
5. Modules 06-10 as flows, in order, from their charters in
   curriculum/charters/. A charter's map and scenario carry over; its
   interaction-type notes do not.

## Standing rules

- `npm run check` green before every commit. Never weaken a check to pass.
- Walk every new or changed screen in a real browser before calling it done.
- Keep repo docs ASCII-only; " - " not em-dashes.
- Log decisions in DECISION_LOG.md. Commit small. Do not merge your own PRs
  or deploy; the owner merges main, and Vercel deploys main.
