'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import React, { useState, useEffect } from 'react';

const codeLines = [
  '// src/lib.rs',
  'pub mod math {',
  '    pub mod geometry {',
  '        pub fn area() {}',
  '    }',
  '    pub fn add() {}',
  '}',
  '',
  'use crate::math::geometry;',
  'use self::math::add;',
  'use super::math;',
];

const animationScript = [
  { explanation: "Let's see how Rust organizes code with modules and namespacing.", codeLineIdx: 0, state: { lib: true, math: false, geometry: false } },
  { explanation: 'A module can contain submodules. Here, math has geometry.', codeLineIdx: 2, state: { lib: true, math: true, geometry: true } },
  { explanation: 'pub makes items visible outside the module.', codeLineIdx: 2, state: { lib: true, math: true, geometry: true, pub: true } },
  { explanation: 'use brings items into scope. crate::, self::, super:: control the path.', codeLineIdx: 8, state: { lib: true, math: true, geometry: true, pub: true, use: true } },
];

function CodeOrg3D({ state }: { state: any }) {
  return (
    <group>
      {/* Modules and submodules */}
      <Box position={[-4, 2, 0]} args={[2, 1, 1]}>
        <meshStandardMaterial color={state.lib ? '#ffd54f' : '#bdbdbd'} />
        <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">lib.rs</Text>
      </Box>
      <Box position={[-1, 2, 0]} args={[2, 1, 1]}>
        <meshStandardMaterial color={state.math ? '#81c784' : '#bdbdbd'} />
        <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">math</Text>
      </Box>
      <Box position={[2, 2, 0]} args={[2, 1, 1]}>
        <meshStandardMaterial color={state.geometry ? '#64b5f6' : '#bdbdbd'} />
        <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">geometry</Text>
      </Box>
      {/* Highlights for pub/use */}
      {state.pub && (
        <Text position={[0.5, 0.7, 0]} fontSize={0.18} color="#fbc02d">pub</Text>
      )}
      {state.use && (
        <Text position={[0.5, -0.7, 0]} fontSize={0.18} color="#64b5f6">use crate::math::geometry</Text>
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

export default function CodeOrganization() {
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
          <CodeOrg3D state={state} />
          <OrbitControls />
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
            <h2>Code Organization & Namespacing</h2>
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