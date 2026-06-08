import Script from "next/script";

interface StructuredDataProps {
  type: "Organization" | "WebSite" | "LocalBusiness";
  data: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case "Organization":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "STHALS.IN",
          alternateName: "PGWala",
          url: "https://www.sthals.in",
          logo: "https://www.sthals.in/kumbhakarn-logo.svg",
          description:
            "Find and manage PG accommodations with ease. STHALS.IN connects students and professionals with quality PG accommodations while empowering PG owners with powerful management tools.",
          foundingDate: "2026",
          sameAs: [
            "https://www.facebook.com/sthals.in",
            "https://www.instagram.com/sthals.in",
            "https://twitter.com/sthals_in",
          ],
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+91-8888585093",
            contactType: "Customer Support",
            availableLanguage: ["English", "Hindi"],
          },
          address: {
            "@type": "PostalAddress",
            streetAddress: "Anil Sadan, Gokhalenagar",
            addressLocality: "Pune",
            addressRegion: "Maharashtra",
            postalCode: "411016",
            addressCountry: "IN",
          },
        };

      case "WebSite":
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "STHALS.IN",
          url: "https://www.sthals.in",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://www.sthals.in/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        };

      case "LocalBusiness":
        return {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "STHALS.IN",
          description:
            "PG accommodation management platform connecting students and professionals with quality accommodations.",
          url: "https://www.sthals.in",
          logo: "https://www.sthals.in/kumbhakarn-logo.svg",
          image: "https://www.sthals.in/kumbhakarn-logo.svg",
          priceRange: "$$",
          address: {
            "@type": "PostalAddress",
            streetAddress: "123 PG Street",
            addressLocality: "City",
            addressRegion: "State",
            postalCode: "123456",
            addressCountry: "IN",
          },
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+91-8888585093",
            contactType: "Customer Support",
            availableLanguage: ["English", "Hindi"],
          },
          openingHours: ["Mo-Su 09:00-18:00"],
          sameAs: [
            "https://www.facebook.com/sthals.in",
            "https://www.instagram.com/sthals.in",
            "https://twitter.com/sthals_in",
          ],
        };

      default:
        return null;
    }
  };

  const structuredData = getStructuredData();

  if (!structuredData) {
    return null;
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      strategy="afterInteractive"
    >
      {JSON.stringify(structuredData)}
    </Script>
  );
}
