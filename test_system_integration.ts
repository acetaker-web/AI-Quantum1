import http from 'http';
import { app } from './server/index';

const PORT = 3099; // Isolated test port

async function runTests() {
  console.log('🚀 Starting QuantumLearn AI Comprehensive System Integration Tests...\n');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(PORT, () => resolve()));
  console.log(`[OK] In-memory server listening on http://localhost:${PORT}`);

  const baseUrl = `http://localhost:${PORT}`;
  let studentToken = '';
  let studentId = '';
  let instructorToken = '';
  let adminToken = '';

  try {
    // 1. Health Check
    console.log('\n--- 1. Testing Health Endpoint ---');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    console.log('Health check response:', healthData);
    if (healthData.status !== 'ok') throw new Error('Health check failed');
    console.log('✔ Health check passed');

    // 2. Register Fresh Student User
    console.log('\n--- 2. Testing Student Registration & 0-Based Baseline ---');
    const timestamp = Date.now();
    const uniqueStudentEmail = `student_${timestamp}@sih2026.edu`;
    const uniqueStudentName = `sih_student_${timestamp}`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: uniqueStudentName,
        email: uniqueStudentEmail,
        password: 'Password123!',
        role: 'student',
        institution: 'IIT Delhi'
      })
    });
    const regData = await regRes.json();
    if (!regRes.ok) throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    console.log('Registered student user:', regData.user.id, regData.user.email);
    studentToken = regData.token;
    studentId = regData.user.id;

    // Verify STRICT 0-based initialization
    const u = regData.user;
    const p = regData.progress;
    console.log('Initial user baseline:');
    console.log(`  XP: ${u.xp} (Must be 0)`);
    console.log(`  Level: ${u.level} (Must be 1)`);
    console.log(`  Streak: ${u.streak} (Must be 0)`);
    console.log(`  Completed Lessons: ${p.completedLessons.length} (Must be 0)`);
    console.log(`  Completed Quizzes: ${Object.keys(p.quizScores).length} (Must be 0)`);
    console.log(`  Completed Challenges: ${p.completedChallenges.length} (Must be 0)`);
    console.log(`  Earned Badges: ${u.badges.length} (Must be 0)`);
    console.log(`  Circuits Created: ${p.circuitsCreated} (Must be 0)`);

    if (
      u.xp !== 0 ||
      u.level !== 1 ||
      u.streak !== 0 ||
      p.completedLessons.length !== 0 ||
      Object.keys(p.quizScores).length !== 0 ||
      p.completedChallenges.length !== 0 ||
      u.badges.length !== 0 ||
      p.circuitsCreated !== 0
    ) {
      throw new Error('❌ Baseline progress is NOT zero-based!');
    }
    console.log('✔ Verified: New student strictly begins with 0% progress and 0 XP');

    // 3. Duplicate Registration Rejection
    console.log('\n--- 3. Testing Duplicate Registration Prevention ---');
    const dupRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'sih_student_01',
        email: uniqueStudentEmail,
        password: 'Password123!',
        role: 'student'
      })
    });
    if (dupRes.status !== 400) throw new Error('Duplicate email allowed unexpectedly');
    console.log('✔ Duplicate registration correctly rejected with 400 Bad Request');

    // 4. Student Login
    console.log('\n--- 4. Testing User Login ---');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueStudentEmail,
        password: 'Password123!'
      })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.token) throw new Error('Login failed');
    console.log('✔ Login successful, JWT token received');

    // 5. Quantum Circuit Simulation (Bell State)
    console.log('\n--- 5. Testing Circuit Simulation (Bell State) ---');
    const bellCircuit = {
      name: 'Bell State Phi+',
      qubits: 2,
      columns: 3,
      operations: [
        { id: 'op1', gate: 'H', qubit: 0, column: 0 },
        { id: 'op2', gate: 'CNOT', qubit: 1, control: 0, column: 1 }
      ]
    };
    const simRes = await fetch(`${baseUrl}/api/simulation/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ circuit: bellCircuit, shots: 1000 })
    });
    const simData = await simRes.json();
    if (!simRes.ok) throw new Error(`Simulation failed: ${JSON.stringify(simData)}`);
    console.log('Simulation Results Summary:');
    console.log('  State Vector Length:', simData.result.stateVector.length);
    console.log('  Probabilities:', simData.result.probabilities);
    console.log('  Measurements:', simData.result.measurements);
    console.log('  Bloch Spheres:', simData.result.blochVectors);

    const prob00 = simData.result.probabilities['00'] || 0;
    const prob11 = simData.result.probabilities['11'] || 0;
    const prob01 = simData.result.probabilities['01'] || 0;
    const prob10 = simData.result.probabilities['10'] || 0;

    if (Math.abs(prob00 - 0.5) > 0.05 || Math.abs(prob11 - 0.5) > 0.05 || prob01 > 0.001 || prob10 > 0.001) {
      throw new Error(`Unexpected Bell state probabilities: ${JSON.stringify(simData.result.probabilities)}`);
    }
    console.log('✔ Bell State simulation verified: 50% |00> and 50% |11>');

    // 6. AI Circuit Analysis
    console.log('\n--- 6. Testing AI Circuit Analysis ---');
    const aiAnalysisRes = await fetch(`${baseUrl}/api/ai/analyze-circuit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ circuit: bellCircuit })
    });
    const aiAnalysisData = await aiAnalysisRes.json();
    if (!aiAnalysisRes.ok) throw new Error(`AI Analysis failed: ${JSON.stringify(aiAnalysisData)}`);
    console.log('Summary:', aiAnalysisData.analysis.summary);
    console.log('Entanglement:', aiAnalysisData.analysis.hasEntanglement);
    if (!aiAnalysisData.analysis.hasEntanglement) {
      throw new Error('AI analysis failed to identify entanglement in Bell state!');
    }
    console.log('✔ AI Circuit Analysis correctly detected entanglement');

    // 7. AI Circuit Optimizer
    console.log('\n--- 7. Testing Circuit Optimizer ---');
    const unoptimizedCircuit = {
      name: 'Unoptimized Circuit',
      qubits: 1,
      columns: 4,
      operations: [
        { id: 'op1', gate: 'H', qubit: 0, column: 0 },
        { id: 'op2', gate: 'H', qubit: 0, column: 1 }, // H * H = I
        { id: 'op3', gate: 'X', qubit: 0, column: 2 }
      ]
    };
    const optRes = await fetch(`${baseUrl}/api/ai/optimize-circuit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ circuit: unoptimizedCircuit })
    });
    const optData = await optRes.json();
    if (!optRes.ok) throw new Error(`Optimizer failed: ${JSON.stringify(optData)}`);
    console.log(`Original gates: ${optData.optimization.originalGateCount}, Optimized gates: ${optData.optimization.optimizedGateCount}`);
    console.log('Optimization Rules:', optData.optimization.simplifications.map((s: any) => s.description));
    if (optData.optimization.optimizedGateCount !== 1) {
      throw new Error(`Expected 1 gate remaining (X), got ${optData.optimization.optimizedGateCount}`);
    }
    console.log('✔ Circuit Optimizer successfully eliminated redundant H-H pair');

    // 8. Challenge Evaluation
    console.log('\n--- 8. Testing Quantum Challenge Evaluation ---');
    const evalRes = await fetch(`${baseUrl}/api/challenges/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        challengeId: 'challenge-2-bell-state',
        circuit: bellCircuit
      })
    });
    const evalData = await evalRes.json();
    if (!evalRes.ok) throw new Error(`Challenge eval failed: ${JSON.stringify(evalData)}`);
    console.log('Challenge evaluation passed:', evalData.evaluation.passed);
    console.log('Score:', evalData.evaluation.score);
    console.log('Feedback:', evalData.evaluation.feedback);
    if (!evalData.evaluation.passed) {
      throw new Error('Bell state challenge evaluation failed unexpectedly!');
    }
    console.log('✔ Challenge evaluation succeeded');

    // 9. Student Progress & Learning Update
    console.log('\n--- 9. Testing Student Progress Update ---');
    const lessonRes = await fetch(`${baseUrl}/api/progress/lesson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        lessonId: 'classical-vs-quantum',
        moduleId: 'fundamentals',
        timeSpentSeconds: 180
      })
    });
    const lessonData = await lessonRes.json();
    if (!lessonRes.ok) throw new Error(`Progress update failed: ${JSON.stringify(lessonData)}`);
    console.log(`Updated user: XP = ${lessonData.user.xp}, Level = ${lessonData.user.level}`);
    if (lessonData.user.xp <= 0 || !lessonData.progress.completedLessons.includes('classical-vs-quantum')) {
      throw new Error('Lesson completion not recorded properly');
    }
    console.log('✔ Lesson completion & XP increment verified');

    // 10. Instructor Experience
    console.log('\n--- 10. Testing Instructor Portal Endpoints ---');
    const instTime = Date.now();
    const instEmail = `instructor_${instTime}@sih2026.edu`;
    const instReg = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `prof_quantum_${instTime}`,
        email: instEmail,
        password: 'Password123!',
        role: 'instructor',
        institution: 'IISc Bangalore'
      })
    });
    const instData = await instReg.json();
    instructorToken = instData.token;

    const statsRes = await fetch(`${baseUrl}/api/instructor/stats`, {
      headers: { Authorization: `Bearer ${instructorToken}` }
    });
    const statsData = await statsRes.json();
    if (!statsRes.ok) throw new Error(`Instructor stats fetch failed: ${JSON.stringify(statsData)}`);
    console.log(`Instructor successfully retrieved student cohort (${statsData.students.length} students)`);

    // Instructor creates custom challenge
    const customChalRes = await fetch(`${baseUrl}/api/instructor/challenges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${instructorToken}`
      },
      body: JSON.stringify({
        title: 'GHZ Tripartite State Generator',
        description: 'Prepare an entangled 3-qubit state |000> + |111>',
        difficulty: 'advanced',
        qubits: 3,
        targetDescription: '|000> and |111>',
        targetProbabilities: { '000': 0.5, '111': 0.5 },
        hints: ['Apply H to q0', 'CNOT q0 to q1', 'CNOT q1 to q2'],
        mustEntangle: true,
        xpReward: 150
      })
    });
    const customChalData = await customChalRes.json();
    if (!customChalRes.ok) throw new Error(`Custom challenge creation failed: ${JSON.stringify(customChalData)}`);
    console.log('✔ Custom challenge created:', customChalData.challenge.title);

    // 11. Admin Experience
    console.log('\n--- 11. Testing Admin Center Endpoints ---');
    const adminTime = Date.now();
    const adminEmail = `admin_${adminTime}@sih2026.edu`;
    const adminReg = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `sys_admin_${adminTime}`,
        email: adminEmail,
        password: 'Password123!',
        role: 'admin'
      })
    });
    const adminData = await adminReg.json();
    adminToken = adminData.token;

    const metricsRes = await fetch(`${baseUrl}/api/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const metricsData = await metricsRes.json();
    if (!metricsRes.ok) throw new Error(`Admin metrics failed: ${JSON.stringify(metricsData)}`);
    console.log('Admin Platform Overview:', metricsData.userCounts);
    console.log('✔ Admin portal retrieved platform stats successfully');

    // 12. Security Check (Role-based authorization)
    console.log('\n--- 12. Testing Security & Role-Based Authorization ---');
    const unauthorizedRes = await fetch(`${baseUrl}/api/admin/overview`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    if (unauthorizedRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for student accessing admin endpoint, got ${unauthorizedRes.status}`);
    }
    console.log('✔ Student properly blocked from admin route with 403 Forbidden');

    console.log('\n===============================================================');
    console.log('🎉 ALL 12 INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
    console.log('===============================================================');

  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
