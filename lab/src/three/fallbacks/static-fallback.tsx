import type { ReactNode } from "react";

type StaticFallbackProps = {
  title?: string;
  description?: string;
  className?: string;
  children?: ReactNode;
};

/**
 * Shown when WebGL is unavailable or 3D is decorative and skipped.
 */
export function StaticFallback({
  title = "3D preview unavailable",
  description = "This section uses WebGL. A simplified view is shown instead.",
  className = "",
  children,
}: StaticFallbackProps) {
  return (
    <div
      className={`flex min-h-[240px] flex-col items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#111113] p-8 text-center ${className}`}
      role="img"
      aria-label={title}
    >
      <p className="text-sm font-medium text-[#f8f8f8]">{title}</p>
      <p className="max-w-sm text-xs text-white/60">{description}</p>
      {children}
    </div>
  );
}
