/**
 * @summary
 * Main API router with version management.
 * Routes requests to appropriate version-specific routers.
 *
 * @module routes
 */
import { Router } from 'express';
import v1Routes from './v1';

const router = Router();

// Version 1 (current stable)
router.use('/v1', v1Routes);

export default router;
