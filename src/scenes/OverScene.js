import Phaser from '../../vendor/phaser.esm.min.js';
import { SCENE, K } from '../core/Keys.js';
import { DESIGN } from '../config/GameConfig.js';
import { Save } from '../core/Save.js';
import { Ses } from '../core/Audio.js';

export class OverScene extends Phaser.Scene {
  constructor() { super(SCENE.over); }

  init(d) { this.sonuc = d || { kazandi: false, dalga: 0, skor: 0 }; }

  create() {
    const W = DESIGN.width, H = DESIGN.height;
    const { kazandi, dalga, skor } = this.sonuc;

    this.add.image(0, 0, K.bg).setOrigin(0).setDisplaySize(W, H);
    this.add.rectangle(0, 0, W, H, kazandi ? 0x0d2410 : 0x240d0d, 0.72).setOrigin(0);

    this.add.text(W / 2, 180, kazandi ? 'EV KURTARILDI!' : 'OYUNCAKLAR EVİ ELE GEÇİRDİ', {
      fontFamily: 'Verdana, Arial, sans-serif', fontSize: '46px',
      color: kazandi ? '#8ce06a' : '#ff8d8d', stroke: '#2b1a10', strokeThickness: 8,
      align: 'center', wordWrap: { width: W - 120 }
    }).setOrigin(0.5);

    this.add.image(W / 2, 300, K.atlas, kazandi ? 'microwave_1' : 'train_0')
      .setScale(1.1).setFlipX(!kazandi);

    const k = Save.oku();
    this.add.text(W / 2, 400, `Ulaşılan dalga: ${dalga}    •    Skor: ${skor}`, {
      fontFamily: 'Verdana, Arial, sans-serif', fontSize: '24px', color: '#ffffff',
      stroke: '#2b1a10', strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(W / 2, 436, `Rekor: ${k.enYuksekDalga} dalga / ${k.enYuksekSkor} puan`, {
      fontFamily: 'Verdana, Arial, sans-serif', fontSize: '17px', color: '#c8b48c'
    }).setOrigin(0.5);

    this._dugme(W / 2 - 150, 530, 'TEKRAR', () => {
      Ses.tik(); this.scene.start(SCENE.game, { secilenler: Save.oku().secilenler });
    });
    this._dugme(W / 2 + 150, 530, 'EKİBİ DEĞİŞTİR', () => {
      Ses.tik(); this.scene.start(SCENE.select);
    });
    this._dugme(W / 2, 612, 'ANA MENÜ', () => {
      Ses.tik(); this.scene.start(SCENE.menu);
    }, 220);
  }

  _dugme(x, y, metin, tikla, w = 270) {
    const h = 58;
    const g = this.add.graphics();
    g.fillStyle(0x4a2f1a, 0.95); g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 12);
    g.lineStyle(3, 0xffd54a, 1); g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 12);
    this.add.text(x, y, metin, {
      fontFamily: 'Verdana, Arial, sans-serif', fontSize: '21px', color: '#ffffff',
      stroke: '#2b1a10', strokeThickness: 4
    }).setOrigin(0.5);
    this.add.rectangle(x, y, w + 12, h + 12, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true }).on('pointerdown', tikla);
  }
}
