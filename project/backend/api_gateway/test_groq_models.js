const axios = require('axios');
require('dotenv').config();

async function testGroqModels() {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  try {
    const res = await axios.get('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${GROQ_API_KEY}` }
    });
    console.log(res.data.data.map(m => m.id));
  } catch (err) {
    console.log(err.message);
  }
}

testGroqModels();
