import { ACCESS_DENIED, ADMIN_AUTHORIZATION_DENIED, ORG_AUTHORIZATION_DENIED } from '@/config/errors';

export const formatPrice = (price: number) => {
  if (price < 1000) return price;
  return Math.round(price / 1000) + 'K';
};

export const isAccessDeniedError = (message?: string) => {
  if (!message) return false;

  return message == ACCESS_DENIED || message == ADMIN_AUTHORIZATION_DENIED || message == ORG_AUTHORIZATION_DENIED;
};
