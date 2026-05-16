import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Ali CNC Pakistan | High-Precision 3D Modeling & CNC",
    template: "%s | Ali CNC Pakistan"
  },
  description: "Expert 3D Modeling & CNC Fabrication by Ali CNC Pakistan. Specialized in CAD Design, DFM, and CNC Programming in Rawalpindi.",
  keywords: ["CNC Pakistan", "3D Modeling", "CAD Design", "CNC Fabrication", "Rawalpindi CNC", "Precision Engineering"],
  authors: [{ name: "Ali CNC Pakistan" }],
  creator: "Ali CNC Pakistan",
  alternates: {
    canonical: "https://www.alicnc.online",
  },
  icons: {
    icon: "/logo_final.png",
    apple: "/logo_final.png",
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://www.alicnc.online",
    title: "Ali CNC Pakistan | High-Precision 3D Modeling & CNC",
    description: "Expert CNC Fabrication and 3D Modeling services in Rawalpindi, Pakistan.",
    siteName: "Ali CNC Pakistan",
    images: [
      {
        url: "/logo_final.png",
        width: 1200,
        height: 630,
        alt: "Ali CNC Pakistan Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ali CNC Pakistan | High-Precision 3D Modeling & CNC",
    description: "Expert CNC Fabrication and 3D Modeling services in Rawalpindi, Pakistan.",
    images: ["/logo_final.png"],
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Ali CNC Pakistan",
  "image": "https://www.alicnc.online/logo_final.png",
  "url": "https://www.alicnc.online",
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
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-5KPVVCZD');`,
          }}
        />
        {/* End Google Tag Manager */}
        <link rel="icon" href="/logo_final.png" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/6a01ab186a19e61c359850c8/1job88mk6';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
              })();
            `,
          }}
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
        <Providers>
          <div className="app-container">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
