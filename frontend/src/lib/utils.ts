import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * 
 * Combines clsx (conditional classes) with tailwind-merge (conflict resolution)
 * Usage: cn('base-class', condition && 'conditional-class', 'px-4 py-2')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
