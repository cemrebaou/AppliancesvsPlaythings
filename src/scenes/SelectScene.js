import Phaser from '../../vendor/phaser.esm.min.js';
import { SCENE, K } from '../core/Keys.js';
import { DESIGN, SEEDBAR } from '../config/GameConfig.js';
import { APPLIANCES } from '../config/ApplianceData.js';
import { Save } from '../core/Save.js';
import { Ses } from '../core/Audio.js';

const SUTUN = 10, SATIR = 3;

/** SelectScene — 30 ev aletinden 9 tanesini seç. */
export class SelectScene extends Phaser.Scene {
  constructor() { super(SCENE.select); }

  create() {
    const W = DESIGN.width, H = DESIGN.height;
    this.add.image(0, 0, K.bg).setOrigin(0).setDisplaySize(W, H);
    this.add.rectangle(0, 0, W, H, 0x120a05, 0.7).setOrigin(0);

    this.add.text(W / 2, 34, 'EKİBİNİ SEÇ  —  9 ev aleti', {
      fontFamily: 'Verdana, Arial, sans-serif', fontSize: '26px', color: '#ffd54a',
      stroke: '#2b1a10', strokeThickness: 6
    }).setOrigin(0.5);

    this.secilenler = [];
    const kayitli = Save.oku().secilenler || [];

    this.kartlar = [];
    const kw = 122, kh = 128;
    const bx = W / 2 - (SUTUN * kw) / 2 + kw / 2;
    const by = 128;

    APPLIANCES.forEach((v, i) => {
      const cx = bx + (i % SUTUN) * kw;
      const cy = by + ((i / SUTUN) | 0) * kh;

      const g = this.add.graphics();
      const ikon = this.add.image(cx, cy - 8, K.atlas, v.id + '_0');
      const sk = Math.min(96 / ikon.width, 70 / ikon.height);
      ikon.setScale(sk);

      const ad = this.add.text(cx, cy + 34, v.ad, {
        fontFamily: 'Verdana, Arial, sans-serif', fontSize: '12px', color: '#ffffff',
        stroke: '#2b1a10', strokeThickness: 3, align: 'center', wordWrap: { width: kw - 16 }
      }).setOrigin(0.5, 0);

      const fiyat = this.add.text(cx + kw / 2 - 16, cy - kh / 2 + 16, String(v.fiyat), {
        fontFamily: 'Verdana, Arial, sans-serif', fontSize: '14px', color: '#ffe36e',
        stroke: '#2b1a10', strokeThickness: 3
      }).setOrigin(1, 0);

      const r = this.add.rectangle(cx, cy, kw - 8, kh - 8, 0xffffff, 0.001)
        .setInteractive({ useHandCursor: true });
      r.on('pointerdown', () => { Ses.ac(); this._cevir(i); });

      const kart = { v, cx, cy, kw, kh, g, ikon, ad, fiyat, secili: false };
      this.kartlar.push(kart);
      if (kayitli.includes(v.id) && this.secilenler.length < SEEDBAR.slots) this._sec(i, true);
      this._kartCiz(kart);
    });

    this.aciklama = this.add.text(W / 2, H - 92, 'Bir karta dokunarak ekibine ekle.', {
      fontFamily: 'Verdana, Arial, sans-serif', fontSize: '16px', color: '#e6d7b8',
      stroke: '#2b1a10', strokeThickness: 3
    }).setOrigin(0.5);

    this.sayacYazi = this.add.text(W / 2 - 330, H - 46, '', {
      fontFamily: 'Verdana, Arial, sans-serif', fontSize: '20px', color: '#ffffff',
      stroke: '#2b1a10', strokeThickness: 4
    }).setOrigin(0.5);

    this.basla = this._dugme(W / 2 + 110, H - 46, 'BAŞLA', () => {
      if (this.secilenler.length !== SEEDBAR.slots) { Ses.hata(); return; }
      Ses.tik();
      Save.yaz({ secilenler: this.secilenler.slice() });
      this.scene.start(SCENE.game, { secilenler: this.secilenler.slice() });
    });
    this._dugme(W / 2 - 160, H - 46, 'GERİ', () => { Ses.tik(); this.scene.start(SCENE.menu); }, 160);

    this._sayacGuncelle();
  }

  _cevir(i) {
    const k = this.kartlar[i];
    if (k.secili) { this._sec(i, false); Ses.tik(); }
    else if (this.secilenler.length < SEEDBAR.slots) { this._sec(i, true); Ses.yerlestir(); }
    else { Ses.hata(); }
    this._kartCiz(k);
    this.aciklama.setText(k.v.ad + ' — ' + k.v.aciklama);
    this._sayacGuncelle();
  }

  _sec(i, durum) {
    const k = this.kartlar[i];
    k.secili = durum;
    const id = k.v.id;
    const p = this.secilenler.indexOf(id);
    if (durum && p < 0) this.secilenler.push(id);
    if (!durum && p >= 0) this.secilenler.splice(p, 1);
  }

  _kartCiz(k) {
    const g = k.g;
    g.clear();
    g.fillStyle(k.secili ? 0x5a3a1e : 0x2a1a10, 0.88);
    g.fillRoundedRect(k.cx - k.kw / 2 + 4, k.cy - k.kh / 2 + 4, k.kw - 8, k.kh - 8, 10);
    g.lineStyle(3, k.secili ? 0xffd54a : 0x7a5c3a, 1);
    g.strokeRoundedRect(k.cx - k.kw / 2 + 4, k.cy - k.kh / 2 + 4, k.kw - 8, k.kh - 8, 10);
    k.ikon.setAlpha(k.secili ? 1 : 0.65);
  }

  _sayacGuncelle() {
    const n = this.secilenler.length;
    this.sayacYazi.setText(`${n} / ${SEEDBAR.slots}`);
    this.sayacYazi.setColor(n === SEEDBAR.slots ? '#8ce06a' : '#ffffff');
    this.basla.setAlpha(n === SEEDBAR.slots ? 1 : 0.45);
  }

  _dugme(x, y, metin, tikla, w = 200) {
    const h = 54;
    const g = this.add.graphics();
    g.fillStyle(0x4a2f1a, 0.95); g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 12);
    g.lineStyle(3, 0xffd54a, 1); g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 12);
    const t = this.add.text(x, y, metin, {
      fontFamily: 'Verdana, Arial, sans-serif', fontSize: '22px', color: '#ffffff',
      stroke: '#2b1a10', strokeThickness: 4
    }).setOrigin(0.5);
    this.add.rectangle(x, y, w + 12, h + 12, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', tikla);
    return t;
  }
}
