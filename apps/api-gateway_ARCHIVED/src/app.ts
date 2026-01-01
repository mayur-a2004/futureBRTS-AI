import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import healthRoutes from './routes/health';
import studentRoutes from './routes/students';
import projectRoutes from './routes/projects';

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use('/health', healthRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/projects', projectRoutes);

export default app;
