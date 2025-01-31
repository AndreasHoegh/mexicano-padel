import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";
import React from "react";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

const APP_NAME = "PadelAmericano";
const APP_DESCRIPTION =
  "The ultimate padel tournament management system for organizing and running americano and mexicano padel tournaments";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.padelamericano.org"),
  alternates: {
    canonical: "https://www.padelamericano.org",
  },
  icons: {
    icon: [
      { url: "favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "favicon.ico",
  },
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "padel",
    "Americano App",
    "Mexicano App",
    "Americano padel app",
    "Mexicano padel app",
    "tournament",
    "tournament management",
    "padel tournament",
    "sports",
    "tournament generator",
    "americano",
    "mexicano",
    "padel americano",
    "padel mexicano",
    "padel tournament organizer",
    "padel tournament software",
    "padel americano rules",
    "padel mexicano rules",
    "padel competition generator",
    "how to organize a padel americano tournament",
    "free padel tournament generator",
    "best app for americano padel",
    "best app for mexicano padel",
    "best app for padel",
    "best app for padel tournament",
    "create a padel americano tournament online",
  ],
  robots: "index, follow",
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ["/og-image.jpg"],
    url: "https://www.padelamericano.org",
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
      <Head>
        <title>Padel Americano</title>
        <script
          defer
          src="https://umami-blond-eight.vercel.app/script.js"
          data-website-id="dfd6d3bb-0b1f-4966-80db-63bcdb0c5149"
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
      </Head>
      <body
        className={`${inter.className} min-h-screen bg-gradient-to-br from-gray-700 to-green-900`}
      >
        <header className="sr-only">
          <h1 className="text-4xl font-bold text-center pt-6 text-yellow-600">
            Americano Padel App
          </h1>
          <p className="text-center text-lg text-gray-300 mt-2">
            The ultimate americano padel app for organizing and running
            americano and mexicano padel tournaments. For free.
          </p>
        </header>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
