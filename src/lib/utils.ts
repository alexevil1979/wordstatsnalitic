import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVolume(n: number, locale: string): string {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-US").format(n);
}
