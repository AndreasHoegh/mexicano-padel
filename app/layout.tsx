import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({ subsets: ["latin"] });

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

const APP_NAME = "PadelAmericano";
const APP_DESCRIPTION =
  "The ultimate padel tournament management system for organizing and running americano and mexicano padel tournaments";

export const metadata: Metadata = {
  metadataBase: new URL("https://padelamericano.com"),
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "padel",
    "tournament",
    "tournament management",
    "padel tournament",
    "sports",
    "tournament generator",
    "americano",
    "mexicano",
  ],
  authors: [{ name: "Andreas Høgh" }],
  creator: "Andreas Høgh",
  publisher: "Andreas Høgh",
  robots: "index, follow",
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "PadelAmericano",
              applicationCategory: "SportsApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
        {GA_MEASUREMENT_ID && (
          <GoogleAnalytics GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />
        )}
      </head>
      <body
        className={`${inter.className} min-h-screen bg-gradient-to-br from-gray-700 to-green-900`}
      >
        {children}
      </body>
    </html>
  );
}
