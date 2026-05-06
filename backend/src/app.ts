import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import healthRoutes from './routes/health.routes.js';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', healthRoutes);

// Global Error Handler (to be expanded later)
app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

export default app;
