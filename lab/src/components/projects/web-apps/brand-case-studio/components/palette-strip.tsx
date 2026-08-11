"use client";

type PaletteStripProps = {
  colors: string[];
  accentColor?: string;
};

export function PaletteStrip({ colors, accentColor }: PaletteStripProps) {
  if (colors.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((hex) => (
        <div key={hex} className="flex flex-col items-center gap-2">
          <div
            className="h-16 w-16 rounded-[var(--bcs-radius-sm)] border border-[var(--bcs-border)] shadow-sm sm:h-20 sm:w-20"
            style={{
              backgroundColor: hex,
              outline: hex.toUpperCase() === accentColor?.toUpperCase() ? "2px solid var(--bcs-fg)" : undefined,
              outlineOffset: 2,
            }}
            role="img"
            aria-label={`Color swatch ${hex}`}
          />
          <span className="font-mono text-xs text-[var(--bcs-fg-muted)]">{hex}</span>
        </div>
      ))}
    </div>
  );
}
