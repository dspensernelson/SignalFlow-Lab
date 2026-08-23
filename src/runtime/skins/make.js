import { storeLabel, sourceLabel, rulesText, matchText, setText, truncate } from './shared.js'

// Make idiom: round modules on a horizontal line; a Router fans out routes with filters.
export const makeSkin = {
  id: 'make',
  label: 'Make',
  layout: 'line',
  family: 'low-code',
  paletteLabel(kind) {
    return {
      trigger: 'Watch Emails / Schedule',
      lookup: 'Data store > Search Records',
      transform: 'Tools > Set Multiple Variables',
      condition: 'Flow Control > Router',
      approval: 'Webhooks > Custom Webhook (reply)',
      send: 'Email > Send an Email',
      compose: 'Tools > Text Aggregator',
      store: 'Data store > Add a Record',
      stop: 'End route',
    }[kind]
  },
  describe(step, ctx) {
    const c = step.config || {}
    switch (step.kind) {
      case 'trigger':
        return c.mode === 'schedule'
          ? { title: 'Schedule', subtitle: `Run scenario: Every day at ${c.at || '?'}` }
          : { title: 'Email > Watch Emails', subtitle: `Folder: ${sourceLabel(ctx, c.source)} - Mark as read` }
      case 'lookup':
        return { title: 'Data store > Search Records', subtitle: `Data store: ${storeLabel(ctx, c.store)} - Filter: ${matchText(c)}${c.mode === 'all' ? ' - Limit: all' : ' - Limit: 1'}` }
      case 'transform':
        return { title: 'Tools > Set Multiple Variables', subtitle: setText(c) }
      case 'condition':
        return { title: 'Flow Control > Router', subtitle: `Route filter: ${rulesText(c)}`, branchLabels: { yes: 'Route 1 (filter passes)', no: 'Route 2 (fallback)' } }
      case 'approval':
        return { title: 'Webhooks > Custom Webhook', subtitle: `Wait for ${c.approver || '?'}'s reply${c.about ? ` on ${c.about}` : ''}` }
      case 'send':
        return { title: c.channel === 'chat' ? 'Slack > Create a Message' : 'Email > Send an Email', subtitle: `To: ${c.to || '?'}${c.subject ? ` - Subject: ${truncate(c.subject, 40)}` : ''}` }
      case 'compose':
        return { title: 'Tools > Text Aggregator', subtitle: truncate(c.template || '') }
      case 'store':
        return { title: c.mode === 'upsert' ? 'Data store > Update a Record' : 'Data store > Add a Record', subtitle: `Data store: ${storeLabel(ctx, c.store)}${c.from ? ` - via Iterator on ${c.from}` : ''}` }
      case 'stop':
        return { title: '(route ends)', subtitle: 'Nothing further on this route' }
      default:
        return { title: step.kind, subtitle: '' }
    }
  },
}
