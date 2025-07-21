'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Line } from '@react-three/drei';
import React, { useState, useEffect } from 'react';

const codeLines = [
  '// Borrowing lets you use a value without taking ownership.',
  'let s1 = String::from("hello");',
  '',
  '// Immutable references (&T)',
  'let r1 = &s1;',
  'let r2 = &s1;',
  'println!("{} and {}", r1, r2);',
  '',
  '// Mutable reference (&mut T)',
  'let mut s2 = String::from("world");',
  'let r3 = &mut s2;',
  'r3.push_str("!");',
  'println!("{}", r3);',
  '',
  '// Rule: Can have multiple immutable OR one mutable reference.',
];

const animationScript = [
  { explanation: "Let's learn about Borrowing and References. They let you access data without taking ownership.", codeLineIdx: 0, state: {} },
  { explanation: "We create a String `s1`. `s1` is the owner.", codeLineIdx: 1, state: { s1: "hello" } },
  { explanation: "We can create multiple immutable references (`&`) to `s1`.", codeLineIdx: 4, state: { s1: "hello", r1: true } },
  { explanation: "Both `r1` and `r2` can read the data owned by `s1`.", codeLineIdx: 5, state: { s1: "hello", r1: true, r2: true } },
  { explanation: "Now for mutable references. We need a mutable variable `s2`.", codeLineIdx: 9, state: { s2: "world" } },
  { explanation: "We create one mutable reference (`&mut`). This gives us read AND write access.", codeLineIdx: 10, state: { s2: "world", r3: true } },
  { explanation: "We can use the mutable reference to change the data.", codeLineIdx: 11, state: { s2: "world!", r3: true } },
  { explanation: "The core rule: In a scope, you can have EITHER multiple immutable references OR ONE single mutable reference.", codeLineIdx: 14, state: { s2: "world!", r3: true } },
];

function Borrowing3D({ state }: { state: any }) {
    // Simplified viz
    return (
        <group>
            {state.s1 && <Box position={[0,-2,0]}><meshStandardMaterial color="#ffd54f" /><Text position={[0,0,0.6]}>{state.s1}</Text></Box>}
            {state.s1 && <Box position={[-2,0,0]}><meshStandardMaterial color="#64b5f6" /><Text position={[0,0,0.6]}>s1</Text></Box>}
            {state.r1 && <Text position={[-2, 1, 0]}>r1: &s1</Text>}
            {state.r2 && <Text position={[0, 1, 0]}>r2: &s1</Text>}

            {state.s2 && <Box position={[2, -2, 0]}><meshStandardMaterial color="#ffd54f" /><Text position={[0,0,0.6]}>{state.s2}</Text></Box>}
            {state.s2 && <Box position={[4,0,0]}><meshStandardMaterial color="#e57373" /><Text position={[0,0,0.6]}>s2</Text></Box>}
            {state.r3 && <Text position={[4, 1, 0]}>r3: &mut s2</Text>}
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

export default function Borrowing() {
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
          <Borrowing3D state={state} />
          <OrbitControls />
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
            <h2>Borrowing & References</h2>
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