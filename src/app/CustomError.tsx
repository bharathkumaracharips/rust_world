'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import React, { useState, useEffect } from 'react';

const codeLines = [
  '// Custom error type and trait',
  'use std::fmt;',
  'enum MyError { NotFound, Invalid }',
  '',
  'impl fmt::Display for MyError {',
  '    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {',
  '        match self {',
  '            MyError::NotFound => write!(f, "Not found"),',
  '            MyError::Invalid => write!(f, "Invalid"),',
  '        }',
  '    }',
  '}',
  '',
  'impl std::error::Error for MyError {}',
  '',
  'fn do_something(flag: bool) -> Result<(), MyError> {',
  '    if flag { Ok(()) } else { Err(MyError::NotFound) }',
  '}',
  '',
  'let res = do_something(false); // Err(MyError::NotFound)',
];

const animationScript = [
  { explanation: "Let's see how to define custom error types and implement traits.", codeLineIdx: 0, state: {} },
  { explanation: 'We define an enum MyError with variants.', codeLineIdx: 2, state: { error: 'NotFound' } },
  { explanation: 'We implement Display for pretty-printing.', codeLineIdx: 4, state: { error: 'NotFound', display: 'Not found' } },
  { explanation: 'We implement the Error trait for compatibility.', codeLineIdx: 13, state: { error: 'NotFound', display: 'Not found', trait: true } },
  { explanation: 'A function returns Result<(), MyError>.', codeLineIdx: 15, state: { error: 'NotFound', display: 'Not found', trait: true, result: 'Err(MyError::NotFound)' } },
];

function CustomError3D({ state }: { state: any }) {
  return (
    <group>
      <Text position={[-3, 2, 0]} fontSize={0.3} color="#fff">MyError Enum</Text>
      <Box position={[-3, 0.5, 0]} args={[2, 1, 1]}>
        <meshStandardMaterial color={state.error === 'NotFound' ? '#e57373' : '#bdbdbd'} />
        <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">NotFound</Text>
      </Box>
      <Box position={[-3, -1.2, 0]} args={[2, 1, 1]}>
        <meshStandardMaterial color={state.error === 'Invalid' ? '#e57373' : '#bdbdbd'} />
        <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">Invalid</Text>
      </Box>
      <Text position={[3, 2, 0]} fontSize={0.3} color="#fff">Display/Debug</Text>
      <Box position={[3, 0.5, 0]} args={[2, 1, 1]}>
        <meshStandardMaterial color={state.display ? '#ffd54f' : '#bdbdbd'} />
        <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">{state.display ?? ''}</Text>
      </Box>
      <Text position={[3, -1.2, 0]} fontSize={0.22} color="#81c784">{state.trait ? 'Implements Error' : ''}</Text>
      <Text position={[0, -2.5, 0]} fontSize={0.22} color="#e57373">{state.result ?? ''}</Text>
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

export default function CustomError() {
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
          <CustomError3D state={state} />
          <OrbitControls />
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
            <h2>Custom Error Types & Traits</h2>
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