"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { SUMMITPATH_ASSETS } from "./constants";

type HikeLogoProps = {
  reduceMotion?: boolean;
};

export function HikeLogo({ reduceMotion = false }: HikeLogoProps) {
  if (reduceMotion) {
    return (
      <Image
        src={SUMMITPATH_ASSETS.hikelogo}
        alt=""
        width={8}
        height={14}
        aria-hidden
        className="inline-block h-[14px] w-2"
      />
    );
  }

  return (
    <motion.span
      className="relative inline-block h-[14px] w-2 overflow-hidden align-middle"
      aria-hidden
      initial={{ opacity: 0, x: -10 }}
      animate={{
        opacity: [0, 0, 1, 1],
        x: [-10, -10, -2, -2],
      }}
      transition={{
        opacity: {
          duration: 3.505,
          times: [0, 0.6348, 0.7092, 1],
          ease: ["linear", "easeOut", "linear"],
          repeat: Infinity,
        },
        x: {
          duration: 3.505,
          times: [0, 0.4224, 0.8472, 1],
          ease: ["linear", [0.781, -0.005, 0.25, 1], "linear"],
          repeat: Infinity,
        },
      }}
    >
      <Image
        src={SUMMITPATH_ASSETS.hikelogo}
        alt=""
        width={8}
        height={14}
        className="h-[14px] w-2 object-contain"
      />
    </motion.span>
  );
}

type SignupHeaderProps = {
  variant: "desktop" | "mobile";
  reduceMotion?: boolean;
  className?: string;
};

export function SignupHeader({ variant, reduceMotion, className }: SignupHeaderProps) {
  if (variant === "mobile") {
    return (
      <header className={className}>
        <h1 className="text-[40px] font-medium leading-[1.1] text-[var(--summitpath-signup-text)]">
          Create Account
        </h1>
        <p className="mt-3 text-base leading-normal opacity-60 text-[var(--summitpath-signup-text)]">
          Explore the trail ahead.
        </p>
      </header>
    );
  }

  return (
    <header className={className}>
      <h1 className="text-center text-[64px] font-medium leading-[0.9] text-[var(--summitpath-signup-text)]">
        Create Account
      </h1>
      <p className="mt-4 flex items-center justify-center gap-1 text-center text-xl leading-normal opacity-75 text-[var(--summitpath-signup-text)]">
        <span>Explore the trail ahead...</span>
        <HikeLogo reduceMotion={reduceMotion} />
      </p>
    </header>
  );
}
