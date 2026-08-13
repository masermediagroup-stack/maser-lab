import type { CSSProperties, ReactNode } from "react";

export type DitherGooeyCardProps = {
  title?: string;
  closeHint?: string;
  bodyTitle?: string;
  body?: ReactNode;
  /** Card / liquid fill. CSS color. */
  backgroundColor?: string;
  /** Heading, body, and icon color. CSS color. */
  textColor?: string;
  reducedMotion?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Controlled open state. Omit for internal gesture state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};
