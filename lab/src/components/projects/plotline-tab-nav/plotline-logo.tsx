"use client";

type PlotlineLogoProps = {
  className?: string;
  size?: number;
};

export function PlotlineLogo({ className = "", size = 28 }: PlotlineLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
    >
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="8"
        className="fill-[var(--pl-pink-dark)]"
      />
      <path
        d="M8 22 L12 14 L16 18 L20 10 L24 16"
        stroke="var(--pl-pink-light)"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="16" r="2" className="fill-[var(--pl-pink-light)]" />
    </svg>
  );
}
