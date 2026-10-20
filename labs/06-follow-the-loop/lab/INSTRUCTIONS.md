# Follow the loop

Predict, observe, and update your understanding of an agentic task.

## Try it

1. Read inputs/meeting-notes.txt or choose one of the supplied desk cards.
2. Before the next action, write the input you expect the agent to need and the output you expect it to create.
3. Watch or run a bounded read-and-summarize task. Pause before the next major action.
4. Record two predictions and compare them with what actually happened. Different valid routes are possible.
5. Explain who chose the next step and update one label or relationship in your model.

## Starting prompt

Read the inputs and write your prediction before using this prompt.

```text
Read inputs/meeting-notes.txt and explain what a useful action brief would need. Do not write files yet. Identify one missing fact and ask one clarification if it affects the result.
```

## Keep

Save your output in `outputs/`. Keep your prediction, source checks, model revision, and evidence route in `outputs/NOTES.md`. Your notes can stay private.

## Check

- Did you record predictions before observing the result?
- Can you explain a mismatch without treating every different click as failure?

The launcher offers hints, examples, and a work check. A check of an open-ended note is a prompt for review, not a grade.

[Background, if you need it](READING.md)
