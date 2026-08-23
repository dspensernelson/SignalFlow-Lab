import { storeLabel, sourceLabel, rulesText, matchText, setText, truncate } from './shared.js'

// Zapier idiom: a numbered vertical list; Paths split and do not rejoin.
export const zapierSkin = {
  id: 'zapier',
  label: 'Zapier',
  layout: 'rail',
  numbered: true,
  family: 'low-code',
  paletteLabel(kind) {
    return {
      trigger: 'Trigger: New Email / Schedule by Zapier',
      lookup: 'Find Record',
      transform: 'Formatter by Zapier',
      condition: 'Paths by Zapier',
      approval: 'Delay + Form reply',
      send: 'Gmail: Send Email',
      compose: 'Formatter: Text',
      store: 'Create Record',
      stop: 'End path',
    }[kind]
  },
  describe(step, ctx) {
    const c = step.config || {}
    switch (step.kind) {
      case 'trigger':
        return c.mode === 'schedule'
          ? { title: 'Schedule by Zapier: Every Day', subtitle: `Time of day: ${c.at || '?'}` }
          : { title: 'Gmail: New Email', subtitle: `Label/Mailbox: ${sourceLabel(ctx, c.source)}` }
      case 'lookup':
        return { title: c.mode === 'all' ? 'Airtable: Find Records' : 'Airtable: Find Record', subtitle: `Table: ${storeLabel(ctx, c.store)} - Search by: ${matchText(c)}` }
      case 'transform':
        return { title: 'Formatter by Zapier: Numbers', subtitle: setText(c) }
      case 'condition':
        return { title: 'Paths by Zapier', subtitle: `Path A rule: ${rulesText(c)}`, branchLabels: { yes: 'Path A', no: 'Path B' } }
      case 'approval':
        return { title: 'Delay Until + Form Submission', subtitle: `Wait for ${c.approver || '?'}${c.about ? ` on ${c.about}` : ''}` }
      case 'send':
        return { title: c.channel === 'chat' ? 'Slack: Send Channel Message' : 'Gmail: Send Email', subtitle: `To: ${c.to || '?'}${c.subject ? ` - Subject: ${truncate(c.subject, 40)}` : ''}` }
      case 'compose':
        return { title: 'Formatter by Zapier: Text', subtitle: truncate(c.template || '') }
      case 'store':
        return { title: c.mode === 'upsert' ? 'Airtable: Update Record' : 'Airtable: Create Record', subtitle: `Table: ${storeLabel(ctx, c.store)}${c.from ? ` - Looping by Zapier over ${c.from}` : ''}` }
      case 'stop':
        return { title: '(path ends)', subtitle: 'Zap stops for this record' }
      default:
        return { title: step.kind, subtitle: '' }
    }
  },
}
