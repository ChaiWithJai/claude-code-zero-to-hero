# Check and repair a result

Find unsupported facts and a failed constraint, then verify a repair.

## Try it

1. Read the brief, source cards, and inputs/flawed-comparison.csv. This example intentionally has mistakes.
2. Find an unsupported delivery claim and a width-eligibility mistake before asking for help.
3. Write a precise correction request using evidence.
4. Create a corrected outputs/comparison.csv. Check the change against original sources.
5. In outputs/NOTES.md, record one thing the result got right, the mismatch, your repair, and what you checked.

## Starting prompt

Read the inputs and write your prediction before using this prompt.

```text
Compare inputs/flawed-comparison.csv with the brief and source cards. Create a corrected outputs/comparison.csv using the same columns. Preserve unknown values. In outputs/NOTES.md explain each correction and its supporting source. Do not change inputs.
```

## Keep

Save your output in `outputs/`. Keep your prediction, source checks, model revision, and evidence route in `outputs/NOTES.md`. Your notes can stay private.

## Check

- Did you identify the invented Cedar delivery?
- Did you repair Harbor eligibility instead of averaging away the constraint error?

The launcher offers hints, examples, and a work check. A check of an open-ended note is a prompt for review, not a grade.

[Background, if you need it](READING.md)
