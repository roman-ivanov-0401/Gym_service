export type {
  SubscriptionType,
  Client,
  Subscription,
  ClientWithSubscriptions,
} from '../store/gymApi';

import type { SubscriptionType } from '../store/gymApi';

/** Отображаемое название типа абонемента (RU). */
export function subscriptionLabelRu(type: SubscriptionType): string {
  return type === 'monthly' ? 'Ежемесячная' : 'Годовая';
}
