'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import React, { useState, useEffect } from 'react';

const codeLines = [
  '// A slice is a view into a block of memory.',
  'let a = [1, 2, 3, 4, 5];',
  '',
  '// Slices have a pointer to the data and a length.',
  'let slice_of_a = &a[1..3];',
  '',
  '// This creates a slice containing [2, 3].',
  '// It does not copy the data.',
];

const animationScript = [
  { explanation: "Let's look at Slices. A slice lets you reference a contiguous sequence of elements in a collection rather than the whole collection.", codeLineIdx: 0, state: {} },
  { explanation: "We start with an array `a` containing 5 elements.", codeLineIdx: 1, state: { array: [1, 2, 3, 4, 5] } },
  { explanation: "We create a slice of `a` from index 1 (inclusive) to 3 (exclusive).", codeLineIdx: 4, state: { array: [1, 2, 3, 4, 5], slice: { start: 1, len: 2 } } },
  { explanation: "The slice itself is a fat pointer: it stores a pointer to the start of the data (`a[1]`) and the length of the slice (2).", codeLineIdx: 4, state: { array: [1, 2, 3, 4, 5], slice: { start: 1, len: 2 } } },
  { explanation: "Slices provide safe, efficient access to a portion of data without copying.", codeLineIdx: 7, state: { array: [1, 2, 3, 4, 5], slice: { start: 1, len: 2 } } },
];

function Slice3D({ state }: { state: any }) {
    return (
        <group>
            {/* Array */}
            {state.array?.map((val: number, i: number) => (
                <Box key={i} position={[-3 + i * 1.5, 0, 0]} args={[1.2, 1.2, 1.2]}>
                    <meshStandardMaterial color="#64b5f6" />
                    <Text position={[0,0,0.7]} fontSize={0.4}>{val}</Text>
                </Box>
            ))}

            {/* Slice view */}
            {state.slice && (
                 <Box args={[state.slice.len * 1.5, 1.4, 1.4]} position={[-3 + (state.slice.start + state.slice.len / 2 - 0.5) * 1.5, 0, 0]}>
                    <meshStandardMaterial color="#81c784" transparent opacity={0.3} />
                </Box>
            )}

             {/* Slice pointer */}
            {state.slice && (
                <group position={[0, -2, 0]}>
                    <Box args={[2, 1, 1]}><meshStandardMaterial color="#e57373"/></Box>
                    <Text position={[0,0,0.6]}>ptr: &a[1], len: 2</Text>
                </group>
            )}
        </group>
    )
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

export default function Slices() {
    const [step, setStep] = useState(0);
    const current = animationScript[step];
    const { codeLineIdx, explanation, state } = current;

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
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Slice3D state={state} />
          <OrbitControls />
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
            <h2>Slices</h2>
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