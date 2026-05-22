import type { MetadataRoute } from "next";

// Public site — allow everything. Returning a MetadataRoute.Robots object
// makes Next emit /robots.txt at the canonical path.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
  };
}
