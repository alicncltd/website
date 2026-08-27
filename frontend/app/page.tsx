"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const isKo = navigator.languages
      ? navigator.languages.some(lang => lang.toLowerCase().startsWith("ko"))
      : (navigator.language || "").toLowerCase().startsWith("ko");
      
    const isTr = navigator.languages
      ? navigator.languages.some(lang => lang.toLowerCase().startsWith("tr"))
      : (navigator.language || "").toLowerCase().startsWith("tr");

    const isJa = navigator.languages
      ? navigator.languages.some(lang => lang.toLowerCase().startsWith("ja"))
      : (navigator.language || "").toLowerCase().startsWith("ja");

    if (isKo) {
      router.replace("/ko");
    } else if (isTr) {
      router.replace("/tr");
    } else if (isJa) {
      router.replace("/ja");
    } else {
      router.replace("/en");
    }
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
      <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
        <p style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "0.5rem" }}>Redirecting...</p>
        <div style={{ width: "30px", height: "30px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--accent-color)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }}></div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
