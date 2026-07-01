# SignalFlow Lab — Design System

A brand & UI system for **SignalFlow Lab**, a local React learning app for practicing
workplace automation by rebuilding real workflow maps one useful artifact at a time.

This system captures SignalFlow Lab's visual language — its enterprise signal-flow blueprint aesthetic — as reusable tokens, components, foundation specimens, and a full UI-kit recreation, in both **light and dark** themes.

---

## Product context

SignalFlow Lab teaches automation by building **one connected workflow** instead of
disconnected tutorials. *The process map is the curriculum.* Its first project is the
fictional **Meridian Morning Market Brief** — an energy-market workflow that turns messy
overnight market notes into an approval-ready 7:00 AM brief.

Learners click nodes on a phase-banded **workflow graph** (sources → references →
artifacts → processes → decisions → handoffs → outputs → archive) to inspect provenance,
access needs, downstream reuse, governance, and a "rebuild it solo" path — then complete
short build tasks that produce validated JSON artifacts. It should feel like an enterprise signal-flow blueprint: part workflow map, part operations console, part learning workspace.

**Core mental model:** Raw signals enter from the left (source nodes). The learner extracts and structures them into trusted workflow artifacts. Downstream nodes reuse those artifacts without rebuilding. Validation is signal quality — did the artifact pass schema checks? Completion means the workflow state changed, not that a lesson was scored.

Core surfaces this system covers:
- **Workflow Map** — the phase-banded canvas, selected-node detail panel, and workflow-health bar (the product's home view).
- **Lesson Workspace** — the Intro → Exercise → Takeaway flow with a JSON editor, deterministic validation, field guide, and Copilot prompt coach.
- **Artifact Viewer** — the saved JSON/Markdown a completed task produces.

### Sources used to build this system
- **GitHub:** `dspensernelson/SignalFlow-Lab` (private) — React + Vite + Tailwind MVP. The
  source of truth for exact colors, type, spacing, node taxonomy, copy, and component
  styling. Explore it to design with higher fidelity: https://github.com/dspensernelson/SignalFlow-Lab
  - Key files read: `src/lib/nodeStyles.js` (the 8 node-type accents), `src/index.css`
    (font + base colors), `src/components/*` (every Tailwind class), `src/data/*.json`
    (workflow nodes, phases, lessons — the product copy), and the doctrine docs
    (`PRODUCT_DOCTRINE.md`, `PROJECT_CONTEXT.md`).
- **Reference screenshots** (3, provided by the user): the polished light + dark Workflow
  Map with header chrome, project console, selected-node panel, and workflow-health bar.
  These informed the dark theme, the logo lockup, and the richer chrome the MVP code does
  not yet implement.

> The repository is **private** — this README does not assume the reader has access, but
> records the link so anyone who does can go deeper.

---

## Visual foundations

**Aesthetic:** clean, dense, functional — an enterprise signal-flow blueprint. Hairline
borders, soft shadows, generous use of tiny uppercase tracked eyebrow labels, and a single
confident blue accent against neutral grays. Color carries meaning (node type + status),
never decoration.

- **Color.** One brand accent: **blue-600 `#2563eb`** (hover `#1d4ed8`). Neutrals are
  Tailwind **gray** (`#f9fafb`→`#111827`); **slate** tints phase bands and dark surfaces.
  The system's most distinctive signal is the **8 node-type accents** (source amber,
  reference violet, artifact cyan, process indigo, decision yellow, handoff teal, output
  green, archive stone) — exact values in `tokens/node-types.css`. **Cyan/teal** is the
  formal signal-path accent: extraction lines, reuse edges, the artifact type identity
  (cyan-600 `#0891b2`), and downstream-feed line color. **Emerald** marks trusted/validated
  artifact state (applied only when type=artifact AND status=complete). **Status** has its
  own scale: ready (blue), in-progress (amber), complete (emerald), needs-inputs
  (amber-600/alert), upcoming (slate), context (violet). Imagery: none — the product is
  data-and-diagram, not photographic.
- **Type.** Native **Segoe UI** (system-ui fallback) for everything UI/prose — this *is*
  the Microsoft aesthetic, so no webfont ships. **Consolas**-led mono for JSON, filenames,
  and code. Scale runs unusually small-and-dense: 9–11px uppercase micro-labels are
  everywhere, 14px is default body, 24px is the page title. Weights 400/500/600/700.
- **Spacing & shape.** 4px base grid. Radii: chips 4px, inputs/small buttons 6px, buttons
  8px, **panels & nodes 12px**, phase regions 16px, status pills full. Borders are hairline
  (1px); the selected-node panel adds a **4px left type-accent strip**.
- **Backgrounds.** Flat fills, no gradients on content. Light app bg is `#f3f4f6`; cards are
  white. The dark canvas is a deep blue-black (`#0a0f1c`) with a faint grid texture and
  panels one step lighter (`#121a2c`).
- **Elevation.** Soft, low shadows (`shadow-sm` on cards). **Selected nodes glow** (a blue
  ring) **only in the dark theme**; in light they use a solid 2px ring + offset.
- **Borders, not bevels.** Everything is defined by 1px borders and fills. Relationship is
  shown with **rings** (selected = blue ring + offset, downstream = teal ring `--sf-signal-reuse`, upstream =
  amber ring `--sf-signal-raw`) and **edge color** (upstream amber, downstream cyan, reuse cobalt-cyan,
  completed-path emerald, idle slate). See `tokens/node-types.css` for the full `--sf-edge-*` set.
- **Motion.** Restrained: 0.15s ease color/opacity/shadow transitions on hover and
  selection. No bounces, no decorative loops. Hover = subtle bg shift / underline (links);
  press relies on the native button. Unrelated nodes **fade to 45% opacity** to focus the
  selection.
- **Transparency & blur.** Used sparingly — phase-band tints are low-alpha slate; dark-theme
  weak-status fills are low-alpha hues. No glassmorphism.
- **Cards.** Rounded-xl (12px), 1px border, `shadow-sm`, white/ink surface. Tinted variants
  (success/warning/info) keep the same shape with a colored border + weak fill.

---

## Content fundamentals

The product's voice is **plain, calm, and instructional** — a knowledgeable colleague
walking you through real work, never hype.

- **Person & address.** Second person, imperative for tasks ("Identify the market hub",
  "Return a valid JSON object"). First-person plural is avoided. The learner is "you";
  the system narrates what *you* will produce.
- **Tone.** Direct and concrete, grounded in a realistic business reason. Every lesson
  pairs a messy real input with a focused build task and a governance moment. Copy explains
  *why it matters* and *how this workflow uses it*, not just what to do.
- **Casing.** Sentence case for headings and body. **Uppercase + letter-spacing** is
  reserved for eyebrow micro-labels ("WORKFLOW MAP", "PURPOSE", "CONCEPTS", "FEEDS INTO")
  and the wordmark. Node-type labels are uppercase 10px bold.
- **Vocabulary.** Teaches automation literacy explicitly: *JSON, schema, field extraction,
  normalization, validation, threshold policy, decision, handoff, artifact, provenance,
  governance, audit trail, reuse.* Filenames are always mono and concrete
  (`market-intake.json`, `clean-prices.json`, `market-brief.md`).
- **Status language.** Short and consistent: *Ready · In progress · Complete · Needs inputs · Upcoming · Context.* Definitions: **Ready** = task can be started; **In progress** = started but not validated; **Complete** = validation passed, artifact saved; **Needs inputs** = can reuse upstream but not build-ready; **Upcoming** = visible future node, not actionable; **Context** = inspectable, no build action. ("Built" retired as redundant with Complete.) Buttons are verb-first: *Start lesson, Validate, Continue to Takeaway, Return to Canvas, Restart, Start Over.*
- **No emoji.** The MVP uses unicode marks (✓ ✗ → ←) inline; this system replaces those
  with Lucide line icons for fidelity to the reference screenshots. Tone stays professional.
- **Examples.**
  - Project goal: *"Build a workplace automation that turns messy overnight market inputs
    into an approval-ready 7:00 AM brief."*
  - Success: *"Intake record built. The workflow now has structured data to work with."*
  - Governance: *"Requires agreement on the required intake fields; the schema is the
    contract every downstream step trusts."*

---

## Iconography

- **Approach:** clean **line icons** (Lucide-style: 24×24, 2px stroke, round caps/joins),
  colored by `currentColor`. Node types each have a signature glyph (source = file-text,
  reference = shield, artifact = braces, process = line-chart, decision = user-check,
  handoff = send, output = file-text, archive = archive).
- **Substitution flag:** the SignalFlow-Lab repo ships **no UI icon set of its own** — its
  `public/icons.svg` is unrelated **purple social glyphs** (Bluesky/Discord/GitHub/X) and
  `public/favicon.svg` is a **purple lightning mark**, both leftover boilerplate that does
  **not** match the product's blue brand. They are kept in `assets/legacy/` for the record
  but are **not** part of this system. The product UI in the reference screenshots uses
  **Lucide-style** line icons, so this system embeds a curated **Lucide** (ISC-licensed)
  subset in `components/core/Icon.jsx`. **If SignalFlow Lab adopts an official icon set,
  drop it in and we'll switch `Icon` to it.**
- **Brand mark:** the **signal-bars / equalizer** glyph in `components/core/Logo.jsx`,
  recreated from the reference screenshots (no logo file exists in the repo). Pairs with the
  "SignalFlow Lab" wordmark (title case in body, uppercase + tracked in the top bar).
- **Emoji / unicode:** not used as iconography in this system.

---

## What's in here (index)

**Tokens** (`tokens/`, all `@import`ed by root `styles.css`)
- `palette.css` — raw blue / gray / slate / status hues + dark blue-blacks.
- `node-types.css` — the 8 node-type accents + 4 edge colors.
- `semantic.css` — surface/border/text/accent/status aliases, **light default + `[data-theme="dark"]`**.
- `typography.css` — font stacks, type scale, weights, tracking.
- `spacing.css` — spacing, radii, borders, node geometry, layout widths.

**Components** (`components/`, exported on `window.SignalFlowLabDesignSystem_4c48cf`)
- `core/` — `Button`, `Badge`, `Chip`, `Card`, `SectionLabel`, `StatItem`, `ThemeToggle`, `Logo`, `Icon`.
- `workflow/` — `WorkflowNode` (the signature canvas object), `Stepper`.
- `lesson/` — `CodeBlock`, `FieldGuideRow`, `ValidationRow`.
- Each component ships `.jsx` + `.d.ts` + `.prompt.md`; each folder has a `@dsCard` specimen.

**Foundation specimens** (`guidelines/*.card.html`) — Colors, Type, Spacing, Brand cards
that populate the Design System tab.

**UI kit** (`ui_kits/signalflow-lab/`) — interactive recreations of the Workflow Map and
Lesson Workspace; `index.html` is a click-through demo. See its README.

**Assets** (`assets/legacy/`) — the repo's mismatched purple boilerplate icons, retained
for reference only.

**Other** — `SKILL.md` (Agent-Skill front matter so this folder works as a downloadable
skill), this `readme.md`.

---

## Using it

Consumers link the single stylesheet and read components off the global namespace:

```html
<link rel="stylesheet" href="styles.css" />
<script src="_ds_bundle.js"></script>
<script type="text/babel">
  const { Button, WorkflowNode, Badge } = window.SignalFlowLabDesignSystem_4c48cf;
</script>
```

Switch themes by setting `data-theme="dark"` on any wrapping element (default is light).

> **Caveat — fonts:** SignalFlow Lab is intentionally a *system-font* brand (Segoe UI /
> Consolas). On non-Windows machines the fallback stack renders a near-equivalent; if you
> need pixel-identical rendering everywhere, supply licensed Segoe UI / Consolas files and
> add `@font-face` rules to a token file.
