/**
 * GameConfig.js
 * Oyunun tüm global sabitleri. Denge ayarı yapmak isteyen sadece bu dosyaya bakar.
 */

export const SURUM = 'v0.14';

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
  footV: 0.70
};

/** Üstteki tohum/kart barı — arka plandaki çizili yuvalarla hizalı. */
export const SEEDBAR = {
  slots: 9,
  startX: 327.9,
  stepX: 84.5,
  y: 60,
  w: 78,
  h: 96
};

/** Sol üstteki enerji göstergesi (arka plandaki şimşek rozeti + bar). */
export const ENERGY_UI = {
  barX: 129, barY: 35, barW: 114, barH: 50,
  textX: 186, textY: 60
};

export const BALANCE = {
  baslangicEnerjisi: 150,
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
  dalgaArasiMs: 18000,
  hazirlikSuresiMs: 12000
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
