import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const BuildingIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 21h18" />
    <path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
    <path d="M15 21V9h2a2 2 0 0 1 2 2v10" />
    <path d="M9 7h2M9 11h2M9 15h2" />
  </svg>
);

export const SendIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
  </svg>
);

export const SparkleIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    <path d="M12 8.5 13 11l2.5 1-2.5 1-1 2.5-1-2.5L8.5 12 11 11l1-2.5Z" />
  </svg>
);

export const PinIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const CopyIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const AlertIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);

export const TrashIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const UserIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const ShieldIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
