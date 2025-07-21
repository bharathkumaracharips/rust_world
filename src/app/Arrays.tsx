'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Text, Box } from '@react-three/drei';
import React, { useState, useEffect } from 'react';

const codeLines = [
  '// Arrays have a fixed length and elements of the same type.',
  'let arr: [i32; 5] = [10, 20, 30, 40, 50];',
  '',
  '// Accessing elements by index (starts at 0)',
  'let first = arr[0]; // 10',
  'let second = arr[1]; // 20',
  '',
  '// Slicing an array',
  'let slice = &arr[1..3]; // &[20, 30]',
  '',
  '// Arrays are stored on the stack.',
  '// Accessing an index out of bounds will cause a panic.',
  '// let wrong = arr[5]; // This would panic!',
];

const animationScript = [
  { explanation: "Let's explore Rust's arrays. Arrays have a fixed size and all elements must have the same type.", codeLineIdx: 0, highlightIndex: null, slice: null },
  { explanation: 'Here, we declare an array of 5 integers. Its type is `[i32; 5]`.', codeLineIdx: 1, highlightIndex: null, slice: null },
  { explanation: 'Elements are accessed by their index, starting from 0. `arr[0]` gives us the first element.', codeLineIdx: 4, highlightIndex: 0, slice: null },
  { explanation: '`arr[1]` gives us the second element.', codeLineIdx: 5, highlightIndex: 1, slice: null },
  { explanation: "You can create a 'slice' to get a view into a portion of the array without copying.", codeLineIdx: 8, highlightIndex: null, slice: { start: 1, end: 3 } },
  { explanation: "Arrays are allocated on the stack. Accessing an out-of-bounds index causes a panic at runtime.", codeLineIdx: 12, highlightIndex: null, slice: null },
];

function Array3D({ elements, highlightIndex, slice }: { elements: number[], highlightIndex: number | null, slice: { start: number, end: number } | null }) {
  return (
    <group>
      {elements.map((el, i) => (
        <group key={i} position={[-2.5 + i * 1.25, 0, 0]}>
          <Box args={[1, 1, 1]}>
            <meshStandardMaterial color={highlightIndex === i ? '#ffd54f' : '#64b5f6'} />
          </Box>
          <Text position={[0, 0, 0.6]} fontSize={0.3} color="#333">{el}</Text>
          <Text position={[0, -0.7, 0]} fontSize={0.2} color="#fff">[{i}]</Text>
        </group>
      ))}
      {slice && (
        <Box args={[(slice.end - slice.start) * 1.25, 1.2, 1.2]} position={[-2.5 + (slice.start + (slice.end - slice.start) / 2 - 0.5) * 1.25, 0, 0]}>
          <meshStandardMaterial color="#81c784" transparent opacity={0.3} />
        </Box>
      )}
    </group>
  );
}

function Controls({ step, totalSteps, onPrev, onNext, onReset }: { step: number; totalSteps: number; onPrev: () => void; onNext: () => void; onReset: () => void }) {
  const progress = totalSteps > 1 ? (step / (totalSteps - 1)) * 100 : 0;
  return (
    <div className="controls-container">
      <div className="progress-bar-background">
        <div className="progress-bar-foreground" style={{ width: `${progress}%` }} />
      </div>
      <div className="buttons">
        <button onClick={onReset} title="Reset (Home)">↩️ Reset</button>
        <button onClick={onPrev} disabled={step === 0} title="Previous (←)">‹ Prev</button>
        <button onClick={onNext} disabled={step === animationScript.length - 1} title="Next (→)">Next ›</button>
      </div>
    </div>
  );
}

export default function Arrays() {
  const [step, setStep] = useState(0);
  const current = animationScript[step];
  const { codeLineIdx, explanation, highlightIndex, slice } = current;

  const changeStep = (newStep: number) => setStep(newStep);
  const handleNext = () => step < animationScript.length - 1 && changeStep(step + 1);
  const handlePrev = () => step > 0 && changeStep(step - 1);
  const handleReset = () => changeStep(0);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Home') handleReset();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [step]);

  return (
    <>
      <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #232526 0%, #414345 100%)' }}>
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }} shadows>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.2} />
          <directionalLight position={[-10, 10, 5]} intensity={1} />
          <Array3D elements={[10, 20, 30, 40, 50]} highlightIndex={highlightIndex} slice={slice} />
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={20}/>
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
          <h2>Data Structures: Array</h2>
          <div className="code-container" style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 16, fontFamily: 'Fira Code, monospace', fontSize: 15, lineHeight: 1.6 }}>
            {codeLines.map((line, idx) => (
              <div key={idx} className={`code-line ${idx === codeLineIdx ? 'line-active' : ''}`} style={{ display: 'flex', padding: '2px 8px', borderRadius: 4, background: idx === codeLineIdx ? 'rgba(98, 179, 246, 0.2)' : 'transparent' }}>
                <span className="line-number" style={{ width: '2em', textAlign: 'right', marginRight: 16, color: '#cccccc', opacity: 0.6 }}>{idx + 1}</span>
                <code>{line}</code>
              </div>
            ))}
          </div>
          <h2 style={{ margin: '24px 0 8px' }}>Explanation</h2>
          <div className="explanation-text" style={{ fontSize: 18, color: '#f0f0f0', minHeight: 80, lineHeight: 1.5 }}>{explanation}</div>
        </div>
        <Controls
          step={step}
          totalSteps={animationScript.length}
          onPrev={handlePrev}
          onNext={handleNext}
          onReset={handleReset}
        />
      </div>
    </>
  );
} 