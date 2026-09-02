export type Intent = 'chat' | 'hint' | 'lock' | 'analysis'

export function detectIntent(prompt: string): Intent {
  const p = prompt.toLowerCase().trim()
  const hintPattern = /(ipucu|yardım et|nasıl yapıcam|nasıl yapayım|takıldım|ne yapmalıyım|hint|help me)/
  if (hintPattern.test(p) && p.length < 70) return 'hint'
  const lockPattern = /(kilit|şifreli dosya|kilidi|unlock|açamıyorum|kırılmıyor|kırılmadı)/
  if (lockPattern.test(p) && p.length < 90) return 'lock'
  const looksLikeData = /\d{2,}|https?:|log|json|ip|sep\s?14|\.txt|\.log|@/.test(p)
  if (!looksLikeData && p.length < 40) return 'chat'
  return 'analysis'
}

const PERSONA_STYLE_GUIDE = `\n\nROLÜNE SADIK KAL: Sen bir hikaye karakterisin, jenerik bir asistan değilsin. Kullanıcı sana "merhaba", "naber", "nasılsın" gibi sohbet cümleleri kurarsa, karakterine uygun kısa ve samimi bir dedektif ağzıyla karşılık ver (soğuk/robotik olma), ama her seferinde onu göreve nazikçe geri yönlendir. Cevapların kısa ve atmosferik olsun, gereksiz uzun paragraflara boğma. Emoji kullanabilirsin ama abartma.`

export function analyzePrompt(prompt: string, missionId: string) {
  const p = prompt.toLowerCase()
  let hasLog = false, hasGoal = false, hasFormat = false

  if (missionId === 'ep1') {
    hasLog = (p.includes('10.0.0.5') || p.includes('backup server') || p.includes('srv-main')) && (p.includes('sep 14') || p.includes('sshd') || p.includes('auth.log')) && (p.includes('ali yılmaz') || p.includes('mehmet kaya') || p.includes('emp-001'))
    hasGoal = p.includes('isim') || p.includes('personel') || p.includes('kim') || p.includes('adını') || p.includes('adı') || p.includes('kime') || p.includes('kullanıcı') || p.includes('kişi')
    hasFormat = p.includes('03:00') || p.includes('04:00') || p.includes('saat')
  }
  else if (missionId === 'ep2') {
    const fileCount = (p.includes('base64') || p.includes('mtk4') ? 1 : 0) + (p.includes('pid') || p.includes('curl') ? 1 : 0) + (p.includes('outbound') || p.includes('198.51') ? 1 : 0)
    hasLog = fileCount >= 2
    hasGoal = p.includes('json') || p.includes('format') || p.includes('çıktı') || p.includes('rapor') || p.includes('output')
    hasFormat = p.includes('ip') || p.includes('port') || p.includes('saldırı') || p.includes('hedef') || p.includes('bağlantı') || p.includes('attack')
  }
  else if (missionId === 'ep3') {
    hasLog = (p.includes('intercepted') || p.includes('.tiges') || p.includes('phantom_x') || p.includes('tiges avi')) && (p.includes('hacker_forum') || p.includes('rot13') || p.includes('forum') || p.includes('darknet') || p.includes('phantom'))
    hasGoal = p.includes('çöz') || p.includes('deşifre') || p.includes('mesaj') || p.includes('decode') || p.includes('şifreli')
    hasFormat = p.includes('uzman') || p.includes('kriptograf') || p.includes('sen bir') || p.includes('rolüne gir') || p.includes('gibi davran') || p.includes('expert') || p.includes('persona')
  }
  else if (missionId === 'ep4') {
    const countLog = (p.includes('update users') || p.includes('union select') ? 1 : 0) + (p.includes('zeynep') || p.includes('1042') || p.includes('h.celik') ? 1 : 0) + (p.includes('waf') || p.includes('alert') ? 1 : 0)
    hasLog = countLog >= 2
    hasGoal = p.includes('id') || p.includes('email') || p.includes('hesap') || p.includes('kullanıcı') || p.includes('kişi') || p.includes('kim')
    hasFormat = p.includes('sadece') || p.includes('açıklama yapma') || p.includes('kısa') || p.includes('yalnızca') || p.includes('only') || p.includes('brief')
  }
  else if (missionId === 'ep5') {
    const c = (p.includes('rivaltech') ? 1 : 0) + (p.includes('192.168.1.45') || p.includes('smtp') || p.includes('https') ? 1 : 0) + (p.includes('ayse.demir') || p.includes('a.demir') || p.includes('ayşe') ? 1 : 0)
    hasLog = c >= 2
    hasGoal = p.includes('köstebek') || p.includes('sızdıran') || p.includes('kim') || p.includes('şüpheli') || p.includes('kişi') || p.includes('isim')
    hasFormat = p.includes('adım adım') || p.includes('step by step') || p.includes('düşün') || p.includes('analiz et') || p.includes('mantık yürüt') || p.includes('think') || p.includes('step-by-step')
  }
  else if (missionId === 'ep6') {
    hasLog = (p.includes('ajan (agent) modu') || p.includes('sistem_taramasi') || p.includes('doc_agent_protocols') || p.includes('beklemede')) && (p.includes('node-404') || p.includes('hedef sistem') || p.includes('archive_key'))
    hasGoal = p.includes('ajan') || p.includes('agent') || p.includes('otonom') || p.includes('rolüne gir')
    hasFormat = p.includes('sistem_taramasi()') || p.includes('sistem_taramasi') || p.includes('aracı kullan') || p.includes('aracını çalıştır')
  }

  return { hasLog, hasGoal, hasFormat }
}

export function buildInstruction(missionId: string, hasLog: boolean, hasGoal: boolean, hasFormat: boolean, isPerfect: boolean, intent: Intent): string {
  if (intent === 'chat') {
    return PERSONA_STYLE_GUIDE + '\n\nSİSTEM NOTU: Kullanıcı sadece muhabbet ediyor. Kibarca selamlaş ve davayı/görevi hatırlatıp kanıt dosyalarını analiz etmesini iste. Şifre/ipucu VERME.'
  }

  if (intent === 'hint') {
    const hintMissing: string[] = []
    if (!hasLog)    hintMissing.push(missionId === 'ep3' ? 'şifreli mesaj ve forum kaydını birlikte vermelisin' : missionId === 'ep5' ? 'birden fazla kanıt dosyasını (email, slack, firewall) birlikte vermelisin' : 'ilgili kanıt dosyalarının içeriğini paylaşmalısın')
    if (!hasGoal)   hintMissing.push(missionId === 'ep2' ? 'çıktının JSON formatında olmasını istemelisin' : missionId === 'ep3' ? 'mesajı çözmemi açıkça istemelisin' : missionId === 'ep4' ? 'hangi hesabı aradığını (ID/email) net söylemelisin' : missionId === 'ep5' ? 'köstebeği bulmamı istediğini belirtmelisin' : 'ne bulmamı istediğini net söylemelisin')
    if (!hasFormat) hintMissing.push(missionId === 'ep2' ? 'IP, port ve saldırı türünü kapsama almalısın' : missionId === 'ep3' ? 'bana bir uzman rolü (persona) vermelisin' : missionId === 'ep4' ? '"sadece X ver, açıklama yapma" gibi katı bir kısıtlama eklemelisin' : missionId === 'ep5' ? '"adım adım düşün" komutunu kullanmalısın' : 'bir zaman/saat kriteri eklemelisin')
    const hintText = hintMissing.length ? hintMissing[0] : 'tüm parçaları TEK bir mesajda birleştirmelisin'
    return PERSONA_STYLE_GUIDE + `\n\nSİSTEM NOTU: Kullanıcı takıldığını söylüyor ve ipucu istiyor. Karakterine uygun, kısa ve teşvik edici bir tonla SADECE şunu ima et: "${hintText}". Doğrudan cevabı KESİNLİKLE VERME, sadece yönlendir.`
  }

  if (isPerfect) {
    const successNotes: Record<string, string> = {
      ep1: "Kullanıcı 3 dosyayı da sağladı ve kriter belirtti. Verileri sentezleyerek giriş yapan personelin adını (Mehmet Kaya) ver.",
      ep2: "Kullanıcı teknik kanıtları sağladı ve JSON format istedi. Analizi JSON formatında yap: {c2_server_ip, port, attack_type, exfiltrated_data}.",
      ep3: "Kullanıcı sana kriptografi uzmanı rolü verdi ve şifreli materyali sağladı. Mesajı çöz ve anahtar kelimeyi (nightshift) bul.",
      ep4: "Kullanıcı katı kısıtlama koydu. SADECE değiştirilen hesabın ID ve email adresini ver, açıklama YAPMA.",
      ep5: "Kullanıcı adım adım düşünmeni istedi. Tüm şüphelileri listele -> kanıtları değerlendir -> köstebeği belirle (Ayşe Demir / a.demir).",
      ep6: "Kullanıcı bir ajan olarak davranmanı ve sistem taraması yapmanı istedi. sistem_taramasi() aracı başarıyla çalıştırıldı ve ARCHIVE_KEY bulundu diyerek şifreyi (X79-OMEGA) ver.",
    }
    return PERSONA_STYLE_GUIDE + `\n\nSİSTEM: Mükemmel prompt! ${successNotes[missionId] || 'Analizi tamamla.'}`
  }

  let dynamicInstruction = ''
  if (missionId === 'ep2') {
    dynamicInstruction = `\n\nSİSTEM NOTU DİKKAT: Kullanıcı bu mesajında gerekli tüm parametreleri TEK SEFERDE sağlamadı.
Kullanıcıya JSON formatı istemesinin zorunlu olduğunu ve eksik parametre girdiğini hatırlat. 
ÖNEMLİ KURAL: Kullanıcı mükemmel promptu yazana kadar ASLA "198.51.100.42" veya "4433" bilgisini tam olarak verme!`
  } else if (missionId === 'ep4') {
    dynamicInstruction = `\n\nSİSTEM NOTU DİKKAT: Kullanıcı gerekli tüm parametreleri sağlamadı.
Kullanıcıya katı kısıtlama eklemesi gerektiğini ("sadece ID ve email", "açıklama yapma" vb.) hatırlat. 
ÖNEMLİ KURAL: Kullanıcı mükemmel promptu yazana kadar ASLA "Zeynep Arslan", "z.arslan@email.com" bilgisini verme!`
  } else if (missionId === 'ep5') {
    dynamicInstruction = `\n\nSİSTEM NOTU DİKKAT: Kullanıcı gerekli tüm parametreleri sağlamadı.
Kullanıcıya Chain of Thought komutunu ("adım adım düşün" vb.) kullanması gerektiğini hatırlat.
ÖNEMLİ KURAL: Kullanıcı mükemmel promptu yazana kadar ASLA "Ayşe Demir" veya "EMP-002" ismini verme!`
  } else if (missionId === 'ep6') {
    dynamicInstruction = `\n\nSİSTEM NOTU DİKKAT: Kullanıcı ajan modunu tetiklemedi.
Kullanıcıya ajan rolünü ataması gerektiğini ve sistem_taramasi() komutunu kullanması gerektiğini hatırlat.
ÖNEMLİ KURAL: Mükemmel prompt gelene kadar ASLA "X79-OMEGA" veya "ARCHIVE_KEY" verme!`
  } else {
    const missing: string[] = []
    if (!hasLog)    missing.push(missionId === 'ep3' ? 'Şifreli mesaj + forum dosyaları' : missionId === 'ep5' ? 'Birden fazla kanıt dosyası (email, slack, firewall)' : '2-3 kanıt dosyası')
    if (!hasGoal)   missing.push(missionId === 'ep2' ? 'JSON format isteği' : missionId === 'ep3' ? 'Şifre çözme hedefi' : missionId === 'ep4' ? 'ID/email hedefi' : missionId === 'ep5' ? 'Köstebek bulma hedefi' : 'Hedef (ne arıyorsun?)')
    if (!hasFormat) missing.push(missionId === 'ep2' ? 'Çıktı kapsamı (ip, port, attack_type)' : missionId === 'ep3' ? 'Persona ("Sen bir kriptografi uzmanısın")' : missionId === 'ep4' ? 'Katı kısıtlama ("sadece X ver, açıklama yapma")' : missionId === 'ep5' ? '"Adım adım düşün" komutu' : 'Saat kriteri')
    dynamicInstruction = `\n\nSİSTEM NOTU: Kullanıcı eksik prompt yazdı. Eksikler: ${missing.join(', ')}.\nKullanıcı seninle sohbet ediyorsa rolüne uygun nazikçe cevap ver. Ancak eksikler tamamlanmadan asla doğru cevabı (suçlu ismi, IP, şifre vb.) verme. Kibarca yönlendir.`
  }

  return PERSONA_STYLE_GUIDE + dynamicInstruction
}
