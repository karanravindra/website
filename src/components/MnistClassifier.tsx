import { useState, useRef, useEffect } from 'react';

const GRID_SIZE = 32;
const PIXEL_SIZE = 12;

export default function MnistClassifier() {
  const [grid, setGrid] = useState<number[][]>(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0))
  );
  const [prediction, setPrediction] = useState<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawGrid();
  }, [grid]);

  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pixels
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const value = grid[i][j];
        ctx.fillStyle = `rgb(${255 - value * 255}, ${255 - value * 255}, ${255 - value * 255})`;
        ctx.fillRect(j * PIXEL_SIZE, i * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      }
    }

    // Draw grid lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * PIXEL_SIZE, 0);
      ctx.lineTo(i * PIXEL_SIZE, GRID_SIZE * PIXEL_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * PIXEL_SIZE);
      ctx.lineTo(GRID_SIZE * PIXEL_SIZE, i * PIXEL_SIZE);
      ctx.stroke();
    }
  };

  const setPixel = (x: number, y: number, value: number, brushSize: number = 1) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const pixelX = Math.floor((x - rect.left) / PIXEL_SIZE);
    const pixelY = Math.floor((y - rect.top) / PIXEL_SIZE);

    const newGrid = [...grid];
    let changed = false;

    // Draw with brush size for easier touch drawing
    for (let dy = -Math.floor(brushSize / 2); dy <= Math.floor(brushSize / 2); dy++) {
      for (let dx = -Math.floor(brushSize / 2); dx <= Math.floor(brushSize / 2); dx++) {
        const px = pixelX + dx;
        const py = pixelY + dy;
        if (px >= 0 && px < GRID_SIZE && py >= 0 && py < GRID_SIZE) {
          newGrid[py][px] = value;
          changed = true;
        }
      }
    }

    if (changed) {
      setGrid(newGrid);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setPixel(e.clientX, e.clientY, 1, 2);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      setPixel(e.clientX, e.clientY, 1, 2);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const touch = e.touches[0];
    setPixel(touch.clientX, touch.clientY, 1, 3);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (isDrawing) {
      const touch = e.touches[0];
      setPixel(touch.clientX, touch.clientY, 1, 3);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(false);
  };

  const clearGrid = () => {
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0)));
    setPrediction(null);
  };

  const predict = async () => {
    setIsLoading(true);
    try {
      // Flatten the grid
      const flatGrid = grid.flat();

      // TODO: Replace with your actual HuggingFace model URL
      const response = await fetch(
        'https://api-inference.huggingface.co/models/YOUR_MODEL_NAME',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: flatGrid }),
        }
      );

      const result = await response.json();
      setPrediction(result);
    } catch (error) {
      console.error('Error predicting:', error);
      setPrediction({ error: 'Failed to predict. Please make sure the model URL is configured.' });
    }
    setIsLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * PIXEL_SIZE}
        height={GRID_SIZE * PIXEL_SIZE}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          border: '2px solid #333',
          cursor: 'crosshair',
          touchAction: 'none',
        }}
      />
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={predict}
          disabled={isLoading}
          style={{
            padding: '0.5rem 1rem',
            cursor: isLoading ? 'wait' : 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          {isLoading ? 'Predicting...' : 'Predict'}
        </button>
        <button
          onClick={clearGrid}
          style={{
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Clear
        </button>
      </div>
      {prediction && (
        <div style={{ marginTop: '1rem', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
          <h3>Prediction:</h3>
          <pre style={{
            textAlign: 'left',
            backgroundColor: '#f5f5f5',
            padding: '1rem',
            borderRadius: '4px',
            overflow: 'auto',
            maxWidth: '100%',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {JSON.stringify(prediction, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
