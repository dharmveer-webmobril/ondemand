export const formatAmount = (value: unknown): string => {
  let amount: number;

  if (typeof value === 'number') {
    amount = value;
  } else if (typeof value === 'string') {
    const normalized = value.replace(/[^0-9.-]/g, '');
    amount = Number(normalized);
  } else {
    amount = Number(value);
  }

  if (!Number.isFinite(amount)) {
    amount = 0;
  }

  const rounded = Math.round((Math.abs(amount) + Number.EPSILON) * 100) / 100;
  const formatted = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
  return `${amount < 0 ? '-' : ''}$${formatted}`;
};

