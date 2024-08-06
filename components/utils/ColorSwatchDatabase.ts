// components/utils/ColorSwatchDatabase.ts

import { deltaE2000 } from './deltaE';

export interface ColorSwatch {
  id: string;
  name: string;
  rgb: [number, number, number];
  lab: [number, number, number];
  cmyk: [number, number, number, number];
  pantone?: string;
  notes?: string;
}

export interface ColorSwatchWithDistance extends ColorSwatch {
    distance: number;
  }
  
  export class ColorSwatchDatabase {
    private swatches: ColorSwatch[] = [];
  
    constructor(swatchData: ColorSwatch[]) {
      this.swatches = swatchData;
    }
  
    addSwatch(swatch: ColorSwatch) {
      this.swatches.push(swatch);
    }
  
    getSwatches(): ColorSwatch[] {
      return this.swatches;
    }
  
    findNearestSwatches(labColor: [number, number, number], count: number = 5): ColorSwatchWithDistance[] {
        return this.swatches
          .map(swatch => ({
            ...swatch,
            distance: deltaE2000(labColor, swatch.lab)
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, count);
      }
  
    private calculateDistance(lab1: [number, number, number], lab2: [number, number, number]): number {
      return Math.sqrt(
        Math.pow(lab1[0] - lab2[0], 2) +
        Math.pow(lab1[1] - lab2[1], 2) +
        Math.pow(lab1[2] - lab2[2], 2)
      );
    }
  
    exportToJSON(): string {
      return JSON.stringify(this.swatches, null, 2);
    }
  
    static importFromJSON(jsonData: string): ColorSwatchDatabase {
      const swatchData = JSON.parse(jsonData) as ColorSwatch[];
      return new ColorSwatchDatabase(swatchData);
    }
  }