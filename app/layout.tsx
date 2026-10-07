// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { CookieBanner } from "@/components/gdpr/CookieBanner";
import { UserLogin } from "@/components/auth/UserLogin";
import { PinterestTag } from "@/components/analytics/PinterestTag";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";
// SHOWCASE: delete the AdminLogin import and the <AdminLogin /> line below.
import { AdminLogin } from "@/components/admin/AdminLogin";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const SITE_URL = "https://barcelonaroute.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  robots: { index: true, follow: true },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    other: { "p:domain_verify": "ccee3d184e7b63ed332ff7cc23e35f4c" },
  },
  category: "travel",

  alternates: { canonical: "./" },

  title: "Barcelona Route — Your perfect day in Barcelona",
  description:
    "Tell us where you're staying and what you love — we'll build your ideal Barcelona route in 30 seconds.",
  manifest: "/manifest.webmanifest",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Barcelona Route",
  },
  openGraph: {
    title: "Barcelona Route",
    description: "Your perfect Barcelona day, planned in 30 seconds",
    url: SITE_URL,
    siteName: "Barcelona Route",
    locale: "en_US",
    type: "website",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Barcelona Route",
  description: "Your perfect day in Barcelona, planned in 30 seconds.",
  applicationCategory: "TravelApplication",
  operatingSystem: "Web, iOS, Android",
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  screenshot: `${SITE_URL}/screenshot.png`,
  url: `${SITE_URL}/`,
};

export const viewport: Viewport = {
  themeColor: "#1B2B4B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/icons/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body>
        <PostHogProvider>
          <header className="site-header">
            <Link href="/" className="site-header__logo">
              Barcelona Route
            </Link>
            <UserLogin />
          </header>

          {children}
          <Toaster />

          <footer className="site-footer">
            <div className="site-footer__links">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/blog">Blog</Link>
            </div>
            <p className="site-footer__copy">
              © {new Date().getFullYear()} Barcelona Route. All rights reserved.
            </p>
          </footer>

  
          <PinterestTag />

          <AdminLogin />
          <ServiceWorkerRegistration />
          <InstallPrompt />
          <CookieBanner />
        </PostHogProvider>
      </body>
    </html>
  );
}