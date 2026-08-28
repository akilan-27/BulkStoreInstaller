import {
  Globe,
  MessageSquare,
  Film,
  Paintbrush,
  Code,
  Briefcase,
  ShieldCheck,
  Gamepad2,
  Wrench,
  Download,
  FolderArchive,
  Network,
  Layers,
  type LucideIcon,
} from "lucide-react";
import type { SVGProps } from "react";

export interface CategoryDefinition {
  id: string;
  name: string;
  icon: LucideIcon;
}

function AiChipIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
      <path d="M7.5 16 L10 10 L12.5 16" />
      <line x1="8.5" y1="14" x2="11.5" y2="14" />
      <line x1="16" y1="10" x2="16" y2="16" />
    </svg>
  );
}

export const CATEGORIES: CategoryDefinition[] = [
  { id: "cat-1",  name: "AI Assistants",          icon: AiChipIcon as LucideIcon },
  { id: "cat-2",  name: "Audio & Video",          icon: Film },
  { id: "cat-3",  name: "Browsers",               icon: Globe },
  { id: "cat-4",  name: "Communication",          icon: MessageSquare },
  { id: "cat-5",  name: "Design",                 icon: Paintbrush },
  { id: "cat-6",  name: "Developer Tools",        icon: Code },
  { id: "cat-7",  name: "Downloads",              icon: Download },
  { id: "cat-8",  name: "Archives",               icon: FolderArchive },
  { id: "cat-9",  name: "Gaming",                 icon: Gamepad2 },
  { id: "cat-10", name: "Network",                icon: Network },
  { id: "cat-11", name: "Productivity",           icon: Briefcase },
  { id: "cat-12", name: "Security",               icon: ShieldCheck },
  { id: "cat-13", name: "System Tools",           icon: Wrench },
];

/** The icon to display for categories that don't have a specific mapping */
export const DEFAULT_CATEGORY_ICON: LucideIcon = Layers;

/**
 * Get the Lucide icon for a category name (case-insensitive).
 * Falls back to a generic icon if no match is found.
 */
export function getCategoryIcon(categoryName: string): LucideIcon {
  const match = CATEGORIES.find(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase()
  );
  return match?.icon || DEFAULT_CATEGORY_ICON;
}
