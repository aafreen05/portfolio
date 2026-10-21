import type { Metadata, Viewport } from "next";
import {
  Antonio,
  Manrope,
  Parisienne,
  Playfair,
  Space_Mono,
  Unbounded,
} from "next/font/google";

import { RevealObserver } from "@/components/motion/reveal-observer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { getProfile, getSettings } from "@/lib/queries";
import { absoluteUrl } from "@/lib/utils";

import "./globals.css";

/**
 * Six faces, six jobs — each chosen to be unmistakably different from the
 * others, so the mix reads as intentional rather than accidental.
 */

/**
 * High-contrast serif for the name and headlines: the "design" voice.
 * The opsz axis is loaded so the utilities can pin it to a screen-safe
 * cut (see `.serif-display` in globals.css) instead of letting the
 * browser choose the hairline-thin print cut at large sizes.
 */
const playfair = Playfair({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

/** Wide geometric. Section titles and buttons: the "system" voice. */
const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  display: "swap",
});

/** Body copy and interface text. */
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

/** Coordinates, labels and decoding effects: the "code" voice. */
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

/**
 * Calligraphy for the greeting and the signature. Chosen over thinner
 * scripts because every stroke survives at screen resolution.
 */
const parisienne = Parisienne({
  variable: "--font-parisienne",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/** Condensed display numerals and the marquee. Below the fold, not preloaded. */
const antonio = Antonio({
  variable: "--font-antonio",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const [settings, profile] = await Promise.all([getSettings(), getProfile()]);

  return {
    metadataBase: new URL(absoluteUrl()),
    title: {
      default: settings.site_title,
      // Follows the editable profile name rather than hard-coding it.
      template: `%s — ${profile.name}`,
    },
    description: settings.site_description,
    keywords: settings.keywords,
    authors: [{ name: profile.name }],
    creator: profile.name,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: absoluteUrl(),
      siteName: profile.name,
      title: settings.site_title,
      description: settings.site_description,
      images: [
        {
          url: settings.og_image_url ?? "/opengraph-image",
          width: 1200,
          height: 630,
          alt: settings.site_title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.site_title,
      description: settings.site_description,
      creator: settings.twitter_handle ?? undefined,
      images: [settings.og_image_url ?? "/opengraph-image"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    icons: { icon: "/icon.svg", apple: "/icon.svg" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#05060c" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${unbounded.variable} ${manrope.variable} ${spaceMono.variable} ${parisienne.variable} ${antonio.variable} h-full`}
    >
      <head>
        {/*
          Arms the scroll reveals before first paint, and disarms them after
          4s if the observer never starts — so a failed or blocked bundle
          leaves the page fully readable instead of blank.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement;d.classList.add('js');window.__revealFailsafe=setTimeout(function(){d.classList.remove('js')},4000)})()`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        {/*
          Dark by default: the concept is a night sky, and that is the
          first impression it is designed around. Visitors can still switch,
          and the choice persists.
        */}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {/*
            `page-frame` contains horizontal overflow (e.g. elements waiting
            to slide in from the right). It must not live on <html> or
            <body> — see the note in globals.css.
          */}
          <div className="page-frame flex min-h-full flex-1 flex-col">{children}</div>
          <Toaster />
        </ThemeProvider>
        <RevealObserver />
      </body>
    </html>
  );
}
