import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as svc from '../services/feedback.service';

const bodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  subject: z.string().trim().min(1).max(300),
  message: z.string().trim().min(1).max(10000),
});

export async function createFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Validation failed', details: parsed.error.flatten() });
      return;
    }
    const { name, email, subject, message } = parsed.data;
    const userId = req.user?.sub ?? null;
    const row = await svc.createFeedback({ userId, name, email, subject, message });
    res.status(201).json({ id: row.id, createdAt: row.createdAt });
  } catch (e) {
    next(e);
  }
}
