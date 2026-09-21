import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const siteConfig = {
  name: "TechRepubliQ",
  tagline: "Your product, built by a real team. Built to scale.",
  email: "hello@techrepubliq.com",
  copyright: `© ${new Date().getFullYear()} TechRepubliQ. All rights reserved.`,
};

export { services, projectTiers } from "./services";
export type { Service } from "./services";

export const orderStatuses = ["Paid", "In Progress", "Delivered"] as const;