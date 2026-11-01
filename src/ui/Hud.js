/**
 * Hud.js
 * Enerji sayacı, dalga göstergesi, skor, kürek ve duraklat düğmeleri.
 * Metinler nadiren değiştiği için her karede setText çağrılmaz.
 */
import { DESIGN, ENERGY_UI, DEPTH, COLORS, SURUM } from '../config/GameConfig.js';
import { Ses } from '../core/Audio.js';
import { tamEkranYap } from '../scenes/MenuScene.js';

const YAZI = (boy, renk = '#ffffff') => ({
  fontFamily: 'Verdana, Arial, sans-serif',
  fontSize: boy + 'px',
  color: renk,
  stroke: '#2b1a10',
  strokeThickness: 4
});

export class Hud {
  constructor(scene, olaylar) {
    this.scene = scene;
    this.olaylar = olaylar;   // { kurekTiklandi, duraklatTiklandi, dalgaCagir }

    this.enerjiYazi = scene.add.text(ENERGY_UI.textX, ENERGY_UI.textY, '0', YAZI(28))
      .setOrigin(0.5).setDepth(DEPTH.ui + 3).setScrollFactor(0);

    this.dalgaYazi = scene.add.text(DESIGN.width - 16, 16, '', YAZI(20))
      .setOrigin(1, 0).setDepth(DEPTH.ui + 3).setScrollFactor(0);

    this.skorYazi = scene.add.text(DESIGN.width - 16, 44, 'Skor 0', YAZI(17, '#ffe9a8'))
      .setOrigin(1, 0).setDepth(DEPTH.ui + 3).setScrollFactor(0);

    this.canYazi = scene.add.text(DESIGN.width - 16, 68, '', YAZI(17, '#ff9a9a'))
      .setOrigin(1, 0).setDepth(DEPTH.ui + 3).setScrollFactor(0);

    this.bilgiYazi = scene.add.text(DESIGN.width / 2, 132, '', YAZI(22, '#ffe9a8'))
      .setOrigin(0.5).setDepth(DEPTH.ui + 3).setScrollFactor(0).setAlpha(0);

    // Tam ekran tuşu: sağ en alt köşe (oyun boyunca hep orada)
    const TW = 118, TH = 34, TX = DESIGN.width - 6 - TW / 2, TY = DESIGN.height - 6 - TH / 2;
    const tg = scene.add.graphics().setDepth(DEPTH.ui + 2).setScrollFactor(0);
    tg.fillStyle(0x4a2f1a, 0.92).fillRoundedRect(TX - TW / 2, TY - TH / 2, TW, TH, 9);
    tg.lineStyle(2, 0xffd54a, 1).strokeRoundedRect(TX - TW / 2, TY - TH / 2, TW, TH, 9);
    const tYazi = scene.add.text(TX, TY, '', YAZI(14))
      .setOrigin(0.5).setDepth(DEPTH.ui + 3).setScrollFactor(0);
    const tGuncelle = () => tYazi.setText(scene.scale.isFullscreen ? 'TAM EKRAN ✕' : 'TAM EKRAN');
    tGuncelle();
    scene.add.rectangle(TX, TY, TW + 10, TH + 10, 0xffffff, 0.001)
      .setDepth(DEPTH.ui + 4).setScrollFactor(0).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        Ses.tik();
        if (scene.scale.isFullscreen) scene.scale.stopFullscreen();
        else tamEkranYap(scene);
      });
    scene.scale.on('enterfullscreen', tGuncelle);
    scene.scale.on('leavefullscreen', tGuncelle);
    scene.events.once('shutdown', () => {
      scene.scale.off('enterfullscreen', tGuncelle);
      scene.scale.off('leavefullscreen', tGuncelle);
    });

    // Sürüm: tam ekran tuşunun hemen solunda, aynı hizada
    scene.add.text(TX - TW / 2 - 8, DESIGN.height - 12, SURUM, YAZI(12, '#a08060'))
      .setOrigin(1, 1).setDepth(DEPTH.ui + 3).setScrollFactor(0).setAlpha(0.7);

    const BY = 168;
    this.kurek = this._dugme(DESIGN.width - 60, BY, 'KÜREK', () => {
      Ses.tik(); this.olaylar.kurekTiklandi();
    });
    this.duraklat = this._dugme(DESIGN.width - 162, BY, 'DUR', () => {
      Ses.tik(); this.olaylar.duraklatTiklandi();
    });
    this.cagir = this._dugme(DESIGN.width - 264, BY, 'ÇAĞIR', () => {
      Ses.tik(); this.olaylar.dalgaCagir();
    });

    this._sonCan = -1;
    this._sonEnerji = -1;
    this._sonSkor = -1;
    this._sonDalga = '';
    this.bilgiKalan = 0;
  }

  _dugme(x, y, metin, tikla) {
    const sc = this.scene, W = 94, H = 46;
    const g = sc.add.graphics().setDepth(DEPTH.ui).setScrollFactor(0);
    g.fillStyle(0x3a2516, 0.86); g.fillRoundedRect(x - W / 2, y - H / 2, W, H, 10);
    g.lineStyle(3, 0x9c7a4e, 1); g.strokeRoundedRect(x - W / 2, y - H / 2, W, H, 10);
    const t = sc.add.text(x, y, metin, YAZI(16))
      .setOrigin(0.5).setDepth(DEPTH.ui + 1).setScrollFactor(0);
    // vuruş alanı görünenden geniş: parmakla kolay basılır
    const r = sc.add.rectangle(x, y, W + 14, H + 14, 0xffffff, 0.001)
      .setDepth(DEPTH.ui + 2).setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    r.on('pointerdown', tikla);
    return { g, t, r, x, y };
  }

  kurekVurgu(acik) {
    this.kurek.t.setColor(acik ? '#ffd54a' : '#ffffff');
  }

  enerji(n) {
    if (n === this._sonEnerji) return;
    this._sonEnerji = n;
    this.enerjiYazi.setText(String(n));
  }

  skor(n) {
    if (n === this._sonSkor) return;
    this._sonSkor = n;
    this.skorYazi.setText('Skor ' + n);
  }

  can(n) {
    if (n === this._sonCan) return;
    this._sonCan = n;
    this.canYazi.setText('Can ' + '\u2665'.repeat(Math.max(0, n)));
  }

  dalga(metin) {
    if (metin === this._sonDalga) return;
    this._sonDalga = metin;
    this.dalgaYazi.setText(metin);
  }

  bilgi(metin, sure = 2200) {
    this.bilgiYazi.setText(metin).setAlpha(1);
    this.bilgiKalan = sure;
  }

  guncelle(dt) {
    if (this.bilgiKalan > 0) {
      this.bilgiKalan -= dt;
      if (this.bilgiKalan < 500) this.bilgiYazi.setAlpha(Math.max(0, this.bilgiKalan / 500));
    }
  }
}
