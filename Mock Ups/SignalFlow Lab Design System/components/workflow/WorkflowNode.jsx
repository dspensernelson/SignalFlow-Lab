import React from 'react'
import { Icon } from '../core/Icon'

/*
 * WorkflowNode — the signature object on the SignalFlow Lab canvas.
 * A type icon + uppercase type label, the node label, and (for artifacts) a
 * mono filename. Border/fill come from STATUS; a ring marks the node's
 * relationship to the current selection (selected / upstream / downstream).
 *
 * Signal-flow state model:
 *   ready        — task can be started; all inputs present
 *   in-progress  — started but not yet validated
 *   complete     — validation passed; artifact saved
 *                  (type=artifact → emerald/cyan emphasis via artifact-trusted tokens)
 *   needs-inputs — can reuse upstream artifact but is not yet build-ready
 *   upcoming     — visible future node; not currently actionable
 *   context      — inspectable; no build action available
 *   locked       — not accessible in this session
 *
 * Signal-flow ring semantics:
 *   selected   — blue double ring (current focus)
 *   upstream   — amber ring (raw signal source; --sf-signal-raw)
 *   downstream — teal ring (reuse/feed path; --sf-signal-reuse)
 */
const TYPE_META = {
  source:    { color: 'var(--sf-type-source)',    icon: 'file-text',  label: 'Source' },
  reference: { color: 'var(--sf-type-reference)', icon: 'shield',     label: 'Reference' },
  artifact:  { color: 'var(--sf-type-artifact)',  icon: 'braces',     label: 'Artifact' },
  process:   { color: 'var(--sf-type-process)',   icon: 'line-chart', label: 'Process' },
  decision:  { color: 'var(--sf-type-decision)',  icon: 'user-check', label: 'Decision' },
  handoff:   { color: 'var(--sf-type-handoff)',   icon: 'send',       label: 'Handoff' },
  output:    { color: 'var(--sf-type-output)',    icon: 'file-text',  label: 'Output' },
  archive:   { color: 'var(--sf-type-archive)',   icon: 'archive',    label: 'Archive' },
}

function statusSkin(status, type, typeColor) {
  /* Trusted artifact: type=artifact + complete → emerald/cyan emphasis.
     This distinguishes "structured signal object" (type identity, cyan) from
     "validated trusted artifact" (completion state, emerald + cyan border). */
  if (status === 'complete' && type === 'artifact') {
    return {
      border: 'var(--sf-artifact-trusted-border)', /* cyan */
      bg:     'var(--sf-artifact-trusted-weak)',    /* emerald-50 */
    }
  }
  switch (status) {
    case 'complete':
      return { border: 'var(--sf-complete)',      bg: 'var(--sf-complete-weak)' }
    case 'in-progress':
      return { border: 'var(--sf-progress)',      bg: 'var(--sf-surface)' }
    case 'ready':
      return { border: 'var(--sf-accent-border)', bg: 'var(--sf-surface)' }
    case 'needs-inputs':
      return { border: 'var(--sf-needs-inputs)',  bg: 'var(--sf-needs-inputs-weak)' }
    case 'upcoming':
      return { border: 'var(--sf-upcoming)',      bg: 'var(--sf-surface-subtle)' }
    case 'context':
      return {
        border: 'color-mix(in srgb, ' + typeColor + ' 45%, transparent)',
        bg:     'color-mix(in srgb, ' + typeColor + ' 9%, var(--sf-surface))',
      }
    case 'locked':
    default:
      return { border: 'var(--sf-border)', bg: 'var(--sf-surface-subtle)' }
  }
}

export function WorkflowNode({
  type = 'artifact',
  label,
  artifactName,
  status = 'ready',
  relation = 'none', // 'selected' | 'upstream' | 'downstream' | 'none'
  dimmed = false,
  icon,
  onClick,
  className = '',
  style,
  ...rest
}) {
  const meta  = TYPE_META[type] || TYPE_META.artifact
  const skin  = statusSkin(status, type, meta.color)
  const locked = status === 'locked'
  const muted  = locked || status === 'upcoming'

  // Ring uses signal-flow semantics: amber upstream, teal downstream, blue selected
  let ring = 'none'
  if      (relation === 'selected')   ring = '0 0 0 2px var(--sf-surface), 0 0 0 4px var(--sf-accent)'
  else if (relation === 'downstream') ring = '0 0 0 2px var(--sf-signal-reuse)'
  else if (relation === 'upstream')   ring = '0 0 0 2px var(--sf-signal-raw)'

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-pressed={relation === 'selected'}
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        width: 'var(--sf-node-w)',
        minHeight: 'var(--sf-node-h)',
        padding: '10px',
        textAlign: 'left',
        borderRadius: 'var(--sf-radius-xl)',
        border: `1px solid ${skin.border}`,
        background: skin.bg,
        color: muted ? 'var(--sf-text-subtle)' : 'var(--sf-text)',
        boxShadow: ring === 'none' ? 'var(--sf-shadow-sm)' : ring,
        opacity: dimmed ? 0.45 : 1,
        cursor: 'pointer',
        transition: 'box-shadow .15s ease, opacity .15s ease, border-color .15s ease',
        fontFamily: 'var(--sf-font-sans)',
        ...style,
      }}
      {...rest}
    >
      {/* Type row */}
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: meta.color, display: 'inline-flex' }}>
            <Icon name={icon || meta.icon} size={13} strokeWidth={2.25} />
          </span>
          <span style={{
            fontSize: 'var(--sf-text-10)',
            fontWeight: 'var(--sf-weight-bold)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--sf-tracking-wide)',
            color: meta.color,
          }}>
            {meta.label}
          </span>
        </span>

        {/* Status badge icons */}
        {status === 'complete' && type === 'artifact' && (
          <span style={{ color: 'var(--sf-artifact-trusted)', display: 'inline-flex' }}>
            <Icon name="circle-check" size={15} strokeWidth={2.25} />
          </span>
        )}
        {status === 'complete' && type !== 'artifact' && (
          <span style={{ color: 'var(--sf-complete)', display: 'inline-flex' }}>
            <Icon name="circle-check" size={15} strokeWidth={2.25} />
          </span>
        )}
        {status === 'needs-inputs' && (
          <span style={{ color: 'var(--sf-needs-inputs)', display: 'inline-flex' }}>
            <Icon name="alert-circle" size={15} strokeWidth={2.25} />
          </span>
        )}
        {locked && (
          <span style={{ color: 'var(--sf-text-subtle)', display: 'inline-flex' }}>
            <Icon name="lock" size={13} />
          </span>
        )}
      </span>

      {/* Node label */}
      <span style={{
        fontSize: 'var(--sf-text-sm)',
        fontWeight: 'var(--sf-weight-semibold)',
        lineHeight: 'var(--sf-leading-tight)',
      }}>
        {label}
      </span>

      {/* Artifact filename */}
      {artifactName && (
        <span style={{
          marginTop: 'auto',
          fontFamily: 'var(--sf-font-mono)',
          fontSize: 'var(--sf-text-10)',
          color: 'var(--sf-text-muted)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {artifactName}
        </span>
      )}
    </button>
  )
}
