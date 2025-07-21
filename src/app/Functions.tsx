'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Text, Box } from '@react-three/drei';
import React, { useState, useEffect } from 'react';

const codeLines = [
  '// Function definition',
  'fn add(a: i32, b: i32) -> i32 {',
  '    a + b',
  '}',
  'let sum = add(2, 3);',
  'println!("sum = {}", sum);',
];

const animationScript = [
  { explanation: 'Let’s learn about functions in Rust. A function is a block of code that performs a specific task.', codeLineIdx: 0, fn: null, highlight: 0 },
  { explanation: 'This is a function definition: add(a, b) returns a + b.', codeLineIdx: 1, fn: null, highlight: 1 },
  { explanation: 'We call add(2, 3) and assign the result to sum.', codeLineIdx: 4, fn: { a: 2, b: 3, result: 5 }, highlight: 4 },
  { explanation: 'sum is now 5.', codeLineIdx: 5, fn: { a: 2, b: 3, result: 5 }, highlight: 5 },
];

function Function3D({ a, b, result }: { a: number; b: number; result: number }) {
  return (
    <group position={[0, 0, 0]}>
      <Box args={[1.2, 1.2, 1.2]} position={[-1.5, 0.7, 0]}><meshStandardMaterial color="#64b5f6" /></Box>
      <Text position={[-1.5, 1.5, 0.7]} fontSize={0.18} color="#fff">a: {a}</Text>
      <Box args={[1.2, 1.2, 1.2]} position={[1.5, 0.7, 0]}><meshStandardMaterial color="#64b5f6" /></Box>
      <Text position={[1.5, 1.5, 0.7]} fontSize={0.18} color="#fff">b: {b}</Text>
      <Text position={[0, -0.7, 0.7]} fontSize={0.22} color="#ffd54f">result: {result}</Text>
      <Text position={[0, 1.7, 0.7]} fontSize={0.22} color="#fff">add(a, b)</Text>
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

export default function Functions() {
  const [step, setStep] = useState(0);
  const current = animationScript[step];
  const { codeLineIdx, explanation, fn } = current;

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
          {fn && <Function3D a={fn.a} b={fn.b} result={fn.result} />}
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={15}/>
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
          <h2>Rust Functions</h2>
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