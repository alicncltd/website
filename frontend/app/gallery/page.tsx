import Navbar from "../../components/Navbar";
import { createClient } from "../../lib/supabase/server";
import { ArrowRight, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import "./gallery.css";

interface PageProps {
  searchParams: Promise<{ product?: string }>;
}

function formatPrice(price: any): string {
  const num = Number(String(price || "0").replace(/[^0-9.]/g, ""));
  return isNaN(num) ? "0" : num.toLocaleString();
}

export default async function GalleryPage({ searchParams }: PageProps) {
  const { product: selectedProductId } = await searchParams;
  const supabase = await createClient();

  // 1. Fetch cached catalog items
  const { data: products } = await supabase
    .from("catalog_items")
    .select("*")
    .order("updated_at", { ascending: false });

  // 2. Fetch specific selected product details for modal + SEO Schema injection
  let selectedProduct = null;
  if (selectedProductId) {
    const { data } = await supabase
      .from("catalog_items")
      .select("*")
      .eq("id", selectedProductId)
      .maybeSingle();
    selectedProduct = data;
  }

  // Schema.org Structured Data
  const jsonLd = selectedProduct
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": selectedProduct.name,
        "image": selectedProduct.cloudinary_url,
        "description": selectedProduct.description,
        "offers": {
          "@type": "Offer",
          "price": selectedProduct.price,
          "priceCurrency": "PKR",
          "availability": "https://schema.org/InStock"
        }
      }
    : null;

  return (
    <>
      <Navbar />

      {/* Inject SEO JSON-LD Product schema */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <main className="gallery-page">
        <section className="gallery-container">
          <h1 className="section-title">
            Our CNC <span className="gradient-text">Product Gallery</span>
          </h1>
          <p className="hero-description" style={{ marginTop: "-2rem" }}>
            Explore high-precision 3D relief models, vector templates, and custom CNC fabrications synced live from our official catalog.
          </p>

          {products && products.length > 0 ? (
            <div className="gallery-grid">
              {products.map((product: any) => (
                <Link
                  key={product.id}
                  href={`/gallery?product=${product.id}`}
                  scroll={false}
                  className="gallery-card glass-panel"
                >
                  <div className="gallery-image-wrapper">
                    <Image
                      src={product.cloudinary_url}
                      alt={product.name}
                      fill
                      loading="lazy"
                      className="gallery-img"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="gallery-content">
                    <div>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>{product.name}</h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                        {product.description?.substring(0, 80)}
                        {product.description?.length > 80 ? "..." : ""}
                      </p>
                    </div>
                    <div className="product-meta">
                      <span className="product-price">Rs. {formatPrice(product.price)}</span>
                      <span className="view-btn">
                        Details <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="no-products glass-panel" style={{ maxWidth: "600px", margin: "4rem auto" }}>
              <h3>No Products in Gallery</h3>
              <p style={{ marginTop: "1rem" }}>Please login to your admin dashboard to sync your WhatsApp Business catalog.</p>
            </div>
          )}
        </section>

        {/* Dynamic Detail Modal (Server-Driven via URL query state) */}
        {selectedProduct && (
          <div className="modal-overlay">
            <div className="modal-content-panel glass-panel">
              <Link href="/gallery" scroll={false} className="close-modal-btn" aria-label="Close details">
                <X size={20} />
              </Link>
              
              <div className="modal-image-wrapper">
                <Image
                  src={selectedProduct.cloudinary_url}
                  alt={selectedProduct.name}
                  fill
                  priority
                  style={{ objectFit: "contain" }}
                />
              </div>

              <div className="modal-details">
                <div>
                  <h2 style={{ fontSize: "1.8rem", fontWeight: 800 }}>{selectedProduct.name}</h2>
                  <div className="modal-price">Rs. {formatPrice(selectedProduct.price)}</div>
                  <p className="modal-desc">{selectedProduct.description}</p>
                </div>
                
                <div style={{ display: "flex", gap: "1rem" }}>
                  <a
                    href={`https://wa.me/923440708494?text=Hi%20,%20I%20am%20interested%20in%20product%20ID%20${selectedProduct.id}%20(${encodeURIComponent(selectedProduct.name)})%20from%20your%20website%20gallery.%20Can%20you%20please%20share%20more%20details%20?`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary"
                    style={{ flexGrow: 1 }}
                  >
                    Inquire on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
