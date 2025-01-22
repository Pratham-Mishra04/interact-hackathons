export const formatPrice = (price: number) => {
  if (price < 1000) return price;
  return Math.round(price / 1000) + 'K';
};
