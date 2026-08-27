import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Providers } from "../providers";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.alicnc.pk"),
  title: {
    default: "Ali CNC™ | 高精度 B2B 3D CAD 設計 & CNC Gコード最適化",
    template: "%s | Ali CNC™"
  },
  description: "木工所、家具工房、アクリル看板加工業者向けのプロフェッショナルな3D CAD設計およびCNCルーター用Gコード最適化サービス。",
  keywords: ["CNC日本", "3D CAD設計", "AutoCAD図面代行", "Gコード作成", "ネスティング最適化", "CNCルーター"],
  authors: [{ name: "Ali CNC™" }],
  creator: "Ali CNC™",
  alternates: {
    canonical: "https://www.alicnc.pk/ja",
  },
  icons: {
    icon: "/logo_final.svg",
    apple: "/logo_final.svg",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://www.alicnc.pk/ja",
    title: "Ali CNC™ | 高精度 B2B 3D CAD 設計 & CNC Gコード最適化",
    description: "工房やCNC加工会社向けのB2B高精度CAD設計とGコード最適化サービス。",
    siteName: "Ali CNC™",
    images: [
      {
        url: "/logo_final.png",
        width: 1200,
        height: 630,
        alt: "Ali CNC™ ロゴ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ali CNC™ | 高精度 B2B 3D CAD 設計 & CNC Gコード最適化",
    description: "工房やCNC加工会社向けのB2B高精度CAD設計とGコード最適化サービス。",
    images: ["/logo_final.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Ali CNC™ Private Limited",
  "image": "https://www.alicnc.pk/logo_final.png",
  "url": "https://www.alicnc.pk/ja",
  "telephone": "+923440708494",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Rawalpindi",
    "addressRegion": "Punjab",
    "addressCountry": "PK"
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

export default function JapaneseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${inter.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo_final.svg" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5KPVVCZD"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        
        <Script id="google-tag-manager-ja" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-5KPVVCZD');`}
        </Script>

        <Script id="tawk-to-chat-ja" strategy="lazyOnload">
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/6a01ab186a19e61c359850c8/1job88mk6';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>

        <Providers>
          <div className="app-container">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
