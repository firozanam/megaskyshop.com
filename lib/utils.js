import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  if (typeof amount !== 'number') {
    return '৳0.00';
  }
  return `৳${amount.toFixed(2)}`;
}
