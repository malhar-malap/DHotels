/**
 * Formats a numeric price into a human-readable Indian notation string.
 * Examples:
 *   4500000000 → ₹450 Cr
 *   450000000  → ₹45 Cr
 *   45000000   → ₹4.5 Cr
 *   1500000    → ₹15 L
 *   150000     → ₹1.5 L
 *   50000      → ₹50,000
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined || isNaN(price)) return '—';
  const num = Number(price);
  if (num >= 10000000) {
    const cr = num / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)} Cr`;
  }
  if (num >= 100000) {
    const lakh = num / 100000;
    return `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)} L`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
};

export default formatPrice;
