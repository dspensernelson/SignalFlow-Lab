**CodeBlock** — the inset mono well for JSON examples, artifact previews, and the source note. Pass a string, or an object (auto-stringified).

```jsx
<CodeBlock>{`{\n  "hub": "ERCOT",\n  "approvalRequired": true\n}`}</CodeBlock>
<CodeBlock>{artifactObject}</CodeBlock>
<CodeBlock wrap>{analystNoteText}</CodeBlock>
```
