import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ClientAuthProvider } from "./ClientAuthProvider";
import StructuredData from "../components/StructuredData";
import I18nProvider from "../components/I18nProvider";

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
    default:
      "Bedwale.in - Find & Book PG Accommodation Online | Pune & India",
    template: "%s | Bedwale.in",
  },
  description:
    "Find and book PG rooms, shared beds and dormitories near you. Bedwale.in connects students and working professionals with affordable PG accommodation in Pune, Mumbai and across India. PG owners — manage rooms, beds and payments online.",
  keywords: [
    // Core
    "PG accommodation",
    "paying guest",
    "book PG online",
    "book bed online",
    "PG near me",
    // City-specific
    "PG in Pune",
    "PG in Mumbai",
    "PG Kothrud",
    "PG Hadapsar",
    "PG near Fergusson College Pune",
    "PG near SIT Pune",
    // Audience
    "student housing India",
    "PG for working professionals",
    "girls PG Pune",
    "boys PG Pune",
    // Budget
    "cheap PG Pune",
    "affordable PG under 5000",
    // Dormitory / hostel
    "dormitory near Pune university",
    "hostel for working professionals Pune",
    // PG owner tools
    "PG management software India",
    "online PG billing system",
    "manage PG tenants app",
    // General
    "room sharing",
    "bed booking India",
  ],
  authors: [{ name: "Jayesh Sevatkar" }],
  creator: "Bedwale.in",
  publisher: "Bedwale.in",

  // Open Graph / Facebook
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.bedwale.in",
    title: "Bedwale.in - Find & Book PG Accommodation Online",
    description:
      "Find and book PG rooms, shared beds and dormitories near you. Affordable PG accommodation for students and working professionals across India.",
    siteName: "Bedwale.in",
    images: [
      {
        url: "https://www.bedwale.in/logo3.png",
        width: 1200,
        height: 630,
        alt: "Bedwale.in - Find and Book PG Accommodation Online",
      },
    ],
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "Bedwale.in - Find & Book PG Accommodation Online",
    description:
      "Find and book PG rooms, shared beds and dormitories near you. Affordable PG for students and professionals across India.",
    images: ["https://www.bedwale.in/logo3.png"],
    creator: "@bedwale_in",
  },

  // Robots
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

  // Verification — replace with real codes from Google/Bing Search Console
  // See: https://search.google.com/search-console  (copy the "content" value from the meta tag)
  verification: {
    google: "YNB6glhaxjWTiuV4WzthwSxT7QVcEa3ehAZPOckjnFI",
  },

  // Canonical URL
  alternates: {
    canonical: "https://www.bedwale.in",
  },

  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  // Theme color
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],

  // Application name
  applicationName: "Bedwale.in",

  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Bedwale.in",
    "format-detection": "telephone=no",
    "msapplication-TileColor": "#da532c",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
        <I18nProvider>
          <ClientAuthProvider>
            <Header />
            <main className="flex-grow pt-[64px]">{children}</main>
            <Footer />
          </ClientAuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
