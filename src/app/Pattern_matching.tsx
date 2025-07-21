'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Text, Box } from '@react-three/drei';
import React, { useState, useEffect } from 'react';

const codeLines = [
  '// Pattern matching and destructuring',
  'struct Point { x: i32, y: i32 }',
  'let (a, b) = (10, 20);',
  'println!("a = {}, b = {}", a, b);',
  'let point = Point { x: 5, y: 8 };',
  'let Point { x, y } = point;',
  'println!("x = {}, y = {}", x, y);',
  'let arr = [1, 2, 3];',
  'let [first, .., last] = arr;',
  'println!("first = {}, last = {}", first, last);',
];

const animationScript = [
  { explanation: 'Let’s look at pattern matching and destructuring. This lets you break up complex data types.', codeLineIdx: 0, pattern: null, highlight: 0 },
  { explanation: 'We can destructure tuples. `a` becomes 10, and `b` becomes 20.', codeLineIdx: 2, pattern: { type: 'tuple', data: { a: 10, b: 20 } }, highlight: 2 },
  { explanation: 'We can destructure structs. `x` becomes 5, and `y` becomes 8.', codeLineIdx: 5, pattern: { type: 'struct', data: { x: 5, y: 8 } }, highlight: 5 },
  { explanation: 'We can also destructure arrays. `first` becomes 1, and `last` becomes 3.', codeLineIdx: 8, pattern: { type: 'array', data: { first: 1, last: 3 } }, highlight: 8 },
];

function Pattern3D({ type, data }: { type: string, data: any }) {
  return (
    <group position={[0, 0, 0]}>
      {type === 'tuple' && (
        <>
          <Box args={[1.2, 1.2, 1.2]} position={[-1.5, 0.7, 0]}><meshStandardMaterial color="#ffd54f" /></Box>
          <Text position={[-1.5, 1.5, 0.7]} fontSize={0.18} color="#333">a: {data.a}</Text>
          <Box args={[1.2, 1.2, 1.2]} position={[1.5, 0.7, 0]}><meshStandardMaterial color="#ffd54f" /></Box>
          <Text position={[1.5, 1.5, 0.7]} fontSize={0.18} color="#333">b: {data.b}</Text>
          <Text position={[0, 1.7, 0.7]} fontSize={0.22} color="#fff">(a, b)</Text>
        </>
      )}
      {type === 'struct' && (
        <>
          <Box args={[1.2, 1.2, 1.2]} position={[0, 0.7, 0]}><meshStandardMaterial color="#64b5f6" /></Box>
          <Text position={[0, 1.5, 0.7]} fontSize={0.22} color="#fff">Point</Text>
          <Text position={[-0.4, 0.7, 0.7]} fontSize={0.18} color="#ffd54f">x: {data.x}</Text>
          <Text position={[0.4, 0.7, 0.7]} fontSize={0.18} color="#ffd54f">y: {data.y}</Text>
          <Text position={[0, 1.7, 0.7]} fontSize={0.22} color="#fff">Point {`{ x, y }`}</Text>
        </>
      )}
      {type === 'array' && (
        <>
          <Box args={[1.2, 1.2, 1.2]} position={[-1.5, 0.7, 0]}><meshStandardMaterial color="#e57373" /></Box>
          <Text position={[-1.5, 1.5, 0.7]} fontSize={0.18} color="#fff">first: {data.first}</Text>
          <Box args={[1.2, 1.2, 1.2]} position={[1.5, 0.7, 0]}><meshStandardMaterial color="#e57373" /></Box>
          <Text position={[1.5, 1.5, 0.7]} fontSize={0.18} color="#fff">last: {data.last}</Text>
          <Text position={[0, 1.7, 0.7]} fontSize={0.22} color="#fff">[first, .., last]</Text>
        </>
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

export default function PatternMatching() {
  const [step, setStep] = useState(0);
  const current = animationScript[step];
  const { codeLineIdx, explanation, pattern } = current;

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
          {pattern && <Pattern3D type={pattern.type} data={pattern.data} />}
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={15}/>
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
          <h2>Rust Pattern Matching & Destructuring</h2>
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