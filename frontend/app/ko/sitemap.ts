import { MetadataRoute } from "next";
import { createClient } from "../../lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alicnc.com";
  const koBaseUrl = `${baseUrl}/ko`;
  
  // Korean Static routes
  const routes = [
    { url: koBaseUrl, lastModified: new Date() },
    { url: `${koBaseUrl}/gallery`, lastModified: new Date() },
  ];

  try {
    const supabase = await createClient();
    const { data: items } = await supabase.from("catalog_items").select("id, updated_at");
    
    if (items) {
      items.forEach((item: any) => {
        routes.push({
          url: `${koBaseUrl}/gallery?product=${item.id}`,
          lastModified: new Date(item.updated_at || Date.now())
        });
      });
    }
  } catch (e) {
    console.error("Failed to generate dynamic Korean sitemap:", e);
  }

  return routes;
}
