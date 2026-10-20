# Get unstuck

## Where is my work?

After selecting an activity, the launcher shows its location under `my-work/`. Each lab, homework, and extension has its own folder. Existing files are kept when you return. Your place is saved locally; it is not a grade or a claim of completion.

The shell does not change folders when a menu finishes. Use the launcher to start Claude Code in the selected workspace, or open the printed folder yourself.

## The menu does not open

Run `node go --doctor` from the extracted repository folder. If Node.js is missing, start at [SETUP.md](SETUP.md). In a non-interactive terminal, jump directly:

```sh
node go --path live --lab 03
```

## I want homework or an extension

Press **? → Homework or extension** (or choose More options in plain mode). You can also jump directly:

```sh
node go --path signature --lab 03 --part homework
node go --path signature --lab 03 --part extension
```

Each activity starts with its own inputs; you do not have to complete the preceding activity to open it. The extension instructions tell you what background helps.

## I want to check or compare

```sh
node go --lab 03 --check
node go --lab 03 --hint
node go --lab 03 --example
```

The example is revealed only when you ask. Some tasks have a fact checker; open-ended tasks give you review questions. A file check cannot judge your intuition or certify mastery.

## Claude Code or an integration is unavailable

Read the task first, write a prediction, then inspect a worked example. Keep the distinction between reasoning about the task and actually running it. Record the access blocker without bypassing your organization's rules.

## I want to try again

Revise your own output or make another file in the same `outputs/` folder. The launcher has no destructive reset command. It never checks out a branch, stashes changes, deletes your work, or pushes to GitHub.

## What should stay private?

Use the supplied fictional data for your first attempts. Your wishes, reflections, and outputs stay in `my-work/`, ignored by Git. Git ignore rules do not stop an explicit force-add, a screenshot, or other sharing. Review what you choose to share.

A working folder organizes the task; instructions and folder names do not enforce full isolation. Follow the [current permission guidance](https://code.claude.com/docs/en/permissions) when reviewing tool actions.
