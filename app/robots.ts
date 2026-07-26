import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/user/"],
      },
    ],
    sitemap: "https://www.bedwale.in/sitemap.xml",
  };
}
