import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { rgbToCIELab, cieLab2rgb } from './utils/colorUtils';
import { deltaE2000 } from './utils/deltaE';

const ripSoftwarePresets = {
  'dtfrip': { name: 'DTFRIP', profile: 'sRGB', whiteInkAdjustment: 1.1 },
  'dtgrip': { name: 'DTGRIP', profile: 'AdobeRGB', whiteInkAdjustment: 1.2 },
  'uvrip': { name: 'UVRIP', profile: 'sRGB', whiteInkAdjustment: 1.0 },
  'transferrip': { name: 'TRANSFERRIP', profile: 'sRGB', whiteInkAdjustment: 1.15 },
  'acrorip': { name: 'ACRORIP', profile: 'AdobeRGB', whiteInkAdjustment: 1.05 },
  'cadlink': { name: 'CADLINK', profile: 'sRGB', whiteInkAdjustment: 1.1 },
  'prorip': { name: 'PRORIP', profile: 'AdobeRGB', whiteInkAdjustment: 1.15 },
  'flexi': { name: 'FLEXI', profile: 'sRGB', whiteInkAdjustment: 1.2 },
  'other': { name: 'Other / Custom', profile: 'Custom', whiteInkAdjustment: 1.0 },
};

const designSoftwarePresets = {
  'photoshop': { name: 'Adobe Photoshop', colorSpace: 'AdobeRGB' },
  'illustrator': { name: 'Adobe Illustrator', colorSpace: 'AdobeRGB' },
  'corel': { name: 'CorelDRAW', colorSpace: 'sRGB' },
  'gimp': { name: 'GIMP', colorSpace: 'sRGB' },
  'other': { name: 'Other / Custom', colorSpace: 'Custom' },
};

interface ColorSwatch {
  name: string;
  hex: string;
  rgb: [number, number, number];
  cmyk: [number, number, number, number];
  count: number;
  percentage: number;
}

const ColorMatcher: React.FC = () => {
  const [rgb, setRgb] = useState({ r: 255, g: 0, b: 0 });
  const [cmyk, setCmyk] = useState({ c: 0, m: 100, y: 100, k: 0 });
  const [ripSoftware, setRipSoftware] = useState('dtfrip');
  const [designSoftware, setDesignSoftware] = useState('photoshop');
  const [colorName, setColorName] = useState('');
  const [calibrationFactor, setCalibrationFactor] = useState(0);
  const [customProfile, setCustomProfile] = useState<string | null>(null);
  const [customSettings, setCustomSettings] = useState('');
  const [colorSwatches, setColorSwatches] = useState<ColorSwatch[]>([]);
  const [nearestSwatches, setNearestSwatches] = useState<ColorSwatch[]>([]);

  const rgbToCmyk = (r: number, g: number, b: number): [number, number, number, number] => {
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
  };

  const cmykToRgb = (c: number, m: number, y: number, k: number): [number, number, number] => {
    c /= 100;
    m /= 100;
    y /= 100;
    k /= 100;

    let r = 255 * (1 - c) * (1 - k);
    let g = 255 * (1 - m) * (1 - k);
    let b = 255 * (1 - y) * (1 - k);

    return [Math.round(r), Math.round(g), Math.round(b)];
  };

  useEffect(() => {
    const loadColorSwatches = async () => {
      try {
        const response = await fetch('/data/color_swatches.json');
        const data = await response.json();
        console.log('Loaded color swatches:', data.slice(0, 5));
        setColorSwatches(data);
      } catch (error) {
        console.error('Failed to load color swatch database:', error);
      }
    };
    loadColorSwatches();
  }, []);

  const findNearestSwatches = useCallback(() => {
    if (colorSwatches.length === 0) return;

    const labColor = rgbToCIELab(rgb.r, rgb.g, rgb.b);
    const swatchesWithDistance = colorSwatches.map(swatch => ({
      ...swatch,
      distance: deltaE2000(labColor, rgbToCIELab(swatch.rgb[0], swatch.rgb[1], swatch.rgb[2]))
    }));

    const sortedSwatches = swatchesWithDistance.sort((a, b) => a.distance - b.distance);
    setNearestSwatches(sortedSwatches.slice(0, 5));
    setColorName(sortedSwatches[0].name);
  }, [rgb, colorSwatches]);

  useEffect(() => {
    findNearestSwatches();
  }, [rgb, findNearestSwatches]);

  useEffect(() => {
    const [c, m, y, k] = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    setCmyk({ c, m, y, k });
  }, [rgb]);

  const handleRgbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue = Math.max(0, Math.min(255, parseInt(value) || 0));
    setRgb(prev => ({ ...prev, [name]: newValue }));
  };

  const handleCmykChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newCmyk = { ...cmyk, [name]: Math.max(0, Math.min(100, parseFloat(value) || 0)) };
    setCmyk(newCmyk);
    const [r, g, b] = cmykToRgb(newCmyk.c, newCmyk.m, newCmyk.y, newCmyk.k);
    setRgb({ r, g, b });
  };

  const handleCalibrationChange = (value: number[]) => {
    setCalibrationFactor(value[0]);
    applyCalibration(value[0]);
  };

  const applyCalibration = (factor: number) => {
    setRgb(prev => ({
      r: Math.max(0, Math.min(255, prev.r + factor)),
      g: Math.max(0, Math.min(255, prev.g + factor)),
      b: Math.max(0, Math.min(255, prev.b + factor))
    }));
  };

  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomProfile(file.name);
    }
  };

  const handleCustomSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomSettings(e.target.value);
  };

  const handleConvert = () => {
    console.log('Converting with', ripSoftware, 'and', designSoftware);
    console.log('Custom settings:', customSettings);
    console.log('Calibration factor:', calibrationFactor);
    console.log('Custom profile:', customProfile);
    console.log('Final RGB:', rgb);
    console.log('Final CMYK:', cmyk);
    console.log('Final Color Name:', colorName);
    // Here you would implement the actual color conversion logic
    // based on the selected software profiles and settings
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-gray-50 border-b text-center py-6">
        <h2 className="text-2xl font-montserrat font-bold">
          DTF <span className="text-red-500">R</span><span className="text-green-500">G</span><span className="text-blue-500">B</span> to 
          <span className="text-cyan-500"> C</span><span className="text-magenta-500">M</span><span className="text-yellow-500">Y</span><span className="text-black">K</span> COLOR MATCH TOOL
        </h2>
        <p className="text-sm text-gray-500 mt-1">by transfer superstars</p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <Label htmlFor="ripSoftware" className="block text-sm font-medium text-gray-700 mb-1">RIP Software</Label>
          <Select value={ripSoftware} onValueChange={setRipSoftware}>
            <SelectTrigger id="ripSoftware" className="w-full bg-white border border-gray-300 rounded-md shadow-sm">
              <SelectValue placeholder="Select RIP software" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
              {Object.entries(ripSoftwarePresets).map(([key, { name }]) => (
                <SelectItem key={key} value={key} className="hover:bg-gray-100">{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="designSoftware" className="block text-sm font-medium text-gray-700 mb-1">Design Software</Label>
          <Select value={designSoftware} onValueChange={setDesignSoftware}>
            <SelectTrigger id="designSoftware" className="w-full bg-white border border-gray-300 rounded-md shadow-sm">
              <SelectValue placeholder="Select design software" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
              {Object.entries(designSoftwarePresets).map(([key, { name }]) => (
                <SelectItem key={key} value={key} className="hover:bg-gray-100">{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(ripSoftware === 'other' || designSoftware === 'other') && (
          <div>
            <Label htmlFor="customSettings" className="block text-sm font-medium text-gray-700 mb-1">Custom Color Settings</Label>
            <Input
              id="customSettings"
              placeholder="Enter custom color settings (e.g., +5R -2G +1B)"
              value={customSettings}
              onChange={handleCustomSettingsChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">Color Calibration</Label>
          <Slider
            defaultValue={[0]}
            max={50}
            min={-50}
            step={1}
            onValueChange={handleCalibrationChange}
            className="w-full"
            style={{
              '--slider-bg': '#E5E7EB',
              '--slider-track': '#4B5563',
              '--slider-range': '#3B82F6',
              '--slider-thumb': '#2563EB',
              '--slider-thumb-focus': '#1D4ED8',
            } as React.CSSProperties}
          />
          <div className="text-sm text-center mt-1 text-gray-600">
            Adjustment: {calibrationFactor > 0 ? '+' : ''}{calibrationFactor}
          </div>
        </div>

        <div>
          <Label htmlFor="customProfile" className="block text-sm font-medium text-gray-700 mb-1">Upload Custom ICC Profile</Label>
          <Input 
            id="customProfile" 
            type="file" 
            accept=".icc,.icm" 
            onChange={handleProfileUpload}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {customProfile && <p className="text-sm mt-1 text-gray-600">Loaded profile: {customProfile}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {['r', 'g', 'b'].map(color => (
            <div key={color}>
              <Label htmlFor={color} className="block text-sm font-medium text-gray-700 mb-1">{color.toUpperCase()}</Label>
              <Input
                type="number"
                id={color}
                name={color}
                value={rgb[color as keyof typeof rgb]}
                onChange={handleRgbChange}
                min="0"
                max="255"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}
        </div>

        <div className="relative h-20 rounded-lg overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-gray-200"></div>
          <div 
            className="absolute inset-0" 
            style={{ backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }}
          ></div>
        </div>

        <div className="text-center font-semibold text-lg text-gray-800">{colorName}</div>

        <div className="grid grid-cols-4 gap-4">
          {['c', 'm', 'y', 'k'].map(color => (
            <div key={color}>
              <Label htmlFor={color} className="block text-sm font-medium text-gray-700 mb-1">{color.toUpperCase()}</Label>
              <Input
                type="number"
                id={color}
                name={color}
                value={cmyk[color as keyof typeof cmyk].toFixed(2)}
                onChange={handleCmykChange}
                min="0"
                max="100"
                step="0.01"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}
        </div>

        {nearestSwatches.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Nearest Color Swatches:</h3>
            {nearestSwatches.map((swatch, index) => (
              <div key={index} className="flex items-center mb-2">
                <div 
                  className="w-8 h-8 mr-2 border border-gray-300" 
                  style={{ backgroundColor: `rgb(${swatch.rgb[0]}, ${swatch.rgb[1]}, ${swatch.rgb[2]})` }}
                ></div>
                <span>
                  {swatch.name} (RGB: {swatch.rgb.join(', ')}, CMYK: {swatch.cmyk.map(v => v.toFixed(2)).join(', ')})
                </span>
              </div>
            ))}
          </div>
        )}

        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out" 
          onClick={handleConvert}
        >
          Convert and Apply Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default ColorMatcher;