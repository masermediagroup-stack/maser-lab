type TypeWorldFallbackProps = {
  quote: string;
  fontFamily: string;
};

export function TypeWorldFallback({
  quote,
  fontFamily,
}: TypeWorldFallbackProps) {
  const lines = quote.split("\n").map((line) => line.trim()).filter(Boolean);

  return (
    <div className="type-world__fallback" role="img" aria-hidden="true">
      <p className="type-world__fallback-quote" style={{ fontFamily }}>
        {lines.map((line, index) => (
          <span key={`${index}-${line}`} className="type-world__fallback-line">
            {line}
          </span>
        ))}
      </p>
    </div>
  );
}
