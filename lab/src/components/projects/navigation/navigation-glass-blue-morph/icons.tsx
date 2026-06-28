import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  active?: boolean;
};

const stroke = (active?: boolean) => (active ? 2.25 : 1.75);

export function HomeIcon({ active, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
      {...props}
    >
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth={stroke(active)}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ExploreIcon({ active, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
      {...props}
    >
      <circle
        cx="11"
        cy="11"
        r="6.5"
        stroke="currentColor"
        strokeWidth={stroke(active)}
      />
      <path
        d="m16 16 4.5 4.5"
        stroke="currentColor"
        strokeWidth={stroke(active)}
        strokeLinecap="round"
      />
      <path
        d="M18 5l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z"
        fill="currentColor"
        opacity={active ? 1 : 0.7}
      />
    </svg>
  );
}

export function LibraryIcon({ active, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
      {...props}
    >
      <path
        d="M5 6.5A1.5 1.5 0 0 1 6.5 5H10v16H6.5A1.5 1.5 0 0 1 5 19.5v-13Z"
        stroke="currentColor"
        strokeWidth={stroke(active)}
        strokeLinejoin="round"
      />
      <path
        d="M10 5h3.5A1.5 1.5 0 0 1 15 6.5v13H10V5Z"
        stroke="currentColor"
        strokeWidth={stroke(active)}
        strokeLinejoin="round"
      />
      <path
        d="M15 8.5h2A1.5 1.5 0 0 1 18.5 10v9.5A1.5 1.5 0 0 1 17 21h-2"
        stroke="currentColor"
        strokeWidth={stroke(active)}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GalleryIcon({ active, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
      {...props}
    >
      {[
        [7, 7],
        [17, 7],
        [7, 17],
        [17, 17],
      ].map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={active ? 2.75 : 2.25}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

export function ProfileIcon({ active, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth={stroke(active)}
      />
      <circle
        cx="12"
        cy="10"
        r="3"
        stroke="currentColor"
        strokeWidth={stroke(active)}
      />
      <path
        d="M7 18.5c1.2-2.2 3-3.5 5-3.5s3.8 1.3 5 3.5"
        stroke="currentColor"
        strokeWidth={stroke(active)}
        strokeLinecap="round"
      />
    </svg>
  );
}
