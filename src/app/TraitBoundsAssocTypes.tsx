'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import React, { useState, useEffect } from 'react';

const codeLines = [
  'trait Summarize {',
  '    fn summary(&self) -> String;',
  '}',
  '',
  'fn print_summary<T: Summarize>(item: T) {',
  '    println!("{}", item.summary());',
  '}',
  '',
  'trait Iterator {',
  '    type Item;',
  '    fn next(&mut self) -> Option<Self::Item>;',
  '}',
];

const animationScript = [
  { explanation: "Let's see trait bounds and associated types.", codeLineIdx: 0, state: { trait: true, bound: false, assoc: false } },
  { explanation: 'A trait defines required methods.', codeLineIdx: 1, state: { trait: true, bound: false, assoc: false } },
  { explanation: 'A function can require a trait bound.', codeLineIdx: 4, state: { trait: true, bound: true, assoc: false } },
  { explanation: 'Traits can have associated types.', codeLineIdx: 8, state: { trait: true, bound: true, assoc: true } },
];

function TraitBoundsAssocTypes3D({ state }: { state: any }) {
  return (
    <group>
      <Box position={[-4, 2, 0]} args={[2, 1, 1]}>
        <meshStandardMaterial color={state.trait ? '#ffd54f' : '#bdbdbd'} />
        <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">trait</Text>
      </Box>
      {state.bound && (
        <Box position={[0, 2, 0]} args={[2, 1, 1]}>
          <meshStandardMaterial color={'#81c784'} />
          <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">T: Summarize</Text>
        </Box>
      )}
      {state.assoc && (
        <Box position={[4, 2, 0]} args={[2, 1, 1]}>
          <meshStandardMaterial color={'#64b5f6'} />
          <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">type Item</Text>
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

export default function TraitBoundsAssocTypes() {
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
          <TraitBoundsAssocTypes3D state={state} />
          <OrbitControls />
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
            <h2>Trait Bounds & Associated Types</h2>
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