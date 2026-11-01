/**
 * ApplianceData.js
 * 15 ev aleti (savunma). Her biri atlas'ta 2 kare: <id>_0 (bekleme), <id>_1 (saldırı).
 *
 * Alanlar:
 *  id        : atlas kare öneki
 *  ad        : ekranda görünen Türkçe ad
 *  fiyat     : enerji maliyeti
 *  can       : dayanıklılık
 *  bekleme   : tekrar yerleştirme süresi (ms)
 *  rol       : 'atici' | 'uretec' | 'duvar'
 *  mermi     : atlas kare adı (ApplianceData -> BulletData)
 *  hasar     : mermi başına hasar
 *  atisMs    : atış aralığı
 *  menzilU   : kaç birim ileriyi görür (1.0 = tüm saha)
 *  seritler  : [0] sadece kendi şeridi, [-1,0,1] komşu şeritleri de vurur
 *  delici    : mermi kaç düşmandan geçer (1 = geçmez)
 *  yavaslat  : true ise düşmanı yavaşlatır
 *  iter      : >0 ise düşmanı geri iter (u birimi)
 *  ceker     : >0 ise düşmanı kendine çeker
 *  patlama   : >0 ise çarpınca bu yarıçapta alan hasarı
 *  uretimMs  : üreteç ise kaç ms'de bir şimşek bırakır
 *  uretimDeger: üreteç ise bıraktığı enerji
 *  olcek     : saha üzerindeki temel boy çarpanı
 */

export const APPLIANCES = [
  {
    id: 'coffee', ad: 'Kahve Makinesi', fiyat: 50, can: 300, bekleme: 7000,
    rol: 'uretec', mermi: 'choco', hasar: 8, atisMs: 3200, menzilU: 0.18,
    seritler: [0], delici: 1, uretimMs: 9000, uretimDeger: 25, olcek: 1.0,
    aciklama: 'Enerji üretir. Yakındakine sıcak kahve fırlatır.'
  },
  {
    id: 'toaster', ad: 'Ekmek Kızartma', fiyat: 100, can: 300, bekleme: 5000,
    rol: 'atici', mermi: 'toast', hasar: 20, atisMs: 1450, menzilU: 1.2,
    seritler: [0], delici: 1, olcek: 1.0,
    aciklama: 'Temel atıcı. Şeridi boyunca kızarmış ekmek fırlatır.'
  },
  {
    id: 'waffle', ad: 'Waffle Makinesi', fiyat: 125, can: 300, bekleme: 7500,
    rol: 'yildiz', hasar: 20, atisMs: 1500, olcek: 1.05,
    aciklama: 'Yıldız. 5 yöne birden yıldız atar (sağ, sol, çaprazlar, yukarı).'
  },
  {
    id: 'kettle', ad: 'Su Isıtıcısı', fiyat: 150, can: 300, bekleme: 7000,
    rol: 'atici', mermi: 'steam', hasar: 14, atisMs: 1500, menzilU: 1.2,
    seritler: [0], delici: 1, yavaslat: true, olcek: 1.0,
    aciklama: 'Kaynar buhar. Değdiği oyuncağı yavaşlatır.'
  },
  {
    id: 'fan', ad: 'Vantilatör', fiyat: 100, can: 280, bekleme: 7500,
    rol: 'ruzgar', menzilU: 0.45, itmeU: 0.085, olcek: 0.95,
    aciklama: 'Önündeki oyuncakları sürekli geri üfler.'
  },
  {
    id: 'hairdryer', ad: 'Saç Kurutma', fiyat: 175, can: 300, bekleme: 8000,
    rol: 'atici', mermi: 'wind', hasar: 16, atisMs: 1600, menzilU: 1.2,
    seritler: [0], delici: 1, iter: 0.045, olcek: 1.0,
    aciklama: 'Sıcak rüzgâr. Oyuncakları geriye doğru iter.'
  },
  {
    id: 'blender', ad: 'Blender', fiyat: 175, can: 300, bekleme: 7500,
    rol: 'atici', mermi: 'juice', mermiRenk: 0x66ccff, hasar: 20, atisMs: 1450, menzilU: 1.2,
    seritler: [0], delici: 1, yavaslat: true, olcek: 1.0,
    aciklama: 'Buzlu meyve suyu. Vurduğu oyuncağı yavaşlatır.'
  },
  {
    id: 'microwave', ad: 'Mikrodalga', fiyat: 250, can: 340, bekleme: 11000,
    rol: 'atici', mermi: 'heat', hasar: 48, atisMs: 1400, menzilU: 0.32,
    seritler: [0], delici: 2, olcek: 1.05,
    aciklama: 'Kısa menzilli ışın. Yakına çok ağır hasar verir.'
  },
  {
    id: 'iron', ad: 'Ütü', fiyat: 125, bekleme: 50000,
    rol: 'silindir', hizU: 0.55, olcek: 1.2,
    aciklama: 'En gerideki düşmana yaptır — ezüp geçer, hepsini tek seferde öldürür.'
  },
  {
    id: 'vacuum', ad: 'Elektrikli Süpürge', fiyat: 150, can: 300, bekleme: 7500,
    rol: 'yutucu', menzilU: 0.22, cekmeHizU: 0.55, sindirMs: 42000, olcek: 1.0,
    aciklama: '2 kare ilerideki oyuncağı içine çeker, 42 sn sindirip atar.'
  },
  {
    id: 'washer', ad: 'Çamaşır Makinesi', fiyat: 150, can: 400, bekleme: 7500,
    rol: 'yakin', hasar: 45, atisMs: 1000, menzilU: 0.17, olcek: 1.05,
    aciklama: 'Yakına gelene kapağı açıp vurur. Kısa menzil, ağır hasar.'
  },
  {
    id: 'fryer', ad: 'Fritöz', fiyat: 175, can: 300, bekleme: 7500,
    rol: 'ates', guc: 2, olcek: 1.0,
    aciklama: 'Ateş ağacı. Üstünden geçen mermiler sarı parlar, 2 kat güçlenir.'
  },
  {
    id: 'sewing', ad: 'Dikiş Makinesi', fiyat: 175, can: 300, bekleme: 8000,
    rol: 'atici', mermi: 'thread', hasar: 8, atisMs: 420, menzilU: 1.2,
    seritler: [0], delici: 1, sabitle: 3000, olcek: 1.0,
    aciklama: 'İlk dikişte oyuncağı yere sabitler (3 sn).'
  },
  {
    id: 'drill', ad: 'Matkap', fiyat: 300, can: 320, bekleme: 14000,
    rol: 'atici', mermi: 'drillbit', hasar: 34, atisMs: 1500, menzilU: 1.2,
    seritler: [0], delici: 99, olcek: 1.0,
    aciklama: 'Matkap ucu tüm şeridi delip geçer.'
  },
  {
    id: 'popcorn', ad: 'Mısır Patlatma', fiyat: 325, can: 360, bekleme: 7500,
    rol: 'atici', mermi: 'popcorn', hasar: 20, atisMs: 1450, menzilU: 1.2,
    seritler: [-1, 0, 1], delici: 1, olcek: 1.1,
    aciklama: '3 şeride birden mısır patlatır.'
  },

  /* ── Yeni Aletler (v0.14) ─ özellikler sonra verilecek ── */
  {
    id: 'ricecooker', ad: 'Pirinç Pişirici', fiyat: 100, can: 300, bekleme: 7000,
    rol: 'atici', mermi: 'toast', hasar: 15, atisMs: 1500, menzilU: 1.2,
    seritler: [0], delici: 1, olcek: 1.0,
    aciklama: 'Özellikler yakında ekleniyor.'
  },
  {
    id: 'standmixer', ad: 'Stand Mikser', fiyat: 150, can: 300, bekleme: 8000,
    rol: 'atici', mermi: 'juice', hasar: 18, atisMs: 1200, menzilU: 1.2,
    seritler: [0], delici: 1, olcek: 1.05,
    aciklama: 'Özellikler yakında ekleniyor.'
  },
  {
    id: 'airfryer', ad: 'Hava Fritözü', fiyat: 175, can: 300, bekleme: 9000,
    rol: 'atici', mermi: 'heat', hasar: 22, atisMs: 1600, menzilU: 1.2,
    seritler: [0], delici: 1, olcek: 1.0,
    aciklama: 'Özellikler yakında ekleniyor.'
  },
  {
    id: 'dishwasher', ad: 'Bulaşık Makinesi', fiyat: 200, can: 400, bekleme: 10000,
    rol: 'atici', mermi: 'steam', hasar: 20, atisMs: 1800, menzilU: 1.2,
    seritler: [0], delici: 1, olcek: 1.05,
    aciklama: 'Özellikler yakında ekleniyor.'
  },
  {
    id: 'spaceheater', ad: 'Isıtıcı', fiyat: 125, can: 280, bekleme: 7000,
    rol: 'atici', mermi: 'wind', hasar: 16, atisMs: 1400, menzilU: 1.2,
    seritler: [0], delici: 1, olcek: 0.95,
    aciklama: 'Özellikler yakında ekleniyor.'
  },
  {
    id: 'humidifier', ad: 'Nemlendirici', fiyat: 100, can: 260, bekleme: 6000,
    rol: 'atici', mermi: 'steam', hasar: 12, atisMs: 1300, menzilU: 1.2,
    seritler: [0], delici: 1, olcek: 0.9,
    aciklama: 'Özellikler yakında ekleniyor.'
  },
  {
    id: 'airpurifier', ad: 'Hava Temizleyici', fiyat: 150, can: 300, bekleme: 7500,
    rol: 'atici', mermi: 'wave', hasar: 14, atisMs: 1100, menzilU: 1.2,
    seritler: [0], delici: 1, olcek: 1.0,
    aciklama: 'Özellikler yakında ekleniyor.'
  },
  {
    id: 'slowcooker', ad: 'Yavaş Pişirici', fiyat: 125, can: 350, bekleme: 8000,
    rol: 'atici', mermi: 'heat', hasar: 17, atisMs: 1700, menzilU: 1.2,
    seritler: [0], delici: 1, olcek: 1.0,
    aciklama: 'Özellikler yakında ekleniyor.'
  },
  {
    id: 'canopener', ad: 'Elektrikli Konserve Açacağı', fiyat: 75, can: 200, bekleme: 5000,
    rol: 'atici', mermi: 'thread', hasar: 10, atisMs: 900, menzilU: 1.2,
    seritler: [0], delici: 1, olcek: 0.8,
    aciklama: 'Özellikler yakında ekleniyor.'
  },
  {
    id: 'foodprocessor', ad: 'Mutfak Robotu', fiyat: 200, can: 320, bekleme: 9000,
    rol: 'atici', mermi: 'juice', hasar: 24, atisMs: 1300, menzilU: 1.2,
    seritler: [0], delici: 2, olcek: 1.05,
    aciklama: 'Özellikler yakında ekleniyor.'
  },
  {
    id: 'paninipress', ad: 'Tost Makinesi', fiyat: 125, can: 280, bekleme: 7000,
    rol: 'atici', mermi: 'toast', hasar: 18, atisMs: 1500, menzilU: 1.0,
    seritler: [0], delici: 1, olcek: 0.95,
    aciklama: 'Özellikler yakında ekleniyor.'
  },
  {
    id: 'handmixer', ad: 'El Mikseri', fiyat: 100, can: 240, bekleme: 6000,
    rol: 'atici', mermi: 'wave', hasar: 13, atisMs: 800, menzilU: 1.2,
    seritler: [0], delici: 1, olcek: 0.85,
    aciklama: 'Özellikler yakında ekleniyor.'
  },
  {
    id: 'citrusjuicer', ad: 'Meyve Sıkacağı', fiyat: 75, can: 200, bekleme: 5000,
    rol: 'atici', mermi: 'juice', hasar: 11, atisMs: 1200, menzilU: 1.2,
    seritler: [0], delici: 1, olcek: 0.8,
    aciklama: 'Özellikler yakında ekleniyor.'
  },
  {
    id: 'clothessteamer', ad: 'Giysi Buharlayıcı', fiyat: 125, can: 260, bekleme: 7000,
    rol: 'atici', mermi: 'steam', hasar: 15, atisMs: 1400, menzilU: 1.2,
    seritler: [0], delici: 1, yavaslat: true, olcek: 0.9,
    aciklama: 'Özellikler yakında ekleniyor.'
  },
  {
    id: 'waterdispenser', ad: 'Su Sebili', fiyat: 100, can: 280, bekleme: 6000,
    rol: 'uretec', mermi: 'steam', hasar: 8, atisMs: 2500, menzilU: 0.2,
    seritler: [0], delici: 1, uretimMs: 8000, uretimDeger: 20, olcek: 1.0,
    aciklama: 'Özellikler yakında ekleniyor.'
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
