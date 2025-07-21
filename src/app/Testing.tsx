'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import React, { useState, useEffect } from 'react';

const codeLines = [
  '// src/lib.rs',
  'pub fn add(a: i32, b: i32) -> i32 { a + b }',
  '',
  '#[cfg(test)]',
  'mod tests {',
  '    use super::*;',
  '    #[test]',
  '    fn test_add() {',
  '        assert_eq!(add(2, 3), 5);',
  '    }',
  '}',
];

const animationScript = [
  { explanation: "Let's see how Rust testing works.", codeLineIdx: 0, state: { lib: true, testmod: false, testfn: false, assert: false } },
  { explanation: 'Tests are placed in a #[cfg(test)] mod.', codeLineIdx: 3, state: { lib: true, testmod: true, testfn: false, assert: false } },
  { explanation: 'Each test is a function marked #[test].', codeLineIdx: 6, state: { lib: true, testmod: true, testfn: true, assert: false } },
  { explanation: 'Assertions check expected results.', codeLineIdx: 8, state: { lib: true, testmod: true, testfn: true, assert: true } },
];

function Testing3D({ state }: { state: any }) {
  return (
    <group>
      <Box position={[-4, 2, 0]} args={[2, 1, 1]}>
        <meshStandardMaterial color={state.lib ? '#ffd54f' : '#bdbdbd'} />
        <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">lib.rs</Text>
      </Box>
      {state.testmod && (
        <Box position={[-1, 2, 0]} args={[2, 1, 1]}>
          <meshStandardMaterial color={'#81c784'} />
          <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">mod tests</Text>
        </Box>
      )}
      {state.testfn && (
        <Box position={[2, 2, 0]} args={[2, 1, 1]}>
          <meshStandardMaterial color={'#64b5f6'} />
          <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">#[test]</Text>
        </Box>
      )}
      {state.assert && (
        <Text position={[2, 0.7, 0]} fontSize={0.18} color="#e57373">assert_eq!(add(2, 3), 5)</Text>
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

export default function Testing() {
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
          <Testing3D state={state} />
          <OrbitControls />
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
            <h2>Testing in Rust</h2>
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