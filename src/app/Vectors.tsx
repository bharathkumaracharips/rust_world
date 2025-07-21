'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Text, Box, Line } from '@react-three/drei';
import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/three';

const AnimatedText = animated(Text);

const codeLines = [
  '// Vectors are like re-sizable arrays, stored on the heap.',
  'let mut vec = Vec::new();',
  '',
  '// `push` adds an element to the end.',
  'vec.push(10);',
  'vec.push(20);',
  'vec.push(30);',
  '',
  '// Access elements by index, just like arrays.',
  'let second = vec[1]; // 20',
  '',
  '// `pop` removes the last element and returns it.',
  'let last = vec.pop(); // Some(30)',
  '',
  '// Length vs. Capacity: Length is # of elements, Capacity is allocated space.',
];

const animationScript = [
  { explanation: "Next up: Vectors. Unlike arrays, vectors are growable and stored on the heap.", codeLineIdx: 0, vec: [], len: 0, cap: 0 },
  { explanation: 'We create a new, empty vector using `Vec::new()`.', codeLineIdx: 1, vec: [], len: 0, cap: 0 },
  { explanation: 'We use `push` to add an element. The vector allocates memory.', codeLineIdx: 4, vec: [10], len: 1, cap: 4 },
  { explanation: 'Pushing another element. Still within capacity.', codeLineIdx: 5, vec: [10, 20], len: 2, cap: 4 },
  { explanation: '...and another one.', codeLineIdx: 6, vec: [10, 20, 30], len: 3, cap: 4 },
  { explanation: 'Accessing elements is the same as with arrays.', codeLineIdx: 9, vec: [10, 20, 30], len: 3, cap: 4, highlightIndex: 1 },
  { explanation: '`pop` removes the last element. The length decreases, but capacity remains.', codeLineIdx: 12, vec: [10, 20], len: 2, cap: 4, popValue: 30 },
  { explanation: "Length is the number of items. Capacity is the space allocated. It grows automatically when needed.", codeLineIdx: 14, vec: [10, 20], len: 2, cap: 4 },
];

function Vector3D({ elements, capacity, highlightIndex, popValue }: { elements: number[], capacity: number, highlightIndex: number | null, popValue: number | null }) {
  const { len, cap } = useSpring({ len: elements.length, cap: capacity, config: { tension: 170, friction: 26 } });

  return (
    <group>
      {/* Heap-allocated blocks */}
      {Array.from({ length: capacity }).map((_, i) => (
        <Box key={i} position={[-3 + i * 1.25, 0, 0]} args={[1, 1, 1]}>
          <meshStandardMaterial
            color={i < elements.length ? (highlightIndex === i ? '#ffd54f' : '#64b5f6') : '#444'}
            transparent={i >= elements.length}
            opacity={i >= elements.length ? 0.2 : 1}
          />
        </Box>
      ))}

      {/* Values inside blocks */}
      {elements.map((el, i) => (
        <Text key={i} position={[-3 + i * 1.25, 0, 0.6]} fontSize={0.3} color="#333">{el}</Text>
      ))}

      {/* Popped value animation */}
      {popValue !== null && (
        <animated.group position={[-3 + elements.length * 1.25, 1.5, 0]}>
          <Text fontSize={0.3} color="#e57373">
            {popValue}
          </Text>
        </animated.group>
      )}

      {/* Control block on the stack */}
      <group position={[-5, -2, 0]}>
        <Box args={[3, 1, 1]}><meshStandardMaterial color="#81c784" /></Box>
        <Text position={[0, 0, 0.6]} fontSize={0.2} color="#333">Vec</Text>
        <AnimatedText position={[-0.8, -0.2, 0.6]} fontSize={0.2} color="#333">
          {len.to(v => `len: ${v.toFixed(0)}`)}
        </AnimatedText>
        <AnimatedText position={[0.8, -0.2, 0.6]} fontSize={0.2} color="#333">
          {cap.to(v => `cap: ${v.toFixed(0)}`)}
        </AnimatedText>
        <Line points={[[-1.5,0,0], [-4.5,1,0], [-4.5,1,0]]} color="white" lineWidth={1} dashed/>
      </group>
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

export default function Vectors() {
  const [step, setStep] = useState(0);
  const current = animationScript[step];
  const { codeLineIdx, explanation, vec, len, cap, highlightIndex, popValue } = current;

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
          <Vector3D elements={vec} capacity={cap} highlightIndex={highlightIndex ?? null} popValue={popValue ?? null} />
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={20}/>
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
          <h2>Data Structures: Vector</h2>
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