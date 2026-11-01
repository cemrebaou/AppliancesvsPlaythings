/**
 * Spark.js — toplanacak şimşek (enerji).
 * Gökten düşer ya da Kahve Makinesi'nden çıkar; dokununca enerjiye dönüşür.
 */
import Phaser from '../../vendor/phaser.esm.min.js';
import { DEPTH, BALANCE } from '../config/GameConfig.js';
import { K } from '../core/Keys.js';

export class Spark {
  constructor(scene) {
    this.sprite = scene.add.image(0, 0, K.atlas, 'spark')
      .setOrigin(0.5, 0.5)
      .setDepth(DEPTH.spark)
      .setScale(0.85)
      .setActive(false)
      .setVisible(false);
    // Vuruş alanı görselden belirgin şekilde geniş: mobilde parmakla rahat yakalanır.
    const w = this.sprite.width, h = this.sprite.height;
    this.sprite.setInteractive(
      new Phaser.Geom.Rectangle(-34, -30, w + 68, h + 60),
      Phaser.Geom.Rectangle.Contains,
      { useHandCursor: true }
    );
    this.sprite.input.enabled = false;
    this.canli = false;
  }

  kur(x, y, hedefY, deger, zipla) {
    this.x = x; this.y = y;
    this.hedefY = hedefY;
    this.deger = deger;
    this.yasam = BALANCE.simsekYasamSuresiMs;
    this.dustu = false;
    this.vz = zipla ? -210 : 0;      // cihazdan çıkınca hafif yukarı sıçrar
    this.vx = zipla ? (Math.random() * 60 - 30) : 0;
    this.faz = Math.random() * 6.28;
    this.canli = true;

    const s = this.sprite;
    s.setPosition(x, y);
    s.setAlpha(1);
    s.setScale(0.85);
    s.setActive(true).setVisible(true);
    s.input.enabled = true;
    s.setData('ref', this);
    return this;
  }

  oldur() {
    this.canli = false;
    if (this.sprite.input) this.sprite.input.enabled = false;
    this.sprite.setActive(false).setVisible(false);
  }
}
