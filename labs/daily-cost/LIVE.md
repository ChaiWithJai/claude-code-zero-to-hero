# Watch one job happen

This exercise follows a fictional media catalogue inquiry from Claude Code's requests to a file you can inspect. It uses synthetic files and your existing Claude sign-in.

## Start the viewer

From the repository folder, run:

```sh
node cost-lab live
```

Open the localhost link printed in the terminal. Leave that terminal running. Click **Rehearse without a model call** first. The viewer labels this example **REHEARSAL**. It does not call Claude or create a real result.

## Connect Claude Code

Open a second terminal in the repository folder:

```sh
node cost-lab claude
```

This starts a fresh Haiku session in a separate folder containing only the exercise files. Your normal sign-in is reused. An already-open Claude session will not inherit this connection. Trust the generated exercise folder if Claude asks.

In the viewer, copy the supplied prompt and paste it into this new Claude session. Approve the file write if asked. Sending the prompt uses your account's model allowance or configured billing route. Starting the viewer and rehearsing make no model calls.

## Present the result

1. Open **Requests** and expand a row. Explain that input, output and cached tokens contribute to the request estimate. A subscription session estimate is not an extra invoice.
2. Open **Tools** and follow how Claude reads the catalogue, writes the brief and checks it. Native spans may arrive a few seconds after the action.
3. Open **Result** and inspect the proposed asset, source and exercise rights status. Enter the minutes you actively spent directing and reviewing the work. Accept the result only after checking it yourself.

Ask the audience what they would accept before revealing the result. The matching audio asset is M003, source SYN003. The rights status applies only to this fictional exercise. No client catalogue or signed-in browser accounts are needed.

The human time estimate uses an illustrative $60/hour. It is separate from the usage estimate and from actual cash payments. A successful request is not automatically an accepted job.

## Keep it light

You need Node 22 or later and an installed, signed-in Claude Code. This pathway was checked with Claude Code 2.1.304. The viewer has no npm dependencies, Docker, database or separate collector. It keeps up to 1,000 records per event type in memory and reports when records were discarded. Closing it clears the trace history.

The Node viewer measured approximately 31–42 MiB RSS during a local idle, connection and three-request rehearsal check. That is a sample, not a memory ceiling. Claude Code and your browser consume additional memory.

Claude's native telemetry goes directly to the localhost viewer using OTLP JSON. The launcher applies exporter settings only to its child session. Prompt, response and tool-content logging stay disabled; the viewer retains only selected usage and tool metadata. The Result tab reads the specific exercise output file. Local connection settings and exercise files stay in the ignored `.local/` folder.

If no telemetry arrives, check that both terminals are still running and that you started Claude with the wrapper above. Organization-managed settings may override telemetry destinations. You can always use the labeled rehearsal for the presentation. The tool timeline uses Claude's enhanced telemetry beta, so it may change between CLI releases.

[Claude telemetry documentation](https://code.claude.com/docs/en/monitoring-usage) explains the native exporters. [OpenInference](https://github.com/Arize-ai/openinference) provides instrumentation and conventions for applications you build. It is useful there, but this native Claude Code exercise does not need an additional instrumentation SDK or tracing backend.
