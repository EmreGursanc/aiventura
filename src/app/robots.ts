import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // İçerideki özel sayfaların botlar tarafından taranmasını engelliyoruz
      disallow: ['/anasayfa', '/ders/', '/detective/', '/profil/', '/labs/', '/yetiskinler/'],
    },
    sitemap: 'https://aiventura.com.tr/sitemap.xml',
  }
}
