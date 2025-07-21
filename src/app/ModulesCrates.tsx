'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import React, { useState, useEffect } from 'react';

const codeLines = [
  '// src/main.rs',
  'mod utils;',
  'fn main() {',
  '    utils::greet();',
  '}',
  '',
  '// src/utils.rs',
  'pub fn greet() {',
  '    println!("Hello from utils!");',
  '}',
  '',
  '// Cargo.toml',
  '[package]',
  'name = "my_crate"',
  'version = "0.1.0"',
];

const animationScript = [
  { explanation: "Let's see how Rust organizes code with modules and crates.", codeLineIdx: 0, state: { main: true, utils: false } },
  { explanation: 'A module is a file or folder. Here, utils.rs is a module.', codeLineIdx: 1, state: { main: true, utils: true } },
  { explanation: 'We declare the module in main.rs with mod utils;.', codeLineIdx: 1, state: { main: true, utils: true, mod: true } },
  { explanation: 'We call a public function from the module: utils::greet();', codeLineIdx: 3, state: { main: true, utils: true, mod: true, call: true } },
  { explanation: 'In utils.rs, pub makes greet visible outside.', codeLineIdx: 6, state: { main: true, utils: true, mod: true, call: true, pub: true } },
  { explanation: 'Cargo.toml defines the crate (package) metadata.', codeLineIdx: 10, state: { main: true, utils: true, mod: true, call: true, pub: true, cargo: true } },
];

function ModulesCrates3D({ state }: { state: any }) {
  return (
    <group>
      {/* File/folder structure */}
      <Box position={[-4, 2, 0]} args={[2, 1, 1]}>
        <meshStandardMaterial color={state.main ? '#ffd54f' : '#bdbdbd'} />
        <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">main.rs</Text>
      </Box>
      <Box position={[-4, 0.5, 0]} args={[2, 1, 1]}>
        <meshStandardMaterial color={state.utils ? '#81c784' : '#bdbdbd'} />
        <Text position={[0, 0, 0.6]} fontSize={0.22} color="#333">utils.rs</Text>
      </Box>
      {/* Arrows and highlights for mod/pub/use */}
      {state.mod && (
        <Text position={[-1.5, 1.25, 0]} fontSize={0.18} color="#64b5f6">mod utils;</Text>
      )}
      {state.call && (
        <Text position={[-1.5, 0.1, 0]} fontSize={0.18} color="#64b5f6">utils::greet()</Text>
      )}
      {state.pub && (
        <Text position={[-1.5, -0.7, 0]} fontSize={0.18} color="#fbc02d">pub fn greet</Text>
      )}
      {/* Cargo.toml */}
      {state.cargo && (
        <Box position={[4, 1, 0]} args={[2.5, 1.5, 1]}>
          <meshStandardMaterial color={'#b39ddb'} />
          <Text position={[0, 0, 0.6]} fontSize={0.18} color="#333">Cargo.toml</Text>
        </Box>
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

export default function ModulesCrates() {
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
          <ModulesCrates3D state={state} />
          <OrbitControls />
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
            <h2>Modules & Crates</h2>
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