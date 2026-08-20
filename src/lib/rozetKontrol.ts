import { ROZET_LISTESI, type Rozet } from '@/data/rozetler'

export interface RozetKontrolGirdisi {
  xp: number
  tamamlananSayisi: number
  seriGunu: number
  mevcutRozetIds: string[]
}

export function yeniKazanilanRozetleriBul(girdi: RozetKontrolGirdisi): Rozet[] {
  const yeniRozetler: Rozet[] = []

  for (const rozet of ROZET_LISTESI) {
    // Zaten kazanılmışsa atla
    if (girdi.mevcutRozetIds.includes(rozet.id)) continue

    // Kriter sağlanıyor mu?
    if (
      rozet.kriter({
        xp: girdi.xp,
        tamamlananSayisi: girdi.tamamlananSayisi,
        seriGunu: girdi.seriGunu,
      })
    ) {
      yeniRozetler.push(rozet)
    }
  }

  return yeniRozetler
}
