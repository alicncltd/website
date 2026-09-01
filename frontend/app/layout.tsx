import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.alicnc.pk"),
  title: {
    default: "Ali CNC™ | High-Precision 3D Modeling & CNC",
    template: "%s | Ali CNC™"
  },
  description: "Expert 3D Modeling & CNC Fabrication by Ali CNC™. Specialized in CAD Design, DFM, and CNC Programming in Rawalpindi.",
  keywords: ["CNC Pakistan", "3D Modeling", "CAD Design", "CNC Fabrication", "Rawalpindi CNC", "Precision Engineering"],
  authors: [{ name: "Ali CNC™" }],
  creator: "Ali CNC™",
  alternates: {
    canonical: "https://www.alicnc.pk",
  },
  icons: {
    icon: "/logo_final.svg",
    apple: "/logo_final.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://www.alicnc.pk",
    title: "Ali CNC™ | High-Precision 3D Modeling & CNC",
    description: "Expert CNC Fabrication and 3D Modeling services in Rawalpindi, Pakistan.",
    siteName: "Ali CNC™",
    images: [
      {
        url: "/logo_final.png",
        width: 1200,
        height: 630,
        alt: "Ali CNC™ Private Limited Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ali CNC™ Private Limited | High-Precision 3D Modeling & CNC",
    description: "Expert CNC Fabrication and 3D Modeling services in Rawalpindi, Pakistan.",
    images: ["/logo_final.png"],
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Ali CNC™ Private Limited",
  "image": "https://www.alicnc.pk/logo_final.png",
  "url": "https://www.alicnc.pk",
  "telephone": "+923440708494",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Rawalpindi",
    "addressRegion": "Punjab",
    "addressCountry": "PK"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 33.6007,
    "longitude": 73.0679
  },
  "founder": {
    "@type": "Person",
    "name": "Raja Muhammad Ali Asghar"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ],
    "opens": "09:00",
    "closes": "18:00"
  },
  "sameAs": [
    "https://www.cadcrowd.com/profile/212733-thealidev",
    "https://www.crunchbase.com/organization/ali-cnc-pakistan"
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo_final.svg" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5KPVVCZD"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        
        {/* Google Tag Manager Script loaded asynchronously */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-5KPVVCZD');`}
        </Script>

        {/* Zoho SalesIQ Live Chat Scripts */}
        <Script id="zsiq-init" strategy="afterInteractive">
          {`window.$zoho=window.$zoho || {};$zoho.salesiq=$zoho.salesiq||{ready:function(){}};`}
        </Script>
        <Script
          id="zsiqscript"
          src="https://salesiq.zohopublic.com/widget?wc=siq78d7576cb38f83628196f5eddb4a99f92a5522a2bd37a77dfbe530b23395e2c9"
          strategy="afterInteractive"
        />

        {/* DMCA Protection Badge Helper Script */}
        <Script src="https://images.dmca.com/Badges/DMCABadgeHelper.min.js" strategy="lazyOnload" />

        <Providers>
          <div className="app-container">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
