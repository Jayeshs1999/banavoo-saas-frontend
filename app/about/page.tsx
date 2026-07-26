import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Us — Bedwale.in",
  description:
    "Learn how Bedwale.in helps PG owners manage rooms, beds and payments — and helps students and working professionals find affordable PG accommodation across India.",
  keywords: [
    "about Bedwale.in",
    "PG accommodation India",
    "PG management platform",
    "student housing India",
  ],
  alternates: { canonical: "https://www.bedwale.in/about" },
  openGraph: {
    title: "About Us — Bedwale.in",
    description:
      "Bedwale.in connects students and professionals with quality PG accommodations, and gives PG owners powerful tools to manage their property.",
    url: "https://www.bedwale.in/about",
    siteName: "Bedwale.in",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
