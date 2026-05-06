const express = require('express');
const morgan = require('morgan');
const healthRoutes = require('./routes/health');

const app = express();

app.use(express.json()); 
app.use(morgan('dev'));

app.use('/health', healthRoutes);

app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
