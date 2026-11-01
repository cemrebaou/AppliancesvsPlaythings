/**
 * LevelData.js
 * Dalga tasarımı (PvZ temposu). Her dalga: { ad, gruplar:[{ toy, adet, araMs, basMs? }], bonusEnerji }
 *  araMs : aynı gruptaki iki düşman arası süre
 *  basMs : grup, dalga başından kaç ms sonra başlar (yoksa önceki gruptan 4 sn sonra)
 * İlk dalgalar tek tek ve seyrek gelir; 10. ve 15. dalga "büyük dalga"dır.
 * 15 dalga bittikten sonra sonsuz mod devreye girer.
 */

export const WAVES = [
  { ad: 'Dalga 1',  gruplar: [{ toy: 'doll', adet: 1, araMs: 0 }] },
  { ad: 'Dalga 2',  gruplar: [{ toy: 'doll', adet: 2, araMs: 12000 }] },
  { ad: 'Dalga 3',  gruplar: [{ toy: 'doll', adet: 2, araMs: 10000 }, { toy: 'bear', adet: 1, araMs: 0, basMs: 6000 }] },
  { ad: 'Dalga 4',  gruplar: [{ toy: 'doll', adet: 3, araMs: 8000 }, { toy: 'bear', adet: 1, araMs: 0, basMs: 12000 }] },
  { ad: 'Dalga 5',  gruplar: [{ toy: 'doll', adet: 3, araMs: 7000 }, { toy: 'bear', adet: 2, araMs: 9000, basMs: 5000 }], bonusEnerji: 50 },
  { ad: 'Dalga 6',  gruplar: [{ toy: 'doll', adet: 3, araMs: 6500 }, { toy: 'jack', adet: 1, araMs: 0, basMs: 10000 }, { toy: 'chair', adet: 1, araMs: 0, basMs: 16000 }] },
  { ad: 'Dalga 7',  gruplar: [{ toy: 'bear', adet: 3, araMs: 6500 }, { toy: 'soldier', adet: 1, araMs: 0, basMs: 9000 }, { toy: 'chair', adet: 2, araMs: 5000, basMs: 12000 }] },
  { ad: 'Dalga 8',  gruplar: [{ toy: 'doll', adet: 4, araMs: 5500 }, { toy: 'jack', adet: 2, araMs: 7000, basMs: 6000 }, { toy: 'nightstand', adet: 1, araMs: 0, basMs: 14000 }] },
  { ad: 'Dalga 9',  gruplar: [{ toy: 'soldier', adet: 2, araMs: 8000 }, { toy: 'bear', adet: 3, araMs: 5500, basMs: 4000 }, { toy: 'coatrack', adet: 2, araMs: 4000, basMs: 10000 }], bonusEnerji: 75 },
  { ad: 'BÜYÜK DALGA', gruplar: [{ toy: 'table', adet: 1, araMs: 0 }, { toy: 'doll', adet: 7, araMs: 1400, basMs: 1500 }, { toy: 'bear', adet: 3, araMs: 2000, basMs: 3000 }, { toy: 'soldier', adet: 2, araMs: 2500, basMs: 5000 }] },
  { ad: 'Dalga 11', gruplar: [{ toy: 'robot', adet: 1, araMs: 0 }, { toy: 'bear', adet: 3, araMs: 5000, basMs: 3000 }, { toy: 'desklamp', adet: 2, araMs: 6000, basMs: 6000 }] },
  { ad: 'Dalga 12', gruplar: [{ toy: 'soldier', adet: 3, araMs: 5000 }, { toy: 'jack', adet: 3, araMs: 4500, basMs: 3000 }, { toy: 'television', adet: 1, araMs: 0, basMs: 9000 }, { toy: 'armchair', adet: 1, araMs: 0, basMs: 12000 }] },
  { ad: 'Dalga 13', gruplar: [{ toy: 'robot', adet: 2, araMs: 7000 }, { toy: 'trashcan', adet: 2, araMs: 6000, basMs: 4000 }, { toy: 'doll', adet: 5, araMs: 3000, basMs: 2000 }, { toy: 'floorlamp', adet: 2, araMs: 5000, basMs: 8000 }], bonusEnerji: 100 },
  { ad: 'Dalga 14', gruplar: [{ toy: 'washingmachine', adet: 1, araMs: 0 }, { toy: 'soldier', adet: 3, araMs: 4000, basMs: 3000 }, { toy: 'bookshelf', adet: 2, araMs: 6000, basMs: 5000 }, { toy: 'jack', adet: 3, araMs: 3500, basMs: 7000 }, { toy: 'dresser', adet: 1, araMs: 0, basMs: 12000 }] },
  { ad: 'SON DALGA', gruplar: [{ toy: 'table', adet: 1, araMs: 0 }, { toy: 'train', adet: 1, araMs: 0, basMs: 4000 }, { toy: 'robot', adet: 2, araMs: 3000, basMs: 2000 }, { toy: 'soldier', adet: 4, araMs: 2000, basMs: 1000 }, { toy: 'doll', adet: 8, araMs: 1100, basMs: 500 }, { toy: 'bear', adet: 4, araMs: 1800, basMs: 2500 }] }
];

/** 15. dalgadan sonrası için prosedürel dalga. */
export function sonsuzDalga(n) {
  const g = Math.max(0, n - WAVES.length);
  const carp = 1 + g * 0.15;
  const buyuk = (g + 1) % 5 === 0;
  const k = buyuk ? 2 : 1;
  return {
    ad: (buyuk ? 'BÜYÜK ' : '') + 'Sonsuz ' + (g + 1),
    zorlukCarpani: carp,
    gruplar: [
      { toy: 'doll', adet: (4 + g) * k, araMs: 1800, basMs: 0 },
      { toy: 'bear', adet: (2 + Math.floor(g / 2)) * k, araMs: 2600, basMs: 2000 },
      { toy: 'soldier', adet: (1 + Math.floor(g / 2)) * k, araMs: 3500, basMs: 4000 },
      { toy: 'jack', adet: 1 + Math.floor(g / 2), araMs: 3000, basMs: 5000 },
      { toy: 'robot', adet: 1 + Math.floor(g / 3), araMs: 4000, basMs: 7000 },
      { toy: 'trashcan', adet: Math.floor(g / 2), araMs: 4000, basMs: 9000 },
      { toy: 'train', adet: Math.floor((g + 1) / 4), araMs: 6000, basMs: 10000 }
    ]
  };
}

export function dalgaAl(n) {
  return n < WAVES.length ? WAVES[n] : sonsuzDalga(n);
}

export const TOPLAM_DALGA = WAVES.length;
