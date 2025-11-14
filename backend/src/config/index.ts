/**
 * @summary
 * Application configuration management.
 * Centralizes all environment variables and configuration settings.
 *
 * @module config
 */
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  api: {
    port: parseInt(process.env.PORT || '3000'),
    version: process.env.API_VERSION || 'v1',
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? process.env.CORS_ORIGINS?.split(',') || []
          : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
      maxAge: 86400,
    },
  },
  weather: {
    apiKey: process.env.WEATHER_API_KEY || '',
    apiUrl: process.env.WEATHER_API_URL || 'https://api.weatherapi.com/v1',
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600'),
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '600'),
  },
};
