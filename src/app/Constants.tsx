'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Text, Plane } from '@react-three/drei';
import React, { useMemo, useState, useEffect } from 'react';
import type { JSX } from 'react';
import { useSpring, animated } from '@react-spring/three';

// --- Helper Functions (Unchanged) ---
function randomAddress() {
  return '0x' + Math.floor(Math.random() * 0xfffff).toString(16).padStart(5, '0');
}
function splitCodeLine(line: string) {
  return line.match(/\w+|[^\w\s]+/g) || [];
}

// --- Data for the Constants Example ---
const codeLines = [
  'const MAX_POINTS: u32 = 100_000;',
  '',
  'fn main() {',
  '    let score = 50;',
  '    println!("Max points: {}", MAX_POINTS);',
  '}',
];

const codeExampleTemplate = [
  { explanation: 'Start of the program. We first define a constant.', memory: [], constants: [], console: [] },
  { word: 'const', codeLineIdx: 0, codeWordIdx: 0, explanation: 'The `const` keyword declares a constant, not a variable.', memory: [], constants: [], console: [] },
  { word: 'MAX_POINTS', codeLineIdx: 0, codeWordIdx: 1, explanation: 'We name our constant `MAX_POINTS`. Its value is fixed for the entire program.', memory: [], constants: [{ var: 'max', stage: 'alloc', position: [0, 1.5, 0] }], console: [] },
  { word: ':', codeLineIdx: 0, codeWordIdx: 2, explanation: 'Constants must always have an explicit type annotation.', memory: [], constants: [{ var: 'max', stage: 'alloc', position: [0, 1.5, 0] }], console: [] },
  { word: 'u32', codeLineIdx: 0, codeWordIdx: 3, explanation: 'The type is `u32`, a 32-bit unsigned integer.', memory: [], constants: [{ var: 'max', stage: 'alloc', position: [0, 1.5, 0] }], console: [] },
  { word: '=', codeLineIdx: 0, codeWordIdx: 4, explanation: 'Assign its value. This value must be known at compile time.', memory: [], constants: [{ var: 'max', stage: 'ready', position: [0, 1.5, 0] }], console: [] },
  { word: '100_000', codeLineIdx: 0, codeWordIdx: 5, explanation: 'The value is 100,000. It is now baked into the program.', memory: [], constants: [{ var: 'max', stage: 'value', value: '100k', position: [0, 1.5, 0] }], console: [] },
  { word: 'fn main()', codeLineIdx: 2, codeWordIdx: 0, explanation: 'Now, we enter the main function where the program runs.', memory: [], constants: [{ var: 'max', stage: 'value', value: '100k', position: [0, 1.5, 0] }], console: [] },
  { word: 'let', codeLineIdx: 3, codeWordIdx: 1, explanation: 'Declare a regular variable `score` on the stack.', memory: [{ var: 'score', stage: 'alloc', position: [0, -0.5, 0] }], constants: [{ var: 'max', stage: 'value', value: '100k', position: [0, 1.5, 0] }], console: [] },
  { word: 'score', codeLineIdx: 3, codeWordIdx: 2, explanation: 'Unlike a constant, this variable has a specific memory address.', memory: [{ var: 'score', stage: 'label', position: [0, -0.5, 0] }], constants: [{ var: 'max', stage: 'value', value: '100k', position: [0, 1.5, 0] }], console: [] },
  { word: '50', codeLineIdx: 3, codeWordIdx: 4, explanation: 'Assign the value 50 to the `score` variable.', memory: [{ var: 'score', stage: 'value', value: 50, position: [0, -0.5, 0] }], constants: [{ var: 'max', stage: 'value', value: '100k', position: [0, 1.5, 0] }], console: [] },
  { word: 'println!', codeLineIdx: 4, codeWordIdx: 1, explanation: 'Prepare to print to the console.', memory: [{ var: 'score', stage: 'value', value: 50, position: [0, -0.5, 0] }], constants: [{ var: 'max', stage: 'value', value: '100k', position: [0, 1.5, 0] }], console: [] },
  { word: 'MAX_POINTS', codeLineIdx: 4, codeWordIdx: 4, explanation: 'To use the constant, its value is directly inlined here. No memory lookup is needed.', memory: [{ var: 'score', stage: 'value', value: 50, position: [0, -0.5, 0] }], constants: [{ var: 'max', stage: 'value', value: '100k', highlight: true, position: [0, 1.5, 0] }], console: ['Max points: 100000'] },
  { word: '}', codeLineIdx: 5, codeWordIdx: 0, explanation: 'The function ends. The `score` variable is dropped from the stack.', memory: [], constants: [{ var: 'max', stage: 'value', value: '100k', position: [0, 1.5, 0] }], console: ['Max points: 100000'] },
];

// --- Reusable Components ---

// ✨ New component for visualizing a constant's definition
function ConstantDefinition({ position, label, value, highlight }: { position: [number, number, number]; label: string; value?: string; highlight?: boolean }) {
  const { color, scale } = useSpring<{ scale: number; color: string }>({
    scale: 1,
    color: highlight ? '#ffeb3b' : '#c56cf0',
    from: { scale: 0, color: '#c56cf0' },
    config: { tension: 300, friction: 20 },
  });
  return (
    <animated.group position={position} scale={scale}>
      <mesh>
        <boxGeometry args={[2, 0.8, 0.1]} />
        <animated.meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <Text position={[0, 0.2, 0.1]} fontSize={0.2} color="#fff" anchorX="center">
        {label}
      </Text>
      <Text position={[0, -0.15, 0.1]} fontSize={0.3} color="#fff" anchorX="center">
        {value}
      </Text>
      <Text position={[0, 0.5, 0.1]} fontSize={0.12} color="#f5f5f5" anchorX="center">
        const
      </Text>
    </animated.group>
  );
}

// MemoryCell from previous example (slightly adapted for this context)
function MemoryCell({ position, label, value, address }: { position: [number, number, number]; label: string; value?: number; address: string }) {
  const { scale } = useSpring<{ scale: number }>({ scale: 1, from: { scale: 0 } });
  return (
    <animated.group position={position} scale={scale}>
      <mesh>
        <boxGeometry args={[1.2, 1, 1]} />
        <meshStandardMaterial color={'#64b5f6'} />
      </mesh>
      <Text position={[0, 0.4, 0.6]} fontSize={0.25} color="#212121" anchorX="center">{label}</Text>
      {value !== undefined && <Text position={[0, 0, 0.6]} fontSize={0.3} color="#000" anchorX="center">{value}</Text>}
      <Text position={[0, -0.7, 0.6]} fontSize={0.16} color="#757575" anchorX="center">{address}</Text>
    </animated.group>
  );
}

interface ControlsProps {
  step: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
}
const Controls = ({ step, totalSteps, onPrev, onNext, onReset }: ControlsProps): JSX.Element => {
  const progress = totalSteps > 1 ? (step / (totalSteps - 1)) * 100 : 0;
  return (
    <div className="controls-container">
      <div className="progress-bar-background">
        <div className="progress-bar-foreground" style={{ width: `${progress}%` }} />
      </div>
      <div className="buttons">
        <button onClick={onReset} title="Reset (Home)">↩️ Reset</button>
        <button onClick={onPrev} disabled={step === 0} title="Previous (←)">‹ Prev</button>
        <button onClick={onNext} disabled={step === totalSteps - 1} title="Next (→)">Next ›</button>
      </div>
    </div>
  );
};

const ConsoleArea = ({ output }: { output: string[] }): JSX.Element => (
  <Html position={[0, -2.8, 0]} center style={{ width: 400, pointerEvents: 'none' }}>
    <div className="glass-panel" style={{ background: 'rgba(30,30,30,0.8)', padding: '16px' }}>
      <b style={{ color: '#eee' }}>Console Output:</b>
      <div style={{ minHeight: 24, color: '#4caf50', paddingTop: '8px', fontFamily: 'monospace', fontSize: '16px' }}>
        {output.map((line: string, i: number) => <div key={i}>{`> ${line}`}</div>)}
      </div>
    </div>
  </Html>
);

// --- Main App Component ---
export default function ConstantsConcept() {
  const [addresses] = useState(() => ({ score: randomAddress() }));
  const [step, setStep] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const steps = useMemo(() => codeExampleTemplate.map(s => ({
      ...s,
      memory: (s.memory || []).map(cell => ({
        ...cell,
        label: 'score',
        address: addresses.score,
        value: (cell as any).value ?? undefined,
      })),
      constants: (s.constants || []).map(c => ({
          ...c,
          label: 'MAX_POINTS',
          value: (c as any).value ?? undefined,
          highlight: (c as any).highlight ?? false,
      }))
  })), [addresses]);

  const currentStep = steps[step];
  const { codeLineIdx, codeWordIdx } = useMemo(() => {
    let line: number | null = null, word: number | null = null;
    for (let i = step; i >= 0; i--) {
        if (typeof steps[i].codeLineIdx === 'number') line = steps[i].codeLineIdx ?? null;
        if (typeof steps[i].codeWordIdx === 'number') word = steps[i].codeWordIdx ?? null;
        if (line !== null) break;
    }
    return { codeLineIdx: line, codeWordIdx: word };
  }, [step, steps]);

  const changeStep = (newStep: number) => {
    setIsFading(true);
    setTimeout(() => { setStep(newStep); setIsFading(false); }, 150);
  };

  const handleNext = () => step < steps.length - 1 && changeStep(step + 1);
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
  }, [step, steps.length]);

  return (
    <>
      <style>{`
        /* ... All the CSS from the previous example goes here ... */
      `}</style>

      <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <Canvas camera={{ position: [0, 0.5, 8], fov: 50 }} shadows>
          <ambientLight intensity={0.7} />
          <directionalLight position={[0, 5, 5]} intensity={0.8} castShadow />
          <pointLight position={[0, 2, 3]} intensity={0.5} color="#c56cf0" />
          {/* Render Constants */}
          {currentStep.constants.map((c: any) => (
            <ConstantDefinition key={c.label} {...c} />
          ))}
          {/* Render Memory Cells */}
          {currentStep.memory.map((cell: any) => (
            <MemoryCell key={cell.address} {...cell} />
          ))}
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 1.8} minPolarAngle={Math.PI / 2.2} />
          <ConsoleArea output={currentStep.console} />
        </Canvas>
        {/* --- UI Panels --- */}
        <div style={{ position: 'fixed', left: 32, top: 32, width: 450 }} className="glass-panel">
          <h2 style={{ marginTop: 0, marginBottom: 16, color: '#111' }}>Constants (`const`)</h2>
          <pre style={{ background: '#2d2d2d', color: '#f8f8f2', padding: 16, borderRadius: 8, fontSize: 16, overflowX: 'auto' }}>
            {codeLines.map((line, idx) => (
              <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', minHeight: '1.2em' }}>
                {splitCodeLine(line).map((w, j) => (
                  <span key={j} style={{
                    background: idx === codeLineIdx && j === codeWordIdx ? '#1976d2' : 'transparent',
                    borderRadius: 4, padding: '2px 4px', marginRight: 2,
                  }}>{w}</span>
                ))}
              </div>
            ))}
          </pre>
          <h2 style={{ margin: '24px 0 8px', color: '#111' }}>Explanation</h2>
          <div className="explanation-text" style={{ fontSize: 18, color: '#333', minHeight: 75, opacity: isFading ? 0 : 1 }}>
            {currentStep.explanation}
          </div>
        </div>
        <Controls
          step={step}
          totalSteps={steps.length}
          onPrev={handlePrev}
          onNext={handleNext}
          onReset={handleReset}
        />
      </div>
    </>
  );
}