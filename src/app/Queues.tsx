'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/three';

const codeLines = [
  '// A queue follows the First-In, First-Out (FIFO) principle.',
  'use std::collections::VecDeque;',
  'let mut queue = VecDeque::new();',
  '',
  '// `push_back` adds an element to the end (enqueue).',
  'queue.push_back(1);',
  'queue.push_back(2);',
  'queue.push_back(3);',
  '',
  '// `pop_front` removes the first element (dequeue).',
  'let first = queue.pop_front(); // Some(1)',
];

const animationScript = [
  { explanation: "Let's cover Queues. They follow a First-In, First-Out (FIFO) rule, like a line at a store.", codeLineIdx: 0, queue: [] },
  { explanation: "We use a `VecDeque` (a double-ended queue) for efficiency. It's initially empty.", codeLineIdx: 2, queue: [] },
  { explanation: '`push_back(1)` enqueues 1. It goes to the back of the line.', codeLineIdx: 5, queue: [1] },
  { explanation: '`push_back(2)` enqueues 2 behind 1.', codeLineIdx: 6, queue: [1, 2] },
  { explanation: '`push_back(3)` enqueues 3 at the very back.', codeLineIdx: 7, queue: [1, 2, 3] },
  { explanation: '`pop_front()` dequeues the front element (1) and returns it.', codeLineIdx: 10, queue: [2, 3], popValue: 1 },
];

function Queue3D({ queue, popValue }: { queue: number[], popValue: number | null }) {
  const { popX } = useSpring({ from: { popX: 0 }, to: { popX: popValue !== null ? -2 : 0 } });
  return (
    <group>
      {queue.map((val, i) => (
        <Box key={val} position={[-1.5 + i * 1.6, 0, 0]} args={[1.4, 1.4, 1.4]}>
          <meshStandardMaterial color={i === 0 ? '#ffd54f' : '#64b5f6'} />
          <Text position={[0, 0, 0.8]} fontSize={0.4} color="#333">{val}</Text>
        </Box>
      ))}
       {popValue !== null && (
        <animated.group position-x={popX}>
          <Box position={[-1.5, 2, 0]} args={[1.4, 1.4, 1.4]}>
            <meshStandardMaterial color="#e57373" />
            <Text position={[0, 0, 0.8]} fontSize={0.4} color="#333">{popValue}</Text>
          </Box>
        </animated.group>
      )}
    </group>
  );
}

function Controls({ step, totalSteps, onPrev, onNext, onReset }: { step: number; totalSteps: number; onPrev: () => void; onNext: () => void; onReset: () => void }) {
  // ... (same as other files)
}

export default function Queues() {
  const [step, setStep] = useState(0);
  const current = animationScript[step];
  const { codeLineIdx, explanation, queue, popValue } = current;
  
  // ... (same event handlers and useEffect as other files)

  return (
    <>
      <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #232526 0%, #414345 100%)' }}>
        <Canvas camera={{ position: [0, 2, 8], fov: 50 }} shadows>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.2} />
          <directionalLight position={[-10, 10, 5]} intensity={1} />
          <Queue3D queue={queue} popValue={popValue ?? null} />
          <OrbitControls />
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
          <h2>Data Structures: Queue</h2>
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
        {/* Controls would go here */}
      </div>
    </>
  );
} 