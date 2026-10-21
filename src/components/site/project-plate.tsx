import { Constellation } from "@/components/site/constellation";
import { tintForLabel } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Generated cover for a project without an uploaded image: a star plate.
 *
 * The constellation is seeded from the slug, so each project owns a stable,
 * unique figure; the tint follows its category. It reads as a deliberate
 * catalogue plate rather than a missing image.
 */
export function ProjectPlate({
  slug,
  title,
  category,
  index,
  starCount = 6,
  className,
  size = "default",
}: {
  slug: string;
  title: string;
  category: string;
  index: number;
  starCount?: number;
  className?: string;
  size?: "default" | "large";
}) {
  const tint = `var(--${tintForLabel(category)})`;

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-card", className)}>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 70% at 60% 40%, color-mix(in oklab, ${tint} 18%, transparent), transparent 70%)`,
        }}
      />
      <div aria-hidden className="chart-rings absolute inset-0 opacity-60" />

      <div className="absolute inset-x-[10%] top-1/2 -translate-y-1/2">
        <Constellation seed={`project-${slug}`} count={starCount} color={tint} grid={false} />
      </div>

      <span className="kicker absolute top-4 left-4">Cat. {String(index + 1).padStart(3, "0")}</span>
      <span className="kicker absolute top-4 right-4" style={{ color: tint }}>
        {category}
      </span>
      <span
        className={cn(
          "serif-italic absolute right-4 bottom-4 left-4 line-clamp-2 leading-tight",
          size === "large" ? "text-[clamp(1.5rem,3vw,2.25rem)]" : "text-xl",
        )}
      >
        {title}
      </span>
    </div>
  );
}
