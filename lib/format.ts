const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

export function formatDollars(value: number): string {
  return currencyFormatter.format(value);
}

export function formatAnnualSavings(monthlySavings: number): string {
  return `${formatDollars(monthlySavings * 12)}/year`;
}
