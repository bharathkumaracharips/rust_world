'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import React, { useState, useEffect } from 'react';

const codeLines = [
  '// A HashSet is a set of unique values.',
  'use std::collections::HashSet;',
  'let mut books = HashSet::new();',
  '',
  '// `insert` adds a value. Duplicates are ignored.',
  'books.insert("A Tale of Two Cities");',
  'books.insert("The Lord of the Rings");',
  'books.insert("A Tale of Two Cities"); // This is ignored.',
  '',
  '// `contains` checks for a value.',
  'let has_lotr = books.contains("The Lord of the Rings"); // true',
];

const animationScript: { explanation: string; codeLineIdx: number; set: Set<string>; highlightKey: string | null; }[] = [
  { explanation: "Now for HashSets. They're like HashMaps, but only store unique keys.", codeLineIdx: 0, set: new Set(), highlightKey: null },
  { explanation: "We create a new, empty HashSet.", codeLineIdx: 2, set: new Set(), highlightKey: null },
  { explanation: "We `insert` a value. It gets hashed to find a bucket.", codeLineIdx: 5, set: new Set(["A Tale of Two Cities"]), highlightKey: "A Tale of Two Cities" },
  { explanation: "We insert another unique value.", codeLineIdx: 6, set: new Set(["A Tale of Two Cities", "The Lord of the Rings"]), highlightKey: "The Lord of the Rings" },
  { explanation: "Inserting a duplicate value has no effect.", codeLineIdx: 7, set: new Set(["A Tale of Two Cities", "The Lord of the Rings"]), highlightKey: "A Tale of Two Cities" },
  { explanation: "We can check for existence with `contains`.", codeLineIdx: 10, set: new Set(["A Tale of Two Cities", "The Lord of the Rings"]), highlightKey: "The Lord of the Rings" },
];

// Simple hash function for visualization
const simpleHash = (key: string, numBuckets: number) => {
  return key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % numBuckets;
};

function HashSet3D({ set, highlightKey }: { set: Set<string>, highlightKey: string | null }) {
  const numBuckets = 8;
  const buckets: string[][] = Array.from({ length: numBuckets }, () => []);
  
  set.forEach(key => {
    const index = simpleHash(key, numBuckets);
    buckets[index].push(key);
  });

  return (
    <group>
      {/* Buckets */}
      {buckets.map((_, i) => (
        <Box key={i} position={[-4 + i * 1.2, -2, 0]} args={[1, 1, 1]}>
          <meshStandardMaterial color="#444" />
          <Text position={[0, -0.7, 0]} fontSize={0.2} color="#fff">{i}</Text>
        </Box>
      ))}

      {/* Values */}
      {buckets.map((bucket, bucketIndex) =>
        bucket.map((key, itemIndex) => (
          <group key={key} position={[-4 + bucketIndex * 1.2, -0.5 + itemIndex * 1.2, 0]}>
            <Box args={[2.5, 0.8, 0.8]}>
              <meshStandardMaterial color={key === highlightKey ? '#ffd54f' : '#64b5f6'} />
            </Box>
            <Text position={[0, 0, 0.5]} fontSize={0.15} color="#333">{key}</Text>
          </group>
        ))
      )}
    </group>
  );
}

// ... Controls and main component boilerplate ...
export default function HashSets() {
    const [step, setStep] = useState(0);
    const current = animationScript[step];
  // ... boilerplate ...
    return (
    <>
    <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #232526 0%, #414345 100%)' }}>
        <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <HashSet3D set={current.set} highlightKey={current.highlightKey} />
          <OrbitControls />
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
            <h2>Data Structures: HashSet</h2>
            {/* Code and Explanation panels */}
        </div>
        {/* Controls */}
    </div>
    </>
    )
} 