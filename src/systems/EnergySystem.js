/**
 * EnergySystem.js
 * Enerji (şimşek) sayacı + gökten düşen şimşeklerin zamanlaması.
 */
import { BALANCE, DESIGN } from '../config/GameConfig.js';

export class EnergySystem {
  constructor(saha, grid, degisti) {
    this.saha = saha;
    this.grid = grid;
    this.degisti = degisti;
    this.sifirla();
  }

  sifirla() {
    this.enerji = BALANCE.baslangicEnerjisi;
    this.sayac = 4000;
  }

  ekle(n) {
    this.enerji = Math.min(BALANCE.maxEnerji, this.enerji + n);
    this.degisti(this.enerji);
  }

  yeter(n) { return this.enerji >= n; }

  harca(n) {
    if (this.enerji < n) return false;
    this.enerji -= n;
    this.degisti(this.enerji);
    return true;
  }

  guncelle(dt) {
    this.sayac -= dt;
    if (this.sayac > 0) return;
    this.sayac = BALANCE.gokSimsekMinMs +
      Math.random() * (BALANCE.gokSimsekMaxMs - BALANCE.gokSimsekMinMs);

    const row = (Math.random() * this.grid.rows) | 0;
    const col = (Math.random() * this.grid.cols) | 0;
    const p = this.grid.hucreMerkez(row, col);
    const x = p.x + (Math.random() * 40 - 20);
    this.saha.simsekBirak(x, -40, p.y - 10, BALANCE.gokSimsekDeger, false);
  }
}
