'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Text, Torus, Sphere } from '@react-three/drei';
import React, { useMemo, useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/three';

const codeLines = [
  '// i8: -128 to 127',
  'let mut x: i8 = 127;',
  'x = x + 1;',
  'println!("{}", x); // -128 (overflow)',
  '',
  '// u8: 0 to 255',
  'let mut y: u8 = 255;',
  'y = y + 1;',
  'println!("{}", y); // 0 (overflow)',
];

const animationScript = [
  { explanation: 'Let’s visualize how integer overflow works in Rust using cyclic notation. We’ll start with i8, which ranges from -128 to 127.', codeLineIdx: 0, pointer: 127, type: 'i8', vibrate: false },
  { explanation: 'We assign x = 127, the maximum value for i8.', codeLineIdx: 1, pointer: 127, type: 'i8', vibrate: false },
  { explanation: 'Now we add 1 to x. The value wraps around to -128 (overflow).', codeLineIdx: 2, pointer: -128, type: 'i8', vibrate: true },
  { explanation: 'Printing x now shows -128.', codeLineIdx: 3, pointer: -128, type: 'i8', vibrate: false },
  { explanation: 'Now let’s look at u8, which ranges from 0 to 255.', codeLineIdx: 5, pointer: 255, type: 'u8', vibrate: false },
  { explanation: 'We assign y = 255, the maximum value for u8.', codeLineIdx: 6, pointer: 255, type: 'u8', vibrate: false },
  { explanation: 'Adding 1 to y wraps it around to 0 (overflow).', codeLineIdx: 7, pointer: 0, type: 'u8', vibrate: true },
  { explanation: 'Printing y now shows 0.', codeLineIdx: 8, pointer: 0, type: 'u8', vibrate: false },
];

function getRange(type: 'i8' | 'u8') {
  if (type === 'i8') return { min: -128, max: 127, count: 256 };
  return { min: 0, max: 255, count: 256 };
}

function angleForValue(value: number, type: 'i8' | 'u8') {
  const { min, max, count } = getRange(type);
  // Map value to [0, 2π)
  let idx = type === 'i8' ? value - min : value;
  return (idx / count) * Math.PI * 2;
}

function CyclicCircle({ pointer, type, vibrate, showLabels, center = [0,0,0] }: { pointer: number; type: 'i8' | 'u8'; vibrate: boolean; showLabels?: boolean; center?: [number, number, number] }) {
  const { min, max, count } = getRange(type);
  const radius = 2;
  // 0 at top, increase clockwise
  function angleForValueClockwise(value: number) {
    let idx = type === 'i8' ? value - min : value;
    return (idx / count) * Math.PI * 2 - Math.PI / 2;
  }
  const angle = angleForValueClockwise(pointer);
  const pointerX = radius * Math.cos(angle);
  const pointerY = radius * Math.sin(angle);
  const vibration = useSpring({
    scale: vibrate ? 1.08 : 1,
    config: { tension: 400, friction: 2 },
    loop: vibrate,
  });
  // Markers for min/max/0
  const minAngle = angleForValueClockwise(min);
  const maxAngle = angleForValueClockwise(max);
  const zeroAngle = angleForValueClockwise(0);
  const minX = radius * Math.cos(minAngle);
  const minY = radius * Math.sin(minAngle);
  const maxX = radius * Math.cos(maxAngle);
  const maxY = radius * Math.sin(maxAngle);
  const zeroX = radius * Math.cos(zeroAngle);
  const zeroY = radius * Math.sin(zeroAngle);
  // Key labels and ticks
  const labels = useMemo(() => {
    if (!showLabels) return null;
    const nums = [];
    const tickLen = 0.18;
    for (let i = min; i <= max; i++) {
      const a = angleForValueClockwise(i);
      const x = radius * Math.cos(a);
      const y = radius * Math.sin(a);
      // Draw small tick for every value
      const tickX1 = (radius - tickLen) * Math.cos(a);
      const tickY1 = (radius - tickLen) * Math.sin(a);
      const tickX2 = (radius + tickLen) * Math.cos(a);
      const tickY2 = (radius + tickLen) * Math.sin(a);
      nums.push(
        <>
          <mesh key={`tick-${i}`} position={[(tickX1+tickX2)/2, (tickY1+tickY2)/2, 0.01]}>
            <boxGeometry args={[0.03, 0.18, 0.03]} />
            <meshStandardMaterial color="#888" />
          </mesh>
          <Text key={`label-${i}`} position={[x, y, 0.13]} fontSize={0.07} color="#aaa" anchorX="center">{i}</Text>
        </>
      );
    }
    return nums;
  }, [type, min, max, showLabels]);
  return (
    <animated.group scale={vibration.scale} position={center}>
      <Torus args={[radius, 0.18, 32, 100]}>
        <meshStandardMaterial color={type === 'i8' ? '#64b5f6' : '#ffd54f'} metalness={0.4} roughness={0.2} />
      </Torus>
      {/* Min marker */}
      <Sphere args={[0.22, 24, 24]} position={[minX, minY, 0.2]}>
        <meshStandardMaterial color="#e57373" />
      </Sphere>
      <Text position={[minX, minY - 0.5, 0.3]} fontSize={0.22} color="#e57373" anchorX="center">{min}</Text>
      {/* Max marker */}
      <Sphere args={[0.22, 24, 24]} position={[maxX, maxY, 0.2]}>
        <meshStandardMaterial color="#81c784" />
      </Sphere>
      <Text position={[maxX, maxY + 0.5, 0.3]} fontSize={0.22} color="#81c784" anchorX="center">{max}</Text>
      {/* 0 marker */}
      <Sphere args={[0.18, 24, 24]} position={[zeroX, zeroY, 0.18]}>
        <meshStandardMaterial color="#fff" />
      </Sphere>
      <Text position={[zeroX, zeroY - 0.5, 0.3]} fontSize={0.18} color="#fff" anchorX="center">0</Text>
      {/* Pointer */}
      <Sphere args={[0.28, 24, 24]} position={[pointerX, pointerY, 0.4]}>
        <meshStandardMaterial color="#ffeb3b" />
      </Sphere>
      <Text position={[pointerX, pointerY, 0.7]} fontSize={0.32} color="#333" anchorX="center">{pointer}</Text>
      {labels}
    </animated.group>
  );
}

function OutputConsole({ logs }: { logs: string[] }) {
  return (
    <Html position={[0, -5.5, 0]} center style={{ width: 500, pointerEvents: 'none' }}>
      <div className="glass-panel" style={{ background: 'rgba(30,30,30,0.8)', padding: '16px', color: '#f0f0f0', fontFamily: 'Fira Code, monospace', fontSize: 16 }}>
        <b>Output Log:</b>
        <div style={{ minHeight: 24, color: '#ff5252', paddingTop: '8px' }}>
          {logs.length === 0 && <span style={{ color: '#aaa', opacity: 0.7 }}>No output yet...</span>}
          {logs.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      </div>
    </Html>
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
        <button onClick={onNext} disabled={step === totalSteps - 1} title="Next (→)">Next ›</button>
      </div>
    </div>
  );
}

export default function CyclicNotation() {
  const [step, setStep] = useState(0);
  const current = animationScript[step];
  const { codeLineIdx, explanation, pointer, type, vibrate } = current;

  // Output log logic
  const logs = useMemo(() => {
    if (step === 3) return ['-128', 'thread panicked at \'attempt to add with overflow\''];
    if (step === 7) return ['0', 'thread panicked at \'attempt to add with overflow\''];
    if (step === 2) return ['thread panicked at \'attempt to add with overflow\''];
    if (step === 6) return ['thread panicked at \'attempt to add with overflow\''];
    return [];
  }, [step]);

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
      <style>{`
        body { font-family: 'Inter', sans-serif; }
        .glass-panel {
          background: rgba(35, 37, 39, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 16px;
          padding: 24px;
          color: #f0f0f0;
        }
        .controls-container {
          position: fixed;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          width: 400px;
          background: rgba(35, 37, 39, 0.7);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 16px;
          padding: 12px;
        }
        .progress-bar-background {
          width: calc(100% - 24px);
          height: 4px;
          background-color: rgba(0,0,0,0.3);
          border-radius: 2px;
          margin: 0 12px 12px 12px;
        }
        .progress-bar-foreground {
          height: 100%;
          background-color: #64b5f6;
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        .buttons {
          display: flex;
          justify-content: space-between;
        }
        .buttons button {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.1);
          color: #f0f0f0;
          border: 1px solid rgba(255,255,255,0.2);
          padding: 8px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s, color 0.2s;
        }
        .buttons button:hover:not(:disabled) {
          background-color: #ffd54f;
          color: #111;
        }
        .buttons button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .info-panel {
          position: fixed;
          left: 32px;
          top: 32px;
          width: 480px;
          z-index: 10;
        }
        .info-panel h2 {
          margin: 0 0 16px 0;
          font-weight: 600;
          border-bottom: 1px solid rgba(255,255,255,0.2);
          padding-bottom: 12px;
        }
        .code-container {
          background: rgba(0,0,0,0.3);
          border-radius: 8px;
          padding: 16px;
          font-family: 'Fira Code', 'Roboto Mono', monospace;
          font-size: 15px;
          line-height: 1.6;
          position: relative;
        }
        .code-line {
          display: flex;
          transition: background-color 0.3s ease;
          padding: 2px 8px;
          margin: 0 -8px;
          border-radius: 4px;
        }
        .line-number {
          width: 2em;
          text-align: right;
          margin-right: 16px;
          color: #cccccc;
          opacity: 0.6;
          user-select: none;
        }
        .line-active {
          background-color: rgba(98, 179, 246, 0.2);
        }
        .explanation-text {
          font-size: 18px;
          color: #f0f0f0;
          min-height: 80px;
          line-height: 1.5;
          transition: opacity 0.2s ease-in-out;
        }
      `}</style>
      <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #232526 0%, #414345 100%)' }}>
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }} shadows>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.2} />
          <directionalLight position={[-10, 10, 5]} intensity={1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
          {/* Two circles: i8 on left, u8 on right */}
          <CyclicCircle pointer={type === 'i8' ? pointer : -128} type={'i8'} vibrate={type === 'i8' && vibrate} showLabels={true} center={[-7,0,0]} />
          <CyclicCircle pointer={type === 'u8' ? pointer : 255} type={'u8'} vibrate={type === 'u8' && vibrate} showLabels={true} center={[7,0,0]} />
          <OutputConsole logs={logs} />
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={15}/>
        </Canvas>
        <div className="info-panel glass-panel">
          <h2>Cyclic Notation & Integer Overflow</h2>
          <div className="code-container">
            {codeLines.map((line, idx) => (
              <div key={idx} className={`code-line ${idx === codeLineIdx ? 'line-active' : ''}`}>
                <span className="line-number">{idx + 1}</span>
                <code>{line}</code>
              </div>
            ))}
          </div>
          <h2 style={{ margin: '24px 0 8px' }}>Explanation</h2>
          <div className="explanation-text">{explanation}</div>
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
