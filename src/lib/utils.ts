import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomTxid(prefix = "E1018"): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `${prefix}${stamp}${rnd}`.padEnd(32, "0").slice(0, 32);
}

export function nextDuplicataNumero(suffix: number): string {
  const year = new Date().getFullYear();
  return `AF-${year}-${String(suffix).padStart(6, "0")}`;
}
