**FieldGuideRow** — one entry in a lesson's Field Guide: field name, JSON type, meaning, example, hint. Stack several inside a `Card`.

```jsx
<FieldGuideRow divider={false} field="hub" type="string" meaning="The market hub mentioned in the note." example={'"ERCOT"'} hint="Look for the named trading hub or region." />
<FieldGuideRow field="approvalRequired" type="boolean" meaning="Whether approval is needed before acting." example="true" hint="Use true or false based on the note." />
```
