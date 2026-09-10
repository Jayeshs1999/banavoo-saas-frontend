import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { StoreProvider } from "./context/StoreContext";

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
    default: "Banavoo",
    template: "%s | Banavoo",
  },
  description: "Banavoo — the marketplace for handmade product sellers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <StoreProvider>
            {/* TODO: Add your Header component here */}
            <main className="flex-grow">{children}</main>
            {/* TODO: Add your Footer component here */}
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
