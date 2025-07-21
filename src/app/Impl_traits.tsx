'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Text, Box, Sphere } from '@react-three/drei';
import React, { useState, useEffect } from 'react';

const codeLines = [
  '// Struct and impl block',
  'struct Point { x: i32, y: i32 }',
  'impl Point {',
  '    fn distance_from_origin(&self) -> f64 {',
  '        ((self.x * self.x + self.y * self.y) as f64).sqrt()',
  '    }',
  '}',
  'let p = Point { x: 3, y: 4 };',
  'println!("{}", p.distance_from_origin());',
  '',
  '// Trait and impl for struct',
  'trait Drawable {',
  '    fn draw(&self);',
  '}',
  'impl Drawable for Point {',
  '    fn draw(&self) {',
  '        println!("Drawing Point at ({}, {})", self.x, self.y);',
  '    }',
  '}',
  'p.draw();',
  '',
  '// Enum and trait',
  'enum Shape { Circle(f64), Square(f64) }',
  'impl Drawable for Shape {',
  '    fn draw(&self) {',
  '        match self {',
  '            Shape::Circle(r) => println!("Drawing Circle with r = {}", r),',
  '            Shape::Square(s) => println!("Drawing Square with s = {}", s),',
  '        }',
  '    }',
  '}',
  'let c = Shape::Circle(2.0);',
  'c.draw();',
];

const animationScript = [
  { explanation: 'Let’s learn about impl blocks and traits in Rust. We start with a struct and its impl block.', codeLineIdx: 0, step: 'struct-impl', struct: null, trait: null, enum: null, highlight: 0 },
  { explanation: 'This is a struct definition for Point.', codeLineIdx: 1, step: 'struct-impl', struct: null, trait: null, enum: null, highlight: 1 },
  { explanation: 'The impl block defines methods for Point. Here, distance_from_origin computes the distance.', codeLineIdx: 2, step: 'struct-impl', struct: null, trait: null, enum: null, highlight: 2 },
  { explanation: 'We create a Point and call its method.', codeLineIdx: 7, step: 'struct-inst', struct: { x: 3, y: 4, showDistance: true }, trait: null, enum: null, highlight: 7 },
  { explanation: 'The result is 5.0 (distance from origin).', codeLineIdx: 8, step: 'struct-inst', struct: { x: 3, y: 4, showDistance: true }, trait: null, enum: null, highlight: 8 },
  { explanation: 'Now, let’s define a trait Drawable and implement it for Point.', codeLineIdx: 11, step: 'trait-def', struct: null, trait: 'Drawable', enum: null, highlight: 11 },
  { explanation: 'We implement Drawable for Point. The draw method prints the point.', codeLineIdx: 14, step: 'trait-impl', struct: { x: 3, y: 4, showDraw: true }, trait: 'Drawable', enum: null, highlight: 14 },
  { explanation: 'We call p.draw(), which prints the point.', codeLineIdx: 19, step: 'trait-impl', struct: { x: 3, y: 4, showDraw: true }, trait: 'Drawable', enum: null, highlight: 19 },
  { explanation: 'Now, let’s look at enums and traits. Shape is an enum.', codeLineIdx: 21, step: 'enum-def', struct: null, trait: null, enum: { type: 'Circle', value: 2.0 }, highlight: 21 },
  { explanation: 'We implement Drawable for Shape. draw prints different messages for Circle and Square.', codeLineIdx: 23, step: 'enum-trait', struct: null, trait: 'Drawable', enum: { type: 'Circle', value: 2.0 }, highlight: 23 },
  { explanation: 'We create a Shape::Circle and call draw().', codeLineIdx: 30, step: 'enum-inst', struct: null, trait: 'Drawable', enum: { type: 'Circle', value: 2.0, showDraw: true }, highlight: 30 },
];

function Point3D({ x, y, showDistance, showDraw }: { x: number; y: number; showDistance?: boolean; showDraw?: boolean }) {
  return (
    <group position={[-4, 0, 0]}>
      <Box args={[1.2, 1.2, 1.2]} position={[0, 0.7, 0]}>
        <meshStandardMaterial color="#64b5f6" />
      </Box>
      <Text position={[0, 1.5, 0.7]} fontSize={0.22} color="#fff">Point</Text>
      <Text position={[-0.4, 0.7, 0.7]} fontSize={0.18} color="#ffd54f">x: {x}</Text>
      <Text position={[0.4, 0.7, 0.7]} fontSize={0.18} color="#ffd54f">y: {y}</Text>
      {showDistance && <Text position={[0, -0.7, 0.7]} fontSize={0.18} color="#81c784">distance: 5.0</Text>}
      {showDraw && <Text position={[0, -1.1, 0.7]} fontSize={0.18} color="#ffd54f">draw()</Text>}
    </group>
  );
}

function Shape3D({ type, value, showDraw }: { type: string; value: number; showDraw?: boolean }) {
  const color = type === 'Circle' ? '#ffd54f' : '#e57373';
  return (
    <group position={[4, 0, 0]}>
      <Text position={[0, 2.5, 0]} fontSize={0.22} color="#fff">Shape</Text>
      {type === 'Circle' && <Sphere args={[0.7, 24, 24]} position={[0, 0.7, 0]}><meshStandardMaterial color={color} /></Sphere>}
      {type === 'Square' && <Box args={[1.2, 1.2, 1.2]} position={[0, 0.7, 0]}><meshStandardMaterial color={color} /></Box>}
      <Text position={[0, 1.5, 0.7]} fontSize={0.18} color="#ffd54f">{type}: {value}</Text>
      {showDraw && <Text position={[0, -0.7, 0.7]} fontSize={0.18} color="#ffd54f">draw()</Text>}
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

export default function ImplTraits() {
  const [step, setStep] = useState(0);
  const current = animationScript[step];
  const { codeLineIdx, explanation, struct, trait, enum: enumVal } = current;

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
          {struct && <Point3D x={struct.x} y={struct.y} showDistance={struct.showDistance} showDraw={struct.showDraw} />}
          {enumVal && <Shape3D type={enumVal.type} value={enumVal.value} showDraw={enumVal.showDraw} />}
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={15}/>
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
          <h2>Rust impl blocks & Traits</h2>
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