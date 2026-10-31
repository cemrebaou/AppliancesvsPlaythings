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

    const refH = this._satirYuksekligi(this.rows - 1);
    for (let r = 0; r < this.rows; r++) {
      this.satirV[r] = (r + GRID.footV) / this.rows;
      this.satirOlcek[r] = this._satirYuksekligi(r) / refH;
      for (let c = 0; c < this.cols; c++) {
        const p = this.nokta((c + 0.5) / this.cols, this.satirV[r]);
        const k = r * this.cols + c;
        this.hucreX[k] = p.x; this.hucreY[k] = p.y;
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

  /** ekran -> {row, col} ya da null */
  hucreBul(x, y) {
    const { u, v } = this.ters(x, y);
    if (u < 0 || u >= 1 || v < 0 || v >= 1) return null;
    return { row: (v * this.rows) | 0, col: (u * this.cols) | 0 };
  }

  /** hücre merkezi (ayak hizası) */
  hucreMerkez(row, col) {
    const k = row * this.cols + col;
    return { x: this.hucreX[k], y: this.hucreY[k] };
  }

  /** şerit içinde u konumundan ekran noktası (düşman ve mermi için) */
  seritNokta(row, u) {
    return this.nokta(u, this.satirV[row]);
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
    const u0 = col / this.cols, u1 = (col + 1) / this.cols;
    const v0 = row / this.rows, v1 = (row + 1) / this.rows;
    const a = this.nokta(u0, v0), b = this.nokta(u1, v0);
    const c = this.nokta(u1, v1), d = this.nokta(u0, v1);
    return [a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y];
  }
}
