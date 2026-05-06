import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  virtualNodeCount: parseInt(process.env.VIRTUAL_NODE_COUNT || '100', 10),
};
