import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import questionRoutes from './routes/questions.js';
import attemptRoutes from './routes/attempts.js';
import gapRoutes from './routes/gaps.js';
import generationJobRoutes from './routes/generationJobs.js';
import practiceRoutes from './routes/practice.js';
import diagnosticRoutes from './routes/diagnostics.js';
import interventionRoutes from './routes/interventions.js';
import progressRoutes from './routes/progress.js';
import codeLabRoutes from './routes/codeLab.js';
import insightRoutes from './routes/insights.js';
import semanticRoutes from './routes/semantic.js';
import settingsRoutes from './routes/settings.js';
import { setupWebSocket } from './ws.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/gaps', gapRoutes);
app.use('/api/generation-jobs', generationJobRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/diagnostics', diagnosticRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/code-lab', codeLabRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/semantic', semanticRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Akademiya Learning Intelligence Platform' });
});

export const server = http.createServer(app);

// Attach WebSocket server on /ws
export const wss = setupWebSocket(server);

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 Akademiya Server listening on http://localhost:${PORT}`);
  });
}

export default app;
