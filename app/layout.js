import { Geist } from "next/font/google";
import "./globals.css";
import "./pwa-font-size.css";
import Providers from "@/components/Providers";
import PwaFontSizeInitializer from "@/components/PwaFontSizeInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata = {
  title: "Aminul Islam Coaching Center",
  description: "Coaching center management dashboard",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.svg", type: "image/svg+xml", sizes: "192x192" },
      { url: "/icon-512.svg", type: "image/svg+xml", sizes: "512x512" },
    ],
    apple: "/icon-192.svg",
  },
};

export const viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <PwaFontSizeInitializer />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

