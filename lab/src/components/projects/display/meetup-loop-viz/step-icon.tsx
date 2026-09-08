import type { LoopStepId } from "./types";

const ICON_SIZE = 20;

type StepIconProps = {
  step: LoopStepId;
};

export function StepIcon({ step }: StepIconProps) {
  return (
    <svg
      className="meetup-loop-viz__icon"
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {step === "drop" ? (
        <>
          <path d="M10 2.5v8.25" />
          <path d="M7.15 8.1 10 10.85 12.85 8.1" />
          <path d="M3.75 12.25v4.5h12.5v-4.5" />
        </>
      ) : null}
      {step === "kickoff" ? (
        <>
          <path d="M3.6 5.1 8.4 10 3.6 14.9" />
          <path d="M10.6 5.1 15.4 10 10.6 14.9" />
        </>
      ) : null}
      {step === "shape" ? (
        <>
          <path d="M3.5 7.25V3.5H7.25" />
          <path d="M12.75 3.5H16.5V7.25" />
          <path d="M16.5 12.75V16.5H12.75" />
          <path d="M7.25 16.5H3.5V12.75" />
        </>
      ) : null}
      {step === "package" ? (
        <>
          <path d="M5 3.5h7.25L16.5 7.75V16.5H5V3.5Z" />
          <path d="M12.25 3.5v4.25H16.5" />
        </>
      ) : null}
      {step === "build" ? (
        <>
          <rect x="3.25" y="3.75" width="11.25" height="7.5" rx="1.75" />
          <rect x="5.5" y="8.75" width="11.25" height="7.5" rx="1.75" />
        </>
      ) : null}
      {step === "critique" ? (
        <>
          <path d="M2.6 10C5.4 5.35 14.6 5.35 17.4 10C14.6 14.65 5.4 14.65 2.6 10Z" />
          <rect x="8.7" y="7.7" width="2.6" height="4.6" rx="1.3" />
        </>
      ) : null}
    </svg>
  );
}
