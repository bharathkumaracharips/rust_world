'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Text } from '@react-three/drei';
import React, { useMemo, useState } from 'react';

// Helper to generate a random memory address
function randomAddress() {
  return '0x' + Math.floor(Math.random() * 0xfffff).toString(16).padStart(5, '0');
}

// Helper to split code lines into words for highlighting
function splitCodeLine(line: string) {
  return line.match(/\w+|[^\w\s]+/g) || [];
}

// Helper component for a memory cell (variable)
function MemoryCell({ position, label, value, highlight, mutable, address }: { position: [number, number, number], label?: string, value?: string | number, highlight?: boolean, mutable?: boolean, address: string }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.2, 1, 1]} />
        <meshStandardMaterial color={highlight ? '#ffeb3b' : mutable ? '#90caf9' : '#bdbdbd'} />
      </mesh>
      <Text position={[0, 0.4, 0.6]} fontSize={0.25} color="#333" anchorX="center" anchorY="middle">{label || address}</Text>
      {value !== undefined && <Text position={[0, 0, 0.6]} fontSize={0.3} color="#222" anchorX="center" anchorY="middle">{value}</Text>}
      {mutable && <Text position={[0, -0.4, 0.6]} fontSize={0.18} color="#1976d2" anchorX="center" anchorY="middle">mutable</Text>}
      <Text position={[0, -0.7, 0.6]} fontSize={0.16} color="#888" anchorX="center" anchorY="middle">{address}</Text>
    </group>
  );
}

// Helper component for the console area
function ConsoleArea({ output }: { output: string[] }) {
  return (
    <Html position={[0, -2.5, 0]} center style={{ width: 400, background: 'rgba(30,30,30,0.97)', borderRadius: 12, padding: 16, color: '#fff', fontFamily: 'monospace', fontSize: 18, boxShadow: '0 2px 16px #0006' }}>
      <div><b>Console Output:</b></div>
      <div style={{ minHeight: 32 }}>
        {output.map((line, i) => <div key={i}>{line}</div>)}
      </div>
    </Html>
  );
}

// Animation step template (no addresses)
const codeExampleTemplate = [
  { word: 'fn', explanation: 'Start of the main function.', codeLineIdx: 0, codeWordIdx: 0, memory: [], console: [], highlight: 0 },
  { word: 'main()', explanation: 'Function name.', codeLineIdx: 0, codeWordIdx: 1, memory: [], console: [], highlight: 1 },
  { word: '{', explanation: 'Enter function scope.', codeLineIdx: 0, codeWordIdx: 2, memory: [], console: [], highlight: 2 },
  // let x = 5;
  { word: 'let', explanation: 'Declare a new variable.', codeLineIdx: 1, codeWordIdx: 0, memory: [{ var: 'x', stage: 'alloc', position: [-1, 0, 0] as [number, number, number] }], console: [], highlight: 3 },
  { word: 'x', explanation: 'Label the memory as x.', codeLineIdx: 1, codeWordIdx: 1, memory: [{ var: 'x', stage: 'label', position: [-1, 0, 0] as [number, number, number] }], console: [], highlight: 4 },
  { word: '=', explanation: 'Ready to assign value to x.', codeLineIdx: 1, codeWordIdx: 2, memory: [{ var: 'x', stage: 'ready', position: [-1, 0, 0] as [number, number, number] }], console: [], highlight: 5 },
  { word: '5;', explanation: 'Assign value 5 to x.', codeLineIdx: 1, codeWordIdx: 4, memory: [{ var: 'x', stage: 'value', value: 5, position: [-1, 0, 0] as [number, number, number] }], console: [], highlight: 6 },
  // println!("x = {}", x);
  { word: 'println!', explanation: 'Prepare to print x.', codeLineIdx: 2, codeWordIdx: 0, memory: [{ var: 'x', stage: 'value', value: 5, position: [-1, 0, 0] as [number, number, number] }], console: [], highlight: 7 },
  { word: '("x = {}",', explanation: 'Format string for printing.', codeLineIdx: 2, codeWordIdx: 1, memory: [{ var: 'x', stage: 'value', value: 5, position: [-1, 0, 0] as [number, number, number] }], console: [], highlight: 8 },
  { word: 'x);', explanation: 'Fetch value of x and print.', codeLineIdx: 2, codeWordIdx: 4, memory: [{ var: 'x', stage: 'value', value: 5, position: [-1, 0, 0] as [number, number, number] }], console: ['x = 5'], highlight: 9 },
  // let mut y = 10;
  { word: 'let', explanation: 'Declare a new variable.', codeLineIdx: 3, codeWordIdx: 0, memory: [
    { var: 'x', stage: 'value', value: 5, position: [-1, 0, 0] as [number, number, number] },
    { var: 'y', stage: 'alloc', position: [1, 0, 0] as [number, number, number] }
  ], console: ['x = 5'], highlight: 10 },
  { word: 'mut', explanation: 'This variable is mutable.', codeLineIdx: 3, codeWordIdx: 1, memory: [
    { var: 'x', stage: 'value', value: 5, position: [-1, 0, 0] as [number, number, number] },
    { var: 'y', stage: 'mutable', position: [1, 0, 0] as [number, number, number], mutable: true }
  ], console: ['x = 5'], highlight: 11 },
  { word: 'y', explanation: 'Label the memory as y.', codeLineIdx: 3, codeWordIdx: 2, memory: [
    { var: 'x', stage: 'value', value: 5, position: [-1, 0, 0] as [number, number, number] },
    { var: 'y', stage: 'label', position: [1, 0, 0] as [number, number, number], mutable: true }
  ], console: ['x = 5'], highlight: 12 },
  { word: '=', explanation: 'Ready to assign value to y.', codeLineIdx: 3, codeWordIdx: 3, memory: [
    { var: 'x', stage: 'value', value: 5, position: [-1, 0, 0] as [number, number, number] },
    { var: 'y', stage: 'ready', position: [1, 0, 0] as [number, number, number], mutable: true }
  ], console: ['x = 5'], highlight: 13 },
  { word: '10;', explanation: 'Assign value 10 to y.', codeLineIdx: 3, codeWordIdx: 5, memory: [
    { var: 'x', stage: 'value', value: 5, position: [-1, 0, 0] as [number, number, number] },
    { var: 'y', stage: 'value', value: 10, position: [1, 0, 0] as [number, number, number], mutable: true }
  ], console: ['x = 5'], highlight: 14 },
  // println!("y = {}", y);
  { word: 'println!', explanation: 'Prepare to print y.', codeLineIdx: 4, codeWordIdx: 0, memory: [
    { var: 'x', stage: 'value', value: 5, position: [-1, 0, 0] as [number, number, number] },
    { var: 'y', stage: 'value', value: 10, position: [1, 0, 0] as [number, number, number], mutable: true }
  ], console: ['x = 5'], highlight: 15 },
  { word: '("y = {}",', explanation: 'Format string for printing.', codeLineIdx: 4, codeWordIdx: 1, memory: [
    { var: 'x', stage: 'value', value: 5, position: [-1, 0, 0] as [number, number, number] },
    { var: 'y', stage: 'value', value: 10, position: [1, 0, 0] as [number, number, number], mutable: true }
  ], console: ['x = 5'], highlight: 16 },
  { word: 'y);', explanation: 'Fetch value of y and print.', codeLineIdx: 4, codeWordIdx: 4, memory: [
    { var: 'x', stage: 'value', value: 5, position: [-1, 0, 0] as [number, number, number] },
    { var: 'y', stage: 'value', value: 10, position: [1, 0, 0] as [number, number, number], mutable: true }
  ], console: ['x = 5', 'y = 10'], highlight: 17 },
  // y = 15;
  { word: 'y', explanation: 'Select y for assignment.', codeLineIdx: 5, codeWordIdx: 0, memory: [
    { var: 'x', stage: 'value', value: 5, position: [-1, 0, 0] as [number, number, number] },
    { var: 'y', stage: 'ready', value: 10, position: [1, 0, 0] as [number, number, number], mutable: true, highlight: true }
  ], console: ['x = 5', 'y = 10'], highlight: 18 },
  { word: '=', explanation: 'Ready to assign new value to y.', codeLineIdx: 5, codeWordIdx: 1, memory: [
    { var: 'x', stage: 'value', value: 5, position: [-1, 0, 0] as [number, number, number] },
    { var: 'y', stage: 'ready', value: 10, position: [1, 0, 0] as [number, number, number], mutable: true, highlight: true }
  ], console: ['x = 5', 'y = 10'], highlight: 19 },
  { word: '15;', explanation: 'Assign new value 15 to y.', codeLineIdx: 5, codeWordIdx: 2, memory: [
    { var: 'x', stage: 'value', value: 5, position: [-1, 0, 0] as [number, number, number] },
    { var: 'y', stage: 'value', value: 15, position: [1, 0, 0] as [number, number, number], mutable: true }
  ], console: ['x = 5', 'y = 10'], highlight: 20 },
  // println!("y changed to {}", y);
  { word: 'println!', explanation: 'Prepare to print y.', codeLineIdx: 6, codeWordIdx: 0, memory: [
    { var: 'x', stage: 'value', value: 5, position: [-1, 0, 0] as [number, number, number] },
    { var: 'y', stage: 'value', value: 15, position: [1, 0, 0] as [number, number, number], mutable: true }
  ], console: ['x = 5', 'y = 10'], highlight: 21 },
  { word: '("y changed to {}",', explanation: 'Format string for printing.', codeLineIdx: 6, codeWordIdx: 1, memory: [
    { var: 'x', stage: 'value', value: 5, position: [-1, 0, 0] as [number, number, number] },
    { var: 'y', stage: 'value', value: 15, position: [1, 0, 0] as [number, number, number], mutable: true }
  ], console: ['x = 5', 'y = 10'], highlight: 22 },
  { word: 'y);', explanation: 'Fetch value of y and print.', codeLineIdx: 6, codeWordIdx: 4, memory: [
    { var: 'x', stage: 'value', value: 5, position: [-1, 0, 0] as [number, number, number] },
    { var: 'y', stage: 'value', value: 15, position: [1, 0, 0] as [number, number, number], mutable: true }
  ], console: ['x = 5', 'y = 10', 'y changed to 15'], highlight: 23 },
  { word: '}', explanation: 'End of function.', codeLineIdx: 7, codeWordIdx: 0, memory: [
    { var: 'x', stage: 'value', value: 5, position: [-1, 0, 0] as [number, number, number] },
    { var: 'y', stage: 'value', value: 15, position: [1, 0, 0] as [number, number, number], mutable: true }
  ], console: ['x = 5', 'y = 10', 'y changed to 15'], highlight: 24 },
];

const codeLines = [
  'fn main() {',
  '    let x = 5;',
  '    println!("x = {}", x);',
  '    let mut y = 10;',
  '    println!("y = {}", y);',
  '    y = 15;',
  '    println!("y changed to {}", y);',
  '}',
];

export default function Variables() {
  // Precompute addresses for x and y (one per variable, reused in all steps)
  const [addresses] = useState(() => ({
    x: randomAddress(),
    y: randomAddress(),
  }));

  // Build the animation steps with injected addresses
  const steps = useMemo(() => codeExampleTemplate.map(step => {
    // Replace all memory blocks with injected addresses
    const memory = (step.memory || []).map(cell => {
      if (cell.var === 'x') return { ...cell, address: addresses.x };
      if (cell.var === 'y') return { ...cell, address: addresses.y };
      return cell;
    });
    return { ...step, memory };
  }), [addresses]);

  const [step, setStep] = useState(0);
  const currentStep = steps[step];
  const memoryBlocks = useMemo(() => currentStep.memory.map(cell => {
    // Always provide address and label for MemoryCell
    let label = (cell as any).label;
    if (!label && (cell as any).var) label = (cell as any).var;
    let address = (cell as any).address || '';
    return {
      ...cell,
      address,
      label,
    };
  }), [currentStep]);

  // Find the most recent step with codeLineIdx/codeWordIdx
  let highlightLineIdx = null, highlightWordIdx = null;
  for (let i = step; i >= 0; i--) {
    if (steps[i].codeLineIdx !== undefined && steps[i].codeWordIdx !== undefined) {
      highlightLineIdx = steps[i].codeLineIdx;
      highlightWordIdx = steps[i].codeWordIdx;
      break;
    }
  }

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (step < steps.length - 1) setStep((s) => s + 1);
      }
      if (e.key === 'ArrowLeft') {
        if (step > 0) setStep((s) => s - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [step, steps.length]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(120deg, #e0eafc, #cfdef3)' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} shadows>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        {/* Render memory cells */}
        {memoryBlocks.map((cell, i) => (
          <MemoryCell key={cell.address + (cell.label || '')} {...cell} />
        ))}
        <OrbitControls enablePan={false} />
        <ConsoleArea output={currentStep.console} />
      </Canvas>
      <div style={{ position: 'fixed', top: 24, left: 0, width: '100%', textAlign: 'center', pointerEvents: 'none' }}>
        <span style={{ background: '#fff', borderRadius: 8, padding: '4px 16px', fontSize: 18, color: '#333', boxShadow: '0 2px 8px #0001', pointerEvents: 'auto' }}>
          Step {step + 1} / {steps.length} (←/→ to animate)
        </span>
      </div>
      <div style={{ position: 'fixed', right: 32, top: 32, width: 400, background: 'rgba(255,255,255,0.97)', borderRadius: 16, padding: 24, boxShadow: '0 4px 32px #0002' }}>
        <h2 style={{ marginBottom: 12 }}>Code</h2>
        <pre style={{ background: '#222', color: '#fff', padding: 16, borderRadius: 8, fontSize: 16, overflowX: 'auto' }}>
          {codeLines.map((line: string, idx: number) => {
            const words = splitCodeLine(line);
            return (
              <div key={idx} style={{ background: idx === highlightLineIdx ? '#222' : 'transparent', color: '#fff', padding: '0 4px', display: 'flex', flexWrap: 'wrap' }}>
                {words.map((w: string, j: number) => (
                  <span
                    key={j}
                    style={{
                      background: idx === highlightLineIdx && j === highlightWordIdx ? '#1976d2' : 'transparent',
                      color: idx === highlightLineIdx && j === highlightWordIdx ? '#fff' : '#fff9',
                      fontWeight: idx === highlightLineIdx && j === highlightWordIdx ? 'bold' : 'normal',
                      borderRadius: 4,
                      padding: '0 2px',
                      marginRight: 2,
                      textDecoration: idx === highlightLineIdx && j === highlightWordIdx ? 'underline' : 'none',
                    }}
                  >
                    {w}
                  </span>
                ))}
              </div>
            );
          })}
        </pre>
        <h2 style={{ margin: '16px 0 8px' }}>Explanation</h2>
        <div style={{ fontSize: 17, color: '#333' }}>{currentStep.explanation}</div>
      </div>
    </div>
  );
} 