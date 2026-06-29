import Image from "next/image";

const LOGOMARK_SRC = "/images/plotline-logomark.png";

type PlotlineLogoProps = {
  className?: string;
  size?: number;
};

export function PlotlineLogo({
  className = "",
  size = 28,
}: PlotlineLogoProps) {
  return (
    <Image
      src={LOGOMARK_SRC}
      alt=""
      width={size}
      height={size}
      className={className}
      aria-hidden
    />
  );
}
