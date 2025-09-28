import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";
import type React from "react";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/AuthContext";
import WakeupDatabase from "@/components/WakeupDatabase";

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
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-R1984ZPVCX"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-R1984ZPVCX');
            `,
          }}
        />
        <script
          defer
          src="https://umami-blond-eight.vercel.app/script.js"
          data-website-id="dfd6d3bb-0b1f-4966-80db-63bcdb0c5149"
        />
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
      </head>
      <body
        className={`${inter.className} min-h-screen bg-gradient-to-br from-gray-700 to-green-900`}
      >
        <AuthProvider>
          <LanguageProvider>
            <WakeupDatabase />
            {/* <NavBar /> */}
            {children}
            <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
