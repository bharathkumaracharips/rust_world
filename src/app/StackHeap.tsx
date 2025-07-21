'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Line } from '@react-three/drei';
import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/three';

const codeLines = [
  '// Stack: Fixed-size data, fast access.',
  'let x: i32 = 5;',
  'let y: bool = true;',
  '',
  '// Heap: Growable data, slower access.',
  'let b = Box::new(20);',
  '',
  '// `x` and `y` are on the stack.',
  '// `b` is a pointer on the stack,',
  '// pointing to the value 20 on the heap.',
];

const animationScript = [
  { explanation: "Let's visualize memory in Rust: the Stack and the Heap.", codeLineIdx: -1, state: {} },
  { explanation: "The Stack is for fixed-size data. It's fast. Let's declare an `i32`.", codeLineIdx: 1, state: { x: 5 } },
  { explanation: "The value 5 is pushed onto the stack for the variable `x`.", codeLineIdx: 1, state: { x: 5 } },
  { explanation: "Let's add a boolean. It also has a known, fixed size.", codeLineIdx: 2, state: { x: 5, y: true } },
  { explanation: "The Heap is for data that can grow or change size. Let's create a `Box`.", codeLineIdx: 5, state: { x: 5, y: true, b: 20 } },
  { explanation: "The value 20 is stored on the heap. A pointer to it is stored on the stack for `b`.", codeLineIdx: 5, state: { x: 5, y: true, b: 20 } },
  { explanation: "Stack memory is freed automatically when it goes out of scope. Heap memory is freed when its owner (`b`) goes out of scope.", codeLineIdx: 9, state: { x: 5, y: true, b: 20 } },
];

function MemoryBlock({ position, color, label, value, isHeap = false }: { position: [number, number, number], color: string, label: string, value: string, isHeap?: boolean }) {
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

function StackHeap3D({ state }: { state: any }) {
  const stackItems = Object.keys(state).filter(k => k !== 'b');
  const heapItems = state.b ? [{ key: 'b', value: state.b }] : [];
  return (
    <group>
      {/* Stack Area */}
      <Text position={[-3, 2, 0]} fontSize={0.4} color="white">Stack (LIFO)</Text>
      {stackItems.map((key, i) => (
        <MemoryBlock key={key} position={[-3, 1 - i * 1.2, 0]} color="#64b5f6" label={key} value={state[key].toString()} />
      ))}
       {state.b && <MemoryBlock position={[-3, 1 - 2 * 1.2, 0]} color="#81c784" label="b" value="ptr" />}

      {/* Heap Area */}
      <Text position={[3, 2, 0]} fontSize={0.4} color="white">Heap</Text>
      {heapItems.map((item, i) => (
         <MemoryBlock key={item.key} position={[3, 1 - i * 1.2, 0]} color="#ffd54f" label="Box" value={item.value.toString()} isHeap />
      ))}

      {/* Pointer Line */}
      {state.b && <Line points={[[-2.25, 1 - 2 * 1.2, 0], [2.25, 1, 0]]} color="white" lineWidth={2} dashed />}
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

export default function StackHeap() {
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
          <StackHeap3D state={state} />
          <OrbitControls />
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
            <h2>Memory: Stack & Heap</h2>
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