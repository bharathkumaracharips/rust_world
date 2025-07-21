'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import React, { useState, useEffect } from 'react';

const codeLines = [
  'let s = String::from("hello");',
  '',
  '{',
  '    let r1 = &s;',
  '    println!("{}", r1);',
  '} // r1 goes out of scope',
  '',
  'let r2 = &s;',
  'println!("{}", r2);',
  '',
  '// This would be a COMPILE ERROR:',
  '// let r3 = &mut s;',
];

const animationScript = [
  { explanation: "Let's see how Rust prevents memory errors. We'll look at a 'use after free' scenario.", codeLineIdx: -1, state: {} },
  { explanation: "We create a String `s`. `s` on the stack owns the data on the heap.", codeLineIdx: 0, state: { s: "hello" } },
  { explanation: "We enter a new scope and create a reference `r1` to `s`.", codeLineIdx: 3, state: { s: "hello", r1: true } },
  { explanation: "We can use `r1` to access the data.", codeLineIdx: 4, state: { s: "hello", r1: true } },
  { explanation: "`r1` goes out of scope. The reference is now gone, but `s` and its data remain.", codeLineIdx: 5, state: { s: "hello", r1: false } },
  { explanation: "We can create a new reference `r2` and use it. The data was never freed.", codeLineIdx: 7, state: { s: "hello", r2: true } },
  { explanation: "Rust's ownership rules ensure data is not freed while valid references exist, preventing dangling pointers.", codeLineIdx: -1, state: { s: "hello", r2: true } },
  { explanation: "Furthermore, Rust prevents creating a mutable reference (`&mut s`) while immutable ones exist, preventing data races.", codeLineIdx: 11, state: { s: "hello", r2: true, r3_error: true } },
];

function MemorySafety3D({ state }: { state: any }) {
    // A simplified visualization for memory safety
    return (
        <group>
            {state.s && <Box position={[-2, 0, 0]}><meshStandardMaterial color="#64b5f6" /><Text position={[0,0,0.6]}>s: ptr</Text></Box>}
            {state.s && <Box position={[2, 0, 0]}><meshStandardMaterial color="#ffd54f" /><Text position={[0,0,0.6]}>{state.s}</Text></Box>}
            {state.r1 && <Text position={[-2, -1.5, 0]} color="white">r1: &s</Text>}
            {state.r2 && <Text position={[-2, -1.5, 0]} color="white">r2: &s</Text>}
            {state.r3_error && <Text position={[0, -2.5, 0]} color="red" fontSize={0.3}>ERROR: Cannot borrow mutably</Text>}
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

export default function MemorySafety() {
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
          <MemorySafety3D state={state} />
          <OrbitControls />
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
            <h2>Memory Safety</h2>
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