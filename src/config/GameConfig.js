/**
 * GameConfig.js
 * Oyunun tüm global sabitleri. Denge ayarı yapmak isteyen sadece bu dosyaya bakar.
 */

export const SURUM = 'v0.20';

/** Tasarım çözünürlüğü (Scale.FIT ile her ekrana oturur). */
export const DESIGN = { width: 1280, height: 720 };

/** Saha ızgarası: 6 şerit x 10 sütun (arka plandaki çizili karolarla birebir). */
export const GRID = {
  rows: 6,
  cols: 10,
  /**
   * Arka plandaki perspektif zemini birim kareye bağlayan 4 köşe (tasarım uzayı).
   * Grid.js bu 4 noktadan homografi matrisini kendisi çözer.
   */
  corners: {
    tl: { x: 285.0, y: 261.0 },
    tr: { x: 1002.0, y: 259.0 },
    bl: { x: 103.0, y: 663.0 },
    br: { x: 1172.0, y: 666.0 }
  },
  /**
   * Karonun içinde nesnenin oturduğu dikey oran (0 = üst kenar, 1 = alt kenar).
   * Hem cihazlar hem düşmanlar bu çizgiye basar; 0.70 karoda görsel olarak ortalar.
   */
  footV: 0.70,
  /** Aletler, düşmanlar ve mermiler bu kadar yukarı kaydırılır (ön sırada px; arkaya doğru perspektifle azalır) */
  yukari: 20,
  /**
   * Arka plandaki karoların ÖLÇÜLMÜŞ yerleri (v0.18). Çizim tam perspektif olmadığı için
   * aletler homografi yerine bu tabloya oturur. Her satır:
   *  x0 = 0. sütun karo merkezi, adim = sütunlar arası, ust/alt = karonun üst/alt kenarı, gen = karo genişliği
   */
  karolar: [
    { x0: 319.9, adim: 71.1,  ust: 260, alt: 294, gen: 64.5 },
    { x0: 297.3, adim: 76.0,  ust: 307, alt: 349, gen: 69.0 },
    { x0: 271.0, adim: 81.8,  ust: 365, alt: 411, gen: 75.0 },
    { x0: 241.2, adim: 88.5,  ust: 427, alt: 486, gen: 83.0 },
    { x0: 205.3, adim: 96.4,  ust: 503, alt: 571, gen: 92.0 },
    { x0: 166.5, adim: 104.9, ust: 588, alt: 664, gen: 104.5 }
  ]
};

/** Üstteki tohum/kart barı — arka plandaki çizili yuvalarla hizalı. */
export const SEEDBAR = {
  slots: 9,
  startX: 340.3,   // arka plandaki cam yuvaların ölçülmüş merkezleri (v0.17)
  stepX: 85.96,
  y: 61.5,
  w: 68,
  h: 88
};

/** Sol üstteki enerji göstergesi (arka plandaki şimşek rozeti + bar). */
export const ENERGY_UI = {
  barX: 129, barY: 35, barW: 114, barH: 50,
  textX: 186, textY: 60
};

export const BALANCE = {
  baslangicEnerjisi: 50,       // PvZ: 50 ile başlar
  maxEnerji: 9990,

  /** Gökten düşen şimşek */
  gokSimsekDeger: 25,
  gokSimsekMinMs: 7000,
  gokSimsekMaxMs: 11000,
  simsekDususHizi: 70,       // px/sn (tasarım uzayı)
  simsekYasamSuresiMs: 9000, // yere düştükten sonra kaybolma

  /** Kürek */
  kurekIadeOrani: 0.5,       // sökünce maliyetin yarısı geri

  /** Mermi */
  mermiHizU: 0.62,           // birim/sn (u ekseni, 1 birim = tüm saha genişliği)
  mermiCarpmaU: 0.028,

  /** Düşman */
  dusmanYemeHasariMs: 500,   // kaç ms'de bir cihazı ısırır
  yavaslatmaOrani: 0.5,
  yavaslatmaSuresiMs: 2500,

  /** Dalga */
  dalgaArasiMs: 15000,
  hazirlikSuresiMs: 20000   // PvZ: ilk zombi ~20 sn sonra
};

/** Z sıralama katmanları */
export const DEPTH = {
  bg: 0,
  field: 10,       // cihaz & düşman (y'ye göre +)
  projectile: 900,
  fx: 950,
  spark: 1000,
  ui: 2000,
  overlay: 3000
};

export const COLORS = {
  sari: 0xffd54a,
  yesil: 0x7bd14a,
  kirmizi: 0xe04b4b,
  koyu: 0x2b1a10,
  beyaz: 0xffffff
};
