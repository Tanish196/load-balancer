import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import healthRoutes from './routes/health.routes.js';
import routingRoutes from './routes/routing.routes.js';
import { ipRateLimiter } from './middlewares/rate-limiter.middleware.js';

const app: Application = express();

// Trust proxy is required if running behind NGINX or a real load balancer
// so that req.ip extracts the real client IP instead of the proxy IP.
app.set('trust proxy', 1);

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', healthRoutes); // Exclude /health from rate limits
app.use('/api/v1', ipRateLimiter, routingRoutes); // Apply rate limits to all actual load balancer endpoints

// Global Error Handler (to be expanded later)
app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

export default app;
