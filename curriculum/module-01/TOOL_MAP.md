# Module 1 (Meridian Morning) - Tool Map

How each step of the Meridian morning-brief workflow maps to the tools people
actually automate with at work. The lab teaches the *shape* of each step; this
map shows how you would rebuild that same shape in Power Automate, Zapier, or
Python once you leave the lab.

Read it two ways:

- Top to bottom it is the whole pipeline: extract the overnight signal,
  normalize the numbers, judge them against policy, decide, and publish.
- Row by row it is a transfer cheat-sheet: the "By hand" column is the manual
  version of the step, and the three tool columns are the automated equivalents.

The tool names are illustrative connectors/actions, not the only option. The
skill is recognizing which *kind* of action each step needs (a trigger, a
lookup, a transform, a condition, an approval, a send) - the specific product is
interchangeable.

## Phase 1-2: Capture the inputs

| Step | By hand | Power Automate | Zapier | Python |
| --- | --- | --- | --- | --- |
| Profile the Overnight Note | Copy the analyst's email/chat note and hand-key ticker, direction, rationale into named columns. | Outlook "When a new email arrives" trigger into a SharePoint "Create item". | Email Parser by Zapier extracts fields, then Google Sheets "Create Row". | imaplib/email to read the note, regex or an LLM call to extract fields into a dict. |
| Interpret the Trader's Flag | Log the trader's one-line flag as a row with ticker, severity, reason. | Teams "When a new message is posted" trigger into a Dataverse "Create item". | Slack "New Message Posted" trigger into an Airtable "Create Record". | slack_sdk to read the channel, parse the flag text, append to a list/DataFrame. |
| Create the Market Intake Record | Copy note and flag into one intake row, deciding which field wins on conflict. | "Compose" + "Join" to merge the two inputs, then "Create item". | A multi-step Zap with a "Formatter" merge feeding one "Create Record". | Build one dict from both sources, {**note, **flag}, resolving conflicts explicitly. |
| Read the Feed Like a Contract | Download the overnight price file and load its rows into a table. | "When a file is created" (SharePoint/OneDrive) + Excel "List rows in a table". | "New File in Folder" (Dropbox/Drive) into "Create Spreadsheet Row(s)". | pandas.read_csv (or requests to the feed API) to load rows into a DataFrame. |
| Inspect the Comparison Input | Pull forecast numbers from the portal/report into a table keyed by hub and date. | HTTP "GET" the forecast API + "Parse JSON" into a table. | Webhooks by Zapier "GET" the endpoint, then "Create Row". | requests.get the forecast API, then json() the response into records. |
| Trace the Baseline to Yesterday | Look up yesterday's closing values and stage them as the baseline. | "Get items" filtered to yesterday's date from your SharePoint archive. | "Find Record" in Airtable filtered to the prior day. | Query the store (SQL WHERE date = yesterday) or read the prior archive file. |

## Phase 3: Normalize and judge

| Step | By hand | Power Automate | Zapier | Python |
| --- | --- | --- | --- | --- |
| Normalize Messy Price Rows | Find-and-replace "$" and "/MWh" in Excel, then set the column type to number. | "Apply to each" row with replace()/int() expressions to coerce values. | "Formatter > Numbers" to strip symbols and convert text to a real number. | float(re.sub(r'[^0-9.]', '', value)) per cell, or pandas.to_numeric. |
| Set and Version a Threshold Policy | Write the threshold rules in a shared doc/config tab as one source of truth. | Store limits in an Environment Variable or a SharePoint config list read at runtime. | Keep thresholds in a "Storage by Zapier" value or a lookup table. | A policy dict loaded from a JSON/YAML config at the top of the script. |
| Compare Actuals vs Forecast/Prior | Add an Excel column comparing today vs prior day and an IF that marks breaches. | A "Condition" comparing each value against the policy, tagging breaches. | "Filter"/"Paths" that only continue when the variance exceeds the threshold. | Compute (today-prior)/prior and flag rows where abs(pct) > limit. |
| Apply the Threshold Policy | Combine clean prices and policy into one verdict per hub (normal/watch/breach). | A "Switch" on the computed score to assign a risk label. | "Paths" branching by score to set a risk-level field. | A scoring function mapping the metrics to a risk label. |

## Phase 4: Decide and route

| Step | By hand | Power Automate | Zapier | Python |
| --- | --- | --- | --- | --- |
| Standardize the Approval Request | Write a reusable message template with merge fields so every request reads the same. | A "Compose" with dynamic content, or an approval email template with placeholders. | A step with {{merge fields}} in the message body. | An f-string or Jinja2 template filled from the record. |
| Encode the Escalation Branch | Auto-approve if within tolerance, otherwise send to a person. | "Condition" -> either auto-complete or "Start and wait for an approval". | "Filter"/"Paths" that auto-pass clean cases and route the rest. | if within_tolerance: approve() else: escalate(). |
| Capture the Approval as a Record | Look up who owns the decision (desk/amount/region) and send it to the right person. | A lookup table + "Start and wait for an approval" addressed to the resolved approver. | "Lookup Table" by Formatter to pick the approver, then send. | A routing map {region: approver} and a send call. |
| Log the Quiet-Morning Outcome | When nothing is flagged, let the run proceed automatically and log it. | The "yes" branch that completes silently and writes an audit row. | The default Path that finishes without human review. | The else branch that commits and logs without escalation. |

## Phase 5: Publish and archive

| Step | By hand | Power Automate | Zapier | Python |
| --- | --- | --- | --- | --- |
| Inspect the Brief Template | Keep last issue's brief as a template so today's edition follows the same order. | A stored Word/HTML template populated with dynamic content. | A template message step with merge fields for each section. | A Jinja2 or string template with named sections. |
| Assemble the 7:00 AM Brief | Drop the cleaned numbers and risk verdicts into the template, ready to send. | "Create HTML table" + "Compose" to build the body, then "Send an email". | A "Formatter" build step feeding "Send Outbound Email"/Gmail. | Render the template with the day data, output HTML or markdown. |
| Deliver, Retain, Seed Tomorrow | Send to the distribution list and save a dated copy to a shared folder. | "Send an email" to the group + "Create file" in a dated SharePoint library. | "Send Email" + "Upload File" to Drive/Dropbox in one Zap. | smtplib to send, then write a timestamped file to storage or S3. |

## The transferable pattern

Every workflow in this course is the same five moves in a different costume:

1. **Trigger / capture** - an email, message, file, or API pulls a raw signal in.
2. **Normalize** - coerce messy human formats into clean, typed fields.
3. **Judge against policy** - compare the data to a written, versioned rule set.
4. **Decide / route** - a condition sends clean cases one way and exceptions to a human.
5. **Publish / archive** - render an output, deliver it, and keep a dated record.

Once you see those five moves, the specific product (Power Automate vs Zapier vs
Python) is just a choice of dialect.
