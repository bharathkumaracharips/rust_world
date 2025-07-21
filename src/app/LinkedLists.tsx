'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Text, Box, Line } from '@react-three/drei';
import React, { useState, useEffect } from 'react';
import * as THREE from 'three';

const codeLines = [
  '// A singly linked list is a sequence of nodes.',
  '// Each node contains a value and a pointer to the next node.',
  'use std::collections::LinkedList;',
  '',
  'let mut list = LinkedList::new();',
  '',
  '// `push_front` adds an element to the beginning.',
  'list.push_front(3);',
  'list.push_front(2);',
  'list.push_front(1);',
  '',
  '// `pop_front` removes the first element.',
  'let first = list.pop_front(); // Some(1)',
];

const animationScript = [
  { explanation: "Let's look at a Linked List. It's a chain of nodes, each pointing to the next.", codeLineIdx: 0, list: [], pop: null },
  { explanation: 'We create a new, empty LinkedList.', codeLineIdx: 4, list: [], pop: null },
  { explanation: '`push_front(3)` adds 3 to the front. It becomes the new head.', codeLineIdx: 7, list: [3], pop: null },
  { explanation: '`push_front(2)` adds 2. It points to the old head (3).', codeLineIdx: 8, list: [2, 3], pop: null },
  { explanation: '`push_front(1)` adds 1, which is now the head.', codeLineIdx: 9, list: [1, 2, 3], pop: null },
  { explanation: '`pop_front()` removes the head (1) and returns it.', codeLineIdx: 12, list: [2, 3], pop: 1 },
];

function Node({ value, position, isHead }: { value: number; position: [number, number, number]; isHead: boolean }) {
  return (
    <group position={position}>
      <Box args={[1, 1, 1]}>
        <meshStandardMaterial color={isHead ? '#ffd54f' : '#64b5f6'} />
      </Box>
      <Text position={[0, 0, 0.6]} fontSize={0.3} color="#333">{value}</Text>
    </group>
  );
}

function LinkedList3D({ list, popValue }: { list: number[], popValue: number | null }) {
  const nodePositions = list.map((_, i) => [-3 + i * 2.5, 0, 0]);
  return (
    <group>
      {list.map((val, i) => (
        <React.Fragment key={i}>
          <Node value={val} position={nodePositions[i] as [number, number, number]} isHead={i === 0} />
          {i < list.length - 1 && (
            <Line
              points={[[-3 + i * 2.5 + 0.5, 0, 0], [-3 + (i + 1) * 2.5 - 0.5, 0, 0]]}
              color="white"
              lineWidth={2}
            />
          )}
        </React.Fragment>
      ))}
      {popValue !== null && (
        <group position={[-3, 1.5, 0]}>
          <Text fontSize={0.3} color="#e57373">Popped: {popValue}</Text>
        </group>
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

export default function LinkedLists() {
  const [step, setStep] = useState(0);
  const current = animationScript[step];
  const { codeLineIdx, explanation, list, pop } = current;

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
          <LinkedList3D list={list} popValue={pop} />
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={20}/>
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
          <h2>Data Structures: Linked List</h2>
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