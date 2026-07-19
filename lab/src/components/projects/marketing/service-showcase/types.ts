export type ServiceMedia = {
  src: string;
  alt: string;
};

export type ServiceItem = {
  id: string;
  label: string;
  title: string;
  description: string;
  cta?: { label: string; href: string };
  image: ServiceMedia;
  comparison?: {
    before: ServiceMedia;
    after: ServiceMedia;
  };
};

export type ServiceImageMode = "auto" | "comparison" | "image";

export type ServiceShowcaseProps = {
  items?: ServiceItem[];
  defaultActiveId?: string;
  activeId?: string;
  onActiveChange?: (id: string) => void;
  forceReducedMotion?: boolean;
  animationEnabled?: boolean;
  panelDurationMs?: number;
  tabDurationMs?: number;
  borderRadiusPx?: number;
  spacingScale?: number;
  imageMode?: ServiceImageMode;
  className?: string;
};
