'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Line } from '@react-three/drei';
import React, { useState, useEffect } from 'react';

const codeLines = [
  'use std::thread;',
  'use std::sync::mpsc;',
  '',
  'let (tx, rx) = mpsc::channel();',
  'for i in 0..3 {',
  '    let tx = tx.clone();',
  '    thread::spawn(move || {',
  '        tx.send(i).unwrap();',
  '    });',
  '}',
  'for _ in 0..3 {',
  '    let msg = rx.recv().unwrap();',
  '    println!("Got: {}", msg);',
  '}',
];

const animationScript = [
  { explanation: "Let's see message passing with multiple threads.", codeLineIdx: 0, state: { main: true, threads: 0, channel: false, sent: 0, received: 0 } },
  { explanation: 'Create a channel and spawn 3 threads.', codeLineIdx: 4, state: { main: true, threads: 3, channel: true, sent: 0, received: 0 } },
  { explanation: 'Each thread sends a message.', codeLineIdx: 7, state: { main: true, threads: 3, channel: true, sent: 3, received: 0 } },
  { explanation: 'Main thread receives all messages.', codeLineIdx: 11, state: { main: true, threads: 3, channel: true, sent: 3, received: 3 } },
];

function MessagePassing3D({ state }: { state: any }) {
  return (
    <group>
      {/* Main thread */}
      <Box position={[-4, 2, 0]} args={[2, 1, 1]}>
        <meshStandardMaterial color={state.main ? '#ffd54f' : '#bdbdbd'} />
        <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">Main</Text>
      </Box>
      {/* Spawned threads */}
      {Array.from({ length: state.threads || 0 }).map((_, i) => (
        <Box key={i} position={[4, 2 - i * 1.2, 0]} args={[2, 1, 1]}>
          <meshStandardMaterial color={'#81c784'} />
          <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">Thread {i+1}</Text>
        </Box>
      ))}
      {/* Channel */}
      {state.channel && (
        <Box position={[0, 2, 0]} args={[2, 1, 1]}>
          <meshStandardMaterial color={'#64b5f6'} />
          <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">Channel</Text>
        </Box>
      )}
      {/* Message passing */}
      {Array.from({ length: state.sent || 0 }).map((_, i) => (
        <Line key={i} points={[[4, 2 - i * 1.2, 0],[0,2,0]]} color="#fbc02d" lineWidth={3} />
      ))}
      {Array.from({ length: state.received || 0 }).map((_, i) => (
        <Line key={i} points={[[0,2,0],[-4,2,0]]} color="#e57373" lineWidth={3} />
      ))}
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

export default function MessagePassing() {
  const [step, setStep] = useState(0);
  const current = animationScript[step];
  const { codeLineIdx, explanation, state } = current;

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
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <MessagePassing3D state={state} />
          <OrbitControls />
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
            <h2>Message Passing</h2>
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