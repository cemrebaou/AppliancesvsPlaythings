/**
 * ToyData.js
 * 6 karanlık oyuncak (düşman). Her biri atlas'ta 5 yürüyüş karesi: <id>_0 .. <id>_4
 *
 *  hizU     : saniyede kaç u birimi ilerler (1 u = sahanın tüm genişliği)
 *  can      : toplam can
 *  zirh     : 0..0.6 gelen hasarı bu oranda azaltır
 *  isirik   : her ısırıkta cihaza verdiği hasar
 *  fps      : yürüyüş animasyon hızı
 *  zipla    : true ise ara sıra bir karo atlar
 *  olcek    : temel boy çarpanı
 *  puan     : öldürünce kazanılan skor
 */

export const TOYS = [
  {
    id: 'doll', ad: 'Bebek', can: 150, hizU: 0.052, zirh: 0,
    isirik: 22, fps: 10, olcek: 0.95, puan: 10,
    aciklama: 'Hızlı ama zayıf.'
  },
  {
    id: 'bear', ad: 'Oyuncak Ayı', can: 190, hizU: 0.032, zirh: 0,
    isirik: 26, fps: 8, olcek: 1.0, puan: 12,
    aciklama: 'Yavaş, dengeli.'
  },
  {
    id: 'soldier', ad: 'Kurşun Asker', can: 270, hizU: 0.038, zirh: 0.12,
    isirik: 30, fps: 9, olcek: 0.92, puan: 18,
    aciklama: 'Düzenli yürür, biraz zırhlı.'
  },
  {
    id: 'jack', ad: 'Kutudaki Palyaço', can: 230, hizU: 0.040, zirh: 0,
    isirik: 28, fps: 10, olcek: 1.0, puan: 22, zipla: true, ziplaMs: 5200, ziplaU: 0.105,
    aciklama: 'Zıplayıp bir cihazı atlar.'
  },
  {
    id: 'robot', ad: 'Kurmalı Robot', can: 360, hizU: 0.030, zirh: 0.3,
    isirik: 34, fps: 8, olcek: 1.0, puan: 28,
    aciklama: 'Metal gövde, hasarı azaltır.'
  },
  {
    id: 'train', ad: 'Hayalet Tren', can: 1100, hizU: 0.022, zirh: 0.2,
    isirik: 70, fps: 7, olcek: 1.15, puan: 80, boss: true,
    aciklama: 'PATRON. Çok dayanıklı, cihazları hızla parçalar.'
  }
];

export const TOY_BY_ID = Object.freeze(
  TOYS.reduce((m, t) => { m[t.id] = t; return m; }, {})
);
