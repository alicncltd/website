import { MetadataRoute } from "next";
import { createClient } from "../lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alicnc.com";
  
  // Static pages
  const routes = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/en`, lastModified: new Date() },
    { url: `${baseUrl}/ko`, lastModified: new Date() },
    { url: `${baseUrl}/tr`, lastModified: new Date() },
    { url: `${baseUrl}/ja`, lastModified: new Date() },
    { url: `${baseUrl}/tools`, lastModified: new Date() },
    { url: `${baseUrl}/gallery`, lastModified: new Date() },
    { url: `${baseUrl}/legal`, lastModified: new Date() },
    { url: `${baseUrl}/legal/privacy`, lastModified: new Date() },
    { url: `${baseUrl}/legal/terms`, lastModified: new Date() },
    { url: `${baseUrl}/legal/copyright`, lastModified: new Date() },
    { url: `${baseUrl}/legal/license`, lastModified: new Date() },
    { url: `${baseUrl}/legal/disclaimer`, lastModified: new Date() },
    { url: `${baseUrl}/legal/refunds`, lastModified: new Date() },
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
