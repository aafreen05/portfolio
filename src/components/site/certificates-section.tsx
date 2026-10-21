import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { DuoTitle, SectionHeading } from "@/components/site/section-heading";
import { tintForLabel } from "@/components/ui/badge";
import type { Certificate } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface CertificatesSectionProps {
  certificates: Certificate[];
}

export function CertificatesSection({ certificates }: CertificatesSectionProps) {
  if (certificates.length === 0) return null;

  return (
    <section
      id="certificates"
      data-label="Credentials"
      className="section-shell relative py-28 sm:py-32 lg:py-40"
    >
      <SectionHeading
        index="05"
        kicker="Certificates"
        title={<DuoTitle caps="Credentials" italic="verified learning" />}
        description="Self-directed study alongside the degree. Every plate links back to its issuer, so each one can be checked."
      />

      <RevealGroup as="ul" stagger={0.1} className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((certificate, index) => {
          // Tinted by issuer, so credentials from one source read as a set.
          const tint = `var(--${tintForLabel(certificate.issuer)})`;

          return (
            <RevealItem as="li" key={certificate.id}>
              <article className="frame frame-hover group relative flex h-full flex-col overflow-clip">
                <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-card">
                  {certificate.image_url ? (
                    <Image
                      src={certificate.image_url}
                      alt={`${certificate.title} certificate issued by ${certificate.issuer}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 26rem"
                      className="object-cover transition-transform duration-1000 group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div className="relative flex h-full items-center justify-center">
                      <div
                        aria-hidden
                        className="absolute inset-0"
                        style={{
                          background: `radial-gradient(circle at 50% 50%, color-mix(in oklab, ${tint} 16%, transparent), transparent 62%)`,
                        }}
                      />
                      <Seal id={certificate.id} issuer={certificate.issuer} tint={tint} />
                    </div>
                  )}
                  <span className="kicker absolute top-4 left-4">
                    Plate {String(index + 1).padStart(3, "0")}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="kicker" style={{ color: tint }}>
                    {certificate.issuer}
                  </p>
                  <h3 className="serif-display mt-3 text-[1.45rem] leading-[1.2]">{certificate.title}</h3>

                  {certificate.credential_id ? (
                    <p
                      className="mt-3 truncate font-mono text-[0.6875rem] text-muted-foreground"
                      title={certificate.credential_id}
                    >
                      ID {certificate.credential_id}
                    </p>
                  ) : null}

                  <div className="mt-auto flex items-center justify-between gap-4 pt-7">
                    {certificate.issue_date ? (
                      <time dateTime={certificate.issue_date} className="numeric text-xl">
                        {formatDate(certificate.issue_date)}
                      </time>
                    ) : (
                      <span />
                    )}

                    {certificate.credential_url ? (
                      <a
                        href={certificate.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="brackets flex items-center gap-1.5 px-3 py-2 font-mono text-[0.625rem] tracking-[0.16em] text-muted-foreground uppercase hover:text-gold focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        Verify
                        <ArrowUpRight className="size-3" aria-hidden />
                        <span className="sr-only">{certificate.title} with {certificate.issuer}</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}

/**
 * A turning seal engraved with the issuer's name — the placeholder for a
 * certificate without an uploaded scan.
 */
function Seal({ id, issuer, tint }: { id: string; issuer: string; tint: string }) {
  const pathId = `seal-ring-${id}`;
  const text = `✦ VERIFIED CREDENTIAL ✦ ${issuer.toUpperCase()} `;
  const repeated = text.repeat(Math.max(1, Math.round(64 / text.length)));

  return (
    <svg viewBox="0 0 200 200" aria-hidden focusable="false" className="relative size-36" style={{ color: tint }}>
      <defs>
        <path id={pathId} d="M 100 100 m -72 0 a 72 72 0 1 1 144 0 a 72 72 0 1 1 -144 0" />
      </defs>
      <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeOpacity="0.45" />
      <circle cx="100" cy="100" r="56" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeDasharray="2 4" />
      <g className="animate-orbit" style={{ "--orbit-duration": "36s" } as React.CSSProperties}>
        <text
          fill="currentColor"
          fontSize="10.5"
          style={{ fontFamily: "var(--font-space-mono), monospace", letterSpacing: "0.12em" }}
        >
          <textPath href={`#${pathId}`} textLength={2 * Math.PI * 72} lengthAdjust="spacing">
            {repeated}
          </textPath>
        </text>
      </g>
      <g transform="translate(100 100)">
        <path d="M0 -26 5 -5 26 0 5 5 0 26 -5 5 -26 0 -5 -5Z" fill="currentColor" />
      </g>
    </svg>
  );
}
