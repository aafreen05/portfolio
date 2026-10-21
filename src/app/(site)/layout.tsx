import { Altitude } from "@/components/motion/altitude";
import { StarField } from "@/components/motion/star-field";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { getProfile, getResume, getSettings, getSocialLinks } from "@/lib/queries";

/**
 * Public shell: the sky behind everything, then navbar, main, footer.
 *
 * Sections are translucent or transparent by design, so the starfield reads
 * as one continuous night the page scrolls through rather than a hero-only
 * effect.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [profile, socials, resume, settings] = await Promise.all([
    getProfile(),
    getSocialLinks(),
    getResume(),
    getSettings(),
  ]);

  const hasResume = Boolean(resume.file_url);

  return (
    <>
      {/* Night-sky gradient: deepest at the zenith, faint warmth at the horizon. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20"
        style={{
          background:
            "radial-gradient(ellipse 120% 70% at 50% -10%, var(--sky-top), transparent 60%), radial-gradient(ellipse 90% 60% at 50% 115%, var(--sky-bottom), transparent 65%)",
        }}
      />
      <StarField />
      <Altitude />

      <Navbar name={profile.name} hasResume={hasResume} />
      <main id="main" className="relative flex-1">
        {children}
      </main>
      <Footer profile={profile} settings={settings} socials={socials} hasResume={hasResume} />
    </>
  );
}
