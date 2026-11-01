/**
 * SeedBar.js
 * Üstteki 9 kart yuvası. Arka plandaki çizili yuvalarla hizalıdır.
 * Dokunmatik için her kartın vuruş alanı yuvanın tamamıdır (parmak dostu).
 */
import { SEEDBAR, DEPTH, COLORS } from '../config/GameConfig.js';
import { K } from '../core/Keys.js';
import { Ses } from '../core/Audio.js';

export class SeedBar {
  /**
   * @param {Phaser.Scene} scene
   * @param {Array} veriler seçilen 9 cihazın verisi
   * @param {Function} secildi (veri, index) => void
   */
  constructor(scene, veriler, secildi) {
    this.scene = scene;
    this.veriler = veriler;
    this.secildi = secildi;
    this.kartlar = [];
    this.secili = -1;

    this.maskeler = scene.add.graphics().setDepth(DEPTH.ui + 2).setScrollFactor(0);

    for (let i = 0; i < veriler.length && i < SEEDBAR.slots; i++) {
      const v = veriler[i];
      const x = SEEDBAR.startX + i * SEEDBAR.stepX;
      const y = SEEDBAR.y;

      const vurus = scene.add.rectangle(x, y, SEEDBAR.w, SEEDBAR.h, 0xffffff, 0.001)
        .setDepth(DEPTH.ui).setScrollFactor(0)
        .setInteractive({ useHandCursor: true });

      const ikon = scene.add.image(x, y - 9, K.atlas, v.id + '_0')
        .setDepth(DEPTH.ui + 1).setScrollFactor(0);
      // yuvanın camına sığdır (fiyat yazısına yer bırak)
      const sk = Math.min((SEEDBAR.w - 14) / ikon.width, (SEEDBAR.h - 36) / ikon.height);
      ikon.setScale(sk);

      const fiyat = scene.add.text(x, y + SEEDBAR.h / 2 - 11, String(v.fiyat), {
        fontFamily: 'Verdana, Arial, sans-serif', fontSize: '14px',
        color: '#ffffff', stroke: '#2b1a10', strokeThickness: 4
      }).setOrigin(0.5).setDepth(DEPTH.ui + 3).setScrollFactor(0);

      const cerceve = scene.add.graphics().setDepth(DEPTH.ui + 4).setScrollFactor(0);

      vurus.on('pointerdown', () => {
        Ses.ac(); Ses.tik();
        this.sec(i);
      });

      this.kartlar.push({ v, x, y, ikon, fiyat, cerceve, vurus, bekleme: 0, alinabilir: true });
    }
  }

  sec(i) {
    const k = this.kartlar[i];
    if (!k) return;
    if (this.secili === i) { this.secimiBirak(); return; }
    if (!k.alinabilir || k.bekleme > 0) { Ses.hata(); return; }
    this.secili = i;
    this.secildi(k.v, i);
    this._cerceveleriCiz();
  }

  secimiBirak() {
    this.secili = -1;
    this.secildi(null, -1);
    this._cerceveleriCiz();
  }

  /** kart kullanıldıktan sonra bekleme başlat */
  beklemeBaslat(i) {
    const k = this.kartlar[i];
    if (!k) return;
    k.bekleme = k.v.bekleme;
    k.beklemeMax = k.v.bekleme;
  }

  /** enerjiye göre kartların solukluğunu güncelle */
  enerjiDegisti(enerji) {
    for (let i = 0; i < this.kartlar.length; i++) {
      const k = this.kartlar[i];
      const ok = enerji >= k.v.fiyat;
      if (ok !== k.alinabilir) {
        k.alinabilir = ok;
        k.ikon.setAlpha(ok ? 1 : 0.55);
        k.fiyat.setColor(ok ? '#ffffff' : '#ff8d8d');
      }
    }
  }

  guncelle(dt) {
    let ciz = false;
    for (let i = 0; i < this.kartlar.length; i++) {
      const k = this.kartlar[i];
      if (k.bekleme > 0) { k.bekleme -= dt; ciz = true; }
    }
    if (ciz || this._temizleGerek) {
      this._maskeleriCiz();
      this._temizleGerek = ciz;
    }
  }

  _maskeleriCiz() {
    const g = this.maskeler;
    g.clear();
    for (let i = 0; i < this.kartlar.length; i++) {
      const k = this.kartlar[i];
      if (k.bekleme <= 0) continue;
      const o = k.bekleme / k.beklemeMax;
      g.fillStyle(0x000000, 0.55);
      g.fillRect(k.x - SEEDBAR.w / 2, k.y - SEEDBAR.h / 2, SEEDBAR.w, SEEDBAR.h * o);
    }
  }

  _cerceveleriCiz() {
    for (let i = 0; i < this.kartlar.length; i++) {
      const k = this.kartlar[i];
      k.cerceve.clear();
      if (this.secili === i) {
        k.cerceve.lineStyle(4, COLORS.sari, 1);
        k.cerceve.strokeRoundedRect(
          k.x - SEEDBAR.w / 2, k.y - SEEDBAR.h / 2, SEEDBAR.w, SEEDBAR.h, 10);
      }
    }
  }

  kartMusait(i) {
    const k = this.kartlar[i];
    return k && k.bekleme <= 0 && k.alinabilir;
  }
}
