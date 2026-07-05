import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

// Single-family typography: Geist everywhere, hierarchy via weight and size
const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Japan バイク Trip Planner",
  description:
    "Plan motorcycle trips through rural Japan — routes, weather, costs, and AI itineraries.",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
      <body className={`${geist.className} antialiased h-full`}>{children}</body>
    </html>
  );
}
