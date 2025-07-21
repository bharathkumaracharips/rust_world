'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Line } from '@react-three/drei';
import React, { useState, useEffect } from 'react';

const codeLines = [
  '// A BinaryHeap is a max-heap priority queue.',
  'use std::collections::BinaryHeap;',
  'let mut heap = BinaryHeap::new();',
  '',
  '// `push` adds an element, maintaining the heap property.',
  'heap.push(1);',
  'heap.push(4);',
  'heap.push(2);',
  'heap.push(5);',
  '',
  '// `pop` removes the largest element.',
  'let largest = heap.pop(); // Some(5)',
];

const animationScript = [
  { explanation: "Finally, the Binary Heap. It's a priority queue that always keeps the largest element at the top.", codeLineIdx: 0, heap: [] },
  { explanation: "We create a new, empty BinaryHeap.", codeLineIdx: 2, heap: [] },
  { explanation: "Pushing 1. It becomes the root.", codeLineIdx: 5, heap: [1] },
  { explanation: "Pushing 4. It's larger than 1, so it becomes the new root.", codeLineIdx: 6, heap: [4, 1] },
  { explanation: "Pushing 2. It finds its correct spot below 4.", codeLineIdx: 7, heap: [4, 1, 2] },
  { explanation: "Pushing 5. It bubbles up to become the new root.", codeLineIdx: 8, heap: [5, 4, 2, 1] },
  { explanation: "`pop` always removes the largest element, which is the root (5).", codeLineIdx: 11, heap: [4, 1, 2], popValue: 5 },
];

function BinaryHeap3D({ heap, popValue }: { heap: number[], popValue: number | null }) {
  const positions: { [key: number]: [number, number, number] } = {};
  const parentChildLinks: [number, number, number, number, number, number][] = [];

  const setPositions = (index: number, x: number, y: number, xOffset: number) => {
    if (index >= heap.length) return;
    positions[index] = [x, y, 0];
    const leftChild = 2 * index + 1;
    const rightChild = 2 * index + 2;
    if (leftChild < heap.length) {
      parentChildLinks.push([x, y, 0, x - xOffset, y - 1.5, 0]);
      setPositions(leftChild, x - xOffset, y - 1.5, xOffset / 2);
    }
    if (rightChild < heap.length) {
      parentChildLinks.push([x, y, 0, x + xOffset, y - 1.5, 0]);
      setPositions(rightChild, x + xOffset, y - 1.5, xOffset / 2);
    }
  };

  if (heap.length > 0) {
    setPositions(0, 0, 2, 4);
  }

  return (
    <group>
      {heap.map((val, i) => (
        <group key={i} position={positions[i]}>
          <Box args={[1, 1, 1]}>
            <meshStandardMaterial color={i === 0 ? '#ffd54f' : '#64b5f6'} />
          </Box>
          <Text position={[0, 0, 0.6]} fontSize={0.4} color="#333">{val}</Text>
        </group>
      ))}
      {parentChildLinks.map((points, i) => (
          <Line key={i} points={points} color="white" lineWidth={1} />
      ))}
       {popValue !== null && (
        <group position={[0, 4, 0]}>
          <Text fontSize={0.4} color="#e57373">Popped: {popValue}</Text>
        </group>
      )}
    </group>
  );
}
// ... Controls and main component boilerplate ...
export default function BinaryHeaps() {
    const [step, setStep] = useState(0);
    const current = animationScript[step];
    // ... boilerplate ...
    return (
        <>
        <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #232526 0%, #414345 100%)' }}>
            <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
                <ambientLight intensity={0.6} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <BinaryHeap3D heap={current.heap} popValue={current.popValue ?? null} />
                <OrbitControls />
            </Canvas>
            <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
                <h2>Data Structures: Binary Heap</h2>
                {/* Code and Explanation panels */}
            </div>
            {/* Controls */}
        </div>
        </>
    )
} 