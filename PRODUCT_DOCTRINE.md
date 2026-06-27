# Product Doctrine

## Purpose

Learn automation by building real workflows, one useful artifact at a time.

## Guiding Principles

1. **The map is the curriculum.** Learners progress by building pieces of one connected workflow instead of moving through disconnected tutorials.
2. **Every node introduces a concept.** Each workflow object teaches practical automation vocabulary like JSON, schemas, triggers, APIs, webhooks, validation, routing, and audit trails.
3. **Artifacts are the unit of progress.** Each task produces a reusable object in the system, such as a structured record, cleaned data table, decision rule, approval route, or brief.
4. **Connections reveal context.** Learners understand automation by seeing where each artifact comes from, what it feeds, where it gets reused, and why it matters.
5. **Governance is part of automation.** Ownership, access, approvals, data quality, auditability, exception handling, and reuse are treated as core workflow design concerns.

## Progression Model

Learners progress by completing buildable task nodes on the workflow map.

- A task is complete when it produces a validated artifact.
- An artifact becomes reusable once it is complete.
- Completed artifacts unlock downstream buildable tasks.
- Source and reference nodes can be inspected without being completed.
- Future nodes may be visible before they are buildable so learners can understand the larger workflow context.

## Map Hierarchy

Project -> Phase -> Workflow Node -> Task -> Artifact -> Concept

- Project: the overall business workflow being built.
- Phase: a capability layer in the workflow.
- Workflow Node: a source, reference, artifact, process, decision, handoff, output, or archive.
- Task: a short learner action attached to a buildable node.
- Artifact: a reusable output produced or improved by a task.
- Concept: the automation idea introduced by a node or task.

## Node Taxonomy Rule

A node should represent either a thing or an action. If a label could mean both, rename it or clarify it in the selected node panel.

## Selected Node Panel Contract

Each selected node should answer:

- What it is.
- Concept it introduces.
- Why it matters.
- Lab version: what the app uses locally instead of the real-world system.
- Upstream dependencies.
- Downstream reuse.
- Access or source requirements.
- Governance note where relevant.
- Solo rebuild path.

The panel may also display status and actions, but status/action is UI behavior rather than product doctrine.

## Lesson Quality Bar

A lesson is good enough when it has:

- A realistic business reason.
- A messy or incomplete input.
- A focused build task.
- A reusable artifact.
- A visible concept callout.
- Deterministic validation.
- A governance moment.
- A map-connected takeaway: each lesson closes by showing what was built, where it lives on the map, and what downstream nodes can reuse it.
