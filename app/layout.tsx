import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ClientAuthProvider } from "./ClientAuthProvider";
import StructuredData from "../components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "STHALS.IN - PG Accommodation Management",
    template: "%s | STHALS.IN",
  },
  description:
    "Find and manage PG accommodations with ease. STHALS.IN connects students and professionals with quality PG accommodations while empowering PG owners with powerful management tools.",
  keywords: [
    "PG accommodation",
    "paying guest",
    "student housing",
    "PG management",
    "room sharing",
    "accommodation finder",
    "PG near me",
    "student housing India",
  ],
  authors: [{ name: "STHALS.IN Team" }],
  creator: "STHALS.IN",
  publisher: "STHALS.IN",

  // Open Graph / Facebook
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.sthals.in",
    title: "STHALS.IN - PG Accommodation Management",
    description:
      "Find and manage PG accommodations with ease. Quality accommodations for students and professionals.",
    siteName: "STHALS.IN",
    images: [
      {
        url: "/logo1.png",
        width: 1200,
        height: 630,
        alt: "STHALS.IN - PG Accommodation Management",
      },
    ],
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "STHALS.IN - PG Accommodation Management",
    description:
      "Find and manage PG accommodations with ease. Quality accommodations for students and professionals.",
    images: ["/logo1.png"],
    creator: "@sthals_in",
  },

  // Additional meta tags
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification tags (optional - remove if not needed)
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },

  // Canonical URL
  alternates: {
    canonical: "https://www.sthals.in",
  },

  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#000000",
      },
    ],
  },

  // Theme color
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],

  // Application name
  applicationName: "STHALS.IN",

  // Additional structured data can be added here
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "STHALS.IN",
    "format-detection": "telephone=no",
    "msapplication-TileColor": "#da532c",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data Components */}
        <StructuredData type="Organization" data={{}} />
        <StructuredData type="WebSite" data={{}} />
        <StructuredData type="LocalBusiness" data={{}} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bungee+Spice&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poiret+One&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Uncial+Antiqua&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <ClientAuthProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ClientAuthProvider>
      </body>
    </html>
  );
}
