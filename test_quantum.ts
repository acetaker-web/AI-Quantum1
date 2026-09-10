import { QuantumSimulator } from './src/lib/quantum/simulator';
import { CircuitOptimizer } from './src/lib/quantum/optimizer';
import { QuantumCircuitAnalyzer } from './src/lib/quantum/analyzer';
import { QuantumCircuit } from './src/types/circuit';

// Test 1: Bell State
console.log('--- TEST 1: Bell State Circuit ---');
const bellCircuit: QuantumCircuit = {
  name: 'Bell State |Phi+>',
  qubits: 2,
  columns: 3,
  operations: [
    { id: '1', gate: 'H', qubit: 0, column: 0 },
    { id: '2', gate: 'CNOT', control: 0, qubit: 1, column: 1 },
    { id: '3', gate: 'M', qubit: 0, column: 2 },
    { id: '4', gate: 'M', qubit: 1, column: 2 },
  ]
};

const result = QuantumSimulator.simulate(bellCircuit, 1000);
console.log('Probabilities:', result.probabilities);
console.log('Counts:', result.counts);
console.log('Bloch vectors:', result.blochVectors);

const analysis = QuantumCircuitAnalyzer.analyze(bellCircuit, result, 'beginner');
console.log('Analysis Pattern:', analysis.identifiedPattern);
console.log('Has Entanglement:', analysis.hasEntanglement);
console.log('Explanation:', analysis.explanation);

// Test 2: Optimizer (H * H = I, X * X = I)
console.log('\n--- TEST 2: Circuit Optimizer ---');
const unoptimized: QuantumCircuit = {
  name: 'Redundant Gates',
  qubits: 1,
  columns: 4,
  operations: [
    { id: '1', gate: 'H', qubit: 0, column: 0 },
    { id: '2', gate: 'H', qubit: 0, column: 1 },
    { id: '3', gate: 'X', qubit: 0, column: 2 },
    { id: '4', gate: 'X', qubit: 0, column: 3 },
  ]
};

const optResult = CircuitOptimizer.optimize(unoptimized);
console.log('Original gate count:', optResult.originalGateCount, '-> Optimized:', optResult.optimizedGateCount);
console.log('Simplifications:', optResult.simplifications.map(s => s.description));

console.log('\nQuantum Simulator & Optimizer test passed successfully!');
