'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Text, Box } from '@react-three/drei';
import React, { useState, useEffect } from 'react';

// Simple 3D arrow using cylinder and cone
interface Arrow3DProps {
  from: [number, number, number];
  to: [number, number, number];
  color?: string;
  headLength?: number;
  headWidth?: number;
}
function Arrow3D({ from, to, color = '#ffd54f', headLength = 0.18, headWidth = 0.12 }: Arrow3DProps) {
  const dir: [number, number, number] = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
  const len = Math.sqrt(dir[0] ** 2 + dir[1] ** 2 + dir[2] ** 2);
  const norm: [number, number, number] = len === 0 ? [0, 1, 0] : [dir[0] / len, dir[1] / len, dir[2] / len];
  const arrowPos: [number, number, number] = [from[0] + norm[0] * (len - headLength), from[1] + norm[1] * (len - headLength), from[2] + norm[2] * (len - headLength)];
  const arrowRot: [number, number, number] = [0, 0, Math.atan2(norm[1], norm[0]) - Math.PI / 2];
  return (
    <group>
      {/* Shaft */}
      <mesh position={[(from[0] + arrowPos[0]) / 2, (from[1] + arrowPos[1]) / 2, (from[2] + arrowPos[2]) / 2] as [number, number, number]} rotation={[0, 0, Math.atan2(norm[1], norm[0])]}>
        <cylinderGeometry args={[headWidth / 3, headWidth / 3, len - headLength, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Head */}
      <mesh position={arrowPos as [number, number, number]} rotation={arrowRot as [number, number, number]}>
        <coneGeometry args={[headWidth, headLength, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

const codeLines = [
  'let mut n = 3;',
  'while n != 0 {',
  '    println!("n = {}", n);',
  '    n -= 1;',
  '}',
  'println!("LIFTOFF!!!");'
];

const animationScript = [
  { explanation: 'We start with n = 3.', codeLineIdx: 0, n: 3, highlight: 0, loop: false },
  { explanation: 'Check if n != 0. It is, so enter the loop.', codeLineIdx: 1, n: 3, highlight: 1, loop: true },
  { explanation: 'Print n.', codeLineIdx: 2, n: 3, highlight: 2, loop: true },
  { explanation: 'Decrement n.', codeLineIdx: 3, n: 2, highlight: 3, loop: true },
  { explanation: 'Check if n != 0. It is, so continue.', codeLineIdx: 1, n: 2, highlight: 1, loop: true },
  { explanation: 'Print n.', codeLineIdx: 2, n: 2, highlight: 2, loop: true },
  { explanation: 'Decrement n.', codeLineIdx: 3, n: 1, highlight: 3, loop: true },
  { explanation: 'Check if n != 0. It is, so continue.', codeLineIdx: 1, n: 1, highlight: 1, loop: true },
  { explanation: 'Print n.', codeLineIdx: 2, n: 1, highlight: 2, loop: true },
  { explanation: 'Decrement n.', codeLineIdx: 3, n: 0, highlight: 3, loop: true },
  { explanation: 'Check if n != 0. It is not, exit the loop.', codeLineIdx: 1, n: 0, highlight: 1, loop: false },
  { explanation: 'Print LIFTOFF!!!', codeLineIdx: 5, n: 0, highlight: 5, loop: false },
];

function WhileDiagram({ n, loop }: { n: number; loop: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Counter box */}
      <Box args={[1.2, 0.7, 0.2]} position={[0, 2, 0]}>
        <meshStandardMaterial color="#64b5f6" />
      </Box>
      <Text position={[0, 2, 0.25]} fontSize={0.22} color="#fff">n = {n}</Text>
      {/* Condition check */}
      <Box args={[2, 0.7, 0.2]} position={[0, 0.8, 0]}>
        <meshStandardMaterial color="#ffd54f" />
      </Box>
      <Text position={[0, 0.8, 0.25]} fontSize={0.22} color="#333">n != 0?</Text>
      {/* Looping arrow */}
      {loop && (
        <Arrow3D
          from={[0, 0.45, 0]}
          to={[0, 2.7, 0]}
          color="#ffd54f"
          headLength={0.18}
          headWidth={0.12}
        />
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

export default function WhileLoopFlow() {
  const [step, setStep] = useState(0);
  const current = animationScript[step];
  const { codeLineIdx, explanation, n, loop } = current;

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
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }} shadows>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.2} />
          <directionalLight position={[-10, 10, 5]} intensity={1} />
          <WhileDiagram n={n} loop={loop} />
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={15}/>
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
          <h2>while Loop Control Flow</h2>
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