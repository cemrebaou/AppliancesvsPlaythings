/**
 * ToyData.js
 * Düşmanlar. Değerler Plants vs Zombies zombilerine göre (v0.15).
 * Oyuncaklar 5 yürüyüş karesi (<id>_0.._4), mobilyalar 2 kare (kareler: 2).
 *
 *  hizU      : saniyede kaç u ilerler (1 u = saha genişliği; normal zombi 0.021 ≈ 4.7 sn/kare)
 *  can       : toplam can (normal zombi 270)
 *  isirik    : 500 ms'de bir cihaza verdiği hasar (50 = PvZ'deki 100/sn)
 *  metal     : true ise Giysi Buharlayıcı (mıknatıs) kaskını söker; can 'govde'ye iner
 *  zipla     : zıplayıcı; tekZipla ise bir kez zıplar, sonra ziplaSonraHiz ile yürür
 *  kizginCan : can bu değerin altına inince hız 'kizginCarpan' katına çıkar
 *  zirh      : 0..0.6 gelen hasarı azaltır (PvZ'de yok, hepsi 0)
 */

export const TOYS = [
  {
    id: 'doll', ad: 'Bebek', pvz: 'Normal Zombi', can: 270, hizU: 0.021, zirh: 0,
    isirik: 50, fps: 7, olcek: 0.95, puan: 10,
    aciklama: 'Sıradan, yavaş yürür.'
  },
  {
    id: 'bear', ad: 'Oyuncak Ayı', pvz: 'Konili Zombi', can: 640, hizU: 0.021, zirh: 0,
    isirik: 50, fps: 6, olcek: 1.0, puan: 12,
    aciklama: 'Dolgun gövde, normalin 2 katından fazla dayanır.'
  },
  {
    id: 'soldier', ad: 'Kurşun Asker', pvz: 'Kovalı Zombi', can: 1370, hizU: 0.021, zirh: 0,
    isirik: 50, fps: 7, olcek: 0.92, puan: 18, metal: true, govde: 270,
    aciklama: 'Metal kasklı, çok dayanıklı. Mıknatısla kaskı sökülür.'
  },
  {
    id: 'jack', ad: 'Kutudaki Palyaço', pvz: 'Sırıklı Zombi', can: 500, hizU: 0.04, zirh: 0,
    isirik: 50, fps: 10, olcek: 1.0, puan: 22,
    zipla: true, tekZipla: true, ziplaMs: 0, ziplaU: 0.105, ziplaSonraHiz: 0.021,
    aciklama: 'Hızlı koşar, ilk aletin üstünden bir kez zıplar. Büyük Buzdolabı durdurur.'
  },
  {
    id: 'robot', ad: 'Kurmalı Robot', pvz: 'Futbolcu Zombi', can: 1670, hizU: 0.042, zirh: 0,
    isirik: 50, fps: 10, olcek: 1.0, puan: 28, metal: true, govde: 270,
    aciklama: 'Metal gövde, hızlı ve çok dayanıklı.'
  },
  {
    id: 'train', ad: 'Hayalet Tren', pvz: 'Dev Zombi', can: 3000, hizU: 0.017, zirh: 0,
    isirik: 1500, fps: 6, olcek: 1.15, puan: 80, boss: true,
    aciklama: 'PATRON. Aletleri tek darbede ezer.'
  },

  /* ── Mobilya düşmanlar ── */
  {
    id: 'washingmachine', ad: 'Çamaşır Makinesi (Düşman)', pvz: 'Buz Arabası', can: 1350, hizU: 0.02, zirh: 0,
    isirik: 2000, fps: 8, olcek: 1.0, kareler: 2, puan: 25,
    aciklama: 'Önüne çıkan aleti anında ezer.'
  },
  {
    id: 'table', ad: 'Masa', pvz: 'Bayraklı Zombi', can: 270, hizU: 0.026, zirh: 0,
    isirik: 50, fps: 8, olcek: 1.0, kareler: 2, puan: 12,
    aciklama: 'Büyük dalgaların öncüsü, biraz hızlı.'
  },
  {
    id: 'chair', ad: 'Sandalye', pvz: 'Cüce Zombi', can: 270, hizU: 0.035, zirh: 0,
    isirik: 50, fps: 10, olcek: 1.0, kareler: 2, puan: 10,
    aciklama: 'Hafif ve hızlı.'
  },
  {
    id: 'desklamp', ad: 'Masa Lambası', pvz: 'Gazeteli Zombi', can: 420, hizU: 0.021, zirh: 0,
    isirik: 50, fps: 8, olcek: 1.0, kareler: 2, puan: 12, kizginCan: 270, kizginCarpan: 2.6,
    aciklama: 'Abajuru kırılınca sinirlenip koşmaya başlar.'
  },
  {
    id: 'floorlamp', ad: 'Zemin Lambası', pvz: 'Dansçı Zombi', can: 500, hizU: 0.026, zirh: 0,
    isirik: 50, fps: 9, olcek: 1.0, kareler: 2, puan: 14,
    aciklama: 'Uzun boylu, tuhaf adımlar.'
  },
  {
    id: 'armchair', ad: 'Koltuk', pvz: 'Konili Zombi (yavaş)', can: 640, hizU: 0.018, zirh: 0,
    isirik: 50, fps: 6, olcek: 1.0, kareler: 2, puan: 14,
    aciklama: 'Şişman ve yavaş.'
  },
  {
    id: 'television', ad: 'Televizyon', pvz: 'Kapılı Zombi', can: 1370, hizU: 0.021, zirh: 0,
    isirik: 50, fps: 7, olcek: 1.0, kareler: 2, puan: 20, metal: true, govde: 270,
    aciklama: 'Ekranı kalkan gibi. Mıknatısla sökülür.'
  },
  {
    id: 'bookshelf', ad: 'Kitaplık', pvz: 'Ağır Zombi', can: 1100, hizU: 0.018, zirh: 0,
    isirik: 50, fps: 6, olcek: 1.0, kareler: 2, puan: 20,
    aciklama: 'Ağır ve dayanıklı.'
  },
  {
    id: 'nightstand', ad: 'Komodin', pvz: 'Konili Zombi', can: 640, hizU: 0.021, zirh: 0,
    isirik: 50, fps: 7, olcek: 1.0, kareler: 2, puan: 12,
    aciklama: 'Çekmeceleriyle korunur.'
  },
  {
    id: 'trashcan', ad: 'Çöp Kutusu', pvz: 'Çöp Kutulu Zombi', can: 1370, hizU: 0.021, zirh: 0,
    isirik: 50, fps: 7, olcek: 1.0, kareler: 2, puan: 18, metal: true, govde: 270,
    aciklama: 'Metal gövde. Mıknatısla kapağı sökülür.'
  },
  {
    id: 'coatrack', ad: 'Portmanto', pvz: 'Cüce Zombi', can: 270, hizU: 0.032, zirh: 0,
    isirik: 50, fps: 10, olcek: 1.0, kareler: 2, puan: 8,
    aciklama: 'İnce ama çevik.'
  },
  {
    id: 'dresser', ad: 'Şifonyer', pvz: 'Ağır Zombi', can: 1100, hizU: 0.019, zirh: 0,
    isirik: 50, fps: 6, olcek: 1.0, kareler: 2, puan: 20,
    aciklama: 'Çekmecelerini kalkan yapar.'
  }
];

export const TOY_BY_ID = Object.freeze(
  TOYS.reduce((m, t) => { m[t.id] = t; return m; }, {})
);
