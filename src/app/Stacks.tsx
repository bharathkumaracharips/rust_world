'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/three';

const codeLines = [
  '// A stack follows the Last-In, First-Out (LIFO) principle.',
  '// A `Vec` can be used as a stack.',
  'let mut stack = Vec::new();',
  '',
  '// `push` adds an element to the top.',
  'stack.push(1);',
  'stack.push(2);',
  'stack.push(3);',
  '',
  '// `pop` removes the top element.',
  'let top = stack.pop(); // Some(3)',
];

const animationScript = [
  { explanation: "Now for Stacks. Think of a stack of plates: you add to the top and remove from the top (LIFO).", codeLineIdx: 0, stack: [] },
  { explanation: "We'll use a `Vec` to act as our stack. It's initially empty.", codeLineIdx: 2, stack: [] },
  { explanation: 'We `push` 1 onto the stack. It becomes the bottom element.', codeLineIdx: 5, stack: [1] },
  { explanation: 'Pushing 2. It goes on top of 1.', codeLineIdx: 6, stack: [1, 2] },
  { explanation: 'Pushing 3. It becomes the new top.', codeLineIdx: 7, stack: [1, 2, 3] },
  { explanation: '`pop` removes the top element (3) and returns it.', codeLineIdx: 10, stack: [1, 2], popValue: 3 },
];

function Stack3D({ stack, popValue }: { stack: number[], popValue: number | null }) {
  const { popY } = useSpring({ from: { popY: 0 }, to: { popY: popValue !== null ? 2 : 0 } });

  return (
    <group>
      {stack.map((val, i) => (
        <Box key={i} position={[0, -1.5 + i * 1.1, 0]} args={[1.5, 1, 1.5]}>
          <meshStandardMaterial color={i === stack.length - 1 ? '#ffd54f' : '#64b5f6'} />
          <Text position={[0, 0, 0.8]} fontSize={0.4} color="#333">{val}</Text>
        </Box>
      ))}
      {popValue !== null && (
        <animated.group position-y={popY}>
          <Box position={[2.5, -1.5 + stack.length * 1.1, 0]} args={[1.5, 1, 1.5]}>
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

export default function Stacks() {
  const [step, setStep] = useState(0);
  const current = animationScript[step];
  const { codeLineIdx, explanation, stack, popValue } = current;

  // ... (same event handlers and useEffect as other files)

  return (
    <>
       <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #232526 0%, #414345 100%)' }}>
        <Canvas camera={{ position: [5, 5, 5], fov: 50 }} shadows>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.2} />
          <directionalLight position={[-10, 10, 5]} intensity={1} />
          <Stack3D stack={stack} popValue={popValue ?? null} />
          <OrbitControls />
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
          <h2>Data Structures: Stack</h2>
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