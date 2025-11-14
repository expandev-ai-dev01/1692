/**
 * @summary
 * V1 API router configuration.
 * Organizes routes into external (public) and internal (authenticated) groups.
 *
 * @module routes/v1
 */
import { Router } from 'express';
import externalRoutes from './externalRoutes';
import internalRoutes from './internalRoutes';

const router = Router();

// External (public) routes - /api/v1/external/...
router.use('/external', externalRoutes);

// Internal (authenticated) routes - /api/v1/internal/...
router.use('/internal', internalRoutes);

export default router;
