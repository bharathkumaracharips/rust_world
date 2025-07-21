'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Text, Box, Sphere, Cylinder, Plane, Environment } from '@react-three/drei';
import React, { useMemo, useState, useEffect, ReactNode } from 'react';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

// --- Type Definitions for Scene Objects ---
interface BaseObjectProps {
    id: string;
    position: [number, number, number];
}
interface IntegerProps extends BaseObjectProps { value: number | string; type: string; }
interface FloatProps extends BaseObjectProps { value: number | string; type: string; }
interface BoolProps extends BaseObjectProps { value: boolean; }
interface CharProps extends BaseObjectProps { value: string; }
interface TupleProps extends BaseObjectProps { elements: any[]; }
interface ArrayProps extends BaseObjectProps { elements: any[]; type: string; }

// --- Reusable UI Components (Controls, ConsoleArea) ---
interface ControlsProps {
  step: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
}

const Controls = ({ step, totalSteps, onPrev, onNext, onReset }: ControlsProps): ReactNode => {
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
};

const ConsoleArea = ({ output }: { output: string[] }): ReactNode => (
  <Html position={[0, -3.5, 0]} center style={{ width: 450, pointerEvents: 'none' }}>
    <div className="glass-panel console-panel">
      <b>Console Output:</b>
      <div className="console-output">
        {output.length === 0 && <span className="console-placeholder">Output will appear here...</span>}
        {output.map((line: string, i: number) => <div key={i}>{`> ${line}`}</div>)}
      </div>
    </div>
  </Html>
);


// --- Visualization Components for each Data Type ---

const typeColors = {
  integer: '#64b5f6', // blue
  float: '#81c784',   // green
  boolean: '#ffd54f', // yellow
  char: '#ff8a65',    // orange
  tuple: '#9575cd',   // purple
  array: '#e57373',   // red
};

const AnimatedGroup = ({ children, position }: { children: React.ReactNode; position: [number, number, number] }) => {
  const { scale, positionY } = useSpring({
    from: { scale: 0.2, positionY: position[1] - 2 },
    to: { scale: 1, positionY: position[1] },
    config: { tension: 220, friction: 20 }
  });
  return <animated.group position={position} position-y={positionY} scale={scale}>{children}</animated.group>;
};

// ✨ Integer cube, scaled by bit-size
function IntegerCell({ value, type, position, highlight }: IntegerProps & { highlight?: boolean }) {
  const size = useMemo(() => {
    if (type.includes('8')) return 0.6;
    if (type.includes('16')) return 0.8;
    if (type.includes('32')) return 1.0;
    if (type.includes('64')) return 1.3;
    return 1.0;
  }, [type]);

  return (
    <AnimatedGroup position={position}>
      <Box args={[size, size, size]} castShadow>
        <meshStandardMaterial color={typeColors.integer} roughness={0.3} metalness={0.2} />
      </Box>
      <Text position={[0, 0, size / 2 + 0.01]} fontSize={0.25} color="#fff" anchorX="center">{value.toString()}</Text>
      <Text position={[0, size / 2 + 0.2, 0]} fontSize={0.15} color="#ccc" anchorX="center">{type}</Text>
      {highlight && <Box args={[size * 0.8, size * 0.8, size * 0.8]} position={[0, size / 2 + 0.1, 0]}>
        <meshStandardMaterial color="yellow" />
      </Box>}
    </AnimatedGroup>
  );
}

// ✨ Float sphere, scaled by bit-size
function FloatCell({ value, type, position, highlight }: FloatProps & { highlight?: boolean }) {
  const size = type.includes('32') ? 0.5 : 0.7;
  return (
    <AnimatedGroup position={position}>
      <Sphere args={[size]} castShadow>
        <meshStandardMaterial color={typeColors.float} roughness={0.1} metalness={0.4} />
      </Sphere>
      <Text position={[0, 0, size + 0.01]} fontSize={0.25} color="#fff">{value}</Text>
      <Text position={[0, size + 0.2, 0]} fontSize={0.15} color="#ccc" anchorX="center">{type}</Text>
      {highlight && <Box args={[size * 0.8, size * 0.8, size * 0.8]} position={[0, size / 2 + 0.1, 0]}>
        <meshStandardMaterial color="yellow" />
      </Box>}
    </AnimatedGroup>
  );
}

// ✨ Boolean "coin"
function BoolCell({ value, position, highlight }: BoolProps & { highlight?: boolean }) {
  const { rotationY } = useSpring({ rotationY: value ? 0 : Math.PI, config: { tension: 200, friction: 25 } });
  const height = 0.25;
  return (
    <AnimatedGroup position={position}>
      <animated.group rotation-y={rotationY}>
        <Cylinder args={[0.6, 0.6, 0.25, 32]} castShadow>
          <meshStandardMaterial color={typeColors.boolean} roughness={0.4} metalness={0.1}/>
        </Cylinder>
        <Text position={[0, 0, 0.14]} fontSize={0.28} color="#333">{value ? 'true' : 'false'}</Text>
      </animated.group>
      {highlight && <Box args={[0.6, 0.6, 0.25]} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="yellow" />
      </Box>}
    </AnimatedGroup>
  );
}

// ✨ Char plane
function CharCell({ value, position, highlight }: CharProps & { highlight?: boolean }) {
  return (
    <AnimatedGroup position={position}>
      <Box args={[1, 1, 0.1]} castShadow>
        <meshStandardMaterial color={typeColors.char} roughness={0.5} metalness={0.1}/>
      </Box>
      <Text position={[0, 0, 0.06]} fontSize={0.5} color="#fff">{value}</Text>
      {highlight && <Box args={[1, 1, 0.1]} position={[0, 0, 0.06]}>
        <meshStandardMaterial color="yellow" />
      </Box>}
    </AnimatedGroup>
  );
}

// ✨ Tuple: A group of other cells
function TupleGroup({ elements, position, highlightIndex }: { elements: any[]; position: [number, number, number]; highlightIndex?: number }) {
    return (
        <AnimatedGroup position={position}>
            <Box args={[elements.length * 1.5 + 0.5, 2, 0.1]} position={[0, -0.1, -0.8]}>
                <meshStandardMaterial color={typeColors.tuple} transparent opacity={0.2} roughness={0.8}/>
            </Box>
            <Text position={[0, 1.2, -0.75]} fontSize={0.2} color="#fff">Tuple</Text>
            {elements.map((el, i) => {
                const elPos: [number, number, number] = [(i - (elements.length - 1) / 2) * 1.5, 0, 0];
                const isHighlighted = highlightIndex === i;
                if (el.type.startsWith('i')) return <IntegerCell key={i} {...el} id={`${i}`} position={elPos} highlight={isHighlighted} />;
                if (el.type.startsWith('f')) return <FloatCell key={i} {...el} id={`${i}`} position={elPos} highlight={isHighlighted} />;
                if (el.type === 'bool') return <BoolCell key={i} {...el} id={`${i}`} position={elPos} highlight={isHighlighted} />;
                return null;
            })}
        </AnimatedGroup>
    );
}

// ✨ Array: A sequence of identical cells
function ArrayGroup({ elements, type, position, highlightIndex }: { elements: any[]; type: string; position: [number, number, number]; highlightIndex?: number }) {
    return (
        <AnimatedGroup position={position}>
            <Box args={[elements.length * 1.2 + 0.2, 1.4, 0.1]} position={[0, -0.1, -0.8]}>
                <meshStandardMaterial color={typeColors.array} transparent opacity={0.2} roughness={0.8}/>
            </Box>
            <Text position={[0, 0.9, -0.75]} fontSize={0.2} color="#fff">{`Array<${type}, ${elements.length}>`}</Text>
            {elements.map((el, i) => (
                <IntegerCell key={i} {...el} id={`${i}`} type={type} position={[(i - (elements.length - 1) / 2) * 1.2, 0, 0]} highlight={highlightIndex === i} />
            ))}
        </AnimatedGroup>
    );
}

// --- Syntax Highlighting Logic ---
const highlightRustCode = (code: string): ReactNode => {
    const keywordColor = '#c586c0'; // purple
    const typeColor = '#4ec9b0';    // teal
    const literalColor = '#b5cea8'; // green
    const stringColor = '#ce9178';  // orange
    const commentColor = '#6a9955'; // dark green
    const defaultColor = '#d4d4d4'; // light grey

    const keywords = /\b(let|mut|fn|struct|enum|const|static|true|false|if|else|match|loop|while|for|in|return|pub|use|as|crate|super)\b/g;
    const types = /\b(i8|i16|i32|i64|i128|u8|u16|u32|u64|u128|isize|usize|f32|f64|char|bool|str|String|Vec|Option|Result|self|Self)\b/g;
    const literals = /\b(\d[\d_]*\.?[\d_]*|\btrue\b|\bfalse\b)\b/g;
    const strings = /'[^']*'|"[^"]*"/g;
    const comments = /\/\/.*/g;

    const tokens = code.split(/(\s+|\(|\)|\.|,|;|:|=|\/\/.*|'[^']*'|"[^"]*")/g).filter(Boolean);

    return tokens.map((token, index) => {
        let color = defaultColor;
        if (comments.test(token)) color = commentColor;
        else if (keywords.test(token)) color = keywordColor;
        else if (types.test(token)) color = typeColor;
        else if (strings.test(token)) color = stringColor;
        else if (literals.test(token)) color = literalColor;
        return <span key={index} style={{ color }}>{token}</span>;
    });
};

// --- Animation Script and Main Component ---

const codeLines = [
    '// --- Scalar Types ---',
    'let small_int: i8 = 10;',
    'let integer: i32 = -2_500;',
    'let large_int: i64 = 9_000_000;',
    'let float: f64 = 3.14;',
    'let is_active: bool = true;',
    'let emoji: char = \'🚀\';',
    '',
    '// --- Compound Types ---',
    'let tup = (500, 6.4, true);',
    'let first_val = tup.0;',
    '',
    'let arr: [i32; 5] = [1, 2, 3, 4, 5];',
    'let third_el = arr[2];',
];

const animationScript = [
    { explanation: "Let's explore Rust's data types. We'll start with Scalar types, which represent a single value.", scene: {} },
    // Integers
    { codeLineIdx: 1, explanation: "An 8-bit signed integer (`i8`). It's the smallest integer type, useful for saving space.", scene: { integers: [{ id: 'i8', type: 'i8', value: 10, position: [-3.5, 1, 0] }] } },
    { codeLineIdx: 2, explanation: "A 32-bit signed integer (`i32`), the default for integers. Notice its larger size.", scene: { integers: [{ id: 'i8', type: 'i8', value: 10, position: [-3.5, 1, 0] }, { id: 'i32', type: 'i32', value: -2500, position: [0, 1, 0] }] } },
    { codeLineIdx: 3, explanation: "A 64-bit signed integer (`i64`) for very large numbers. It's visually the largest.", scene: { integers: [{ id: 'i8', type: 'i8', value: 10, position: [-3.5, 1, 0] }, { id: 'i32', type: 'i32', value: -2500, position: [0, 1, 0] }, { id: 'i64', type: 'i64', value: '9M', position: [3.5, 1, 0] }] } },
    // Float
    { codeLineIdx: 4, explanation: "A 64-bit floating-point number (`f64`). We'll represent floats as spheres.", scene: { floats: [{ id: 'f64', type: 'f64', value: 3.14, position: [0, -1, 0] }] } },
    // Boolean
    { codeLineIdx: 5, explanation: "A boolean type (`bool`), which can only be `true` or `false`.", scene: { floats: [{ id: 'f64', type: 'f64', value: 3.14, position: [0, -1, 0] }], booleans: [{ id: 'bool', value: true, position: [-2.5, -1, 0] }] } },
    // Char
    { codeLineIdx: 6, explanation: "A `char` holds a single Unicode character (4 bytes). Notice it uses single quotes.", scene: { floats: [{ id: 'f64', type: 'f64', value: 3.14, position: [0, -1, 0] }], booleans: [{ id: 'bool', value: true, position: [-2.5, -1, 0] }], chars: [{ id: 'char', value: '🚀', position: [2.5, -1, 0] }] } },
    { explanation: "Now let's look at Compound types, which can group multiple values.", scene: {} },
    // Tuple
    { codeLineIdx: 9, explanation: "A Tuple groups values of different types into one compound value. Its length is fixed.", scene: { tuples: [{ id: 'tup', elements: [{type: 'i32', value: 500}, {type: 'f64', value: 6.4}, {type: 'bool', value: true}], position: [0, 0, 0] }] } },
    { codeLineIdx: 10, explanation: "We can access tuple elements by their index, starting from 0, using dot notation.", scene: { tuples: [{ id: 'tup', elements: [{type: 'i32', value: 500}, {type: 'f64', value: 6.4}, {type: 'bool', value: true}], position: [0, 0, 0], highlightIndex: 0 }], console: ["First value is: 500"] } },
    { explanation: "Tuples are great for fixed collections of varied data. Next, Arrays.", scene: {} },
    // Array
    { codeLineIdx: 12, explanation: "An Array stores multiple values of the *same type*. Its length is also fixed.", scene: { arrays: [{ id: 'arr', type: 'i32', elements: [{value: 1}, {value: 2}, {value: 3}, {value: 4}, {value: 5}], position: [0, 0, 0] }] } },
    { codeLineIdx: 13, explanation: "Like tuples, we access array elements by index using square brackets `[]`.", scene: { arrays: [{ id: 'arr', type: 'i32', elements: [{value: 1}, {value: 2}, {value: 3}, {value: 4}, {value: 5}], position: [0, 0, 0], highlightIndex: 2 }], console: ["Third element is: 3"] } },
    { explanation: "You've completed the tour of Rust's primary data types! Feel free to explore the scene.", scene: {} },
];

export default function DataTypesConcept() {
  const [step, setStep] = useState(0);
  const [explanation, setExplanation] = useState(animationScript[0].explanation);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentStepData = animationScript[step];
  
  // Logic to determine which code line to highlight
  const activeCodeLine = useMemo(() => {
    let line = null;
    for (let i = step; i >= 0; i--) {
      if (typeof animationScript[i].codeLineIdx === 'number') {
        line = animationScript[i].codeLineIdx;
        break;
      }
    }
    return line;
  }, [step]);
  
  const changeStep = (newStep: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    // Fade out explanation
    document.querySelector('.explanation-text')?.classList.add('fading');
    
    setTimeout(() => {
        setStep(newStep);
        setExplanation(animationScript[newStep].explanation);
        // Fade in new explanation
        document.querySelector('.explanation-text')?.classList.remove('fading');
        setIsAnimating(false);
    }, 200);
  };

  const handleNext = () => step < animationScript.length - 1 && changeStep(step + 1);
  const handlePrev = () => step > 0 && changeStep(step - 1);
  const handleReset = () => changeStep(0);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Home' || e.key === 'r') { e.preventDefault(); handleReset(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [step, animationScript.length]);

  return (
    <>
        <style>{`
            :root {
                --panel-bg: rgba(35, 37, 39, 0.7);
                --panel-border: rgba(255, 255, 255, 0.2);
                --text-light: #f0f0f0;
                --text-dark: #cccccc;
                --accent-color: #64b5f6;
                --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                --font-mono: 'Fira Code', 'Roboto Mono', monospace;
            }
            body { 
                font-family: var(--font-sans);
                overscroll-behavior: none;
            }
            .glass-panel {
                background: var(--panel-bg);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border: 1px solid var(--panel-border);
                border-radius: 16px;
                padding: 24px;
                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
                color: var(--text-light);
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
                border-bottom: 1px solid var(--panel-border);
                padding-bottom: 12px;
            }
            .code-container {
                background: rgba(0,0,0,0.3);
                border-radius: 8px;
                padding: 16px;
                font-family: var(--font-mono);
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
                color: var(--text-dark);
                opacity: 0.6;
                user-select: none;
            }
            .line-active {
                background-color: rgba(98, 179, 246, 0.2);
            }
            .explanation-text {
                font-size: 18px;
                color: var(--text-light);
                min-height: 80px;
                line-height: 1.5;
                transition: opacity 0.2s ease-in-out;
            }
            .explanation-text.fading {
                opacity: 0;
            }
            .controls-container {
                position: fixed;
                bottom: 32px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10;
                width: 400px;
                background: var(--panel-bg);
                backdrop-filter: blur(10px);
                border: 1px solid var(--panel-border);
                border-radius: 16px;
                padding: 12px;
                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
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
                background-color: var(--accent-color);
                border-radius: 2px;
                transition: width 0.3s ease;
            }
            .buttons {
                display: flex;
                justify-content: space-between;
            }
            .buttons button {
                font-family: var(--font-sans);
                font-size: 16px;
                font-weight: 500;
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-light);
                border: 1px solid var(--panel-border);
                padding: 8px 20px;
                border-radius: 8px;
                cursor: pointer;
                transition: background-color 0.2s, color 0.2s;
            }
            .buttons button:hover:not(:disabled) {
                background-color: var(--accent-color);
                color: #111;
            }
            .buttons button:disabled {
                opacity: 0.4;
                cursor: not-allowed;
            }
            .console-panel {
                padding: 16px;
                color: var(--text-light);
            }
            .console-panel b {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                color: var(--text-dark);
            }
            .console-output {
                min-height: 24px;
                color: #4caf50;
                padding-top: 8px;
                font-family: var(--font-mono);
                font-size: 16px;
            }
            .console-placeholder {
                color: var(--text-dark);
                opacity: 0.6;
                font-style: italic;
            }
        `}</style>
        <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #232526 0%, #414345 100%)' }}>
            <Canvas camera={{ position: [0, 1.5, 12], fov: 50 }} shadows>
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <directionalLight position={[-10, 10, 5]} intensity={1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
                <Environment preset="city" />

                {/* Reflective floor */}
                <Plane args={[50, 50]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
                     <meshStandardMaterial color="#333" roughness={0.2} metalness={0.8} />
                </Plane>
                
                {/* --- Render all scene objects --- */}
                {currentStepData.scene.integers?.map((props: any) => <IntegerCell key={props.id} {...props} position={((props.position?.length === 3) ? props.position : [0,0,0]) as [number, number, number]} />)}
                {currentStepData.scene.floats?.map((props: any) => <FloatCell key={props.id} {...props} position={((props.position?.length === 3) ? props.position : [0,0,0]) as [number, number, number]} />)}
                {currentStepData.scene.booleans?.map((props: any) => <BoolCell key={props.id} {...props} position={((props.position?.length === 3) ? props.position : [0,0,0]) as [number, number, number]} />)}
                {currentStepData.scene.chars?.map((props: any) => <CharCell key={props.id} {...props} position={((props.position?.length === 3) ? props.position : [0,0,0]) as [number, number, number]} />)}
                {currentStepData.scene.tuples?.map((props: any) => <TupleGroup key={props.id} {...props} position={((props.position?.length === 3) ? props.position : [0,0,0]) as [number, number, number]} highlightIndex={props.highlightIndex} />)}
                {currentStepData.scene.arrays?.map((props: any) => <ArrayGroup key={props.id} {...props} position={((props.position?.length === 3) ? props.position : [0,0,0]) as [number, number, number]} highlightIndex={props.highlightIndex} />)}

                <OrbitControls enablePan={true} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={25}/>
                <ConsoleArea output={currentStepData.scene.console ?? []} />
            </Canvas>

            {/* --- UI Panels --- */}
            <div className="info-panel glass-panel">
                <h2>Rust Data Types</h2>
                <div className="code-container">
                    {codeLines.map((line, idx) => (
                        <div key={idx} className={`code-line ${idx === activeCodeLine ? 'line-active' : ''}`}>
                            <span className="line-number">{idx + 1}</span>
                            <code>{highlightRustCode(line)}</code>
                        </div>
                    ))}
                </div>
                <h2 style={{ margin: '24px 0 8px' }}>Explanation</h2>
                <div className="explanation-text">{explanation}</div>
            </div>
            
            <Controls
                step={step} totalSteps={animationScript.length}
                onPrev={handlePrev} onNext={handleNext} onReset={handleReset}
            />
        </div>
    </>
  );
}