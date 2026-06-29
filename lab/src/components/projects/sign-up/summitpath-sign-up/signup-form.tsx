"use client";

import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SignupField } from "./signup-field";
import { SignupHeader } from "./signup-header";
import { SignupHeroPanelDesktop, SignupHeroPanelMobile } from "./signup-hero-panel";
import { SignupSocialButtons } from "./signup-social-buttons";
import type { useSignupForm } from "./use-signup-form";

type SignupFormBodyProps = {
  form: ReturnType<typeof useSignupForm>;
  reduceMotion: boolean;
  variant: "desktop" | "mobile";
  showFooter?: boolean;
};

const statusLabel = {
  idle: "Ready to submit",
  loading: "Creating account...",
  success: "Account created",
  error: "Fix the highlighted fields",
} as const;

export function SignupFormBody({
  form,
  reduceMotion,
  variant,
  showFooter = true,
}: SignupFormBodyProps) {
  const { submitStatus, disabled, fields, canSubmit, updateField, handleSubmit, fieldInvalid } =
    form;
  const isLoading = disabled || submitStatus === "loading";
  const fieldWidth = variant === "desktop" ? "w-[475px]" : "w-[342px]";

  const stagger = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.28, ease: "easeOut" as const },
      };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center" noValidate>
      <motion.div {...stagger} className="w-full">
        <SignupHeader
          variant={variant}
          reduceMotion={reduceMotion}
          className={variant === "desktop" ? "mb-[62px]" : "mb-8 px-6"}
        />
      </motion.div>

      <motion.div
        {...(reduceMotion ? {} : { ...stagger, transition: { ...stagger.transition, delay: 0.05 } })}
        className={cn("flex flex-col gap-5", fieldWidth)}
      >
        <SignupField
          id="summitpath-signup-name"
          label="Name"
          placeholder="Jane Doe"
          value={fields.name}
          disabled={isLoading}
          invalid={fieldInvalid("name")}
          required
          autoComplete="name"
          errorMessage="Name must be at least 2 characters."
          onChange={(value) => updateField("name", value)}
        />
        <SignupField
          id="summitpath-signup-email"
          label="Email"
          placeholder="jane@trail.com"
          value={fields.email}
          type="email"
          disabled={isLoading}
          invalid={fieldInvalid("email")}
          required
          autoComplete="email"
          errorMessage="Enter a valid email address."
          onChange={(value) => updateField("email", value)}
        />
        <SignupField
          id="summitpath-signup-password"
          label="password"
          placeholder="TrailJoe123"
          value={fields.password}
          type="password"
          disabled={isLoading}
          invalid={fieldInvalid("password")}
          required
          autoComplete="new-password"
          errorMessage="Password must be at least 8 characters."
          onChange={(value) => updateField("password", value)}
        />
      </motion.div>

      <motion.div
        {...(reduceMotion ? {} : { ...stagger, transition: { ...stagger.transition, delay: 0.12 } })}
        className={cn("mt-5", fieldWidth)}
      >
        <motion.button
          type="submit"
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          disabled={!canSubmit}
          className={cn(
            "summitpath-signup-cta relative h-16 w-full overflow-hidden rounded-xl bg-gradient-to-r from-[var(--summitpath-signup-cta-from)] to-[var(--summitpath-signup-cta-to)] text-lg font-bold text-[var(--summitpath-signup-cta-text)] shadow-[0_4px_6px_rgba(0,0,0,0.08)]",
            !canSubmit && "cursor-not-allowed opacity-55",
          )}
        >
          <span className="relative z-10 inline-flex items-center justify-center gap-2">
            {submitStatus === "loading" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {submitStatus === "success" ? <CheckCircle2 className="size-4" aria-hidden /> : null}
            {submitStatus === "error" ? <TriangleAlert className="size-4" aria-hidden /> : null}
            Create Account
          </span>
        </motion.button>
      </motion.div>

      <motion.div
        {...(reduceMotion ? {} : { ...stagger, transition: { ...stagger.transition, delay: 0.18 } })}
        className={cn("mt-5", fieldWidth)}
      >
        <SignupSocialButtons variant={variant} disabled={disabled} />
      </motion.div>

      {showFooter ? (
        <p
          className={cn(
            "mt-6 text-center text-sm text-[var(--summitpath-signup-text)]",
            variant === "mobile" && "opacity-60",
          )}
        >
          Already have an account?{" "}
          <button
            type="button"
            className={cn(
              "font-semibold text-[var(--summitpath-signup-text)]",
              variant === "mobile" && "text-[#163020] underline underline-offset-2",
            )}
          >
            Sign in
          </button>
        </p>
      ) : null}

      <p
        className={cn(
          "mt-3 text-center text-sm font-medium",
          submitStatus === "success" && "text-[var(--summitpath-signup-success)]",
          submitStatus === "error" && "text-[var(--summitpath-signup-error)]",
          submitStatus === "idle" && "text-[var(--summitpath-signup-text-muted)]",
        )}
        aria-live="polite"
      >
        {statusLabel[submitStatus]}
      </p>
    </form>
  );
}

export function SummitPathSignUpDesktop({
  form,
  reduceMotion,
}: {
  form: ReturnType<typeof useSignupForm>;
  reduceMotion: boolean;
}) {
  return (
    <div
      className="summitpath-signup relative flex h-[1080px] w-[1920px] overflow-hidden bg-white"
      aria-label="SummitPath sign-up desktop"
    >
      <div className="flex h-full w-[960px] shrink-0 items-start justify-center overflow-hidden pt-[220px]">
        <SignupFormBody form={form} reduceMotion={reduceMotion} variant="desktop" showFooter />
      </div>
      <SignupHeroPanelDesktop />
    </div>
  );
}

export function SummitPathSignUpMobile({
  form,
  reduceMotion,
}: {
  form: ReturnType<typeof useSignupForm>;
  reduceMotion: boolean;
}) {
  return (
    <div
      className="summitpath-signup relative flex h-[1168px] w-[452px] flex-col overflow-hidden bg-[#fdfcf9]"
      aria-label="SummitPath sign-up mobile"
    >
      <SignupHeroPanelMobile />
      <div className="flex flex-1 flex-col items-center px-6 pt-10">
        <SignupFormBody form={form} reduceMotion={reduceMotion} variant="mobile" showFooter />
      </div>
    </div>
  );
}
