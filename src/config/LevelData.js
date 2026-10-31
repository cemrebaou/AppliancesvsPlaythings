/**
 * LevelData.js
 * Dalga tasarımı. Her dalga: { ad, gruplar:[{ toy, adet, araMs }], bonusEnerji }
 * 15 dalga bittikten sonra sonsuz mod devreye girer (WAVES_SONRASI üretir).
 */

export const WAVES = [
  { ad: 'Dalga 1',  gruplar: [{ toy: 'doll', adet: 2, araMs: 2600 }] },
  { ad: 'Dalga 2',  gruplar: [{ toy: 'doll', adet: 3, araMs: 2200 }, { toy: 'bear', adet: 1, araMs: 1800 }] },
  { ad: 'Dalga 3',  gruplar: [{ toy: 'bear', adet: 4, araMs: 2000 }] },
  { ad: 'Dalga 4',  gruplar: [{ toy: 'doll', adet: 4, araMs: 1500 }, { toy: 'soldier', adet: 2, araMs: 2200 }] },
  { ad: 'Dalga 5',  gruplar: [{ toy: 'soldier', adet: 5, araMs: 1700 }], bonusEnerji: 50 },
  { ad: 'Dalga 6',  gruplar: [{ toy: 'bear', adet: 4, araMs: 1400 }, { toy: 'jack', adet: 2, araMs: 2000 }] },
  { ad: 'Dalga 7',  gruplar: [{ toy: 'jack', adet: 4, araMs: 1500 }, { toy: 'soldier', adet: 3, araMs: 1600 }] },
  { ad: 'Dalga 8',  gruplar: [{ toy: 'robot', adet: 3, araMs: 2400 }, { toy: 'doll', adet: 5, araMs: 1100 }] },
  { ad: 'Dalga 9',  gruplar: [{ toy: 'robot', adet: 4, araMs: 1900 }, { toy: 'jack', adet: 3, araMs: 1400 }], bonusEnerji: 75 },
  { ad: 'Dalga 10', gruplar: [{ toy: 'train', adet: 1, araMs: 0 }, { toy: 'bear', adet: 5, araMs: 1200 }] },
  { ad: 'Dalga 11', gruplar: [{ toy: 'soldier', adet: 6, araMs: 1200 }, { toy: 'robot', adet: 3, araMs: 1600 }] },
  { ad: 'Dalga 12', gruplar: [{ toy: 'jack', adet: 6, araMs: 1000 }, { toy: 'doll', adet: 8, araMs: 700 }] },
  { ad: 'Dalga 13', gruplar: [{ toy: 'robot', adet: 6, araMs: 1300 }, { toy: 'train', adet: 1, araMs: 0 }], bonusEnerji: 100 },
  { ad: 'Dalga 14', gruplar: [{ toy: 'soldier', adet: 8, araMs: 900 }, { toy: 'jack', adet: 5, araMs: 1100 }, { toy: 'robot', adet: 4, araMs: 1400 }] },
  { ad: 'SON DALGA', gruplar: [{ toy: 'train', adet: 3, araMs: 4000 }, { toy: 'robot', adet: 6, araMs: 1100 }, { toy: 'soldier', adet: 8, araMs: 800 }, { toy: 'doll', adet: 10, araMs: 500 }] }
];

/** 15. dalgadan sonrası için prosedürel dalga. */
export function sonsuzDalga(n) {
  const g = Math.max(0, n - WAVES.length);
  const carp = 1 + g * 0.18;
  return {
    ad: 'Sonsuz ' + (g + 1),
    zorlukCarpani: carp,
    gruplar: [
      { toy: 'doll', adet: 6 + g, araMs: 600 },
      { toy: 'soldier', adet: 4 + g, araMs: 900 },
      { toy: 'robot', adet: 3 + Math.floor(g / 2), araMs: 1200 },
      { toy: 'jack', adet: 3 + Math.floor(g / 2), araMs: 1000 },
      { toy: 'train', adet: 1 + Math.floor(g / 3), araMs: 3500 }
    ]
  };
}

export function dalgaAl(n) {
  return n < WAVES.length ? WAVES[n] : sonsuzDalga(n);
}

export const TOPLAM_DALGA = WAVES.length;
