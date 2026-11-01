/**
 * Grid.js
 * Arka plandaki perspektif zemini mantıksal (satır, sütun) ızgarasına bağlar.
 *
 * Birim kare (u,v) -> ekran (x,y) dönüşümü 3x3 homografi ile yapılır.
 * 4 köşe GameConfig.GRID.corners içinde; matris burada bir kez çözülür.
 * Her şey önceden hesaplanıp tabloya yazılır — update içinde matris çarpımı yok.
 */

import { GRID } from '../config/GameConfig.js';

/** 8 bilinmeyenli lineer sistemi Gauss eliminasyonu ile çözer. */
function cozGauss(A, b) {
  const n = b.length;
  const M = A.map((r, i) => r.concat([b[i]]));
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    const t = M[c]; M[c] = M[p]; M[p] = t;
    const pv = M[c][c];
    for (let j = c; j <= n; j++) M[c][j] /= pv;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c];
      if (f === 0) continue;
      for (let j = c; j <= n; j++) M[r][j] -= f * M[c][j];
    }
  }
  return M.map(r => r[n]);
}

/** Birim karenin 4 köşesini verilen 4 ekran noktasına eşleyen homografi. */
function homografi(dst) {
  const src = [[0, 0], [1, 0], [0, 1], [1, 1]];
  const pts = [dst.tl, dst.tr, dst.bl, dst.br];
  const A = [], b = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i], X = pts[i].x, Y = pts[i].y;
    A.push([x, y, 1, 0, 0, 0, -x * X, -y * X]); b.push(X);
    A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y]); b.push(Y);
  }
  const h = cozGauss(A, b);
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

function tersMatris3(m) {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  const id = 1 / det;
  return [
    A * id, (c * h - b * i) * id, (b * f - c * e) * id,
    B * id, (a * i - c * g) * id, (c * d - a * f) * id,
    C * id, (b * g - a * h) * id, (a * e - b * d) * id
  ];
}

export class Grid {
  constructor() {
    this.rows = GRID.rows;
    this.cols = GRID.cols;
    this.H = homografi(GRID.corners);
    this.Hi = tersMatris3(this.H);

    // --- Önceden hesaplanan tablolar (sıcak döngüde yeniden hesap yok) ---
    this.satirV = new Float32Array(this.rows);      // şeridin ayak v değeri
    this.satirOlcek = new Float32Array(this.rows);  // perspektif boy çarpanı
    this.hucreX = new Float32Array(this.rows * this.cols);
    this.hucreY = new Float32Array(this.rows * this.cols);
    this.kaydir = new Float32Array(this.rows);       // satır başına yukarı kaydırma (px)

    // Ölçülmüş karolar: sütun merkez çizgisinin eğimi (dx/dy), ilk ve son satırdan
    this.karoTablo = GRID.karolar;
    const K0 = this.karoTablo[0], K5 = this.karoTablo[this.rows - 1];
    const y0 = (K0.ust + K0.alt) / 2, y5 = (K5.ust + K5.alt) / 2;
    this.sutunEgim = (sutun) => ((K5.x0 + sutun * K5.adim) - (K0.x0 + sutun * K0.adim)) / (y5 - y0);

    const refH = this._satirYuksekligi(this.rows - 1);
    for (let r = 0; r < this.rows; r++) {
      this.satirV[r] = (r + GRID.footV) / this.rows;
      this.satirOlcek[r] = this._satirYuksekligi(r) / refH;
      this.kaydir[r] = (GRID.yukari || 0) * this.satirOlcek[r];
      for (let c = 0; c < this.cols; c++) {
        const kr = this.karo(r, c);
        const k = r * this.cols + c;
        this.hucreX[k] = kr.cx; this.hucreY[k] = kr.cy + kr.h * 0.2 - this.kaydir[r];
      }
    }
  }

  _satirYuksekligi(r) {
    const a = this.nokta(0.5, r / this.rows);
    const b = this.nokta(0.5, (r + 1) / this.rows);
    return b.y - a.y;
  }

  /** (u,v) birim kare -> ekran noktası */
  nokta(u, v) {
    const m = this.H;
    const w = m[6] * u + m[7] * v + m[8];
    return { x: (m[0] * u + m[1] * v + m[2]) / w, y: (m[3] * u + m[4] * v + m[5]) / w };
  }

  /** ekran -> (u,v); saha dışıysa u/v 0..1 aralığının dışında döner */
  ters(x, y) {
    const m = this.Hi;
    const w = m[6] * x + m[7] * y + m[8];
    return { u: (m[0] * x + m[1] * y + m[2]) / w, v: (m[3] * x + m[4] * y + m[5]) / w };
  }

  /** Ölçülmüş karo: { cx, cy, ust, alt, w, h } */
  karo(row, col) {
    const t = this.karoTablo[row];
    return {
      cx: t.x0 + col * t.adim, cy: (t.ust + t.alt) / 2,
      ust: t.ust, alt: t.alt, w: t.gen, h: t.alt - t.ust
    };
  }

  /** ekran -> {row, col} ya da null (ölçülmüş karolara göre) */
  hucreBul(x, y) {
    const T = this.karoTablo, n = this.rows;
    let row = -1;
    for (let r = 0; r < n; r++) {
      const ust = r === 0 ? T[0].ust - 12 : (T[r - 1].alt + T[r].ust) / 2;
      const alt = r === n - 1 ? T[r].alt + 12 : (T[r].alt + T[r + 1].ust) / 2;
      if (y >= ust && y < alt) { row = r; break; }
    }
    if (row < 0) return null;
    const t = T[row], cy = (t.ust + t.alt) / 2;
    let col = -1, enIyi = 1e9;
    for (let c = 0; c < this.cols; c++) {
      const cx = t.x0 + c * t.adim + this.sutunEgim(c) * (y - cy);
      const d = Math.abs(x - cx);
      if (d < enIyi) { enIyi = d; col = c; }
    }
    if (enIyi > t.adim * 0.55) return null;
    return { row, col };
  }

  /** hücre merkezi (ayak hizası) */
  hucreMerkez(row, col) {
    const k = row * this.cols + col;
    return { x: this.hucreX[k], y: this.hucreY[k] };
  }

  /** şerit içinde u konumundan ekran noktası (düşman ve mermi için) */
  seritNokta(row, u) {
    const p = this.nokta(u, this.satirV[row]);
    p.y -= this.kaydir[row];
    return p;
  }

  /** sütun merkezinin u değeri */
  sutunU(col) { return (col + 0.5) / this.cols; }

  /** u -> en yakın sütun indeksi */
  uSutun(u) {
    const c = (u * this.cols) | 0;
    return c < 0 ? 0 : (c >= this.cols ? this.cols - 1 : c);
  }

  olcek(row) { return this.satirOlcek[row]; }

  /** hücrenin 4 köşesi (seçim vurgusu çizmek için) */
  hucreKoseleri(row, col) {
    const k = this.karo(row, col), hw = k.w / 2;
    const sL = this.sutunEgim(col - 0.5), sR = this.sutunEgim(col + 0.5);
    const ut = k.ust - k.cy, al = k.alt - k.cy;
    return [
      k.cx - hw + sL * ut, k.ust,
      k.cx + hw + sR * ut, k.ust,
      k.cx + hw + sR * al, k.alt,
      k.cx - hw + sL * al, k.alt
    ];
  }
}
