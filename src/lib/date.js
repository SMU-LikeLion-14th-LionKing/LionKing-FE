export function parseApiDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;

  const dateValue = String(value);
  const normalizedFraction = dateValue.replace(
    /(\.\d{3})\d+(?=Z|[+-]\d{2}:?\d{2}|$)/,
    "$1",
  );
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalizedFraction);
  const normalizedValue = hasTimezone
    ? normalizedFraction
    : `${normalizedFraction}Z`;
  const date = new Date(normalizedValue);

  return Number.isNaN(date.getTime()) ? null : date;
}
