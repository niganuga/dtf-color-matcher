// colorUtils.ts

export function rgbToCIELab(r: number, g: number, b: number): [number, number, number] {
  // RGB to XYZ
  r = r / 255;
  g = g / 255;
  b = b / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  let x = r * 0.4124 + g * 0.3576 + b * 0.1805;
  let y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  let z = r * 0.0193 + g * 0.1192 + b * 0.9505;

  // XYZ to Lab
  x = x / 0.95047;
  y = y / 1.00000;
  z = z / 1.08883;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

  const L = (116 * y) - 16;
  const a = 500 * (x - y);
  const b_value = 200 * (y - z);

  return [L, a, b_value];
}

export function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  let c = 1 - (r / 255);
  let m = 1 - (g / 255);
  let y = 1 - (b / 255);
  let k = Math.min(c, m, y);

  if (k === 1) {
    return [0, 0, 0, 100];
  }

  c = ((c - k) / (1 - k)) * 100;
  m = ((m - k) / (1 - k)) * 100;
  y = ((y - k) / (1 - k)) * 100;
  k = k * 100;

  return [c, m, y, k];
}

export function cmykToRgb(c: number, m: number, y: number, k: number): [number, number, number] {
  c /= 100;
  m /= 100;
  y /= 100;
  k /= 100;

  let r = 255 * (1 - c) * (1 - k);
  let g = 255 * (1 - m) * (1 - k);
  let b = 255 * (1 - y) * (1 - k);

  return [Math.round(r), Math.round(g), Math.round(b)];
}

// Add other color utility functions as needed