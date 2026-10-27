import express from 'express';
import cors from 'cors';
import projectsRoutes from './routes/projects.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Montaje de rutas API
app.use('/api/projects', projectsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'webcreator-backend' });
});

export default app;
