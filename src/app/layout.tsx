import type { Metadata, Viewport } from "next";
import { Cinzel, Great_Vibes, Plus_Jakarta_Sans } from "next/font/google";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { EVENT, EVENT_TIMESTAMP, FORMATTED_EVENT_DATE } from "@/config/event";
import "./globals.css";

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
  display: "swap",
  preload: true,
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  preload: true,
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  preload: true,
});

const siteTitle = `${EVENT.name} — ${EVENT.age} Anos | Convite Oficial`;
const siteDescription = `Você é meu convidado especial para celebrar os meus ${EVENT.age} anos — ${FORMATTED_EVENT_DATE.long}, às ${FORMATTED_EVENT_DATE.time}, no ${EVENT.venue.name}. Confirme sua presença e confira os detalhes.`;

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "SocialEvent",
  name: siteTitle,
  description: siteDescription,
  startDate: EVENT.dateISO,
  endDate: new Date(EVENT_TIMESTAMP + EVENT.durationHours * 3_600_000).toISOString(),
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  url: EVENT.siteUrl,
  location: {
    "@type": "Place",
    name: EVENT.venue.name,
    address: EVENT.venue.address,
  },
  organizer: {
    "@type": "Person",
    name: EVENT.name,
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(EVENT.siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${EVENT.name} — ${EVENT.age} Anos`,
  },
  description: siteDescription,
  authors: [{ name: "Lucas Gomes do Amaral", url: "https://github.com/gomeslxy" }],
  creator: "Lucas Gomes do Amaral",
  publisher: "Lucas Gomes do Amaral",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  // Imagens OG/Twitter vêm de `opengraph-image.tsx` / `twitter-image.tsx` (geradas a partir de `event.ts`).
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: `${EVENT.name} — ${EVENT.age} Anos`,
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  appleWebApp: {
    capable: true,
    title: `${EVENT.name} ${EVENT.age}`,
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0A2463",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`scroll-locked ${greatVibes.variable} ${cinzel.variable} ${jakarta.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
