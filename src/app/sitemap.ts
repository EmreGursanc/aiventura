import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://aiventura.com.tr'

  // Sadece Google'ın indekslemesini istediğimiz açık/tanıtım sayfalarını ekliyoruz.
  // İçerideki oyun/ders/profil sayfalarını eklemiyoruz ki kullanıcı girişi olmadan taranamayan sayfalar Google'ı yormasın.
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    }
  ]
}
