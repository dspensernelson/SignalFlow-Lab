import { storeLabel, sourceLabel, rulesText, matchText, setText, truncate } from './shared.js'

// Power Automate idiom: vertical cards, action names from the connector catalog.
export const powerAutomateSkin = {
  id: 'powerAutomate',
  label: 'Power Automate',
  layout: 'rail',
  family: 'low-code',
  paletteLabel(kind) {
    return {
      trigger: 'When a new email arrives / Recurrence',
      lookup: 'Get items',
      transform: 'Compose',
      condition: 'Condition',
      foreach: 'Apply to each',
      approval: 'Start and wait for an approval',
      send: 'Send an email (V2)',
      compose: 'Compose (HTML)',
      store: 'Create item',
      stop: 'Terminate',
    }[kind]
  },
  describe(step, ctx) {
    const c = step.config || {}
    switch (step.kind) {
      case 'trigger':
        return c.mode === 'schedule'
          ? { title: 'Recurrence', subtitle: `Frequency: Day - At these hours: ${c.at || '?'}` }
          : { title: 'When a new email arrives (V3)', subtitle: `Folder: ${sourceLabel(ctx, c.source)} - Include Attachments: Yes` }
      case 'lookup':
        return { title: c.mode === 'all' ? 'Get items' : 'Get items (Top Count 1)', subtitle: `List Name: ${storeLabel(ctx, c.store)} - Filter Query: ${matchText(c)}` }
      case 'transform':
        return { title: 'Compose', subtitle: `Inputs: ${setText(c)}` }
      case 'condition':
        return { title: 'Condition', subtitle: rulesText(c), branchLabels: { yes: 'If yes', no: 'If no' } }
      case 'foreach':
        return { title: 'Apply to each', subtitle: `Select an output from previous steps: ${c.list || '?'}`, branchLabels: { each: 'Apply to each' } }
      case 'approval':
        return { title: 'Start and wait for an approval', subtitle: `Approval type: Approve/Reject - Assigned to: ${c.approver || '?'}${c.about ? ` - Title: ${c.about}` : ''}` }
      case 'send':
        return { title: c.channel === 'chat' ? 'Post message in a chat or channel' : 'Send an email (V2)', subtitle: `To: ${c.to || '?'}${c.subject ? ` - Subject: ${truncate(c.subject, 40)}` : ''}` }
      case 'compose':
        return { title: 'Compose (HTML)', subtitle: `Inputs: ${truncate(c.template || '')}` }
      case 'store':
        return { title: c.mode === 'update' ? 'Update item' : c.mode === 'upsert' ? 'Create or update item' : 'Create item', subtitle: `Site: ${(ctx && ctx.moduleData && ctx.moduleData.org) || 'Team site'} - List Name: ${storeLabel(ctx, c.store)}${c.from ? ` - Apply to each: ${c.from}` : ''}` }
      case 'stop':
        return { title: 'Terminate', subtitle: 'Status: Succeeded - this record is done' }
      default:
        return { title: step.kind, subtitle: '' }
    }
  },
}
