# Red-Team Test Cases

These cases challenge the current local build. They should not expand product scope.

## Intake Validator Cases

### Intake Invalid JSON

Input:

```json
{ "hub": "ERCOT",
```

Expected result: validation fails with a clear JSON parse message and no artifact is saved.

### Intake Missing Required Field

Input:

```json
{
  "hub": "ERCOT",
  "peakPrice": "$187/MWh",
  "settledPrice": "$142/MWh",
  "generationFlag": "Wind underperformed"
}
```

Expected result: validation fails because `approvalRequired` is missing. The feedback should identify the missing field.

### Intake Wrong Expected Value

Input:

```json
{
  "hub": "PJM",
  "peakPrice": "$187/MWh",
  "settledPrice": "$142/MWh",
  "generationFlag": "Wind underperformed",
  "approvalRequired": true
}
```

Expected result: validation fails the hub rule.

### Intake Accepted Price Formatting

Input:

```json
{
  "hub": "ercot",
  "peakPrice": "187",
  "settledPrice": "142/MWh",
  "generationFlag": "wind generation underperformed",
  "approvalRequired": "yes"
}
```

Expected result: validation passes because normalization, accepted values, and boolean coercion are working.

### Intake Ambiguous Boolean

Input:

```json
{
  "hub": "ERCOT",
  "peakPrice": "$187/MWh",
  "settledPrice": "$142/MWh",
  "generationFlag": "Wind underperformed",
  "approvalRequired": "maybe"
}
```

Expected result: validation fails with a message telling the user to use `true` or `false`.

## Flow Cases

- [ ] Failed validation keeps the user in the lesson.
- [ ] Failed validation leaves `Market Intake Record` as `in-progress`.
- [ ] Refresh after starting the Intake task surfaces `Market Intake Record` on the canvas as `in-progress` or resumable.
- [ ] Passing Intake saves the submitted user JSON, not a hardcoded answer.
- [ ] Refresh after passing Intake preserves `Market Intake Record` as `complete`.
- [ ] Source/reference nodes can be selected but do not show task launch actions.
- [ ] Future task nodes without built task IDs can be selected but remain locked/stubbed until explicitly scoped.
- [ ] Selecting a completed artifact node shows downstream reuse and View Artifact.

## Threshold Policy Validator Cases

### Threshold Policy Invalid JSON

Input:

```json
{ "policyName": "ERCOT Hub Threshold Policy",
```

Expected result: validation fails with a clear JSON parse message and no artifact is saved.

### Threshold Policy Missing Required Fields

Input:

```json
{
  "policyName": "ERCOT Hub Threshold Policy",
  "version": "1.0.0",
  "owner": "Risk Desk Lead"
}
```

Expected result: validation fails and identifies missing policy fields.

### Thresholds As Strings

Input:

```json
{
  "policyName": "ERCOT Hub Threshold Policy",
  "version": "1.0.0",
  "owner": "Risk Desk Lead",
  "approver": "Desk Manager",
  "routineThreshold": "5",
  "escalationThreshold": "12"
}
```

Expected result: validation fails because threshold values must be numbers, not strings.

### Bad Threshold Ordering

Input:

```json
{
  "policyName": "ERCOT Hub Threshold Policy",
  "version": "1.0.0",
  "owner": "Risk Desk Lead",
  "approver": "Desk Manager",
  "routineThreshold": 12,
  "escalationThreshold": 5
}
```

Expected result: validation fails because `escalationThreshold` must be greater than `routineThreshold`.

### Correct Policy

Input:

```json
{
  "policyName": "ERCOT Hub Threshold Policy",
  "version": "1.0.0",
  "owner": "Risk Desk Lead",
  "approver": "Desk Manager",
  "routineThreshold": 5,
  "escalationThreshold": 12
}
```

Expected result: validation passes and saves the parsed user JSON as `threshold-policy.json`.

## Clean Price Data Validator Cases

### Clean Price Data Invalid JSON

Input:

```json
[ { "hub": "ERCOT",
```

Expected result: validation fails with a clear JSON parse message and no artifact is saved.

### Clean Price Data Wrong Top-Level Shape

Input:

```json
{ "hub": "ERCOT", "peakPrice": 187, "settledPrice": 142 }
```

Expected result: validation fails because the answer must be a top-level JSON array of rows.

### Clean Price Data Missing Required Row Field

Input:

```json
[
  { "hub": "ERCOT", "peakPrice": 187 },
  { "hub": "SPP", "peakPrice": 96, "settledPrice": 88 },
  { "hub": "MISO", "peakPrice": 74, "settledPrice": 70 }
]
```

Expected result: validation fails because the ERCOT row is missing `settledPrice`.

### Clean Price Data Prices As Strings

Input:

```json
[
  { "hub": "ERCOT", "peakPrice": "$187/MWh", "settledPrice": "$142/MWh" },
  { "hub": "SPP", "peakPrice": 96, "settledPrice": 88 },
  { "hub": "MISO", "peakPrice": 74, "settledPrice": 70 }
]
```

Expected result: validation fails because price values must be numbers, not strings with `$` or `/MWh`.

### Clean Price Data Missing Expected Hub

Input:

```json
[
  { "hub": "ERCOT", "peakPrice": 187, "settledPrice": 142 },
  { "hub": "SPP", "peakPrice": 96, "settledPrice": 88 }
]
```

Expected result: validation fails because the expected `MISO` row is missing.

### Clean Price Data Correct Normalized JSON

Input:

```json
[
  { "hub": "ERCOT", "peakPrice": 187, "settledPrice": 142 },
  { "hub": "SPP", "peakPrice": 96, "settledPrice": 88 },
  { "hub": "MISO", "peakPrice": 74, "settledPrice": 70 }
]
```

Expected result: validation passes and saves the parsed user JSON array as `clean-prices.json`.
