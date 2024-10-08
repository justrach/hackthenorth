import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ConvexClientProvider from "./ConvexClientProvider";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Excus.us - Innovative Conference Networking",
  description: "Connect with diverse professionals at conferences using our AI-powered matching system. Excus.us brings together people with different backgrounds for meaningful conversations.",
  keywords: ["conference networking", "AI matching", "professional connections", "diversity networking", "embeddings"],
  openGraph: {
    title: "Excus.us - Meet Diverse Professionals at Conferences",
    description: "Discover unexpected connections at conferences with our AI-powered matching platform.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Excus.us logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Excus.us - Innovative Conference Networking",
    description: "Connect with diverse professionals at conferences using our AI-powered matching system.",
    images: ["/twitter-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      <body className={inter.className}>
        <ConvexClientProvider>
          {children}</ConvexClientProvider>
      </body>
    </html>
  );
}
