'use client';
import React, { useState } from 'react';

// Import all the presentation components
import Variables from './Variables';
import Shadowing from './Shadowing';
import Constants from './Constants';
import DataTypes from './Data_Types';
import CyclicNotation from './Cycllic_notation';
import IfElseFlow from './If_else';
import LoopFlow from './Loop';
import WhileLoopFlow from './While_loop';
import ForLoopFlow from './For_loop';
import MatchFlow from './Match';

const components = {
  variables: { name: 'Variables', component: Variables },
  shadowing: { name: 'Shadowing', component: Shadowing },
  constants: { name: 'Constants', component: Constants },
  data_types: { name: 'Data Types', component: DataTypes },
  cyclic_notation: { name: 'Cyclic Notation', component: CyclicNotation },
  if_else: { name: 'If/Else', component: IfElseFlow },
  loop: { name: 'Loop', component: LoopFlow },
  while_loop: { name: 'While Loop', component: WhileLoopFlow },
  for_loop: { name: 'For Loop', component: ForLoopFlow },
  match: { name: 'Match', component: MatchFlow },
};

type ComponentKey = keyof typeof components;

export default function Home() {
  const [activeComponentKey, setActiveComponentKey] = useState<ComponentKey | null>(null);

  const ActiveComponent = activeComponentKey ? components[activeComponentKey].component : null;

  if (ActiveComponent) {
    return (
      <div>
        <button
          onClick={() => setActiveComponentKey(null)}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '10px 15px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            transition: 'transform 0.1s ease',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Back to Menu
        </button>
        <ActiveComponent />
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
      color: 'white',
      fontFamily: 'Inter, sans-serif',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>Rust World</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '3rem', color: '#ccc' }}>Interactive 3D Visualizations of Rust Concepts</p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        width: '100%',
        maxWidth: '1000px'
      }}>
        {Object.keys(components).map((key) => (
          <button
            key={key}
            onClick={() => setActiveComponentKey(key as ComponentKey)}
            style={{
              padding: '25px',
              fontSize: '1.1rem',
              fontWeight: 500,
              cursor: 'pointer',
              background: 'rgba(35, 37, 39, 0.8)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '16px',
              color: '#f0f0f0',
              backdropFilter: 'blur(10px)',
              transition: 'background-color 0.2s, transform 0.2s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.backgroundColor = '#ffd54f';
              e.currentTarget.style.color = '#111';
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.backgroundColor = 'rgba(35, 37, 39, 0.8)';
              e.currentTarget.style.color = '#f0f0f0';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {components[key as ComponentKey].name}
          </button>
        ))}
      </div>
    </div>
  );
}
