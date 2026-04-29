import { prisma } from '../config/database';

export interface CreateFeedbackInput {
  userId?: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function createFeedback(input: CreateFeedbackInput) {
  return prisma.feedback.create({
    data: {
      userId: input.userId ?? null,
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
    },
  });
}
