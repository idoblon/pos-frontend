const NPR_FORMATTER = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatMoney = (value) => `रु ${NPR_FORMATTER.format(Number(value) || 0)}`;
