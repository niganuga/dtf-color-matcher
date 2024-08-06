// components/utils/deltaE.ts

function rad2deg(rad: number): number {
    return 360 * rad / (2 * Math.PI);
  }
  
  function deg2rad(deg: number): number {
    return (2 * Math.PI * deg) / 360;
  }
  
  export function deltaE2000(lab1: [number, number, number], lab2: [number, number, number]): number {
    const [L1, a1, b1] = lab1;
    const [L2, a2, b2] = lab2;
  
    const kL = 1, kC = 1, kH = 1;
  
    const C1 = Math.sqrt(Math.pow(a1, 2) + Math.pow(b1, 2));
    const C2 = Math.sqrt(Math.pow(a2, 2) + Math.pow(b2, 2));
    const Cb = (C1 + C2) / 2;
  
    const G = 0.5 * (1 - Math.sqrt(Math.pow(Cb, 7) / (Math.pow(Cb, 7) + Math.pow(25, 7))));
    const a1p = (1 + G) * a1;
    const a2p = (1 + G) * a2;
  
    const C1p = Math.sqrt(Math.pow(a1p, 2) + Math.pow(b1, 2));
    const C2p = Math.sqrt(Math.pow(a2p, 2) + Math.pow(b2, 2));
  
    const h1p = rad2deg(Math.atan2(b1, a1p));
    const h2p = rad2deg(Math.atan2(b2, a2p));
  
    const dLp = L2 - L1;
    const dCp = C2p - C1p;
    
    let dhp: number;
    if (C1p * C2p === 0) {
      dhp = 0;
    } else if (Math.abs(h2p - h1p) <= 180) {
      dhp = h2p - h1p;
    } else if (h2p - h1p > 180) {
      dhp = h2p - h1p - 360;
    } else {
      dhp = h2p - h1p + 360;
    }
  
    const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(deg2rad(dhp) / 2);
  
    const Lbp = (L1 + L2) / 2;
    const Cbp = (C1p + C2p) / 2;
  
    let hbp: number;
    if (C1p * C2p === 0) {
      hbp = h1p + h2p;
    } else if (Math.abs(h1p - h2p) <= 180) {
      hbp = (h1p + h2p) / 2;
    } else if (h1p + h2p < 360) {
      hbp = (h1p + h2p + 360) / 2;
    } else {
      hbp = (h1p + h2p - 360) / 2;
    }
  
    const T = 1 - 0.17 * Math.cos(deg2rad(hbp - 30)) + 0.24 * Math.cos(deg2rad(2 * hbp)) +
      0.32 * Math.cos(deg2rad(3 * hbp + 6)) - 0.20 * Math.cos(deg2rad(4 * hbp - 63));
  
    const dTheta = 30 * Math.exp(-Math.pow((hbp - 275) / 25, 2));
  
    const RC = 2 * Math.sqrt(Math.pow(Cbp, 7) / (Math.pow(Cbp, 7) + Math.pow(25, 7)));
    const SL = 1 + ((0.015 * Math.pow(Lbp - 50, 2)) / Math.sqrt(20 + Math.pow(Lbp - 50, 2)));
    const SC = 1 + 0.045 * Cbp;
    const SH = 1 + 0.015 * Cbp * T;
    const RT = -Math.sin(deg2rad(2 * dTheta)) * RC;
  
    const dE = Math.sqrt(
      Math.pow(dLp / (SL * kL), 2) +
      Math.pow(dCp / (SC * kC), 2) +
      Math.pow(dHp / (SH * kH), 2) +
      RT * (dCp / (SC * kC)) * (dHp / (SH * kH))
    );
  
    return dE;
  }