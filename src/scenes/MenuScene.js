import Phaser from '../../vendor/phaser.esm.min.js';
import { SCENE, K } from '../core/Keys.js';
import { DESIGN, SURUM, DEPTH } from '../config/GameConfig.js';
import { Save } from '../core/Save.js';
import { Ses } from '../core/Audio.js';

/** Tam ekrana geçer ve telefonu yatay konuma kilitler (destekleyen tarayıcılarda). */
export function tamEkranYap(scene) {
  try { scene.scale.startFullscreen(); } catch (e) { /* desteklenmiyor */ }
  setTimeout(() => {
    try {
      const o = screen.orientation;
      if (o && o.lock) o.lock('landscape').catch(() => {});
    } catch (e) { /* desteklenmiyor */ }
  }, 150);
}

export class MenuScene extends Phaser.Scene {
  constructor() { super(SCENE.menu); }

  create() {
    const W = DESIGN.width, H = DESIGN.height;
    this.add.image(0, 0, K.bg).setOrigin(0).setDisplaySize(W, H).setDepth(0);
    this.add.rectangle(0, 0, W, H, 0x120a05, 0.55).setOrigin(0).setDepth(1);

    this.add.image(W / 2 - 250, H / 2 + 28, K.atlas, 'toaster_0').setScale(1.1).setDepth(2);
    this.add.image(W / 2 + 250, H / 2 + 28, K.atlas, 'bear_0').setScale(1.0).setFlipX(true).setDepth(2);

    this.add.text(W / 2, 150, 'APPLIANCES', {
      fontFamily: 'Verdana, Arial, sans-serif', fontSize: '58px', color: '#ffd54a',
      stroke: '#2b1a10', strokeThickness: 9
    }).setOrigin(0.5).setDepth(3);
    this.add.text(W / 2, 208, 'vs', {
      fontFamily: 'Verdana, Arial, sans-serif', fontSize: '28px', color: '#ffffff',
      stroke: '#2b1a10', strokeThickness: 6
    }).setOrigin(0.5).setDepth(3);
    this.add.text(W / 2, 262, 'PLAYTHINGS', {
      fontFamily: 'Verdana, Arial, sans-serif', fontSize: '58px', color: '#e8e2d2',
      stroke: '#2b1a10', strokeThickness: 9
    }).setOrigin(0.5).setDepth(3);

    const kayit = Save.oku();
    this.add.text(W / 2, 320,
      `En iyi: ${kayit.enYuksekDalga} dalga  •  ${kayit.enYuksekSkor} puan`, {
      fontFamily: 'Verdana, Arial, sans-serif', fontSize: '18px', color: '#c8b48c'
    }).setOrigin(0.5).setDepth(3);

    this._dugme(W / 2, 400, 'OYNA', () => {
      Ses.ac(); Ses.tik();
      this.scene.start(SCENE.select);
    });

    this._dugme(W / 2, 480, kayit.sesAcik ? 'SES: AÇIK' : 'SES: KAPALI', (b) => {
      const yeni = !Save.oku().sesAcik;
      Save.yaz({ sesAcik: yeni });
      b.setText(yeni ? 'SES: AÇIK' : 'SES: KAPALI');
      if (yeni) { Ses.ac(); Ses.tik(); }
    }, 0.8);

    // Tam ekran: basınca tam ekran olur ve ekranı yataya kilitler (dönme uyarısı yok)
    this._dugme(W / 2, 552, this.scale.isFullscreen ? 'TAM EKRANDAN ÇIK' : 'TAM EKRAN', (b) => {
      Ses.ac(); Ses.tik();
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
        b.setText('TAM EKRAN');
      } else {
        tamEkranYap(this);
        b.setText('TAM EKRANDAN ÇIK');
      }
    }, 0.8);

    this.add.text(W - 12, H - 10, SURUM, {
      fontFamily: 'Verdana, Arial, sans-serif', fontSize: '14px', color: '#8f7a5c'
    }).setOrigin(1, 1).setDepth(3);

    this.add.text(12, H - 10, 'Geliştiren: Cemre Başoğlu', {
      fontFamily: 'Verdana, Arial, sans-serif', fontSize: '14px', color: '#8f7a5c'
    }).setOrigin(0, 1).setDepth(3);
  }

  _dugme(x, y, metin, tikla, olcek = 1) {
    const w = 320 * olcek, h = 66 * olcek;
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x4a2f1a, 0.95); g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 14);
    g.lineStyle(4, 0xffd54a, 1); g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 14);
    const t = this.add.text(x, y, metin, {
      fontFamily: 'Verdana, Arial, sans-serif', fontSize: (26 * olcek) + 'px',
      color: '#ffffff', stroke: '#2b1a10', strokeThickness: 5
    }).setOrigin(0.5).setDepth(5);
    const r = this.add.rectangle(x, y, w + 16, h + 16, 0xffffff, 0.001)
      .setDepth(6).setInteractive({ useHandCursor: true });
    r.on('pointerdown', () => tikla(t));
    return t;
  }
}
