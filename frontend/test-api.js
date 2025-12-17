const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing backend connection...');
    
    // Test 1: Health check
    const health = await axios.get('http://localhost:8000/api/v1/health');
    console.log('✅ Health check:', health.data);
    
    // Test 2: Search
    console.log('\nTesting search...');
    const search = await axios.post('http://localhost:8000/api/v1/search', {
      query: '¿Qué es la inteligencia artificial?',
      top_k: 3
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Search response:', JSON.stringify(search.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testAPI();