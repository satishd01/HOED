import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with clsx for conditional class composition.
 * Handles conflicts (e.g., `bg-red-500 bg-blue-500` → `bg-blue-500`).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
