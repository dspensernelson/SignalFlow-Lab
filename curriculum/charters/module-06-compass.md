# Module 6 Charter - Compass CRM Hygiene (RATIFIED)

Ratified 2026-07-02 by standing owner approval (DECISION_LOG.md, autonomy
pass). Build under AUTONOMY_CHARTER.md. Keep ASCII-only.

## Org and mission

Compass Insurance runs its sales team on a CRM that decays daily: reps
create duplicate accounts, imported lists disagree with reality, and lead
scores drift. Every Monday at 9:00 AM the desk needs a clean book: dupes
merged, records enriched, leads scored and routed. Module 1 cleaned three
rows by hand; this module teaches what changes when it is three THOUSAND -
rules must carry the judgment, because no human reads every record.

## The deliverable

`hygiene-report.md` - the Monday 9:00 AM clean-book report: merges executed
and by which rule, records enriched, scores assigned, leads routed, and the
week's data-quality trend.

## Named roles (FIXED - never invent more)

Sales Ops Analyst (runs hygiene), Data Steward (owns survivorship rules and
reviews risky merges), RevOps Manager (owns the scoring model), AE Team DL
(receives routed leads), Enrichment Vendor (external lookup source - a
SYSTEM, not a person).

## Signature concept cluster (new here)

Duplicate detection at scale (match keys and fuzzy candidates),
survivorship rules (which field value wins a merge), enrichment from an
external source (trust and cost), scoring models as governed config, batch
thinking (rules process the population; humans review the sampled edge).

## Recurring concepts (deepened)

Dedupe (M2's, generalized), source-of-truth agreements, exception review as
a handoff, config versioning, assembly, archive loops.

## Draft map spine

Phases: Export and Profile -> Duplicate Detection -> Merge and Survivorship
-> Enrichment and Scoring -> Routing and Report.

| Node id | Type | Lesson type | Concept |
| --- | --- | --- | --- |
| crm-export | source | inspection | The weekly extract; population thinking |
| match-key-policy | reference | governance | What makes two records "the same" |
| dedupe-candidates | process | transformation | Candidate pairs from match keys |
| survivorship-policy | reference | governance | Field-by-field: which value wins, why |
| merge-decision | decision | decision | Auto-merge (high confidence) vs steward review |
| steward-review | handoff | handoff | Human review of the risky sample; captured |
| golden-record | artifact | build | The merged record with lineage of both parents |
| enrichment-lookup | process | transformation | External data joined in; trust boundaries |
| enrichment-source | source | inspection | The vendor feed: cost, staleness, coverage |
| scoring-model | reference | governance | Weights as owned, versioned config |
| lead-scores | artifact | transformation | Applying the model to the clean population |
| territory-rules | reference | governance | Score+geography -> owner mapping |
| lead-routing | process | transformation | Assigning routed leads per the rules |
| hygiene-report | output | assembly | The Monday report with trend |
| hygiene-archive | archive | handoff | Retention; next week's dedupe baseline |
| quality-trend | process | transformation | Week-over-week decay measured (loop close) |

(16 nodes.)

## The fork

merge-decision: candidate pair above the confidence threshold -> auto-merge
into golden-record; below -> steward-review. Boundary teaching: confidence
thresholds trade steward hours against bad merges - and a bad merge is
worse than a duplicate (merges destroy information; dupes only clutter).

## The temporal loop

hygiene-archive -> dedupe-candidates: last week's merge outcomes are this
week's match-key baseline, and quality-trend measures whether the book is
actually getting cleaner.

## Unlock root and early branches

Root: crm-export. Fans to match-key-policy + enrichment-source; the dedupe
branch and the scoring branch converge at the report.

## Tier postures

- Easy: two obvious duplicate pairs, clean survivorship, one enrichment.
- Medium: a fuzzy candidate pair (same person, different spellings), a
  survivorship conflict (newer-but-emptier vs older-but-richer), a vendor
  lookup that returns garbage (trust boundary).
- Hard (curated drills): design the match-key policy from a sample with
  known dupes; design the confidence threshold from steward-hours math;
  scoring-model change management (v2 with backtest note); merge rollback
  when survivorship destroyed data (the recovery drill).

## Engine needs (self-serve under AUTONOMY_CHARTER)

None expected beyond existing types; population-scale is taught through
representative samples (rows), not literal thousands.

## Canon guidance

Record ids ACC-####; a fixed 6-field account schema; confidence as 0-100;
scores 0-100 with two band cutoffs. Cross-lesson numbers into
curriculum/module-06/canon.json.
