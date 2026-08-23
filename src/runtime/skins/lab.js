import { storeLabel, sourceLabel, rulesText, matchText, setText, setFields, truncate } from './shared.js'

// The Lab skin: neutral vocabulary (the taxonomy's action kinds).
export const labSkin = {
  id: 'lab',
  label: 'Lab',
  layout: 'rail',
  family: 'neutral',
  paletteLabel(kind) {
    return { trigger: 'Trigger', lookup: 'Lookup', transform: 'Transform', condition: 'Condition', approval: 'Approval', send: 'Send', compose: 'Compose', store: 'Store', stop: 'Stop' }[kind] || kind
  },
  describe(step, ctx) {
    const c = step.config || {}
    switch (step.kind) {
      case 'trigger':
        return c.mode === 'schedule'
          ? { title: 'Trigger: on a schedule', subtitle: c.at ? `Every day at ${c.at}` : 'No time set' }
          : { title: 'Trigger: when something arrives', subtitle: c.source ? `In ${sourceLabel(ctx, c.source)}` : 'No source connected' }
      case 'lookup':
        return { title: `Lookup: ${storeLabel(ctx, c.store)}`, subtitle: `${c.mode === 'all' ? 'all rows' : 'one row'} where ${matchText(c)} -> ${c.as || c.store || '?'}` }
      case 'transform':
        return { title: `Transform: ${setFields(c).join(', ') || 'nothing yet'}`, subtitle: setText(c) }
      case 'condition':
        return { title: 'Condition', subtitle: `If ${rulesText(c)}` }
      case 'approval':
        return { title: `Approval: ${c.approver || 'who?'}`, subtitle: c.about ? `About ${c.about}` : 'Ask, and store the reply' }
      case 'send':
        return { title: `Send to ${c.to || 'who?'}`, subtitle: c.subject ? truncate(c.subject) : `via ${c.channel || 'email'}` }
      case 'compose':
        return { title: `Compose ${c.as || 'body'}`, subtitle: truncate(c.template || '(empty template)') }
      case 'store':
        return { title: `Store in ${storeLabel(ctx, c.store)}`, subtitle: c.from ? `each row of ${c.from}` : c.mode === 'upsert' ? `upsert by ${c.key || '?'}` : 'append the record' }
      case 'stop':
        return { title: 'Stop here', subtitle: 'This record is done; nothing below runs for it' }
      default:
        return { title: step.kind, subtitle: '' }
    }
  },
}
