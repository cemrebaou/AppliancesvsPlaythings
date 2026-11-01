/** Save.js — localStorage sarmalayıcı (gizli sekmede bile patlamaz). */
const ANAHTAR = 'avp_save_v1';

const VARSAYILAN = {
  enYuksekDalga: 0,
  enYuksekSkor: 0,
  sesAcik: true,
  secilenler: ['dynamo', 'toaster', 'minifridge', 'battery', 'outlet', 'blender', 'lamp', 'paninipress', 'iron']
};

let bellek = null;

export const Save = {
  oku() {
    if (bellek) return bellek;
    try {
      const h = localStorage.getItem(ANAHTAR);
      bellek = h ? Object.assign({}, VARSAYILAN, JSON.parse(h)) : Object.assign({}, VARSAYILAN);
    } catch (e) {
      bellek = Object.assign({}, VARSAYILAN);
    }
    return bellek;
  },
  yaz(yama) {
    const d = Object.assign(this.oku(), yama);
    bellek = d;
    try { localStorage.setItem(ANAHTAR, JSON.stringify(d)); } catch (e) { /* yok say */ }
    return d;
  }
};
