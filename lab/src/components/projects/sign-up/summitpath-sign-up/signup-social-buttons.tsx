"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { SUMMITPATH_ASSETS } from "./constants";

type SignupSocialButtonsProps = {
  variant: "desktop" | "mobile";
  disabled?: boolean;
  className?: string;
};

export function SignupSocialButtons({
  variant,
  disabled = false,
  className,
}: SignupSocialButtonsProps) {
  if (variant === "mobile") {
    return (
      <div className={cn("w-full", className)}>
        <div className="mb-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-black/10" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wide opacity-30 text-[var(--summitpath-signup-text)]">
            OR
          </span>
          <span className="h-px flex-1 bg-black/10" aria-hidden />
        </div>
        <div className="flex flex-col gap-3">
          <SocialButton
            label="Sign Up with Google"
            icon={SUMMITPATH_ASSETS.googleIcon}
            variant="google"
            size="mobile"
            disabled={disabled}
          />
          <SocialButton
            label="Continue with Apple"
            icon={SUMMITPATH_ASSETS.appleIcon}
            variant="apple"
            size="mobile"
            disabled={disabled}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-[35px]", className)}>
      <SocialButton
        label="Sign Up with Google"
        icon={SUMMITPATH_ASSETS.googleIcon}
        variant="google"
        size="desktop"
        disabled={disabled}
      />
      <SocialButton
        label="Sign Up with Apple"
        icon={SUMMITPATH_ASSETS.appleIcon}
        variant="apple"
        size="desktop"
        disabled={disabled}
      />
    </div>
  );
}

type SocialButtonProps = {
  label: string;
  icon: string;
  variant: "google" | "apple";
  size: "desktop" | "mobile";
  disabled?: boolean;
};

function SocialButton({ label, icon, variant, size, disabled }: SocialButtonProps) {
  const isDesktop = size === "desktop";

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "summitpath-signup-social flex items-center justify-center gap-4 rounded-xl disabled:opacity-50",
        isDesktop ? "h-[35px] w-[223px] rounded-xl" : "h-[52px] w-full rounded-[10px]",
        variant === "google" ? "bg-white text-[#757575]" : "bg-black text-[#757575]",
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center gap-4 rounded-[10px] px-[15px] py-1.5",
          variant === "apple" && "bg-white",
        )}
      >
        <Image src={icon} alt="" width={24} height={24} aria-hidden className="size-6 shrink-0" />
        <span className={cn("whitespace-nowrap", isDesktop ? "text-base" : "text-base")}>
          {label}
        </span>
      </span>
    </button>
  );
}
