export type SubscriptionType = 'monthly' | 'yearly';

export function subscriptionLabelRu(type: SubscriptionType): string {
  return type === 'monthly' ? 'Ежемесячная' : 'Годовая';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  clientId: string;
  type: SubscriptionType;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface ClientWithSubscriptions extends Client {
  subscriptions: Subscription[];
}
