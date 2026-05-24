export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function maskTaxNumber(value?: string): string | undefined {
  if (!value) return undefined;
  const digits = onlyDigits(value);
  if (digits.length <= 4) return '***';
  return `${'*'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}
