'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Line } from '@react-three/drei';
import React, { useState, useEffect } from 'react';

const codeLines = [
  'use std::sync::atomic::{AtomicUsize, Ordering};',
  '',
  'let a = AtomicUsize::new(0);',
  'let b = AtomicUsize::new(0);',
  '',
  'a.store(1, Ordering::Relaxed);',
  'b.store(1, Ordering::Relaxed);',
  '',
  '// Memory barrier',
  'a.store(2, Ordering::SeqCst);',
  '',
  'let x = a.load(Ordering::SeqCst);',
  'let y = b.load(Ordering::SeqCst);',
];

const animationScript = [
  { explanation: "Let's see why memory barriers are needed.", codeLineIdx: 0, state: { a: 0, b: 0, barrier: false } },
  { explanation: 'Store values with relaxed ordering.', codeLineIdx: 5, state: { a: 1, b: 1, barrier: false } },
  { explanation: 'A memory barrier (SeqCst) enforces order.', codeLineIdx: 9, state: { a: 2, b: 1, barrier: true } },
  { explanation: 'Loads with SeqCst see the latest values.', codeLineIdx: 11, state: { a: 2, b: 1, barrier: true } },
];

function MemoryBarriers3D({ state }: { state: any }) {
  return (
    <group>
      <Box position={[-4, 2, 0]} args={[2, 1, 1]}>
        <meshStandardMaterial color={'#ffd54f'} />
        <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">Atomic a</Text>
      </Box>
      <Text position={[-4, 0.7, 0]} fontSize={0.18} color="#81c784">{state.a}</Text>
      <Box position={[-1, 2, 0]} args={[2, 1, 1]}>
        <meshStandardMaterial color={'#b39ddb'} />
        <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">Atomic b</Text>
      </Box>
      <Text position={[-1, 0.7, 0]} fontSize={0.18} color="#81c784">{state.b}</Text>
      {state.barrier && (
        <Line points={[[-4,2,0],[1,2,0]]} color="#e57373" lineWidth={3} />
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

export default function MemoryBarriers() {
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
          <MemoryBarriers3D state={state} />
          <OrbitControls />
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
            <h2>Memory Barriers</h2>
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