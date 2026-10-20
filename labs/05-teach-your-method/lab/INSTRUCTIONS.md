# Teach your sidekick your method

Make a small method explicit, then improve it with feedback.

## Try it

1. Read inputs/meeting-notes.txt. Identify what is a decision, an action, a suggestion, or an open question.
2. Name the judgment you keep and the preparation you want your sidekick to support.
3. Describe a method: trigger, inputs, steps, exceptions, and a good result.
4. Run the starting prompt or adapt it with one preference. Save outputs/action-brief.txt.
5. Revise one instruction based on a mismatch. In outputs/NOTES.md compare before/after and the checking effort.

## Starting prompt

Read the inputs and write your prediction before using this prompt.

```text
Read inputs/meeting-notes.txt. Separate decisions from suggestions. List actions using only explicitly stated owners and dates; mark missing owners or dates unknown. Finish with open questions. Create outputs/action-brief.txt. Do not send messages, schedule anything, invent commitments, or edit inputs. Explain one preserved ambiguity in outputs/NOTES.md.
```

## Keep

Save your output in `outputs/`. Keep your prediction, source checks, model revision, and evidence route in `outputs/NOTES.md`. Your notes can stay private.

## Check

- Are unknown owners and dates still unknown?
- Did you keep a suggestion separate from a decision?
- Can you point to evidence that your revision helped?

The launcher offers hints, examples, and a work check. A check of an open-ended note is a prompt for review, not a grade.

[Background, if you need it](READING.md)
