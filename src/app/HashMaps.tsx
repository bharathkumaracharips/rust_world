'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Line } from '@react-three/drei';
import React, { useState, useEffect } from 'react';

const codeLines = [
  '// A HashMap stores key-value pairs.',
  'use std::collections::HashMap;',
  'let mut scores = HashMap::new();',
  '',
  '// `insert` adds a key-value pair.',
  'scores.insert(String::from("Blue"), 10);',
  'scores.insert(String::from("Yellow"), 50);',
  '',
  '// Access values by key.',
  'let team_name = String::from("Blue");',
  'let score = scores.get(&team_name); // Some(&10)',
];

const animationScript: { explanation: string; codeLineIdx: number; map: { [key: string]: number }; highlightKey: string | null; }[] = [
  { explanation: "Let's explore HashMaps. They store data as key-value pairs.", codeLineIdx: 0, map: {}, highlightKey: null },
  { explanation: "We create a new, empty HashMap.", codeLineIdx: 2, map: {}, highlightKey: null },
  { explanation: "We `insert` the key 'Blue' with the value 10. The key is hashed to find a bucket.", codeLineIdx: 5, map: { Blue: 10 }, highlightKey: "Blue" },
  { explanation: "Now we insert 'Yellow' with value 50. It gets hashed to a different bucket.", codeLineIdx: 6, map: { Blue: 10, Yellow: 50 }, highlightKey: "Yellow" },
  { explanation: "We can `get` a value by providing its key.", codeLineIdx: 10, map: { Blue: 10, Yellow: 50 }, highlightKey: "Blue" },
];

// Simple hash function for visualization
const simpleHash = (key: string, numBuckets: number) => {
  return key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % numBuckets;
};

function HashMap3D({ map, highlightKey }: { map: { [key: string]: number }, highlightKey: string | null }) {
  const numBuckets = 8;
  const buckets: { key: string, value: number }[][] = Array.from({ length: numBuckets }, () => []);
  
  Object.entries(map).forEach(([key, value]) => {
    const index = simpleHash(key, numBuckets);
    buckets[index].push({ key, value });
  });

  return (
    <group>
      {/* Buckets */}
      {buckets.map((bucket, i) => (
        <Box key={i} position={[-4 + i * 1.2, -2, 0]} args={[1, 1, 1]}>
          <meshStandardMaterial color="#444" />
          <Text position={[0, -0.7, 0]} fontSize={0.2} color="#fff">{i}</Text>
        </Box>
      ))}

      {/* Key-Value pairs */}
      {buckets.map((bucket, bucketIndex) =>
        bucket.map(({ key, value }, itemIndex) => (
          <group key={key} position={[-4 + bucketIndex * 1.2, -0.5 + itemIndex * 1.2, 0]}>
            <Box args={[1, 1, 1]}>
              <meshStandardMaterial color={key === highlightKey ? '#ffd54f' : '#64b5f6'} />
            </Box>
            <Text position={[0, 0, 0.6]} fontSize={0.2} color="#333">{`${key}: ${value}`}</Text>
          </group>
        ))
      )}
    </group>
  );
}

// ... Controls and main component boilerplate ...
export default function HashMaps() {
  const [step, setStep] = useState(0);
  const current = animationScript[step];
  // ... boilerplate ...
  return (
    <>
    <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #232526 0%, #414345 100%)' }}>
        <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <HashMap3D map={current.map} highlightKey={current.highlightKey} />
          <OrbitControls />
        </Canvas>
        <div className="info-panel glass-panel" style={{ position: 'fixed', left: 32, top: 32, width: 480, zIndex: 10 }}>
            <h2>Data Structures: HashMap</h2>
            {/* Code and Explanation panels */}
        </div>
        {/* Controls */}
    </div>
    </>
  );
} 