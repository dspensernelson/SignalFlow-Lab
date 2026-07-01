# Lesson 15 - Prior Day Brief Template (prior-day-brief-template)

- Lesson type: inspection | Interaction: choiceCheck (new)
- Artifact: source-profile-brief-template.json | Difficulty: Beginner | Clock: 6:50 AM
- Build wave: B (requires choiceCheck)
- NODE_AUDIT note: audit suggested this could become interpretation instead of
  inspection. Resolved: it stays inspection (the learner examines the structure);
  the interpretation energy goes into q2's baseline-vs-template distinction.

## Theory

- Invariant: templates carry STRUCTURE across runs the way baselines carry DATA.
  A recurring output stays consistent - readable by people, parseable by
  downstream automation - only because its structure is versioned and reused, not
  reinvented per run.
- Mental-model shift: from "the brief is written each morning" to "the brief is
  RENDERED each morning - the structure already exists; today only supplies the
  values." That flip (structure fixed, values flow) is the essence of templating
  everywhere: documents, emails, reports, dashboards.
- Recognition cue: for any recurring deliverable, ask what stays identical between
  instances. Whatever stays identical should live in exactly one governed place.
  If each instance is written from scratch, consistency is luck.

## Artifact contract (condensed)

- Purpose: prove the brief's reusable structure - and its distinction from the
  prior-day DATA baseline - is understood before assembly.
- Immediate consumer: Morning Brief (lesson 16 renders into exactly these sections).
- Complete means: the learner knows which sections every brief must contain and
  why that consistency matters to readers and to automation.

## Learning contract

- Primary concept: output templating (structure across runs).
- Supporting: template vs baseline, section standards, versioned structure.
- Accomplishment: "I verified the structure today's brief must render into, and I
  can tell the structure carrier from the data carrier."
- Capability Statement: "The workflow can now assemble the daily output against a
  consistent brief structure."

## Lesson JSON (create src/data/lessons/lesson-prior-day-brief-template.json)

```json
{
  "id": "lesson-prior-day-brief-template",
  "nodeId": "prior-day-brief-template",
  "title": "Inspect the Brief's Reusable Structure",
  "difficulty": "Beginner",
  "skill": "Output templating",
  "scenario": "It is 6:50 AM. Every artifact the brief needs now exists. Before assembling, look at the one thing that does NOT change each morning: the brief's structure. Yesterday's brief, the day before's, and today's all share it - that sharing is the lesson.",
  "inputType": "text",
  "inputLabel": "Brief Template (structure only)",
  "input": "# Meridian Morning Market Brief - <day>\nStatus: <approval line>\n\n## Headline\n<the hub that moved most, and by how much>\n\n## Hub Summary\n<one line per hub: peak, settled, vs forecast>\n\n## Operations\n<generation and operational notes>\n\nSame sections, every day. The numbers change; the structure does not. Structure version: 1.0.0, owned by the Desk Manager.",
  "instructions": [
    "Read the template and notice what is fixed and what is a placeholder.",
    "Answer the four structure questions.",
    "Validate to record the profile."
  ],
  "interactionType": "choiceCheck",
  "validation": {
    "type": "choiceCheck",
    "questions": [
      {
        "id": "q1",
        "prompt": "What does this template carry from day to day?",
        "options": [
          { "id": "a", "text": "Yesterday's prices, for comparison" },
          { "id": "b", "text": "Structure - the sections every brief must have, in order" },
          { "id": "c", "text": "The threshold values the desk agreed" }
        ],
        "correctOptionId": "b",
        "explain": "Look at what is literal in the input versus what sits in angle brackets: the headings are fixed; every number is a placeholder. The template carries the fixed part."
      },
      {
        "id": "q2",
        "prompt": "The Prior Day Reference (lesson 06) also carries something across days. What is the difference?",
        "options": [
          { "id": "a", "text": "There is no difference - they are the same node drawn twice" },
          { "id": "b", "text": "The reference carries DATA (yesterday's numbers); the template carries STRUCTURE (the sections)" },
          { "id": "c", "text": "The template carries data; the reference carries structure" }
        ],
        "correctOptionId": "b",
        "explain": "Both cross midnight, but they carry different cargo: the baseline feeds Variance Check with numbers; this template feeds the Morning Brief with shape."
      },
      {
        "id": "q3",
        "prompt": "Why does a consistent structure matter beyond looking tidy?",
        "options": [
          { "id": "a", "text": "Readers and downstream automation both know where to look - the Approval line or Headline is always in the same place" },
          { "id": "b", "text": "It makes the brief shorter" },
          { "id": "c", "text": "It avoids the need for approvals" }
        ],
        "correctOptionId": "a",
        "explain": "Consistency is an interface: a manager scans the same spot daily, and anything parsing the brief (like tomorrow's baseline extraction) depends on sections staying put."
      },
      {
        "id": "q4",
        "prompt": "Which workflow step consumes this template?",
        "options": [
          { "id": "a", "text": "Morning Brief - it renders today's values into these sections" },
          { "id": "b", "text": "Variance Check - it compares against the sections" },
          { "id": "c", "text": "Approval Decision - it routes based on the headings" }
        ],
        "correctOptionId": "a",
        "explain": "Follow the map: the assembly step is where fixed structure meets today's values."
      }
    ],
    "artifactOnPass": {
      "source": "prior-day-brief-template",
      "carries": "structure (sections and order), not data",
      "sections": ["Status", "Headline", "Hub Summary", "Operations"],
      "version": "1.0.0",
      "owner": "Desk Manager",
      "distinctFrom": "prior-day-reference carries data; this carries structure",
      "firstConsumer": "morning-brief"
    }
  },
  "fieldGuide": [],
  "copilotPrompt": "Profile this output template: what it carries across runs, how it differs from a data baseline, why structural consistency matters, and which step consumes it.",
  "successMessage": "Structure verified. The assembly step now has its frame - next you fill it with today's values.",
  "intro": {
    "heading": "Before you inspect: structure vs data",
    "sections": [
      {
        "title": "Rendered, not written",
        "body": "Nobody authors the brief from scratch at 6:50 AM. The structure already exists; the morning supplies values. Fixed structure plus flowing values is templating - the same pattern behind mail merge, report generators, and every recurring dashboard."
      },
      {
        "title": "Two carriers cross midnight",
        "body": "Yesterday hands today two things: numbers (the prior-day baseline, used by Variance Check) and shape (this template, used by assembly). They look like twins on the map; they do different jobs."
      },
      {
        "title": "Structure is an interface",
        "body": "Because the Approval line is always at the top, the Desk Manager checks it in one glance - and automation extracting tomorrow's baseline knows where the numbers live. Consistency serves both audiences at once."
      },
      {
        "title": "Structure is governed too",
        "body": "The template has a version and an owner, like the Threshold Policy and the Approval Template. Changing the brief's sections is a governance act - readers and parsers both depend on it."
      }
    ],
    "jsonExample": "{\n  \"carries\": \"structure\",\n  \"sections\": [\"Status\", \"Headline\", \"Hub Summary\", \"Operations\"],\n  \"firstConsumer\": \"morning-brief\"\n}",
    "skill": "Output templating",
    "artifactName": "source-profile-brief-template.json"
  },
  "takeaway": {
    "heading": "Structure verified",
    "points": [
      "You separated the fixed part of a recurring output (sections) from the flowing part (values).",
      "You can now tell the two midnight-crossing inputs apart: baseline carries data, template carries structure.",
      "You saw structure as an interface serving two audiences: human readers and downstream parsing.",
      "The very next lesson renders today's artifacts into exactly these sections.",
      "The workflow can now assemble the daily output against a consistent brief structure."
    ],
    "artifactName": "source-profile-brief-template.json"
  }
}
```

## Wiring

1. Requires choiceCheck (ENGINE_ADDITIONS_SPEC.md section 1).
2. Register lesson-prior-day-brief-template in src/App.jsx.
3. Set `"taskId": "lesson-prior-day-brief-template"` on node
   `prior-day-brief-template` in src/data/workflowNodes.json.

## Acceptance checklist

- [ ] Wrong q2 answer (option c) shows the cargo-distinction explain.
- [ ] Pass stores source-profile-brief-template.json; node completes.
- [ ] No page scroll at 800px in wrong-answer state; lint/build pass.
