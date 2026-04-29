import { Router } from 'express';
import { optionalAuthMiddleware } from '../middlewares/auth.middleware';
import * as ctrl from '../controllers/feedback.controller';

const router = Router();

/**
 * @openapi
 * /feedback:
 *   post:
 *     summary: Send feedback (stored; optional Bearer links user)
 *     tags: [Feedback]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, subject, message]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               subject: { type: string }
 *               message: { type: string }
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', optionalAuthMiddleware, ctrl.createFeedback);

export default router;
