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
    default: "Ali CNC Pakistan | High-Precision 3D Modeling & CNC Specialist",
    template: "%s | Ali CNC Pakistan"
  },
  description: "Expert High-Precision 3D Modeling, CNC Fabrication, and CAD Design services by Muhammad Ali in Rawalpindi, Pakistan. Specialized in DFM and CNC Programming.",
  keywords: ["CNC Pakistan", "3D Modeling", "CAD Design", "CNC Fabrication", "Rawalpindi CNC", "Precision Engineering"],
  authors: [{ name: "Muhammad Ali" }],
  creator: "Muhammad Ali",
  icons: {
    icon: "/logo_final.png",
    apple: "/logo_final.png",
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://alicncpk.com",
    title: "Ali CNC Pakistan | High-Precision 3D Modeling & CNC Specialist",
    description: "Expert CNC Fabrication and 3D Modeling services in Rawalpindi, Pakistan.",
    siteName: "Ali CNC Pakistan",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo_final.png" />
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
        <Providers>
          <div className="app-container">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
