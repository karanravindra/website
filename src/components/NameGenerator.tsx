import { useState } from 'react';

export default function NameGenerator() {
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const [temperature, setTemperature] = useState(1.0);
  const [numNames, setNumNames] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [maxLength, setMaxLength] = useState(10);

  const generateNames = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with your actual model endpoint
      const response = await fetch(
        'https://api-inference.huggingface.co/models/YOUR_NAME_GENERATOR_MODEL',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: '',
            parameters: {
              max_length: maxLength,
              temperature: temperature,
              num_return_sequences: numNames,
            },
          }),
        }
      );

      const result = await response.json();

      if (Array.isArray(result)) {
        setGeneratedNames(result.map((item: any) => item.generated_text || item));
      } else {
        setGeneratedNames(['Model not configured yet. Add your HuggingFace model URL.']);
      }
    } catch (error) {
      console.error('Error generating names:', error);
      setGeneratedNames(['Error generating names. Please configure the model endpoint.']);
    }
    setIsLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label>
          <strong>Temperature:</strong> {temperature.toFixed(2)}
          <br />
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
          <small>Lower = more predictable, Higher = more creative</small>
        </label>

        <label>
          <strong>Number of Names:</strong> {numNames}
          <br />
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={numNames}
            onChange={(e) => setNumNames(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </label>

        <label>
          <strong>Max Length:</strong> {maxLength}
          <br />
          <input
            type="range"
            min="5"
            max="20"
            step="1"
            value={maxLength}
            onChange={(e) => setMaxLength(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </label>

        <button
          onClick={generateNames}
          disabled={isLoading}
          style={{
            padding: '0.5rem 1rem',
            cursor: isLoading ? 'wait' : 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            marginTop: '0.5rem',
          }}
        >
          {isLoading ? 'Generating...' : 'Generate Names'}
        </button>
      </div>

      {generatedNames.length > 0 && (
        <div>
          <h3>Generated Names:</h3>
          <ul style={{ lineHeight: '1.8' }}>
            {generatedNames.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
        <h4>Understanding the Parameters</h4>
        <p><strong>Temperature</strong> controls randomness:</p>
        <ul>
          <li>Low (0.1-0.5): More conservative, common patterns</li>
          <li>Medium (0.5-1.0): Balanced creativity</li>
          <li>High (1.0-2.0): More unusual, creative outputs</li>
        </ul>
        <p>
          This is a key parameter in GPT-style models that affects how the model samples from its
          probability distribution. Lower temperatures make the model more confident in its top choices,
          while higher temperatures make it consider a wider range of possibilities.
        </p>
      </div>
    </div>
  );
}
