// AIVentura: Tüm TypeScript Tip Tanımları
// =============================================

// ─── Müfredat Tipleri ──────────────────────────────────────────────────────

export type TrackId = 'cocuklar' | 'profesyoneller'

export type QuestStatus = 'kilitli' | 'baslanmamis' | 'devam' | 'tamamlandi'

export interface ValidationRule {
  zorunluKelimeler?: string[]
  minUzunluk?: number
  maxUzunluk?: number
}

export interface NpcDiyalog {
  tip?: 'npc' | 'metin' | 'ipucu'
  avatar?: string
  isim?: string
  konusmaci?: string
  metin: string
  ifade?: 'mutlu' | 'dusunuyor' | 'saskin' | 'uyari' | 'zafer'
  icerik?: string
}

export interface Rozet {
  id?: string
  isim: string
  ikon: string
  aciklama: string
}

export interface YapbozBlok {
  id: string
  kategori: 'konu' | 'eylem' | 'stil' | 'parametre'
  metin: string
  renk: string
}

export interface Gorev {
  id: string
  ikon: string
  baslik: string
  ozet: string
  hikaye?: NpcDiyalog[]
  hedef?: string
  ipucu?: string
  dogrulama?: ValidationRule
  yanitSimulasyonu?: string
  xpOdul: number
  rozetOdul?: Rozet
  isPremium?: boolean
  yapbozBloklari?: YapbozBlok[]
}

export interface BossBattle {
  id: string
  baslik: string
  aciklama: string
  isPremium?: boolean
}

export interface Bolum {
  id: string
  numara?: number
  sira?: number
  etiket?: string
  baslik: string
  aciklama: string
  gorevler: (Gorev | BossBattle)[]
}

export interface Kurs {
  id?: string
  izId?: TrackId
  baslik?: string
  aciklama?: string
  dunyaBaslik: string
  dunyaAltBaslik?: string
  bolumler: Bolum[]
}

// ─── Kullanıcı Tipleri ─────────────────────────────────────────────────────

export interface KullaniciIstatistikleri {
  seviye: number
  xp: number
  sonrakiSeviyeXp: number
  seriGunu: number
  rozetler: Rozet[]
  tamamlananGorevler: string[]
  aktifIz: TrackId
}

export interface KullaniciBilgisi {
  uid: string
  email: string
  displayName: string | null
  photoURL: string | null
  olusturmaTarihi: Date
  istatistikler: KullaniciIstatistikleri
  isPremium: boolean
}

// ─── UI State Tipleri ──────────────────────────────────────────────────────

export type Gorunum = 'harita' | 'ders' | 'profil'

export interface AktifDers {
  gorev: Gorev
  bolumId: string
  gorevIndex: number
  toplamGorev: number
}
