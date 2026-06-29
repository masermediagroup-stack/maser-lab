import Image from "next/image";
import type { SVGProps } from "react";

const LOGOMARK_SRC = "/images/prism-logomark.png";

type PrismLogoProps = {
  className?: string;
};

export function PrismLogo({ className }: PrismLogoProps) {
  return (
    <Image
      src={LOGOMARK_SRC}
      alt=""
      width={32}
      height={32}
      className={className}
      aria-hidden
    />
  );
}
export function ProfileIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 14 14" fill="none" className={className} aria-hidden {...props}>
      <circle cx="7" cy="4.5" r="2.2" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M2.5 12c.9-2 2.4-3 4.5-3s3.6 1 4.5 3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
