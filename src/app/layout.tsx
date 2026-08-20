import type { Metadata } from "next";
import "./globals.css";
import AppWrapper from "@/components/layout/AppWrapper";

export const metadata: Metadata = {
  metadataBase: new URL("https://aiventura.com.tr"),
  title: "AIVentura | Yapay Zekayı Oynayarak Öğren",
  description:
    "AIVentura, yapay zekayı Türkçe, oyunlaştırılmış ve hikâyeli görevlerle öğreten Türkiye'nin lider interaktif platformudur. Başlangıç seviyesinden siber dedektifliğe kadar AI dünyasını keşfedin.",
  keywords: [
    "yapay zeka öğren",
    "AIVentura",
    "AI eğitim",
    "prompt mühendisliği",
    "Türkçe AI kursu",
    "oyunlaştırma",
    "midjourney eğitimi",
    "siber dedektif",
  ],
  openGraph: {
    title: "AIVentura | Yapay Zekayı Oynayarak Öğren",
    description: "Türkiye'nin ilk oyunlaştırılmış yapay zeka öğrenme platformu. Hemen ücretsiz başla!",
    url: "https://aiventura.com.tr",
    siteName: "AIVentura",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIVentura | Yapay Zekayı Oynayarak Öğren",
    description: "Oyun oynayarak Prompt Mühendisliği ve Yapay Zeka öğrenin.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <div id="__next-root">
          <AppWrapper>{children}</AppWrapper>
        </div>
      </body>
    </html>
  );
}
