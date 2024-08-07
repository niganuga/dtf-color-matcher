import React, { useState, useEffect, useRef } from 'react';

interface ImageColorDetectorProps {
  imageUrl: string;
  onColorSelect: (color: { r: number; g: number; b: number }) => void;
}

const ImageColorDetector: React.FC<ImageColorDetectorProps> = ({ imageUrl, onColorSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [magnifierPos, setMagnifierPos] = useState({ x: -1, y: -1 });
  const [selectedPos, setSelectedPos] = useState({ x: -1, y: -1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
    }
  }, [imageUrl]);

  const getColor = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const actualX = Math.floor((x - rect.left) * scaleX);
      const actualY = Math.floor((y - rect.top) * scaleY);
      const imageData = ctx.getImageData(actualX, actualY, 1, 1);
      return {
        r: imageData.data[0],
        g: imageData.data[1],
        b: imageData.data[2]
      };
    }
    return { r: 0, g: 0, b: 0 };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setMagnifierPos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };

  const handleMouseLeave = () => {
    setMagnifierPos({ x: -1, y: -1 });
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const color = getColor(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    onColorSelect(color);
    setSelectedPos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ maxWidth: '100%', height: 'auto', cursor: 'crosshair' }}
      />
      {magnifierPos.x !== -1 && (
        <div
          style={{
            position: 'absolute',
            left: magnifierPos.x + 10,
            top: magnifierPos.y + 10,
            width: '100px',
            height: '100px',
            border: '2px solid white',
            borderRadius: '50%',
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          <canvas
            ref={(el) => {
              if (el) {
                const ctx = el.getContext('2d');
                const mainCanvas = canvasRef.current;
                if (ctx && mainCanvas) {
                  el.width = 100;
                  el.height = 100;
                  ctx.imageSmoothingEnabled = false;
                  ctx.drawImage(
                    mainCanvas,
                    magnifierPos.x - 10, magnifierPos.y - 10, 20, 20,
                    0, 0, 100, 100
                  );
                }
              }
            }}
          />
        </div>
      )}
      {selectedPos.x !== -1 && (
        <div
          style={{
            position: 'absolute',
            left: selectedPos.x - 5,
            top: selectedPos.y - 5,
            width: '10px',
            height: '10px',
            border: '2px solid white',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};

export default ImageColorDetector;