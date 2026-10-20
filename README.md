# Claude Code Zero to Hero

Choose a wish. Build your understanding. Practice with your sidekick.

## Start here

Open a terminal in this folder and run:

```sh
node go
```

Choose **Live workshop** or **Signature course**, then an exercise. Use the arrow keys and Enter. The launcher keeps your current task and work folder visible. Full instructions open in a scrollable reader, and you return to the same exercise after working with Claude Code.

Use `node go --plain` for numbered prompts without screen redraws. It also works with `--agent codex`. Run the launcher again to pick up where you left off.

[Set up once](SETUP.md) if you need Node.js, Claude Code, or help opening this folder. No `npm install` is needed.

## How the labs work

1. Predict what will happen.
2. Try a bounded task with the supplied files.
3. Check the result against the original information.
4. Update your model of understanding.

Your files live in `my-work/`. Switching labs, homework, or extensions keeps them. Your personal work and launcher progress are excluded from Git by default.

**Stuck?** Ask the launcher for a hint. **Ready to compare?** Ask for a worked example. **Want another rep?** Choose homework or an extension.

The live workshop uses a shorter path through the same labs. The signature course includes the full sequence. You do not need to switch branches, copy a solution over your work, or learn Git to move around.

[Browse the labs](labs/README.md) · [Get unstuck](HELP.md)

## The business masterclass

Run `node cost-lab serve` for a visual masterclass on revenue opportunities, operating costs and the work behind AI. It makes no model calls. [Open the exercise](labs/daily-cost/README.md).

To watch a Claude Code job happen, follow [the live observability exercise](labs/daily-cost/LIVE.md). Start with `node cost-lab live`, then open Haiku in a second terminal with `node cost-lab claude`. Use `node cost-lab live --demo` for a labeled example that makes no model calls.
