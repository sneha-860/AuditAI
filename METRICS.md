# Metrics

## North Star

Audits completed with email captured.

Total audits are useful for product learning, but total audits are the vanity metric. Captured audits are what drive revenue because they create follow-up, consultation booking, share-link circulation, and Credex credit conversations.

## Input Metrics

1. Audit start rate: landing to form submitted. Target: `>60%`.

2. Email capture rate: results to email submitted. Target: `>20%`.

3. High-value rate: percent of audits showing more than `$500` savings. Target: `>15%`.

## First Instrumentation

Use Vercel Analytics for page-level traffic and custom events for funnel behavior.

```ts
trackEvent("audit_started");
trackEvent("audit_completed", { totalSavings, toolCount });
trackEvent("email_captured", { isHighValue });
trackEvent("share_link_copied");
trackEvent("consultation_cta_clicked");
```

`audit_started` should fire when the user begins entering tool data, not just when the page loads. `audit_completed` should fire after the deterministic report is generated. `email_captured` should fire only after `/api/leads` returns success. `share_link_copied` should fire from the success state of the lead form. `consultation_cta_clicked` should fire only for high-value Credex credit CTAs.

## Pivot Trigger

If `email_capture_rate < 10%` after `200` completed audits, the value proposition is not landing strongly enough at the moment of capture. The first A/B test should move email capture above the full results while still showing enough savings context to earn trust. The second test should change the lead form promise from "send my report" to "send this to finance" for engineering-manager traffic.
