"use client";

import { cn } from "@/lib/utils";

type SignupFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password";
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  autoComplete?: string;
  errorMessage?: string;
  className?: string;
  inputClassName?: string;
};

export function SignupField({
  id,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  disabled = false,
  invalid = false,
  required = false,
  autoComplete,
  errorMessage,
  className,
  inputClassName,
}: SignupFieldProps) {
  const errorId = `${id}-error`;

  return (
    <label className={cn("block", className)} htmlFor={id}>
      <span className="mb-[11px] block text-xs font-bold uppercase tracking-[0.02em] text-[var(--summitpath-signup-label)]">
        {label}
      </span>
      <input
        id={id}
        className={cn(
          "summitpath-signup-field-input h-14 w-full rounded-xl border-2 border-[var(--summitpath-signup-input-border)] bg-[var(--summitpath-signup-input-bg)] px-[14px] text-base text-[var(--summitpath-signup-text)] placeholder:opacity-35",
          invalid && "border-[var(--summitpath-signup-error)]",
          disabled && "cursor-not-allowed bg-slate-100 text-slate-400",
          inputClassName,
        )}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={invalid}
        aria-describedby={invalid && errorMessage ? errorId : undefined}
      />
      {invalid && errorMessage ? (
        <span id={errorId} className="mt-1 block text-xs text-[var(--summitpath-signup-error)]" role="alert">
          {errorMessage}
        </span>
      ) : null}
    </label>
  );
}
