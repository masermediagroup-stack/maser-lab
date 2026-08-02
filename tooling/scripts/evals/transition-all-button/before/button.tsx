export function LabChipButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="rounded-md bg-black px-3 py-2 text-white transition-all duration-200 hover:scale-105"
    >
      {label}
    </button>
  );
}
