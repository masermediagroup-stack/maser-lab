import type { CSSProperties, ReactNode } from "react";

export type DitherGooeyCardProps = {
  title?: string;
  pullHint?: string;
  closeHint?: string;
  bodyTitle?: string;
  body?: ReactNode;
  /** Optional chroma tint. Omit or empty for black-and-white dither. */
  accentColor?: string;
  reducedMotion?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Controlled open state. Omit for internal gesture state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};
