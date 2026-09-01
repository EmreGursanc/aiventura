export interface Evidence {
  id: string
  title: string
  type: 'log' | 'code' | 'json' | 'email'
  content: string
  isLocked?: boolean
  lockHint?: string
  lockQuestion?: string
  lockAnswerKeyword?: string[]
}

export interface DetectiveMission {
  id: string
  chapterNumber: number
  title: string
  subtitle: string
  description: string
  objective: string
  difficulty?: string
  systemPrompt: string
  evidence: Evidence[]
  tensionWarning?: string
  tensionEscalation?: string
}

export const DETECTIVE_MISSIONS: DetectiveMission[] = [
  {
    id: 'ep1',
    chapterNumber: 1,
    title: 'Otopsi Raporu',
    subtitle: 'BÖLÜM 1: ROL ATAMA',
    description: 'Zengin iş adamı Tarık Bey ölü bulundu. Elimizdeki otopsi raporu çok karmaşık tıbbi terimlerle dolu.',
    objective: 'Otopsi raporunu anlaşılır kılmak için yapay zekaya uygun bir ROL ata.',
    systemPrompt: '',
    evidence: [],
  },
  {
    id: 'ep2',
    chapterNumber: 2,
    title: 'Telefon Kayıtları',
    subtitle: 'BÖLÜM 2: NETLİK KAZANDIRMA',
    description: 'Şüphelilerin 10 yıllık telefon mesajları elimize geçti. Çok fazla gereksiz veri var.',
    objective: 'Spesifik saat ve kelimeler belirterek (NETLİK katarak) şüpheli mesajları filtrele.',
    systemPrompt: '',
    evidence: [],
  },
  {
    id: 'ep3',
    chapterNumber: 3,
    title: 'İfade Çelişkileri',
    subtitle: 'BÖLÜM 3: FORMAT KULLANIMI',
    description: 'Şüphelilerin uzun ifadeleri birbirine girmiş. Kim nerede çelişiyor anlamak imkansız.',
    objective: 'İfadeleri anlaşılır bir TABLO formatına dönüştürerek çelişkiyi bul.',
    systemPrompt: '',
    evidence: [],
  },
  {
    id: 'ep4',
    chapterNumber: 4,
    title: 'Tutuklama Emri',
    subtitle: 'BÖLÜM 4: SENTEZ (FİNAL)',
    description: 'Tüm ipuçlarını buldun. Şoförün yalan söylediğini ve kasayı açtığını biliyoruz.',
    objective: 'Öğrendiğin 4 kavramı birleştirerek savcılığa resmi bir rapor hazırlat ve katili yakala!',
    systemPrompt: '',
    evidence: [],
  }
];
