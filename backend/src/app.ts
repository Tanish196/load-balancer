import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import healthRoutes from './routes/health.routes.js';
import routingRoutes from './routes/routing.routes.js';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', healthRoutes);
app.use('/api/v1', routingRoutes);

// Global Error Handler (to be expanded later)
app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

export default app;
