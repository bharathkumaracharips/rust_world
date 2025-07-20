'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Text } from '@react-three/drei';
import React, { useMemo, useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/three'; // ✨ Import for animations

// --- Helper Functions (Unchanged) ---
function randomAddress() {
  return '0x' + Math.floor(Math.random() * 0xfffff).toString(16).padStart(5, '0');
}
function splitCodeLine(line: string) {
  return line.match(/\w+|[^\w\s]+/g) || [];
}

// --- Data & Templates (Unchanged) ---
const codeExampleTemplate = [
  // ... (Your original step data remains here)
  { word: 'fn', explanation: 'Start of the main function.', codeLineIdx: 0, codeWordIdx: 0, memory: [], console: [], highlight: 0 },
  { word: 'main()', explanation: 'Function name.', codeLineIdx: 0, codeWordIdx: 1, memory: [], console: [], highlight: 1 },
  { word: '{', explanation: 'Enter function scope.', codeLineIdx: 0, codeWordIdx: 2, memory: [], console: [], highlight: 2 },
  { word: 'let', explanation: 'Declare a new variable x.', codeLineIdx: 1, codeWordIdx: 0, memory: [{ var: 'x1', stage: 'alloc', position: [0, 0, 0] as [number, number, number] }], console: [], highlight: 3 },
  { word: 'x', explanation: 'Label the memory as x.', codeLineIdx: 1, codeWordIdx: 1, memory: [{ var: 'x1', stage: 'label', position: [0, 0, 0] as [number, number, number] }], console: [], highlight: 4 },
  { word: '=', explanation: 'Ready to assign value to x.', codeLineIdx: 1, codeWordIdx: 2, memory: [{ var: 'x1', stage: 'ready', position: [0, 0, 0] as [number, number, number] }], console: [], highlight: 5 },
  { word: '5;', explanation: 'Assign value 5 to x.', codeLineIdx: 1, codeWordIdx: 4, memory: [{ var: 'x1', stage: 'value', value: 5, position: [0, 0, 0] as [number, number, number] }], console: [], highlight: 6 },
  { word: 'let', explanation: 'Shadow x with a new variable.', codeLineIdx: 2, codeWordIdx: 0, memory: [
    { var: 'x1', stage: 'value', value: 5, position: [0, 0, 0] as [number, number, number] },
    { var: 'x2', stage: 'alloc', position: [2, 0, 0] as [number, number, number] }
  ], console: [], highlight: 7 },
  { word: 'x', explanation: 'Label the new memory as x (shadowing).', codeLineIdx: 2, codeWordIdx: 1, memory: [
    { var: 'x1', stage: 'value', value: 5, position: [0, 0, 0] as [number, number, number] },
    { var: 'x2', stage: 'label', position: [2, 0, 0] as [number, number, number] }
  ], console: [], highlight: 8 },
  { word: '=', explanation: 'Ready to assign value to new x.', codeLineIdx: 2, codeWordIdx: 2, memory: [
    { var: 'x1', stage: 'value', value: 5, position: [0, 0, 0] as [number, number, number] },
    { var: 'x2', stage: 'ready', position: [2, 0, 0] as [number, number, number] }
  ], console: [], highlight: 9 },
  { word: 'x', explanation: 'Fetch value of old x for shadowing.', codeLineIdx: 2, codeWordIdx: 3, memory: [
    { var: 'x1', stage: 'value', value: 5, position: [0, 0, 0] as [number, number, number], highlight: true },
    { var: 'x2', stage: 'ready', position: [2, 0, 0] as [number, number, number] }
  ], console: [], highlight: 10 },
  { word: '+', explanation: 'Prepare to add 1 to x.', codeLineIdx: 2, codeWordIdx: 4, memory: [
    { var: 'x1', stage: 'value', value: 5, position: [0, 0, 0] as [number, number, number], highlight: true },
    { var: 'x2', stage: 'ready', position: [2, 0, 0] as [number, number, number] }
  ], console: [], highlight: 11 },
  { word: '1;', explanation: 'Assign value 6 to new x (shadowed).', codeLineIdx: 2, codeWordIdx: 5, memory: [
    { var: 'x1', stage: 'value', value: 5, position: [0, 0, 0] as [number, number, number] },
    { var: 'x2', stage: 'value', value: 6, position: [2, 0, 0] as [number, number, number] }
  ], console: [], highlight: 12 },
  { word: 'println!', explanation: 'Prepare to print shadowed x.', codeLineIdx: 3, codeWordIdx: 0, memory: [
    { var: 'x1', stage: 'value', value: 5, position: [0, 0, 0] as [number, number, number] },
    { var: 'x2', stage: 'value', value: 6, position: [2, 0, 0] as [number, number, number] }
  ], console: [], highlight: 13 },
  { word: '("x after shadowing = {}",', explanation: 'Format string for printing.', codeLineIdx: 3, codeWordIdx: 1, memory: [
    { var: 'x1', stage: 'value', value: 5, position: [0, 0, 0] as [number, number, number] },
    { var: 'x2', stage: 'value', value: 6, position: [2, 0, 0] as [number, number, number] }
  ], console: [], highlight: 14 },
  { word: 'x);', explanation: 'Fetch value of shadowed x and print.', codeLineIdx: 3, codeWordIdx: 5, memory: [
    { var: 'x1', stage: 'value', value: 5, position: [0, 0, 0] as [number, number, number] },
    { var: 'x2', stage: 'value', value: 6, position: [2, 0, 0] as [number, number, number] }
  ], console: ['x after shadowing = 6'], highlight: 15 },
  { word: '}', explanation: 'End of function.', codeLineIdx: 4, codeWordIdx: 0, memory: [
    { var: 'x1', stage: 'value', value: 5, position: [0, 0, 0] as [number, number, number] },
    { var: 'x2', stage: 'value', value: 6, position: [2, 0, 0] as [number, number, number] }
  ], console: ['x after shadowing = 6'], highlight: 16 },
];
const codeLines = [
  'fn main() {',
  '    let x = 5;',
  '    let x = x + 1;',
  '    println!("x after shadowing = {}", x);',
  '}',
];

// ✨ --- Animated MemoryCell Component ---
function MemoryCell({ position, label, value, highlight, mutable, address }: { position: [number, number, number], label?: string, value?: string | number, highlight?: boolean, mutable?: boolean, address: string }) {
  const { scale, color } = useSpring<{ scale: number; color: string }>({
    scale: 1,
    color: highlight ? '#ffeb3b' : mutable ? '#64b5f6' : '#bdbdbd',
    from: { scale: 0, color: '#bdbdbd' },
    config: { tension: 300, friction: 20 },
  });

  return (
    <animated.group position={position} scale={scale}>
      <mesh>
        <boxGeometry args={[1.2, 1, 1]} />
        <animated.meshStandardMaterial color={color} />
      </mesh>
      <Text position={[0, 0.4, 0.6]} fontSize={0.25} color="#212121" anchorX="center" anchorY="middle">{label || address}</Text>
      {value !== undefined && <Text position={[0, 0, 0.6]} fontSize={0.3} color="#000" anchorX="center" anchorY="middle">{value}</Text>}
      {mutable && <Text position={[0, -0.4, 0.6]} fontSize={0.18} color="#0d47a1" anchorX="center" anchorY="middle">mutable</Text>}
      <Text position={[0, -0.7, 0.6]} fontSize={0.16} color="#757575" anchorX="center" anchorY="middle">{address}</Text>
    </animated.group>
  );
}

// ✨ --- Enhanced Console Component ---
function ConsoleArea({ output }: { output: string[] }) {
  return (
    <Html position={[0, -2.8, 0]} center style={{ width: 400, pointerEvents: 'none' }}>
      <div className="glass-panel" style={{ background: 'rgba(30,30,30,0.8)' }}>
        <b style={{ color: '#eee' }}>Console Output:</b>
        <div style={{ minHeight: 24, color: '#4caf50', paddingTop: '8px' }}>
          {output.map((line, i) => <div key={i}>{`> ${line}`}</div>)}
        </div>
      </div>
    </Html>
  );
}

// ✨ --- New Controls Component ---
interface ControlsProps {
  step: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
}
function Controls({ step, totalSteps, onPrev, onNext, onReset }: ControlsProps) {
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
}

// --- Main App Component ---
export default function Shadowing() {
  const [addresses] = useState(() => ({ x1: randomAddress(), x2: randomAddress() }));
  const [step, setStep] = useState(0);
  const [isFading, setIsFading] = useState(false); // For explanation text animation

  const steps = useMemo(() => codeExampleTemplate.map(s => ({
      ...s,
      memory: (s.memory || []).map(cell => ({
        ...cell,
        address: cell.var === 'x1' ? addresses.x1 : addresses.x2,
        label: 'x',
      })),
  })), [addresses]);

  const currentStep = steps[step];
  const { codeLineIdx, codeWordIdx } = useMemo(() => {
    for (let i = step; i >= 0; i--) {
        if (steps[i].codeLineIdx !== undefined && steps[i].codeWordIdx !== undefined) {
            return { codeLineIdx: steps[i].codeLineIdx, codeWordIdx: steps[i].codeWordIdx };
        }
    }
    return { codeLineIdx: null, codeWordIdx: null };
  }, [step, steps]);

  // ✨ Animate step changes with a brief fade for the explanation text
  const changeStep = (newStep: number) => {
    setIsFading(true);
    setTimeout(() => {
      setStep(newStep);
      setIsFading(false);
    }, 150); // Match this duration with CSS transition
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
      {/* ✨ Add a global style tag for our new CSS */}
      <style>{`
        body { font-family: 'Inter', sans-serif; }
        .glass-panel {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
        }
        .controls-container {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 16px 32px;
          box-sizing: border-box;
          z-index: 100;
        }
        .progress-bar-background {
          height: 8px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .progress-bar-foreground {
          height: 100%;
          background: #1976d2;
          border-radius: 4px;
          transition: width 0.2s ease-out;
        }
        .controls-container .buttons {
          display: flex;
          justify-content: center;
          gap: 12px;
        }
        .controls-container button {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 500;
          padding: 8px 20px;
          border-radius: 8px;
          border: 1px solid transparent;
          cursor: pointer;
          background: #fff;
          color: #333;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.2s ease;
        }
        .controls-container button:hover:not(:disabled) {
          background: #f0f0f0;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .controls-container button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .explanation-text {
          transition: opacity 0.15s ease-in-out;
        }
      `}</style>

      <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <Canvas camera={{ position: [1, 0, 8], fov: 50 }} shadows>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={0.6} castShadow />
          {currentStep.memory.map((cell) => (
            <MemoryCell key={cell.address} {...cell} />
          ))}
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 1.8} minPolarAngle={Math.PI / 2.2} />
          <ConsoleArea output={currentStep.console} />
        </Canvas>

        {/* --- UI Panels --- */}
        <div style={{ position: 'fixed', left: 32, top: 32, width: 450 }} className="glass-panel">
          <h2 style={{ marginTop: 0, marginBottom: 16, color: '#111' }}>Code Execution</h2>
          <pre style={{ background: '#2d2d2d', color: '#f8f8f2', padding: 16, borderRadius: 8, fontSize: 16, overflowX: 'auto' }}>
            {codeLines.map((line: string, idx: number) => {
              const words = splitCodeLine(line);
              return (
                <div key={idx} style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {words.map((w, j) => (
                    <span key={j} style={{
                      background: idx === codeLineIdx && j === codeWordIdx ? '#1976d2' : 'transparent',
                      borderRadius: 4, padding: '2px 4px', marginRight: 2,
                    }}>{w}</span>
                  ))}
                </div>
              );
            })}
          </pre>
          <h2 style={{ margin: '24px 0 8px', color: '#111' }}>Explanation</h2>
          <div className="explanation-text" style={{ fontSize: 18, color: '#333', minHeight: 54, opacity: isFading ? 0 : 1 }}>
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