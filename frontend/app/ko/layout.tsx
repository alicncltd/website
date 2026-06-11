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
  metadataBase: new URL("https://www.alicnc.online"),
  title: {
    default: "Ali CNC | 고정밀 B2B 3D CAD 설계 & CNC G코드 최적화",
    template: "%s | Ali CNC"
  },
  description: "국내 가구 공방, 목공소, 아크릴 간판 제작사를 위한 B2B 전문 도면 설계 및 CNC 가공용 G코드 최적화 서비스. 불량률 제로, 자재 손실 최소화 네스팅 설계.",
  keywords: ["CNC 가공", "3D CAD 모델링", "AutoCAD 도면 대행", "아스파이어 G코드", "자재 네스팅 설계", "CNC 가공 도면"],
  authors: [{ name: "Ali CNC" }],
  creator: "Ali CNC",
  alternates: {
    canonical: "https://www.alicnc.online/ko",
  },
  icons: {
    icon: "/logo_final.svg",
    apple: "/logo_final.svg",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://www.alicnc.online/ko",
    title: "Ali CNC | 고정밀 B2B 3D CAD 설계 & G코드 최적화",
    description: "국내 가구 공방 및 CNC 목공소를 위한 고정밀 B2B 도면 설계 및 G코드 최적화 서비스.",
    siteName: "Ali CNC",
    images: [
      {
        url: "/logo_final.png",
        width: 1200,
        height: 630,
        alt: "Ali CNC 로고",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ali CNC Private Limited | 고정밀 B2B 3D CAD 설계 & G코드 최적화",
    description: "국내 가구 공방 및 CNC 목공소를 위한 고정밀 B2B 도면 설계 및 G코드 최적화 서비스.",
    images: ["/logo_final.png"],
  },
};

// JSON-LD Structured Data for South Korea
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Ali CNC Private Limited",
  "image": "https://www.alicnc.online/logo_final.png",
  "url": "https://www.alicnc.online/ko",
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

export default function KoreanLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable}`} suppressHydrationWarning>
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
        
        {/* Google Tag Manager Script loaded asynchronously */}
        <Script id="google-tag-manager-ko" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-5KPVVCZD');`}
        </Script>

        {/* Tawk.to Live Chat Script loaded lazily */}
        <Script id="tawk-to-chat-ko" strategy="lazyOnload">
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
