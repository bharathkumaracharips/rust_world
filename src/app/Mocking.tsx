'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import React, { useState, useEffect } from 'react';

const codeLines = [
  '// Trait for dependency',
  'trait Greeter {',
  '    fn greet(&self) -> String;',
  '}',
  '',
  '// Real implementation',
  'struct RealGreeter;',
  'impl Greeter for RealGreeter {',
  '    fn greet(&self) -> String { "Hello!".to_string() }',
  '}',
  '',
  '// Mock implementation for tests',
  'struct MockGreeter;',
  'impl Greeter for MockGreeter {',
  '    fn greet(&self) -> String { "Test!".to_string() }',
  '}',
  '',
  'fn run<G: Greeter>(g: &G) -> String { g.greet() }',
  '',
  '#[test]',
  'fn test_run() {',
  '    let mock = MockGreeter;',
  '    assert_eq!(run(&mock), "Test!");',
  '}',
];

const animationScript = [
  { explanation: "Let's see how mocking works in Rust.", codeLineIdx: 0, state: { trait: true, real: false, mock: false, run: false, test: false } },
  { explanation: 'Define a trait for the dependency.', codeLineIdx: 1, state: { trait: true, real: false, mock: false, run: false, test: false } },
  { explanation: 'RealGreeter implements the trait.', codeLineIdx: 6, state: { trait: true, real: true, mock: false, run: false, test: false } },
  { explanation: 'MockGreeter implements the trait for testing.', codeLineIdx: 12, state: { trait: true, real: true, mock: true, run: false, test: false } },
  { explanation: 'run() uses any Greeter.', codeLineIdx: 16, state: { trait: true, real: true, mock: true, run: true, test: false } },
  { explanation: 'Test uses MockGreeter to control output.', codeLineIdx: 19, state: { trait: true, real: true, mock: true, run: true, test: true } },
];

function Mocking3D({ state }: { state: any }) {
  return (
    <group>
      <Box position={[-4, 2, 0]} args={[2, 1, 1]}>
        <meshStandardMaterial color={state.trait ? '#ffd54f' : '#bdbdbd'} />
        <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">trait Greeter</Text>
      </Box>
      {state.real && (
        <Box position={[-1, 2, 0]} args={[2, 1, 1]}>
          <meshStandardMaterial color={'#81c784'} />
          <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">RealGreeter</Text>
        </Box>
      )}
      {state.mock && (
        <Box position={[2, 2, 0]} args={[2, 1, 1]}>
          <meshStandardMaterial color={'#64b5f6'} />
          <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">MockGreeter</Text>
        </Box>
      )}
      {state.run && (
        <Text position={[2, 0.7, 0]} fontSize={0.18} color="#fbc02d">run(&G)</Text>
      )}
      {state.test && (
        <Text position={[2, -0.7, 0]} fontSize={0.18} color="#e57373">assert_eq!(run(&mock), "Test!")</Text>
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

export default function Mocking() {
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
          <Mocking3D state={state} />
          <OrbitControls />
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
            <h2>Mocking in Rust</h2>
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