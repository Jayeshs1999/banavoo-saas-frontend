interface StructuredDataProps {
  type: "Organization" | "WebSite" | "LocalBusiness";
  data?: Record<string, unknown>;
}

export default function StructuredData({ type }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case "Organization":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Bedwale.in",
          url: "https://www.bedwale.in",
          logo: "https://www.bedwale.in/logo3.png",
          description:
            "Bedwale.in connects students and professionals with quality PG accommodations across India, while empowering PG owners with powerful management tools.",
          foundingDate: "2025",
          sameAs: [
            "https://www.facebook.com/bedwale.in",
            "https://www.instagram.com/bedwale.in",
            "https://twitter.com/bedwale_in",
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
          name: "Bedwale.in",
          url: "https://www.bedwale.in",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://www.bedwale.in/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        };

      case "LocalBusiness":
        return {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Bedwale.in",
          description:
            "PG accommodation platform connecting students and professionals with quality PG rooms and beds across Pune and India.",
          url: "https://www.bedwale.in",
          logo: "https://www.bedwale.in/logo3.png",
          image: "https://www.bedwale.in/logo3.png",
          priceRange: "₹₹",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Anil Sadan, Gokhalenagar",
            addressLocality: "Pune",
            addressRegion: "Maharashtra",
            postalCode: "411016",
            addressCountry: "IN",
          },
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+91-8888585093",
            contactType: "Customer Support",
            availableLanguage: ["English", "Hindi"],
          },
          openingHours: ["Mo-Su 09:00-21:00"],
          sameAs: [
            "https://www.facebook.com/bedwale.in",
            "https://www.instagram.com/bedwale.in",
            "https://twitter.com/bedwale_in",
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
    <script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
