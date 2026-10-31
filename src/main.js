/**
 * main.js — Phaser 4 oyun örneğini kurar.
 * Mobil için: Scale.FIT + CENTER_BOTH, yatay yerleşim, çoklu dokunma açık.
 */
import Phaser from '../vendor/phaser.esm.min.js';
import { DESIGN, SURUM } from './config/GameConfig.js';
import { BootScene } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { SelectScene } from './scenes/SelectScene.js';
import { GameScene } from './scenes/GameScene.js';
import { OverScene } from './scenes/OverScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'oyun',
  backgroundColor: '#1b120b',
  width: DESIGN.width,
  height: DESIGN.height,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DESIGN.width,
    height: DESIGN.height
  },
  render: {
    antialias: true,
    roundPixels: true,
    powerPreference: 'high-performance',
    transparent: false,
    pixelArt: false,
    // Mobilde gereksiz bellek kullanmasın
    clearBeforeRender: true
  },
  input: {
    activePointers: 3,          // çoklu dokunma
    touch: { capture: true }
  },
  fps: { target: 60, forceSetTimeOut: false },
  disableContextMenu: true,
  autoFocus: true,
  scene: [BootScene, PreloadScene, MenuScene, SelectScene, GameScene, OverScene]
};

const oyun = new Phaser.Game(config);

// Sekme arka plana alınınca sesi/çizimi durdur, geri gelince devam et.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) oyun.loop.sleep();
  else oyun.loop.wake();
});

window.AVP_SURUM = SURUM;
export default oyun;
