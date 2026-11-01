import Phaser from '../../vendor/phaser.esm.min.js';
import { SCENE } from '../core/Keys.js';

/** BootScene — hiçbir şey yüklemez, sadece yükleme ekranını başlatır. */
export class BootScene extends Phaser.Scene {
  constructor() { super(SCENE.boot); }

  create() {
    this.scene.start(SCENE.preload);
  }
}
