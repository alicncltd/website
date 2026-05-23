import Link from "next/link";
import Navbar from "../components/Navbar";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexDirection: 'column',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h1 className="gradient-text" style={{ fontSize: '6rem', fontWeight: 900, marginBottom: '1rem' }}>404</h1>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', marginBottom: '2.5rem' }}>
          Sorry, the page you are looking for doesn&apos;t exist or has been moved. 
          Use the button below to return to the homepage.
        </p>
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
      </main>
    </>
  );
}
