export function deltaE2000(lab1: [number, number, number], lab2: [number, number, number]): number {
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;

  const kL = 1, kC = 1, kH = 1;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);

  const barC = (C1 + C2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(barC, 7) / (Math.pow(barC, 7) + Math.pow(25, 7))));

  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;

  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  const h1p = Math.atan2(b1, a1p) * 180 / Math.PI;
  const h2p = Math.atan2(b2, a2p) * 180 / Math.PI;

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp = h2p - h1p;
  if (dhp > 180) dhp -= 360;
  else if (dhp < -180) dhp += 360;

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp * Math.PI / 360);

  const barL = (L1 + L2) / 2;
  const barCp = (C1p + C2p) / 2;

  let barhp = (h1p + h2p) / 2;
  if (Math.abs(h1p - h2p) > 180) {
    if (h1p + h2p < 360) barhp += 180;
    else barhp -= 180;
  }

  const T = 1 - 0.17 * Math.cos((barhp - 30) * Math.PI / 180)
    + 0.24 * Math.cos((2 * barhp) * Math.PI / 180)
    + 0.32 * Math.cos((3 * barhp + 6) * Math.PI / 180)
    - 0.20 * Math.cos((4 * barhp - 63) * Math.PI / 180);

  const SL = 1 + (0.015 * Math.pow(barL - 50, 2)) / Math.sqrt(20 + Math.pow(barL - 50, 2));
  const SC = 1 + 0.045 * barCp;
  const SH = 1 + 0.015 * barCp * T;

  const RT = -2 * Math.sqrt(Math.pow(barCp, 7) / (Math.pow(barCp, 7) + Math.pow(25, 7)))
    * Math.sin((60 * Math.exp(-Math.pow((barhp - 275) / 25, 2))) * Math.PI / 180);

  const dE = Math.sqrt(
    Math.pow(dLp / (kL * SL), 2) +
    Math.pow(dCp / (kC * SC), 2) +
    Math.pow(dHp / (kH * SH), 2) +
    RT * (dCp / (kC * SC)) * (dHp / (kH * SH))
  );

  return dE;
}