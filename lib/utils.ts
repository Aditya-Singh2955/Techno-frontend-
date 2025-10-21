import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const TOP_200_COMPANIES = [
  // Example entries, replace/expand as needed
  "Tech Solutions LLC",
  "Emirates Group",
  "Dubai Holdings",
  "Emaar Properties",
  "Majid Al Futtaim",
  "Etisalat",
  "DP World",
  "Mashreq Bank",
  "Al-Futtaim Group",
  "Jumeirah Group",
  // ... up to 200
];
