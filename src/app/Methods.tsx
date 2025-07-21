'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Text, Box } from '@react-three/drei';
import React, { useState, useEffect } from 'react';

const codeLines = [
  '// Method call',
  'struct Point { x: i32, y: i32 }',
  'impl Point {',
  '    fn magnitude(&self) -> f64 {',
  '        ((self.x * self.x + self.y * self.y) as f64).sqrt()',
  '    }',
  '}',
  'let p = Point { x: 3, y: 4 };',
  'let mag = p.magnitude();',
  'println!("mag = {}", mag);',
];

const animationScript = [
  { explanation: 'Now, let’s look at methods. A method is a function defined on a struct.', codeLineIdx: 0, method: null, highlight: 0 },
  { explanation: 'We define a Point struct.', codeLineIdx: 1, method: null, highlight: 1 },
  { explanation: 'The impl block contains the methods for Point. `magnitude` calculates the distance from the origin.', codeLineIdx: 2, method: null, highlight: 2 },
  { explanation: 'We create an instance of Point.', codeLineIdx: 7, method: { x: 3, y: 4, result: null }, highlight: 7 },
  { explanation: 'We call p.magnitude() on our Point instance.', codeLineIdx: 8, method: { x: 3, y: 4, result: 5.0 }, highlight: 8 },
  { explanation: 'mag is now 5.0.', codeLineIdx: 9, method: { x: 3, y: 4, result: 5.0 }, highlight: 9 },
];

function Method3D({ x, y, result }: { x: number; y: number; result: number | null }) {
  return (
    <group position={[0, 0, 0]}>
      <Box args={[1.2, 1.2, 1.2]} position={[0, 0.7, 0]}><meshStandardMaterial color="#64b5f6" /></Box>
      <Text position={[0, 1.5, 0.7]} fontSize={0.22} color="#fff">Point</Text>
      <Text position={[-0.4, 0.7, 0.7]} fontSize={0.18} color="#ffd54f">x: {x}</Text>
      <Text position={[0.4, 0.7, 0.7]} fontSize={0.18} color="#ffd54f">y: {y}</Text>
      {result !== null && <Text position={[0, -0.7, 0.7]} fontSize={0.22} color="#81c784">magnitude: {result}</Text>}
      <Text position={[0, 1.7, 0.7]} fontSize={0.22} color="#fff">p.magnitude()</Text>
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

export default function Methods() {
  const [step, setStep] = useState(0);
  const current = animationScript[step];
  const { codeLineIdx, explanation, method } = current;

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
          {method && <Method3D x={method.x} y={method.y} result={method.result} />}
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={15}/>
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
          <h2>Rust Methods</h2>
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