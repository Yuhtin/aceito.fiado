const DAY_MS = 24 * 60 * 60 * 1000;

export function daysBetween(from: Date, to: Date): number {
  return Math.max(0, Math.ceil((to.getTime() - from.getTime()) / DAY_MS));
}

export function dateDaysAgo(days: number, reference = new Date()): Date {
  return new Date(reference.getTime() - days * DAY_MS);
}

export function monthKey(dateLike: string): string {
  const date = new Date(dateLike);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function isWithinDays(dateLike: string, days: number, reference = new Date()): boolean {
  const date = new Date(dateLike);
  return date >= dateDaysAgo(days, reference) && date <= reference;
}
