import type { Metadata, Viewport } from "next";
import { Cinzel, Great_Vibes, Plus_Jakarta_Sans } from "next/font/google";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { EVENT, getFormattedDate } from "@/config/event";
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

const date = getFormattedDate();

export const metadata: Metadata = {
  title: `${EVENT.name} · ${EVENT.age} Anos — Convite`,
  description: `Você é meu convidado especial! ${date.weekday}, ${date.day} de ${date.month.toLowerCase()} de ${date.year} às ${date.time}.`,
  openGraph: {
    title: `${EVENT.name} · ${EVENT.age} Anos`,
    description: `Save the date — ${date.short} · ${date.time}`,
    type: "website",
    locale: "pt_BR",
  },
  appleWebApp: { capable: true, title: `${EVENT.name} ${EVENT.age}`, statusBarStyle: "default" },
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

