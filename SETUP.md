# Set up once

Bring a computer and a folder you can find again. The same setup works for the live workshop, replay, and signature course.

## 1. Get this folder

Use the private repository invitation provided for your course. On GitHub, choose **Code → Download ZIP**, then extract it. You can also clone the repository if you already use Git.

Do not work inside the compressed ZIP. Keep the whole extracted folder together.

## 2. Check Node.js

The small interactive launcher needs **Node.js 22 or newer**. Node.js is the runtime for the menu; you are not being asked to learn JavaScript or set up a web application.

```sh
node --version
```

If it is not available, use the [official Node.js download](https://nodejs.org/en/download). Follow your organization's installation rules. You do not need to install packages after downloading this repository.

## 3. Open a terminal in this folder

Your default terminal is fine. You do not need a new terminal app.

Use the [Claude terminal guide](https://code.claude.com/docs/en/terminal-guide) if opening a folder from a terminal is unfamiliar.

Then run:

```sh
node go
```

`npm start` opens the same menu if that command is more familiar.

## 4. Prepare Claude Code

Follow the current [official quickstart](https://code.claude.com/docs/en/quickstart) using approved access. Having used Claude chat does not by itself establish Claude Code access.

The launcher offers **Work with Claude Code** after you choose a lab. It does not install the tool, connect accounts, or change permissions for you.

## If setup is blocked

You can read the instructions in `labs/`, make a prediction, and inspect the supplied examples. Mark your work as **analyzed**, rather than **executed**. Keep the exact blocker and one next step in your notes.

The core exercises use fictional local files. No work-account integration, browser connector, special workstation, or additional terminal is required. You can complete the independent execution checkpoint once approved tool access is ready.

Optional readiness check:

```sh
node go --doctor
```

## Practice with Codex

Use `node go --agent codex` to use the same lab menu with Codex. For a direct jump: `node go --agent codex --lab 03 --start`. Include `--agent codex` when you return; the default remains Claude Code. Check installation with `node go --agent codex --doctor`.

The launcher copies the lab coaching instructions into `AGENTS.md` for Codex and keeps any existing file. Review these instructions before starting. They guide the assistant; they do not restrict its operating-system permissions. Choose permissions in your agent and inspect its proposed actions. A version check only confirms the command runs; it does not verify sign-in or account access.

## Terminal navigation

Use ↑/↓ and Enter to choose. Esc returns from a secondary menu. In the reading view, use ↑/↓ or Space to scroll and Esc or q to return. Press q on a menu to quit. Ctrl+C exits and restores the terminal. Full instructions, hints and examples are read only when selected.

Use `node go --plain` if screen redraws or color are unhelpful, including when using a screen reader. `NO_COLOR=1` suppresses color in the interactive view. Screen reader behavior varies by terminal; plain mode is available without alternate-screen controls.
