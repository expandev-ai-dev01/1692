/**
 * @summary
 * External (public) API routes configuration for V1.
 * Handles publicly accessible endpoints without authentication.
 *
 * @module routes/v1/externalRoutes
 */
import { Router } from 'express';
import * as weatherController from '@/api/v1/external/weather/controller';

const router = Router();

// Weather routes
router.get('/weather/current', weatherController.getCurrentWeather);
router.post('/weather/refresh', weatherController.refreshWeather);

export default router;
