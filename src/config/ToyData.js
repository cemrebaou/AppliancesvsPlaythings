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
  },

  /* ── Mobilya & Ev Eşyası Düşmanlar (v0.14) ─ özellikler sonra verilecek ── */
  {
    id: 'refrigerator', ad: 'Buzdolabı', can: 500, hizU: 0.025, zirh: 0.1,
    isirik: 40, fps: 6, olcek: 1.0, kareler: 2, puan: 40,
    aciklama: 'İri ve ağır. Diğer düşmanların 2 katı büyüklüğünde.'
  },
  {
    id: 'minifridge', ad: 'Mini Buzdolabı', can: 200, hizU: 0.040, zirh: 0,
    isirik: 25, fps: 8, olcek: 1.0, kareler: 2, puan: 15,
    aciklama: 'Küçük ama hızlı.'
  },
  {
    id: 'washingmachine', ad: 'Çamaşır Makinesi (Düşman)', can: 320, hizU: 0.030, zirh: 0.15,
    isirik: 32, fps: 8, olcek: 1.0, kareler: 2, puan: 25,
    aciklama: 'Döne döne saldırır.'
  },
  {
    id: 'table', ad: 'Masa', can: 180, hizU: 0.045, zirh: 0,
    isirik: 20, fps: 9, olcek: 1.0, kareler: 2, puan: 12,
    aciklama: 'Sıradan bir masa.'
  },
  {
    id: 'chair', ad: 'Sandalye', can: 140, hizU: 0.055, zirh: 0,
    isirik: 18, fps: 10, olcek: 1.0, kareler: 2, puan: 10,
    aciklama: 'Hafif ve hızlı.'
  },
  {
    id: 'desklamp', ad: 'Masa Lambası', can: 120, hizU: 0.060, zirh: 0,
    isirik: 15, fps: 10, olcek: 1.0, kareler: 2, puan: 8,
    aciklama: 'Küçük ama sinir bozucu.'
  },
  {
    id: 'floorlamp', ad: 'Zemin Lambası', can: 160, hizU: 0.048, zirh: 0,
    isirik: 18, fps: 9, olcek: 1.0, kareler: 2, puan: 12,
    aciklama: 'Uzun boylu, tuhaf adımlar.'
  },
  {
    id: 'armchair', ad: 'Koltuk', can: 280, hizU: 0.028, zirh: 0.05,
    isirik: 28, fps: 7, olcek: 1.0, kareler: 2, puan: 20,
    aciklama: 'Şişman ve yavaş.'
  },
  {
    id: 'television', ad: 'Televizyon', can: 220, hizU: 0.038, zirh: 0.08,
    isirik: 24, fps: 8, olcek: 1.0, kareler: 2, puan: 18,
    aciklama: 'Ekranından ışın yayar.'
  },
  {
    id: 'bookshelf', ad: 'Kitaplık', can: 350, hizU: 0.025, zirh: 0.1,
    isirik: 30, fps: 7, olcek: 1.0, kareler: 2, puan: 25,
    aciklama: 'Kitapları fırlatır.'
  },
  {
    id: 'nightstand', ad: 'Komodin', can: 150, hizU: 0.050, zirh: 0,
    isirik: 18, fps: 9, olcek: 1.0, kareler: 2, puan: 12,
    aciklama: 'Çekmecelerini fırlatır.'
  },
  {
    id: 'trashcan', ad: 'Çöp Kutusu', can: 130, hizU: 0.055, zirh: 0,
    isirik: 15, fps: 10, olcek: 1.0, kareler: 2, puan: 10,
    aciklama: 'Çöp saçar.'
  },
  {
    id: 'coatrack', ad: 'Portmanto', can: 100, hizU: 0.065, zirh: 0,
    isirik: 12, fps: 11, olcek: 1.0, kareler: 2, puan: 8,
    aciklama: 'İnce ama çevik.'
  },
  {
    id: 'dresser', ad: 'Şifonyer', can: 300, hizU: 0.030, zirh: 0.08,
    isirik: 28, fps: 7, olcek: 1.0, kareler: 2, puan: 22,
    aciklama: 'Çekmecelerini silah olarak kullanır.'
  }
];

export const TOY_BY_ID = Object.freeze(
  TOYS.reduce((m, t) => { m[t.id] = t; return m; }, {})
);
