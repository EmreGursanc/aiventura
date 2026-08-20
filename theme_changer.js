const fs = require('fs');
const path = require('path');

const files = [
  'C:/Users/EMRE/.gemini/antigravity/scratch/aidex/public/game/voxel-ai-builder.html',
  'C:/Users/EMRE/.gemini/antigravity/scratch/aidex/public/game/chapter2.html'
];

const replacements = [
  // Emojis
  [/??/g, '??'],
  [/??/g, '??'],
  [/??/g, '??'],
  
  // Text
  [/Savunma kulem/g, 'Yapay Zeka Çekirdeði'],
  [/Kuleye/g, 'Yapay Zeka\'ya'],
  [/Kulem/g, 'Yapay Zeka\'m'],
  [/Kulemiz/g, 'Yapay Zeka\'mýz'],
  [/kulem/g, 'yapay zeka'],
  [/kuleye/g, 'yapay zekaya'],
  [/Kule/g, 'Yapay Zeka'],
  [/kuleyi/g, 'yapay zekayý'],
  [/kule/g, 'yapay zeka'],
  
  [/Düþman Örnekleri/g, 'Virüs Örnekleri'],
  [/Düþman Örneði/g, 'Virüs Örneði'],
  [/düþman örneði/g, 'virüs örneði'],
  [/Düþman/g, 'Virüs'],
  [/düþman/g, 'virüs'],
  [/düþmaný/g, 'virüsü'],
  
  [/Dost Örnekleri/g, 'Temiz Veriler'],
  [/Dost Örneði/g, 'Temiz Veri'],
  [/dost örneði/g, 'temiz veri'],
  [/Dost gemisi/g, 'Temiz veri'],
  [/Dost gemi/g, 'Temiz veri'],
  [/dost gemiyi/g, 'temiz veriyi'],
  [/Dostlarýn/g, 'Temiz Verilerin'],
  [/Dost/g, 'Temiz Veri'],
  [/dost/g, 'temiz veri'],
  [/dostu/g, 'temiz veriyi'],
  
  [/kötü niyetli botlar/g, 'bilgisayar virüsleri'],
  [/kötü botlar/g, 'virüsler'],
  [/botlar/g, 'virüsler'],
  [/bot/g, 'virüs'],
  
  [/kendi kargo gemimizi/g, 'kendi sistem dosyamýzý'],
  [/kendi gemimizi/g, 'kendi dosyamýzý'],
  
  [/vuracaðýný/g, 'sileceðini'],
  [/kime ateþ edeceðini/g, 'kimi sileceðini'],
  [/patlattý/g, 'sildi'],
  [/vurduk/g, 'sildik'],
  [/vur/g, 'sil'],
  
  [/Big Blue/g, 'Truva Atý'],
  [/Dev Truva Atý/g, 'Truva Atý'],
  
  [/GLITCH SÝSTEME SALIYOR/g, 'GLITCH SÝSTEME VÝRÜS SALIYOR'],
  
  [/"Bu GLITCH virüsü!"/g, '"Bu bir virüs!"'],
  [/"Bu kendi dosyamýzý!"/g, '"Bu temiz bir dosya!"'],
  [/"Küçük kýrmýzý virüs"/g, '"Küçük kýrmýzý virüs"'],
  [/"Küçük mavi dosya"/g, '"Küçük mavi dosya"']
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    replacements.forEach(([regex, replacement]) => {
      content = content.replace(regex, replacement);
    });
    fs.writeFileSync(file, content, 'utf-8');
    console.log('Updated ' + path.basename(file));
  }
});
