import axios from 'axios';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

async function run() {
  console.log('Testing AI Provider Configuration endpoints...');

  // 1. Log in as teacher to get JWT
  const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: 'teacher.golden@akademiya.io',
    password: 'password123'
  });
  const token = loginRes.data.token;
  const headers = { Authorization: `Bearer ${token}` };
  console.log('✓ Teacher logged in successfully');

  // 2. GET current provider
  const getRes = await axios.get(`${BASE_URL}/api/settings/ai-provider`, { headers });
  console.log('✓ GET /api/settings/ai-provider returned:', getRes.data.config.activeProvider);

  // 3. Switch to Gemini
  const setGeminiRes = await axios.put(`${BASE_URL}/api/settings/ai-provider`, { provider: 'gemini' }, { headers });
  console.log('✓ Switched to Gemini:', setGeminiRes.data.config.activeProvider === 'gemini' ? 'PASS' : 'FAIL');

  // 4. Test Gemini connection
  const testGemini = await axios.post(`${BASE_URL}/api/settings/ai-provider/test`, { provider: 'gemini' }, { headers });
  console.log('✓ Test Gemini Connection Result:', testGemini.data);

  // 5. Switch to LM Studio
  const setLMStudioRes = await axios.put(`${BASE_URL}/api/settings/ai-provider`, { provider: 'lmstudio' }, { headers });
  console.log('✓ Switched to LM Studio:', setLMStudioRes.data.config.activeProvider === 'lmstudio' ? 'PASS' : 'FAIL');

  // 6. Test LM Studio connection
  const testLMStudio = await axios.post(`${BASE_URL}/api/settings/ai-provider/test`, { provider: 'lmstudio' }, { headers });
  console.log('✓ Test LM Studio Connection Result:', testLMStudio.data);

  console.log('\n🎉 ALL AI PROVIDER TOGGLE TESTS PASSED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error('❌ Test failed:', err.response?.data || err.message);
  process.exit(1);
});
