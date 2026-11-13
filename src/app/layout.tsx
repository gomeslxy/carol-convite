import type { Metadata, Viewport } from "next";
import { Cinzel, Great_Vibes, Plus_Jakarta_Sans } from "next/font/google";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { EVENT, FORMATTED_EVENT_DATE } from "@/config/event";
import "./globals.css";

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jakarta",
  display: "swap",
});

const siteTitle = `${EVENT.name} · ${EVENT.age} Anos — Convite`;
const siteDescription = `Você é meu convidado especial! ${FORMATTED_EVENT_DATE.weekday}, ${FORMATTED_EVENT_DATE.day} de ${FORMATTED_EVENT_DATE.month.toLowerCase()} de ${FORMATTED_EVENT_DATE.year} às ${FORMATTED_EVENT_DATE.time}.`;

export const metadata: Metadata = {
  metadataBase: new URL(EVENT.siteUrl),
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${EVENT.name} · ${EVENT.age} Anos`,
    description: `Save the date — ${FORMATTED_EVENT_DATE.short} · ${FORMATTED_EVENT_DATE.time}. Confirme sua presença!`,
    url: "/",
    siteName: `${EVENT.name} · ${EVENT.age} Anos`,
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/images/carol-cutout.png",
        width: 800,
        height: 800,
        alt: `${EVENT.name} — ${EVENT.age} Anos`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${EVENT.name} · ${EVENT.age} Anos`,
    description: `Save the date — ${FORMATTED_EVENT_DATE.short} · ${FORMATTED_EVENT_DATE.time}.`,
    images: ["/images/carol-cutout.png"],
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
  themeColor: "#F8FAFC",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`scroll-locked ${greatVibes.variable} ${cinzel.variable} ${jakarta.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
