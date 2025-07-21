'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Line } from '@react-three/drei';
import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/three';

const codeLines = [
  '// 1. Each value in Rust has an owner.',
  'let s1 = String::from("hello");',
  '',
  '// 2. There can only be one owner at a time.',
  'let s2 = s1;',
  '',
  '// `s1` is no longer valid here; it was moved to `s2`.',
  '// println!("{}", s1); // This would cause a compile error!',
  '',
  '// 3. When the owner goes out of scope, the value is dropped.',
];

const animationScript = [
  { explanation: "Let's explore Rust's Ownership rules. Rule 1: Each value has a variable that's its owner.", codeLineIdx: 0, s1: null, s2: null },
  { explanation: "We create a String `s1`. The string data is on the heap, and `s1` on the stack is its owner.", codeLineIdx: 1, s1: { value: "hello", owner: true }, s2: null },
  { explanation: "Rule 2: There can only be one owner at a time. Let's assign `s1` to `s2`.", codeLineIdx: 4, s1: { value: "hello", owner: true }, s2: null },
  { explanation: "Ownership of the heap data is moved from `s1` to `s2`. `s1` is now invalidated.", codeLineIdx: 4, s1: { value: "hello", owner: false }, s2: { value: "hello", owner: true } },
  { explanation: "Trying to use `s1` now would be a compile-time error, preventing a double-free bug.", codeLineIdx: 7, s1: { value: "hello", owner: false }, s2: { value: "hello", owner: true } },
  { explanation: "Rule 3: When `s2` goes out of scope, its owned value is automatically dropped (memory is freed).", codeLineIdx: 9, s1: { value: "hello", owner: false }, s2: { value: "hello", owner: true } },
];

function MemoryViz({ s1, s2 }: { s1: any, s2: any }) {
  const heapDataPos: [number, number, number] = [3, 0, 0];
  return (
    <group>
      {/* Stack */}
      <Text position={[-3, 2, 0]} fontSize={0.4} color="white">Stack</Text>
      {s1 && <MemoryBlock position={[-3, 1, 0]} color={s1.owner ? "#64b5f6" : "#555"} label="s1" value={s1.owner ? "ptr" : "moved"} />}
      {s2 && <MemoryBlock position={[-3, -0.5, 0]} color={s2.owner ? "#64b5f6" : "#555"} label="s2" value={s2.owner ? "ptr" : "moved"} />}
      
      {/* Heap */}
      <Text position={[3, 2, 0]} fontSize={0.4} color="white">Heap</Text>
      { (s1 || s2) && <MemoryBlock position={heapDataPos} color="#ffd54f" label="String" value={s1?.value ?? s2?.value} /> }
      
      {/* Pointers */}
      {s1?.owner && <Line points={[[-2.25, 1, 0], heapDataPos]} color="white" lineWidth={2} />}
      {s2?.owner && <Line points={[[-2.25, -0.5, 0], heapDataPos]} color="white" lineWidth={2} />}
    </group>
  );
}

function MemoryBlock({ position, color, label, value }: { position: [number, number, number], color: string, label: string, value: string }) {
  const { scale } = useSpring({ from: { scale: 0 }, to: { scale: 1 } });
  return (
    <animated.group position={position} scale={scale}>
      <Box args={[1.5, 1, 1]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Text position={[0, 0, 0.6]} fontSize={0.25} color="#333">{`${label}: ${value}`}</Text>
    </animated.group>
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

export default function Ownership() {
  const [step, setStep] = useState(0);
  const current = animationScript[step];
  const { codeLineIdx, explanation, s1, s2 } = current;

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
          <MemoryViz s1={s1} s2={s2} />
          <OrbitControls />
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
            <h2>Ownership Rules</h2>
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