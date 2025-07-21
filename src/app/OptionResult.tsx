'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import React, { useState, useEffect } from 'react';

const codeLines = [
  '// Option<T> is for values that may or may not be present.',
  'let some_num = Some(5);',
  'let no_num: Option<i32> = None;',
  '',
  '// Result<T, E> is for operations that may succeed or fail.',
  'let ok = Result::Ok(10);',
  'let err: Result<i32, &str> = Result::Err("error!");',
];

const animationScript = [
  { explanation: "Let's explore Option and Result enums for error handling.", codeLineIdx: 0, state: {} },
  { explanation: 'Option can be Some(value) or None.', codeLineIdx: 1, state: { some: 5 } },
  { explanation: 'None means no value is present.', codeLineIdx: 2, state: { some: 5, none: true } },
  { explanation: 'Result can be Ok(value) for success...', codeLineIdx: 5, state: { some: 5, none: true, ok: 10 } },
  { explanation: '...or Err(error) for failure.', codeLineIdx: 6, state: { some: 5, none: true, ok: 10, err: 'error!' } },
];

function OptionResult3D({ state }: { state: any }) {
  return (
    <group>
      {/* Option */}
      <Text position={[-4, 2, 0]} fontSize={0.3} color="#fff">Option&lt;T&gt;</Text>
      <Box position={[-4, 0.5, 0]} args={[1.5, 1, 1]}>
        <meshStandardMaterial color={state.some ? '#ffd54f' : '#bdbdbd'} />
        <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">Some({state.some ?? ''})</Text>
      </Box>
      <Box position={[-4, -1.2, 0]} args={[1.5, 1, 1]}>
        <meshStandardMaterial color={state.none ? '#e57373' : '#bdbdbd'} />
        <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">None</Text>
      </Box>
      {/* Result */}
      <Text position={[4, 2, 0]} fontSize={0.3} color="#fff">Result&lt;T, E&gt;</Text>
      <Box position={[4, 0.5, 0]} args={[1.5, 1, 1]}>
        <meshStandardMaterial color={state.ok ? '#81c784' : '#bdbdbd'} />
        <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">Ok({state.ok ?? ''})</Text>
      </Box>
      <Box position={[4, -1.2, 0]} args={[1.5, 1, 1]}>
        <meshStandardMaterial color={state.err ? '#e57373' : '#bdbdbd'} />
        <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">Err({state.err ?? ''})</Text>
      </Box>
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

export default function OptionResult() {
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
          <OptionResult3D state={state} />
          <OrbitControls />
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
            <h2>Option & Result Enums</h2>
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