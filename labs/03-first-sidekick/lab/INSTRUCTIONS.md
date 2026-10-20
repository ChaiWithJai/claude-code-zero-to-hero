# Direct your first sidekick

Produce a checked comparison from three fictional source cards.

## Try it

1. Read inputs/buyer-brief.txt and the three desk cards. All products and prices are fictional.
2. Write a prediction: what needs to be read, what should be created, and what could be unknown?
3. Ask your sidekick to create outputs/comparison.csv with the column names below.
4. Check two claims against source IDs. Check the mandatory width and budget constraints.
5. Explain your decision, remaining unknowns, and whether you ran the task in outputs/NOTES.md.

## Starting prompt

Read the inputs and write your prediction before using this prompt.

```text
Read the buyer brief and desk cards in inputs/. Use only supplied facts. Create outputs/comparison.csv with columns option,price_usd,width_cm,warranty_years,delivery_days,source_id,meets_width_limit,unknowns. Preserve missing delivery as unknown. Include all three options and apply the 105 cm width limit. Do not edit inputs, browse, purchase, sign in, or contact anyone. Explain trade-offs and missing information in outputs/NOTES.md; keep the final decision human.
```

## Keep

Save your output in `outputs/`. Keep your prediction, source checks, model revision, and evidence route in `outputs/NOTES.md`. Your notes can stay private.

## Check

- Do all three rows trace to their sources?
- Does Harbor fail the hard width limit?
- Is Cedar delivery still unknown?

The launcher offers hints, examples, and a work check. A check of an open-ended note is a prompt for review, not a grade.

[Background, if you need it](READING.md)
