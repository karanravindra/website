import { useState, useRef, useEffect } from 'react';

const GRID_SIZE = 32;
const PIXEL_SIZE = 12;

export default function MnistDiffusion() {
  const [generatedImage, setGeneratedImage] = useState<number[][]>(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0))
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [steps, setSteps] = useState(50);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [selectedDigit, setSelectedDigit] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawImage();
  }, [generatedImage]);

  const drawImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pixels
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const value = generatedImage[i][j];
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

  const generateImage = async () => {
    setIsGenerating(true);
    try {
      // TODO: Replace with your actual diffusion model endpoint
      const response = await fetch(
        'https://api-inference.huggingface.co/models/YOUR_DIFFUSION_MODEL',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: selectedDigit !== null ? `digit ${selectedDigit}` : 'random digit',
            parameters: {
              num_inference_steps: steps,
              guidance_scale: guidanceScale,
            },
          }),
        }
      );

      // For now, generate a random pattern as placeholder
      // In production, you'd parse the model output
      const newImage = Array(GRID_SIZE).fill(null).map(() =>
        Array(GRID_SIZE).fill(null).map(() => Math.random())
      );
      setGeneratedImage(newImage);
    } catch (error) {
      console.error('Error generating image:', error);
      // Show a placeholder pattern on error
      const errorPattern = Array(GRID_SIZE).fill(null).map((_, i) =>
        Array(GRID_SIZE).fill(null).map((_, j) =>
          (i + j) % 2 === 0 ? 0.5 : 0
        )
      );
      setGeneratedImage(errorPattern);
    }
    setIsGenerating(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * PIXEL_SIZE}
        height={GRID_SIZE * PIXEL_SIZE}
        style={{
          border: '2px solid #333',
        }}
      />

      <div style={{ width: '100%', maxWidth: '400px' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          <strong>Target Digit (optional):</strong>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedDigit(null)}
              style={{
                padding: '0.5rem',
                cursor: 'pointer',
                backgroundColor: selectedDigit === null ? '#007bff' : '#e0e0e0',
                color: selectedDigit === null ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                minWidth: '50px',
              }}
            >
              Random
            </button>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                onClick={() => setSelectedDigit(digit)}
                style={{
                  padding: '0.5rem',
                  cursor: 'pointer',
                  backgroundColor: selectedDigit === digit ? '#007bff' : '#e0e0e0',
                  color: selectedDigit === digit ? 'white' : 'black',
                  border: 'none',
                  borderRadius: '4px',
                  minWidth: '50px',
                }}
              >
                {digit}
              </button>
            ))}
          </div>
        </label>

        <label style={{ display: 'block', marginTop: '1rem' }}>
          <strong>Diffusion Steps:</strong> {steps}
          <br />
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={steps}
            onChange={(e) => setSteps(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
          <small>More steps = better quality, but slower</small>
        </label>

        <label style={{ display: 'block', marginTop: '1rem' }}>
          <strong>Guidance Scale:</strong> {guidanceScale.toFixed(1)}
          <br />
          <input
            type="range"
            min="1"
            max="15"
            step="0.5"
            value={guidanceScale}
            onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
          <small>Higher = closer to target, Lower = more creative</small>
        </label>

        <button
          onClick={generateImage}
          disabled={isGenerating}
          style={{
            padding: '0.5rem 1rem',
            cursor: isGenerating ? 'wait' : 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            marginTop: '1rem',
            width: '100%',
          }}
        >
          {isGenerating ? 'Generating...' : 'Generate Image'}
        </button>
      </div>

      <div style={{ backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '4px', marginTop: '1rem', width: '100%' }}>
        <h4>Understanding Diffusion Parameters</h4>
        <p><strong>Diffusion Steps:</strong></p>
        <ul style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
          <li>The number of denoising iterations</li>
          <li>More steps produce clearer images but take longer</li>
          <li>Typical range: 20-100 steps</li>
        </ul>
        <p><strong>Guidance Scale:</strong></p>
        <ul style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
          <li>Controls how closely the output matches the target digit</li>
          <li>Higher values = more faithful to the target</li>
          <li>Lower values = more diversity and creativity</li>
        </ul>
      </div>
    </div>
  );
}
