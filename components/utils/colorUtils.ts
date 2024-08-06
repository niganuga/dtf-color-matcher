// components/utils/colorUtils.ts

// Helper function to convert RGB to XYZ
function rgbToXyz(r: number, g: number, b: number): [number, number, number] {
    r = r / 255;
    g = g / 255;
    b = b / 255;
  
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  
    const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) * 100;
    const y = (r * 0.2126 + g * 0.7152 + b * 0.0722) * 100;
    const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) * 100;
  
    return [x, y, z];
  }
  
  // Helper function to convert XYZ to Lab
  function xyzToLab(x: number, y: number, z: number): [number, number, number] {
    const ref_X = 95.047;
    const ref_Y = 100.000;
    const ref_Z = 108.883;
  
    x = x / ref_X;
    y = y / ref_Y;
    z = z / ref_Z;
  
    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
  
    const L = (116 * y) - 16;
    const a = 500 * (x - y);
    const b = 200 * (y - z);
  
    return [L, a, b];
  }
  
  export function rgbToCIELab(r: number, g: number, b: number): [number, number, number] {
    const [x, y, z] = rgbToXyz(r, g, b);
    return xyzToLab(x, y, z);
  }
  
  // Helper function to convert Lab to XYZ
  function labToXyz(L: number, a: number, b: number): [number, number, number] {
    const ref_X = 95.047;
    const ref_Y = 100.000;
    const ref_Z = 108.883;
  
    let y = (L + 16) / 116;
    let x = a / 500 + y;
    let z = y - b / 200;
  
    const y3 = Math.pow(y, 3);
    const x3 = Math.pow(x, 3);
    const z3 = Math.pow(z, 3);
  
    y = y3 > 0.008856 ? y3 : (y - 16/116) / 7.787;
    x = x3 > 0.008856 ? x3 : (x - 16/116) / 7.787;
    z = z3 > 0.008856 ? z3 : (z - 16/116) / 7.787;
  
    return [x * ref_X, y * ref_Y, z * ref_Z];
  }
  
  // Helper function to convert XYZ to RGB
  function xyzToRgb(x: number, y: number, z: number): [number, number, number] {
    x = x / 100;
    y = y / 100;
    z = z / 100;
  
    let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    let b = x * 0.0557 + y * -0.2040 + z * 1.0570;
  
    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1/2.4) - 0.055 : 12.92 * b;
  
    return [
      Math.max(0, Math.min(255, Math.round(r * 255))),
      Math.max(0, Math.min(255, Math.round(g * 255))),
      Math.max(0, Math.min(255, Math.round(b * 255)))
    ];
  }
  
  export function cieLab2rgb(L: number, a: number, b: number): [number, number, number] {
    const [x, y, z] = labToXyz(L, a, b);
    return xyzToRgb(x, y, z);
  }