'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Text, Box, Sphere } from '@react-three/drei';
import React, { useState, useEffect } from 'react';

const codeLines = [
  '// Struct definition',
  'struct Point {',
  '    x: i32,',
  '    y: i32,',
  '}',
  'let p = Point { x: 3, y: 7 };',
  'println!("({}, {})", p.x, p.y);',
  '',
  '// Enum definition',
  'enum Direction {',
  '    Up,',
  '    Down,',
  '    Left,',
  '    Right,',
  '}',
  'let dir = Direction::Left;',
  'match dir {',
  '    Direction::Up => println!("Up"),',
  '    Direction::Down => println!("Down"),',
  '    Direction::Left => println!("Left"),',
  '    Direction::Right => println!("Right"),',
  '}',
];

const animationScript = [
  { explanation: 'Let’s learn about Rust construct types: struct and enum. We start with struct.', codeLineIdx: 0, step: 'struct-def', struct: null, enum: null, highlight: 0 },
  { explanation: 'This is a struct definition. A struct groups related fields together.', codeLineIdx: 1, step: 'struct-def', struct: null, enum: null, highlight: 1 },
  { explanation: 'The struct Point has two fields: x and y, both i32.', codeLineIdx: 2, step: 'struct-def', struct: null, enum: null, highlight: 2 },
  { explanation: 'We create a Point instance: p = Point { x: 3, y: 7 }.', codeLineIdx: 5, step: 'struct-inst', struct: { x: 3, y: 7 }, enum: null, highlight: 5 },
  { explanation: 'We can access fields: p.x = 3, p.y = 7.', codeLineIdx: 6, step: 'struct-inst', struct: { x: 3, y: 7 }, enum: null, highlight: 6 },
  { explanation: 'Now let’s look at enums. An enum lets you define a type by enumerating its possible variants.', codeLineIdx: 8, step: 'enum-def', struct: null, enum: null, highlight: 8 },
  { explanation: 'This is an enum definition. Direction can be Up, Down, Left, or Right.', codeLineIdx: 9, step: 'enum-def', struct: null, enum: null, highlight: 9 },
  { explanation: 'We create an enum value: dir = Direction::Left.', codeLineIdx: 15, step: 'enum-inst', struct: null, enum: 'Left', highlight: 15 },
  { explanation: 'We can match on enum values. Here, dir is Left.', codeLineIdx: 16, step: 'enum-match', struct: null, enum: 'Left', highlight: 16 },
  { explanation: 'The match arm Direction::Left runs: println!("Left")', codeLineIdx: 18, step: 'enum-match', struct: null, enum: 'Left', highlight: 18 },
];

function Struct3D({ x, y }: { x: number; y: number }) {
  return (
    <group position={[-3, 0, 0]}>
      <Box args={[1.2, 1.2, 1.2]} position={[0, 0.7, 0]}>
        <meshStandardMaterial color="#64b5f6" />
      </Box>
      <Text position={[0, 1.5, 0.7]} fontSize={0.22} color="#fff">Point</Text>
      <Text position={[-0.4, 0.7, 0.7]} fontSize={0.18} color="#ffd54f">x: {x}</Text>
      <Text position={[0.4, 0.7, 0.7]} fontSize={0.18} color="#ffd54f">y: {y}</Text>
    </group>
  );
}

function Enum3D({ variant }: { variant: string }) {
  const positions = {
    Up: [0, 2, 0],
    Down: [0, -2, 0],
    Left: [-2, 0, 0],
    Right: [2, 0, 0],
  } as const;
  return (
    <group position={[4, 0, 0]}>
      <Text position={[0, 2.5, 0]} fontSize={0.22} color="#fff">Direction</Text>
      {Object.entries(positions).map(([name, pos]) => (
        <Sphere key={name} args={[0.5, 24, 24]} position={pos as [number, number, number]}>
          <meshStandardMaterial color={variant === name ? '#ffd54f' : '#bdbdbd'} />
        </Sphere>
      ))}
      {Object.entries(positions).map(([name, pos]) => (
        <Text key={name} position={[(pos as [number, number, number])[0], (pos as [number, number, number])[1], 0.7]} fontSize={0.18} color="#333">{name}</Text>
      ))}
      {variant && (
        <Text position={[(positions as any)[variant][0], (positions as any)[variant][1], 1.1]} fontSize={0.22} color="#ffd54f">{variant}</Text>
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

export default function ConstructTypes() {
  const [step, setStep] = useState(0);
  const current = animationScript[step];
  const { codeLineIdx, explanation, struct, enum: enumVal } = current;

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
          {struct && <Struct3D x={struct.x} y={struct.y} />}
          {enumVal && <Enum3D variant={enumVal} />}
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={15}/>
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
          <h2>Rust Construct Types: struct & enum</h2>
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