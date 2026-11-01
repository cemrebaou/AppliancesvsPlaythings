import Phaser from '../../vendor/phaser.esm.min.js';
import { SCENE, K, animYuru } from '../core/Keys.js';
import { DESIGN, SURUM } from '../config/GameConfig.js';
import { TOYS } from '../config/ToyData.js';

/**
 * PreloadScene — tek atlas + tek arka plan yükler (2 istek).
 * Animasyonlar burada bir kez tanımlanır, sahneler arası paylaşılır.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() { super(SCENE.preload); }

  preload() {
    const W = DESIGN.width, H = DESIGN.height;
    this.cameras.main.setBackgroundColor('#1b120b');

    this.add.text(W / 2, H / 2 - 50, 'Appliances vs Playthings', {
      fontFamily: 'Verdana, Arial, sans-serif', fontSize: '34px', color: '#ffd54a'
    }).setOrigin(0.5);

    const bar = this.add.graphics();
    const cerceve = this.add.graphics();
    cerceve.lineStyle(3, 0x9c7a4e, 1).strokeRoundedRect(W / 2 - 200, H / 2 + 10, 400, 26, 8);

    this.load.on('progress', (p) => {
      bar.clear().fillStyle(0xffd54a, 1)
        .fillRoundedRect(W / 2 - 196, H / 2 + 14, 392 * p, 18, 6);
    });

    this.load.setPath('assets/');
    this.load.image(K.bg, 'bg_room.jpg');
    this.load.atlas(K.atlas, 'atlas.webp', 'atlas.json');
  }

  create() {
    for (const t of TOYS) {
      // Orijinal oyuncaklar 5 kare (_0.._4), yeni mobilya düşmanlar 2 kare (_0, _1)
      const kareAdeti = t.kareler || 5;
      const kareler = [];
      for (let i = 0; i < kareAdeti; i++) kareler.push({ key: K.atlas, frame: `${t.id}_${i}` });
      this.anims.create({
        key: animYuru(t.id),
        frames: kareler,
        frameRate: t.fps,
        repeat: -1
      });
    }
    this.scene.start(SCENE.menu);
  }
}
