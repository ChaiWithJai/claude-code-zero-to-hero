# NOTE-02: How I measure the request

Track a stable request/message ID, exact model, input tokens, output tokens, cache writes by duration, and cache reads. Price each request separately. Repeated snapshots of the same request should not inflate totals. All input, including cached input, contributes to Haiku 5.5's 100,000-token pricing threshold. Actual invoices come from the account provider.

Verified 2026-10-20. Sources:
https://platform.claude.com/docs/en/about-claude/pricing
https://code.claude.com/docs/en/monitoring-usage
