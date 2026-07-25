import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import marketRoutes from './routes/market.routes.js';

const app = express();

app.use(cors({
  origin: config.frontend.url,
  credentials: true,
}));

app.use(express.json());

app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/market', marketRoutes);

app.listen(config.server.port, () => {
  console.log(`Server running on port ${config.server.port} in ${config.server.nodeEnv} mode`);
});