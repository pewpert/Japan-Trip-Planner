import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import { BRAND } from "@/lib/brand";
import "./globals.css";

// One typeface throughout; hierarchy comes from size, weight and case.
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.descriptor}`,
  description:
    "Plan a motorcycle ride in Japan: go or no-go for the day, arrival against sunset, fuel range, honest motorcycle tolls and seasonal road hazards.",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Apply saved dark mode preference before first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=localStorage.getItem('japan-bike-trip-dark-mode');if(d==='true')document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${instrumentSans.variable} font-sans antialiased h-full`}>{children}</body>
    </html>
  );
}
