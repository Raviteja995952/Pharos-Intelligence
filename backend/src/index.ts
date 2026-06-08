import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import analyzeRoutes from './routes/analyze';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('\n--- Pharos Risk Intelligence Agent Startup ---');
console.log('Environment loaded');
const isKeyLoaded = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
console.log(`Gemini key loaded (${isKeyLoaded})`);
console.log('----------------------------------------------\n');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/', (req, res) => {
  res.send('Pharos Risk Intelligence Agent API is running.');
});

// Routes
app.use('/analyze', analyzeRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
