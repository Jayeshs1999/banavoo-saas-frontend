import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us — Bedwale.in",
  description:
    "Get in touch with Bedwale.in. Reach us for PG accommodation queries, listing support, or feedback. We are available Mon–Sun 9am to 9pm.",
  keywords: [
    "contact Bedwale.in",
    "PG support India",
    "PG accommodation helpdesk",
  ],
  alternates: { canonical: "https://www.bedwale.in/contact" },
  openGraph: {
    title: "Contact Us — Bedwale.in",
    description:
      "Get in touch with Bedwale.in for PG accommodation queries, listing support, or any feedback.",
    url: "https://www.bedwale.in/contact",
    siteName: "Bedwale.in",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
