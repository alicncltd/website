import { MetadataRoute } from "next";
import { createClient } from "../lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alicnc.com";
  
  // Static pages
  const routes = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/gallery`, lastModified: new Date() },
    { url: `${baseUrl}/login`, lastModified: new Date() },
  ];

  try {
    const supabase = await createClient();
    const { data: items } = await supabase.from("catalog_items").select("id, updated_at");
    
    if (items) {
      items.forEach((item: any) => {
        routes.push({
          url: `${baseUrl}/gallery?product=${item.id}`,
          lastModified: new Date(item.updated_at || Date.now())
        });
      });
    }
  } catch (e) {
    console.error("Failed to generate dynamic sitemap:", e);
  }

  return routes;
}
