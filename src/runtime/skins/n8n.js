import { storeLabel, sourceLabel, rulesText, matchText, setText, truncate } from './shared.js'

// n8n idiom: rectangular nodes on a canvas; IF nodes have true/false outputs.
export const n8nSkin = {
  id: 'n8n',
  label: 'n8n',
  layout: 'line',
  family: 'low-code',
  paletteLabel(kind) {
    return {
      trigger: 'Email Trigger (IMAP) / Schedule Trigger',
      lookup: 'Google Sheets: Get row(s)',
      transform: 'Edit Fields (Set)',
      condition: 'IF',
      approval: 'Wait (resume on webhook)',
      send: 'Send Email',
      compose: 'Edit Fields (Set)',
      store: 'Google Sheets: Append row',
      stop: 'No Operation (branch ends)',
    }[kind]
  },
  describe(step, ctx) {
    const c = step.config || {}
    switch (step.kind) {
      case 'trigger':
        return c.mode === 'schedule'
          ? { title: 'Schedule Trigger', subtitle: `Cron: every day at ${c.at || '?'}` }
          : { title: 'Email Trigger (IMAP)', subtitle: `Mailbox: ${sourceLabel(ctx, c.source)} - Action: mark read` }
      case 'lookup':
        return { title: 'Google Sheets: Get row(s)', subtitle: `Sheet: ${storeLabel(ctx, c.store)} - Lookup: ${matchText(c)}${c.mode === 'all' ? ' - Return all matches' : ' - First match'}` }
      case 'transform':
        return { title: 'Edit Fields (Set)', subtitle: setText(c) }
      case 'condition':
        return { title: 'IF', subtitle: rulesText(c), branchLabels: { yes: 'true', no: 'false' } }
      case 'approval':
        return { title: 'Wait', subtitle: `Resume: On webhook call - from ${c.approver || '?'}${c.about ? ` about ${c.about}` : ''}` }
      case 'send':
        return { title: c.channel === 'chat' ? 'Slack: Send message' : 'Send Email', subtitle: `To: ${c.to || '?'}${c.subject ? ` - Subject: ${truncate(c.subject, 40)}` : ''}` }
      case 'compose':
        return { title: 'Edit Fields (Set)', subtitle: `${c.as || 'body'} = ${truncate(c.template || '')}` }
      case 'store':
        return { title: c.mode === 'upsert' ? 'Google Sheets: Append or update row' : 'Google Sheets: Append row', subtitle: `Sheet: ${storeLabel(ctx, c.store)}${c.from ? ` - Split Out ${c.from} first` : ''}` }
      case 'stop':
        return { title: 'No Operation, do nothing', subtitle: 'Branch ends here' }
      default:
        return { title: step.kind, subtitle: '' }
    }
  },
}
