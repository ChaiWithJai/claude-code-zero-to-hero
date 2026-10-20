# The cost of a finished job

A 20-minute exercise for Claude Code beginners. No model call or paid account is required for the demo. You need Node.js 22 or newer.

```sh
node cost-lab demo
node cost-lab serve
```

Open the localhost URL the command prints. Predict the cost of turning three teaching notes into a checked handout. Reveal the trace, add a repair, increase the context, then compare API pricing with subscription allocation. Keep the final teaching judgment at the center. The sidekick handles preparation.

## Your 20 minutes

- 0–3: Define a finished job and predict its cost. The output needs to be usable, not merely generated.
- 3–7: Identify how you pay. API token charges, subscription allocation, and human time value answer different questions.
- 7–12: Run the visual. Find input, output and cache usage. Price each request, including repairs. Haiku 5.5 uses a higher tier above 100,000 input tokens per request, including cached input.
- 12–16: Change one assumption. Compare the cost of another repair with another five minutes of review. Your hourly time value is an optional planning assumption.
- 16–19: Choose one real recurring task. Record the prediction, exact acceptance check, active review time, and one improvement for the next run.
- 19–20: Choose your next practice route.

## A complete practice job

Read `inputs/job-brief.md` and the three teaching notes. Make your own handout, then compare with `worked-example.md` after your attempt. The example trace remains simulated; an actual agent run has its own usage.

## Your own trace

Start with `/usage` in Claude Code and your provider's account usage page. The exact UI depends on your installed version. Claude Code's session dollar figure is a locally computed estimate. Included Pro/Max usage does not create that amount as a separate API invoice.

For a run where you already save Claude CLI stream-json output:

```sh
node cost-lab import /absolute/path/to/your-stream.jsonl --serve
```

The importer reads only the selected file. It keeps model/token metadata, not prompts, tools, or account IDs. It does not launch Claude, scan your home folder, or change telemetry settings. Reports stay in ignored `.local/cost-lab/`. A missing final result means the capture may be incomplete. Unknown models and missing cache-write breakdowns stay unpriced. The importer cannot establish your actual invoice, paid tool charges, or whether the job passed human review.

For a new capture, inspect your installed `claude --help` before using `--output-format stream-json --verbose` with a print-mode run. Running Claude consumes your plan or API allowance. A CLI budget flag is not a provider account spending limit. This exercise never starts that run for you.

## Hand-rolled job ledger

Record one row per model request with request ID, model, input tokens, output tokens, cache-write tokens by duration, and cache-read tokens. Separately record paid tool charges, human active minutes, and whether the output meets its acceptance check. Avoid counting both request rows and the final aggregate, or repeated snapshots of the same request.

API estimate = sum of request token categories × their rates. Add separately priced services if used. Estimated resources per accepted job adds active human time at the value you choose. Waiting time is not automatically human effort.

Subscription allocation = monthly fee ÷ chosen active days ÷ accepted jobs per day. This is a budgeting convention, not a daily bill. Keep included usage, monthly API credits, and separately billed usage in distinct buckets. Do not add API-equivalent included usage to the plan fee.

## Optional tracing extension

Claude Code supports OpenTelemetry metrics and events. The official console example sets `CLAUDE_CODE_ENABLE_TELEMETRY=1`, `OTEL_METRICS_EXPORTER=console`, and `OTEL_METRIC_EXPORT_INTERVAL=1000` for the session. Use a disposable/local test and the official monitoring guide when you choose this extension. This lab does not install a collector or enable prompt/tool-content logging. The local importer supports stream-json, not OTLP exports.

## Next practice

- **Free:** keep using the repository and the supplied exercises at your own pace.
- **Claude Code Daily Driver:** guided exercises for recurring work, planned as the lower-priced offer.
- **Claude Code Zero to Hero workshop:** live instruction, a visual model of understanding, and feedback on your own task, planned as the premium offer.

Prices, dates and booking details are not set in this exercise. The repo must be public or you must have access before the link works for you.

## Sources and rates

Rates checked 2026-10-20, USD before tax. The bundled table covers first-party standard global rates for named models. Other providers, batch, fast mode, data residency, contracts, credits, and future changes require separate treatment.

- [Anthropic API pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Claude subscriptions](https://claude.com/pricing)
- [Claude Code cost and usage](https://code.claude.com/docs/en/costs)
- [OpenTelemetry monitoring](https://code.claude.com/docs/en/monitoring-usage)
