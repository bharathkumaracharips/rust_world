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
import ConstructTypes from './Construct_types';
import ImplTraits from './Impl_traits';
import Functions from './Functions';
import Methods from './Methods';
import PatternMatching from './Pattern_matching';
import Arrays from './Arrays';
import Vectors from './Vectors';
import LinkedLists from './LinkedLists';
import Stacks from './Stacks';
import Queues from './Queues';
import HashMaps from './HashMaps';
import HashSets from './HashSets';
import BinaryHeaps from './BinaryHeaps';
import StackHeap from './StackHeap';
import Ownership from './Ownership';
import MemorySafety from './MemorySafety';
import Borrowing from './Borrowing';
import Slices from './Slices';
import OptionResult from './OptionResult';
import ErrorPropagation from './ErrorPropagation';
import CustomError from './CustomError';
import ModulesCrates from './ModulesCrates';
import CodeOrganization from './CodeOrganization';
import DependencyManagement from './DependencyManagement';
import PublishingCrateIo from './PublishingCrateIo';
import Testing from './Testing';
import UnitTesting from './UnitTesting';
import Mocking from './Mocking';
import Benchmarking from './Benchmarking';
import ThreadChannels from './ThreadChannels';
import MessagePassing from './MessagePassing';
import AtomicOperation from './AtomicOperation';
import MemoryBarriers from './MemoryBarriers';
import FutureAsyncAwait from './FutureAsyncAwait';
import TraitsImpl from './TraitsImpl';
import TraitBoundsAssocTypes from './TraitBoundsAssocTypes';
import GenericsTypeLevel from './GenericsTypeLevel';
import LifetimeBorrowChecker from './LifetimeBorrowChecker';
import MacrosMetaProgramming from './MacrosMetaProgramming';

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
  construct_types: { name: 'Construct Types', component: ConstructTypes },
  impl_traits: { name: 'Impl & Traits', component: ImplTraits },
  functions: { name: 'Functions', component: Functions },
  methods: { name: 'Methods', component: Methods },
  pattern_matching: { name: 'Pattern Matching', component: PatternMatching },
  arrays: { name: 'Arrays', component: Arrays },
  vectors: { name: 'Vectors', component: Vectors },
  linked_lists: { name: 'Linked Lists', component: LinkedLists },
  stacks: { name: 'Stacks', component: Stacks },
  queues: { name: 'Queues', component: Queues },
  hash_maps: { name: 'HashMaps', component: HashMaps },
  hash_sets: { name: 'HashSets', component: HashSets },
  binary_heaps: { name: 'Binary Heaps', component: BinaryHeaps },
  stack_heap: { name: 'Stack & Heap', component: StackHeap },
  ownership: { name: 'Ownership', component: Ownership },
  memory_safety: { name: 'Memory Safety', component: MemorySafety },
  borrowing: { name: 'Borrowing & References', component: Borrowing },
  slices: { name: 'Slices', component: Slices },
  option_result: { name: 'Option & Result', component: OptionResult },
  error_propagation: { name: 'Error Propagation (?)', component: ErrorPropagation },
  custom_error: { name: 'Custom Error Types', component: CustomError },
  modules_crates: { name: 'Modules & Crates', component: ModulesCrates },
  code_organization: { name: 'Code Organization & Namespacing', component: CodeOrganization },
  dependency_management: { name: 'Dependency Management', component: DependencyManagement },
  publishing_crate_io: { name: 'Publishing on crates.io', component: PublishingCrateIo },
  testing: { name: 'Testing', component: Testing },
  unit_testing: { name: 'Unit Testing', component: UnitTesting },
  mocking: { name: 'Mocking', component: Mocking },
  benchmarking: { name: 'Benchmarking', component: Benchmarking },
  thread_channels: { name: 'Thread Channels', component: ThreadChannels },
  message_passing: { name: 'Message Passing', component: MessagePassing },
  atomic_operation: { name: 'Atomic Operation', component: AtomicOperation },
  memory_barriers: { name: 'Memory Barriers', component: MemoryBarriers },
  future_async_await: { name: 'Futures & Async/Await', component: FutureAsyncAwait },
  traits_impl: { name: 'Traits: Def & Impl', component: TraitsImpl },
  trait_bounds_assoc_types: { name: 'Trait Bounds & Assoc Types', component: TraitBoundsAssocTypes },
  generics_type_level: { name: 'Generics & Type-level', component: GenericsTypeLevel },
  lifetime_borrow_checker: { name: 'Lifetime & Borrow Checker', component: LifetimeBorrowChecker },
  macros_meta_programming: { name: 'Macros & Meta Programming', component: MacrosMetaProgramming },
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
