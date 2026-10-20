# Observe the cost of a Claude Code session

In the repository folder, start the cost display:

```sh
node cost-lab live
```

Open the printed localhost link. It shows the session's estimated model usage and the cost of each request, matching the request-cost example in the presentation. There are no tabs or steps to complete on this page.

In a second terminal in the same folder, open Claude Code:

```sh
node cost-lab claude
```

This opens Haiku in the synthetic catalogue folder using your existing sign-in. The terminal prints the example prompt below. Paste it when ready. Sending the prompt consumes your account allowance.

> Please read catalogue.csv. A fictional producer wants an upbeat, sixty-second audio bed. Compare the audio candidates and choose the closest match. Preserve its source ID and rights status exactly as recorded. Write brief.json with these string fields: candidate_id, source_id, rights_status, reason, human_approval. In human_approval, state that a person must approve any real use. Read the file back and check it against the catalogue. Explain your choice briefly. Use only these exercise files.

Watch each request add to the total as Claude works. Then return to the presentation to add human review time and any other operating costs. A subscription usage estimate is not automatically an extra charge. Inspect the actual brief in Claude Code; the cost display does not decide whether the work is useful.

For a no-model rehearsal, start the display with `node cost-lab live --demo`. It visibly labels the costs as simulated. Start a fresh viewer to clear the example, or run the Claude wrapper, which clears it before connecting the real session.

## Reference

Node 22+ and an installed, signed-in Claude Code are required. The setup was checked with Claude Code 2.1.304. It uses native cost events sent directly to a local Node process. It has no extra packages, Docker, database or collector. Tool tracing and metric export are disabled. Prompt and tool-content logging stay off. Local configuration and exercise files are ignored by Git.

History is limited to 1,000 requests. If older records are discarded, the page labels the total as partial. Closing the viewer clears the history. Claude Code and your browser use additional memory beyond the viewer itself.

An already-open Claude session does not inherit this connection. Use the wrapper above. Organization-managed settings may override telemetry destinations. See [Claude Code monitoring](https://code.claude.com/docs/en/monitoring-usage) for the native export settings.
