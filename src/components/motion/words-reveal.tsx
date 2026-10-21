import { cn } from "@/lib/utils";

/**
 * Splits a heading into words or letters that cascade in — with no client
 * JavaScript. Each piece is a `[data-reveal-item]` inside the caller's
 * `[data-reveal-group]`, so the shared reveal observer staggers them with
 * the same machinery as every other section.
 *
 * Pieces are `inline-block` because transforms do not apply to inline
 * boxes. In letter mode each word is kept `nowrap`, so a line can only ever
 * break between words, never inside one.
 *
 * The original string is exposed once to assistive tech; the split copy is
 * `aria-hidden`, so a screen reader hears the heading, not a spelling bee.
 */
export function WordsReveal({
  text,
  mode = "words",
  className,
  pieceClassName,
}: {
  text: string;
  mode?: "words" | "letters";
  className?: string;
  pieceClassName?: string;
}) {
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <span className={cn(className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, wordIndex) =>
          mode === "letters" ? (
            <span key={`${word}-${wordIndex}`} className="inline-block whitespace-nowrap">
              {Array.from(word).map((letter, letterIndex) => (
                <span
                  key={letterIndex}
                  data-reveal-item=""
                  data-reveal-letter=""
                  className={cn("inline-block", pieceClassName)}
                >
                  {letter}
                </span>
              ))}
              {wordIndex < words.length - 1 ? <span className="inline-block w-[0.24em]"> </span> : null}
            </span>
          ) : (
            <span
              key={`${word}-${wordIndex}`}
              data-reveal-item=""
              className={cn("inline-block", pieceClassName)}
            >
              {word}
              {wordIndex < words.length - 1 ? <span className="inline-block w-[0.26em]"> </span> : null}
            </span>
          ),
        )}
      </span>
    </span>
  );
}
