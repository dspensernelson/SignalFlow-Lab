# Lesson 04 - Price Feed / CSV Rows (price-feed)

> REVISED 2026-07-06 (opening-arc re-storyboard): converted choiceCheck ->
> tagSource; the learner tags the contract line, the corroborating ERCOT peak,
> the two quirks, and the schedule. Mission intro + diagram takeaway added.
> See DECISION_LOG.md 2026-07-06. The script below is the original design record.

- Lesson type: inspection | Interaction: choiceCheck (new)
- Artifact: source-profile-price-feed.json | Difficulty: Beginner | Clock: 6:18 AM
- Build wave: B (requires choiceCheck)
- Closes NODE_AUDIT item 10: this lesson gives the node its missing fixture (the
  same raw rows the Clean Price Data lesson consumes - deliberately identical).

## Theory

- Invariant: tabular feeds have a CONTRACT - column names, order, formats, and a
  delivery schedule. Consuming a feed without knowing its contract is how pipelines
  break on the first slightly-different file.
- Mental-model shift: from "here is data" to "here is a producer's promise about
  future files, and every quirk in today's file (casing, spacing, units) is a
  clue about how strong that promise is."
- Recognition cue: when handed any CSV/export, read the header row and ONE data
  row before writing any logic, and ask: what is the schedule, what are the types,
  and what has permission to fetch this?

## Artifact contract (condensed)

- Purpose: prove the numeric feed's format, quirks, access needs, and consumer are
  understood before the cleaning step runs.
- Immediate consumer: Clean Price Data (lesson 07) normalizes exactly these rows.
- Complete means: the learner can say what the feed promises, what it does NOT
  promise (consistent casing/spacing), and who consumes it.

## Learning contract

- Primary concept: feed contracts (tabular ingestion).
- Supporting: CSV structure, format drift, feed scheduling, access/subscription.
- Accomplishment: "I read the feed like a contract and spotted the quirks the
  cleaning step will have to absorb."
- Capability Statement: "The workflow can now identify the raw numeric feed that
  must be cleaned before evaluation."

## Lesson JSON (create src/data/lessons/lesson-price-feed.json)

```json
{
  "id": "lesson-price-feed",
  "nodeId": "price-feed",
  "title": "Read the Feed Like a Contract",
  "difficulty": "Beginner",
  "skill": "Feed contracts",
  "scenario": "It is 6:18 AM. The overnight price rows landed on schedule. Before anyone cleans or computes, inspect the feed the way a pipeline engineer would: what does each column promise, what quirks does today's file reveal, and who depends on it next?",
  "inputType": "text",
  "inputLabel": "Raw Price Rows (as delivered)",
  "input": "hub, peak, settled\nercot, $187/MWh, $142/MWh\nSPP, $96/MWh, $88/MWh\nmiso, $74 /MWh, $70/MWh\n\nDelivery: dropped nightly by the market data export, expected before 6:15 AM.",
  "instructions": [
    "Read the header row, then read each data row slowly - the quirks are the lesson.",
    "Answer the four feed questions.",
    "Validate to record the feed profile."
  ],
  "interactionType": "choiceCheck",
  "validation": {
    "type": "choiceCheck",
    "questions": [
      {
        "id": "q1",
        "prompt": "What structure does this input have?",
        "options": [
          { "id": "a", "text": "CSV rows under a header that names the columns" },
          { "id": "b", "text": "Free-form prose like the analyst note" },
          { "id": "c", "text": "A JSON array of objects" }
        ],
        "correctOptionId": "a",
        "explain": "The first line (hub, peak, settled) is a header naming the columns; every following line is one row honoring that order. That header is the feed's contract."
      },
      {
        "id": "q2",
        "prompt": "Which quirks in today's file show the feed does NOT promise clean values?",
        "options": [
          { "id": "a", "text": "The rows arrive in alphabetical order" },
          { "id": "b", "text": "Inconsistent hub casing (ercot, SPP, miso) and a stray space in \"$74 /MWh\"" },
          { "id": "c", "text": "There are only three rows" }
        ],
        "correctOptionId": "b",
        "explain": "Compare the hub values and the MISO peak cell character by character. Casing drifts and spacing drifts - the contract covers columns, not cleanliness."
      },
      {
        "id": "q3",
        "prompt": "In a real company, what would consuming this feed require?",
        "options": [
          { "id": "a", "text": "A market data subscription or permission to the nightly export location" },
          { "id": "b", "text": "Nothing - price data is always free" },
          { "id": "c", "text": "Manager approval each morning" }
        ],
        "correctOptionId": "a",
        "explain": "The input names its delivery: a nightly market data export. Reading it programmatically means access to that feed or drop location - a subscription and a permission, not a person."
      },
      {
        "id": "q4",
        "prompt": "Which workflow step consumes these rows first?",
        "options": [
          { "id": "a", "text": "Variance Check" },
          { "id": "b", "text": "Morning Brief" },
          { "id": "c", "text": "Clean Price Data" }
        ],
        "correctOptionId": "c",
        "explain": "Follow the map: raw rows cannot be computed on ($ signs, units, drift), so their first stop is the cleaning step that normalizes them."
      }
    ],
    "artifactOnPass": {
      "source": "price-feed",
      "structure": "csv-rows-with-header",
      "columns": ["hub", "peak", "settled"],
      "schedule": "nightly, before 6:15 AM",
      "knownQuirks": "inconsistent hub casing; stray spaces; values carry $ and /MWh",
      "accessNeeded": "market data subscription or export-location permission",
      "firstConsumer": "clean-price-data"
    }
  },
  "fieldGuide": [],
  "copilotPrompt": "Profile this CSV feed as a contract: structure, columns, schedule, the quirks today's file reveals, the access consuming it requires, and its first consumer.",
  "successMessage": "Feed profiled. You already know exactly what the cleaning step will have to fix - because you found the quirks yourself.",
  "intro": {
    "heading": "Before you inspect: feeds are promises",
    "sections": [
      {
        "title": "A header row is a contract",
        "body": "hub, peak, settled is not just a label line - it is the producer's promise about every future file: these columns, this order. Pipelines are built against that promise."
      },
      {
        "title": "Contracts have gaps",
        "body": "The contract says which columns arrive. It says nothing about casing, spacing, or units - and today's file drifts on all three. Reading one real file closely tells you what the contract does NOT cover."
      },
      {
        "title": "Schedule is part of the source",
        "body": "This feed drops nightly before 6:15 AM. Schedules matter because everything downstream inherits them: a late feed is a late brief. (The Hard tier of this module makes that failure real.)"
      },
      {
        "title": "Same rows, next lesson",
        "body": "These are the exact rows the Clean Price Data step normalizes. Inspection and transformation are two different skills applied to one input - first understand it, then fix it."
      }
    ],
    "jsonExample": "{\n  \"structure\": \"csv-rows-with-header\",\n  \"columns\": [\"hub\", \"peak\", \"settled\"],\n  \"firstConsumer\": \"clean-price-data\"\n}",
    "skill": "Feed contracts",
    "artifactName": "source-profile-price-feed.json"
  },
  "takeaway": {
    "heading": "Feed profiled",
    "points": [
      "You read the header as a contract and today's rows as evidence of what the contract leaves out.",
      "You found the quirks by eye - casing drift, a stray space, units on every value - before any code had to.",
      "You recorded the schedule and the access requirement, the two facts integration work always starts from.",
      "Clean Price Data consumes exactly these rows; you now know why that step exists.",
      "The workflow can now identify the raw numeric feed that must be cleaned before evaluation."
    ],
    "artifactName": "source-profile-price-feed.json"
  }
}
```

## Wiring

1. Requires choiceCheck (ENGINE_ADDITIONS_SPEC.md section 1).
2. Register lesson-price-feed in src/App.jsx.
3. Set `"taskId": "lesson-price-feed"` on node `price-feed` in
   src/data/workflowNodes.json. Also update that node's labVersion text if it
   still says "Not wired up yet" - it should say the fixture is the raw rows shown
   in this lesson.

## Acceptance checklist

- [ ] Wrong q2 answer explains via the character-level comparison hint.
- [ ] Pass stores source-profile-price-feed.json; node completes.
- [ ] No page scroll at 800px in wrong-answer state; lint/build pass.
