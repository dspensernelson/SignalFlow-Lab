import * as React from 'react'
import type { IconName } from '../core/Icon'

export type NodeType =
  | 'source' | 'reference' | 'artifact' | 'process'
  | 'decision' | 'handoff' | 'output' | 'archive'

export type NodeStatus = 'context' | 'locked' | 'ready' | 'in-progress' | 'complete'

export interface WorkflowNodeProps extends React.HTMLAttributes<HTMLButtonElement> {
  /** Object type → accent color + default icon + label. Default 'artifact'. */
  type?: NodeType
  /** Node title. */
  label: string
  /** Mono filename shown at the bottom (artifacts/outputs). */
  artifactName?: string
  /** Progress/context status → border + fill. Default 'ready'. */
  status?: NodeStatus
  /** Relationship to the current selection → ring. Default 'none'. */
  relation?: 'selected' | 'upstream' | 'downstream' | 'none'
  /** Fade unrelated nodes. Default false. */
  dimmed?: boolean
  /** Override the type's default icon. */
  icon?: IconName
}

/**
 * The signature workflow-map object: type-colored, status-skinned, selectable.
 * @startingPoint section="Workflow" subtitle="Canvas node, all 8 types & states" viewport="700x260"
 */
export function WorkflowNode(props: WorkflowNodeProps): JSX.Element
