# Economics

## Lead Value Calculation

The audit is valuable only if a completed audit can become a credit customer often enough to justify product and distribution work.

Base assumptions:

- Average AI spend of audited company: `$300/month`
- Audit to consultation conversion: `8%`
- Consultation to credit purchase conversion: `25%`
- Average first credit purchase: `$800`
- Credex margin on credits: `15%`

Value per completed audit:

```text
$800 * 15% * 25% * 8% = $2.40
```

High-value audits are worth more. When the audit shows more than `$500/month` in possible savings, the user has an active budget problem and stronger urgency. If high-value audits convert at `3x` the base rate, expected value becomes:

```text
$2.40 base audit value * 3 = $7.20 per high-value audit
```

## CAC by Channel

HN and Reddit organic have `$0` cash CAC and should produce roughly `50 audits/week` at scale from useful posts and durable comments. The trade-off is volatility: one good thread can spike, but the channel cannot be controlled.

LinkedIn DM requires about `2 hours/week` to identify engineering managers, send thoughtful messages, and follow up. If that produces `10 audits/week` and founder/operator time is valued at `$500/week`, CAC is:

```text
$500 time value / 10 audits = $50 per audit
```

That only works for high-value audits with a likely consultation path.

Email to warm Credex leads should be the best channel. The email tool and list cost are effectively about `$5 CAC` per audit, and conversion should be `4x` organic because these prospects already care about reducing AI spend before buying credits.

## $1M ARR Math

Credex needs `$1,000,000` in annual recurring gross margin. At `15%` margin on credit GMV:

```text
$1,000,000 / 15% = $6,666,667 annual credit GMV
```

If the average customer buys `$800/quarter`, annual GMV per customer is:

```text
$800 * 4 = $3,200/year
```

Customers required:

```text
$6,666,667 / $3,200 = 2,084 customers
```

If `2%` of completed audits eventually convert into credit customers:

```text
2,084 customers / 2% = 104,000 audits
```

Daily audit volume required:

```text
104,000 audits / 365 days = 285 audits/day
```

Feasible? Yes. Product Hunt alone can drive `500` audits on day 1 if the positioning lands. The durable path is organic search, warm Credex lead email, repeated community visibility, and shareable audit reports moving through engineering and finance teams.
