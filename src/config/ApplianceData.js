/**
 * ApplianceData.js
 * 38 ev aleti (savunma). Her biri atlas'ta 2 kare: <id>_0 (bekleme), <id>_1 (saldırı).
 * Tüm değerler Plants vs Zombies (PvZ) karşılıklarına göre ayarlıdır (v0.15).
 *
 * Alanlar:
 *  id, ad, fiyat, can, bekleme (ms), olcek, aciklama, pvz (karşılığı)
 *  rol:
 *    'uretec'    enerji üretir (uretimMs, uretimDeger, uretimAdet, ilkUretimMs)
 *    'atici'     şeridine mermi atar (mermi, hasar, atisMs, menzilU, seritler, delici,
 *                yavaslat, iter, sabitle, seri = arka arkaya atış, geri = arkaya atış)
 *    'yakin'     menzildeki herkese doğrudan vurur (menzilU, hasar, atisMs)
 *    'firlatici' en yakın düşmana kavisli atış (hasar, atisMs, sicrama, sicramaHasar,
 *                tereyagSans, yavaslat)
 *    'duvar'     sadece dayanır (uzun: zıplayanları durdurur)
 *    'bomba'     fitil bitince patlar (fitilMs, hasar, seritYaricap, uYaricap)
 *    'buz'       sahadaki tüm düşmanları dondurur (fitilMs, donmaMs, hasar)
 *    'mayin'     hazirMs sonra kurulur, üstüne gelen düşmanı patlatır
 *    'ezici'     yakındaki düşmanın üstüne atlayıp ezer
 *    'diken'     üstünden geçenlere saniyede hasar, yenmez
 *    'sarimsak'  ısırılınca düşmanı komşu şeride saptırır
 *    'miknatis'  yakındaki metal düşmanın kask/kovasını söker (atisMs = şarj)
 *    'silindir', 'yutucu', 'ruzgar', 'ates', 'yildiz' : önceki sürümlerden
 *  ustune : sadece bu id'li aletin üstüne konabilir (yükseltme)
 */

export const APPLIANCES = [
  /* ── Enerji ── */
  {
    id: 'dynamo', ad: 'Kollu Dinamo', pvz: 'Ayçiçeği', fiyat: 50, can: 300, bekleme: 7500,
    rol: 'uretec', uretimMs: 24000, ilkUretimMs: 7000, uretimDeger: 25, uretimAdet: 1, olcek: 0.72,
    aciklama: 'Standart enerji üreteci. 24 sn\'de bir 25 enerji. Saldırmaz.'
  },
  {
    id: 'generator', ad: 'Jeneratör', pvz: 'İkiz Ayçiçeği', fiyat: 150, can: 300, bekleme: 50000,
    rol: 'uretec', uretimMs: 24000, ilkUretimMs: 7000, uretimDeger: 25, uretimAdet: 2, olcek: 0.8,
    ustune: 'dynamo',
    aciklama: 'Gelişmiş üreteç. Sadece Kollu Dinamo\'nun üstüne kurulur, 2 kat enerji.'
  },
  {
    id: 'coffee', ad: 'Kahve Makinesi', pvz: 'Güneş Mantarı', fiyat: 25, can: 300, bekleme: 7500,
    rol: 'uretec', uretimMs: 24000, ilkUretimMs: 7000, uretimDeger: 15, uretimAdet: 1, olcek: 1.0,
    aciklama: 'Ucuz üreteç. 24 sn\'de bir 15 enerji. Saldırmaz.'
  },

  /* ── Atıcılar ── */
  {
    id: 'toaster', ad: 'Ekmek Kızartma', pvz: 'Bezelye Atıcı', fiyat: 100, can: 300, bekleme: 7500,
    rol: 'atici', mermi: 'toast', hasar: 20, atisMs: 1425, menzilU: 1.2,
    seritler: [0], delici: 1, olcek: 1.0,
    aciklama: 'Temel atıcı. Şeridi boyunca kızarmış ekmek fırlatır.'
  },
  {
    id: 'lamp', ad: 'Kollu Lamba', pvz: 'Tekrarlayıcı', fiyat: 200, can: 300, bekleme: 7500,
    rol: 'atici', mermi: 'heat', mermiRenk: 0xffe680, hasar: 20, atisMs: 1425, menzilU: 1.2,
    seritler: [0], delici: 1, seri: 2, olcek: 0.75,
    aciklama: 'Her seferinde 2 ışık topu atar.'
  },
  {
    id: 'standmixer', ad: 'Stand Mikser', pvz: 'Makineli Bezelye', fiyat: 250, can: 300, bekleme: 50000,
    rol: 'atici', mermi: 'choco', hasar: 20, atisMs: 1425, menzilU: 1.2,
    seritler: [0], delici: 1, seri: 4, olcek: 1.0,
    aciklama: 'Her seferinde 4 hamur topu atar.'
  },
  {
    id: 'blender', ad: 'Blender', pvz: 'Buz Bezelye', fiyat: 175, can: 300, bekleme: 7500,
    rol: 'atici', mermi: 'juice', mermiRenk: 0x66ccff, hasar: 20, atisMs: 1425, menzilU: 1.2,
    seritler: [0], delici: 1, yavaslat: true, olcek: 1.0,
    aciklama: 'Buzlu meyve suyu. Vurduğu oyuncağı yavaşlatır.'
  },
  {
    id: 'kettle', ad: 'Su Isıtıcısı', pvz: 'Buz Bezelye (ucuz)', fiyat: 150, can: 300, bekleme: 7500,
    rol: 'atici', mermi: 'steam', hasar: 15, atisMs: 1425, menzilU: 1.2,
    seritler: [0], delici: 1, yavaslat: true, olcek: 1.0,
    aciklama: 'Kaynar buhar. Daha az hasar, değdiğini yavaşlatır.'
  },
  {
    id: 'popcorn', ad: 'Mısır Patlatma', pvz: 'Üçlü Atıcı', fiyat: 325, can: 300, bekleme: 7500,
    rol: 'atici', mermi: 'popcorn', hasar: 20, atisMs: 1425, menzilU: 1.2,
    seritler: [-1, 0, 1], delici: 1, olcek: 1.1,
    aciklama: '3 şeride birden mısır patlatır.'
  },
  {
    id: 'waffle', ad: 'Waffle Makinesi', pvz: 'Yıldız Meyvesi', fiyat: 125, can: 300, bekleme: 7500,
    rol: 'yildiz', hasar: 20, atisMs: 1425, olcek: 1.05,
    aciklama: '5 yöne birden waffle atar (sağ, sol, çaprazlar, yukarı).'
  },
  {
    id: 'handmixer', ad: 'El Mikseri', pvz: 'Bölünmüş Bezelye', fiyat: 125, can: 300, bekleme: 7500,
    rol: 'atici', mermi: 'wave', hasar: 20, atisMs: 1425, menzilU: 1.2,
    seritler: [0], delici: 1, geri: 2, olcek: 0.85,
    aciklama: 'Öne 1, arkaya 2 atış. Arkadan geçenleri de vurur.'
  },
  {
    id: 'airfryer', ad: 'Hava Fritözü', pvz: 'Kaktüs', fiyat: 125, can: 300, bekleme: 7500,
    rol: 'atici', mermi: 'fry', hasar: 20, atisMs: 1425, menzilU: 1.2,
    seritler: [0], delici: 2, olcek: 1.0,
    aciklama: 'Patates dikeni atar, 2 düşmanı birden deler.'
  },
  {
    id: 'canopener', ad: 'Konserve Açacağı', pvz: 'Korkak Mantar', fiyat: 25, can: 300, bekleme: 7500,
    rol: 'atici', mermi: 'thread', mermiRenk: 0xdddddd, hasar: 20, atisMs: 1425, menzilU: 1.2,
    seritler: [0], delici: 1, olcek: 0.8,
    aciklama: 'Çok ucuz uzun menzilli atıcı.'
  },
  {
    id: 'airpurifier', ad: 'Hava Temizleyici', pvz: 'Puf Mantarı', fiyat: 0, can: 300, bekleme: 7500,
    rol: 'atici', mermi: 'dust', hasar: 20, atisMs: 1425, menzilU: 0.3,
    seritler: [0], delici: 1, olcek: 0.9,
    aciklama: 'Bedava. Sadece 3 kare ileriye atar.'
  },
  {
    id: 'radio', ad: 'Eski Radyo', pvz: 'Duman Mantarı', fiyat: 75, can: 300, bekleme: 7500,
    rol: 'yakin', hasar: 20, atisMs: 1425, menzilU: 0.4, olcek: 0.75,
    aciklama: 'Ses dalgası 4 kare ilerideki herkesi deler geçer.'
  },
  {
    id: 'washer', ad: 'Çamaşır Makinesi', pvz: 'Ejder Çiçeği', fiyat: 150, can: 300, bekleme: 7500,
    rol: 'yakin', hasar: 40, atisMs: 1000, menzilU: 0.17, olcek: 1.05,
    aciklama: 'Yakına gelene kapağı açıp vurur. Kısa menzil, ağır hasar.'
  },
  {
    id: 'microwave', ad: 'Mikrodalga', pvz: 'Duman Mantarı (ağır)', fiyat: 250, can: 300, bekleme: 11000,
    rol: 'atici', mermi: 'heat', hasar: 48, atisMs: 1425, menzilU: 0.32,
    seritler: [0], delici: 2, olcek: 1.05,
    aciklama: 'Kısa menzilli ışın. Yakına çok ağır hasar verir.'
  },
  {
    id: 'drill', ad: 'Matkap', pvz: 'Delici', fiyat: 300, can: 300, bekleme: 14000,
    rol: 'atici', mermi: 'drillbit', hasar: 34, atisMs: 1500, menzilU: 1.2,
    seritler: [0], delici: 99, olcek: 1.0,
    aciklama: 'Matkap ucu tüm şeridi delip geçer.'
  },
  {
    id: 'sewing', ad: 'Dikiş Makinesi', pvz: 'Dondurucu', fiyat: 175, can: 300, bekleme: 8000,
    rol: 'atici', mermi: 'thread', hasar: 8, atisMs: 420, menzilU: 1.2,
    seritler: [0], delici: 1, sabitle: 3000, olcek: 1.0,
    aciklama: 'İlk dikişte oyuncağı yere sabitler (3 sn).'
  },
  {
    id: 'hairdryer', ad: 'Saç Kurutma', pvz: 'İtici', fiyat: 175, can: 300, bekleme: 8000,
    rol: 'atici', mermi: 'wind', hasar: 20, atisMs: 1600, menzilU: 1.2,
    seritler: [0], delici: 1, iter: 0.045, olcek: 1.0,
    aciklama: 'Sıcak rüzgâr. Oyuncakları geriye doğru iter.'
  },

  /* ── Fırlatıcılar ── */
  {
    id: 'dishwasher', ad: 'Bulaşık Makinesi', pvz: 'Lahana Fırlatıcı', fiyat: 100, can: 300, bekleme: 7500,
    rol: 'firlatici', mermi: 'cloth', hasar: 40, atisMs: 2900, olcek: 1.05,
    aciklama: 'Kavisli tabak fırlatır, 40 hasar.'
  },
  {
    id: 'ricecooker', ad: 'Pirinç Pişirici', pvz: 'Mısır Fırlatıcı', fiyat: 100, can: 300, bekleme: 7500,
    rol: 'firlatici', mermi: 'popcorn', hasar: 20, atisMs: 2900, tereyagSans: 0.25, olcek: 1.0,
    aciklama: 'Pirinç topu atar; bazen yapışkan top atıp 4 sn dondurur.'
  },
  {
    id: 'foodprocessor', ad: 'Mutfak Robotu', pvz: 'Kavun Fırlatıcı', fiyat: 300, can: 300, bekleme: 7500,
    rol: 'firlatici', mermi: 'juice', mermiRenk: 0x9be36a, hasar: 80, atisMs: 2900,
    sicrama: 0.11, sicramaHasar: 27, olcek: 1.05,
    aciklama: 'Ağır karışım atar, 80 hasar + çevresine sıçrar.'
  },
  {
    id: 'waterdispenser', ad: 'Su Sebili', pvz: 'Kış Kavunu', fiyat: 500, can: 300, bekleme: 50000,
    rol: 'firlatici', mermi: 'juice', mermiRenk: 0x66ccff, hasar: 80, atisMs: 2900,
    sicrama: 0.11, sicramaHasar: 27, yavaslat: true, olcek: 1.0,
    aciklama: 'Buz gibi su bombası. 80 hasar, çevresine sıçrar ve hepsini yavaşlatır.'
  },

  /* ── Duvarlar ── */
  {
    id: 'minifridge', ad: 'Mini Buzdolabı', pvz: 'Ceviz', fiyat: 50, can: 4000, bekleme: 30000,
    rol: 'duvar', olcek: 0.82,
    aciklama: 'Sağlam duvar. Oyuncakları uzun süre oyalar.'
  },
  {
    id: 'refrigerator', ad: 'Büyük Buzdolabı', pvz: 'Uzun Ceviz', fiyat: 125, can: 8000, bekleme: 30000,
    rol: 'duvar', uzun: true, olcek: 0.52,
    aciklama: 'Çok sağlam, uzun duvar. Üstünden zıplanamaz.'
  },
  {
    id: 'citrusjuicer', ad: 'Meyve Sıkacağı', pvz: 'Sarımsak', fiyat: 50, can: 400, bekleme: 7500,
    rol: 'sarimsak', olcek: 0.8,
    aciklama: 'Isıran oyuncak ekşiyip komşu şeride kaçar.'
  },

  /* ── Tek kullanımlık ── */
  {
    id: 'battery', ad: 'Akü', pvz: 'Kiraz Bombası', fiyat: 150, bekleme: 50000,
    rol: 'bomba', fitilMs: 1200, hasar: 1800, seritYaricap: 1, uYaricap: 0.15, olcek: 0.75,
    aciklama: 'Patlar! 3x3 alandaki her şeyi yok eder.'
  },
  {
    id: 'slowcooker', ad: 'Yavaş Pişirici', pvz: 'Kıyamet Mantarı', fiyat: 125, bekleme: 50000,
    rol: 'bomba', fitilMs: 1500, hasar: 1800, seritYaricap: 2, uYaricap: 0.26, olcek: 1.0,
    aciklama: 'Dev patlama. 5x5 alandaki her şeyi yok eder.'
  },
  {
    id: 'outlet', ad: 'Elektrik Prizi', pvz: 'Patates Mayını', fiyat: 25, can: 300, bekleme: 30000,
    rol: 'mayin', hazirMs: 15000, hasar: 1800, uYaricap: 0.06, olcek: 0.75,
    aciklama: '15 sn\'de kurulur, üstüne basanı çarpıp yok eder.'
  },
  {
    id: 'paninipress', ad: 'Tost Makinesi', pvz: 'Kabak', fiyat: 50, can: 300, bekleme: 30000,
    rol: 'ezici', hasar: 1800, olcek: 0.95,
    aciklama: 'Yakına gelen oyuncağın üstüne atlayıp ezer.'
  },
  {
    id: 'humidifier', ad: 'Nemlendirici', pvz: 'Buz Mantarı', fiyat: 75, bekleme: 50000,
    rol: 'buz', fitilMs: 600, donmaMs: 4000, hasar: 20, olcek: 0.9,
    aciklama: 'Sahadaki tüm oyuncakları 4 sn dondurur.'
  },
  {
    id: 'iron', ad: 'Ütü', pvz: 'Jalapeño', fiyat: 125, bekleme: 50000,
    rol: 'silindir', hizU: 0.55, olcek: 1.2,
    aciklama: 'Şeridin en gerisinden ezip geçer, hepsini tek seferde öldürür.'
  },

  /* ── Özel ── */
  {
    id: 'vacuum', ad: 'Elektrikli Süpürge', pvz: 'Yutucu', fiyat: 150, can: 300, bekleme: 7500,
    rol: 'yutucu', menzilU: 0.22, cekmeHizU: 0.55, sindirMs: 42000, olcek: 1.0,
    aciklama: '2 kare ilerideki oyuncağı içine çeker, 42 sn sindirir.'
  },
  {
    id: 'fryer', ad: 'Fritöz', pvz: 'Meşale Ağacı', fiyat: 175, can: 300, bekleme: 7500,
    rol: 'ates', guc: 2, olcek: 1.0,
    aciklama: 'Üstünden geçen mermiler sarı parlar, 2 kat güçlenir.'
  },
  {
    id: 'fan', ad: 'Vantilatör', pvz: 'Üfleyici', fiyat: 100, can: 300, bekleme: 7500,
    rol: 'ruzgar', menzilU: 0.45, itmeU: 0.085, olcek: 0.95,
    aciklama: 'Önündeki oyuncakları sürekli geri üfler.'
  },
  {
    id: 'spaceheater', ad: 'Isıtıcı', pvz: 'Diken Otu', fiyat: 100, can: 300, bekleme: 7500,
    rol: 'diken', hasar: 20, atisMs: 1000, olcek: 0.9,
    aciklama: 'Üstünden geçeni saniyede 20 yakar. Oyuncaklar onu yiyemez.'
  },
  {
    id: 'clothessteamer', ad: 'Giysi Buharlayıcı', pvz: 'Mıknatıs Mantarı', fiyat: 100, can: 300, bekleme: 7500,
    rol: 'miknatis', atisMs: 15000, menzilU: 0.3, olcek: 0.9,
    aciklama: 'Yakındaki metal oyuncağın kask/kovasını söker (15 sn şarj).'
  }
];

/** id -> veri hızlı erişim */
export const APPLIANCE_BY_ID = Object.freeze(
  APPLIANCES.reduce((m, a) => { m[a.id] = a; return m; }, {})
);

/** Mermi görselleri için ölçek tablosu (atlas kare adı -> ekran ölçeği). */
export const BULLET_SCALE = {
  toast: 0.6, steam: 0.62, wind: 0.6, juice: 0.6, heat: 0.7,
  choco: 0.58, waffle: 0.56, blast: 0.62, dust: 0.62, wave: 0.6,
  cloth: 0.58, fry: 0.55, thread: 0.55, drillbit: 0.58, popcorn: 0.58
};
