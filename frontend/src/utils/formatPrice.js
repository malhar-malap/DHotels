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

export const PRICE_NOT_DISCLOSED_LABEL = 'Price Not Disclosed';

// Keep in step with PRICE_UNITS in utils/hospitality.js
const PRICE_UNIT_SUFFIX = { PER_MONTH: '/ month', PER_YEAR: '/ year', PER_SQFT_MONTH: '/ sq ft / month' };

/**
 * Formats a listing's asking price, honouring the seller's "price not to be disclosed" choice
 * and the unit the price is quoted in, e.g. "₹22 L / month".
 */
export const formatListingPrice = (listing) => {
  const { price, suffix } = listingPriceParts(listing);
  return suffix ? `${price} ${suffix}` : price;
};

/** The price and its unit separately, for layouts that set the unit in smaller type. */
export const listingPriceParts = (listing) => {
  if (listing?.priceNotDisclosed) return { price: PRICE_NOT_DISCLOSED_LABEL, suffix: '' };
  const price = formatPrice(listing?.askingPrice);
  return { price, suffix: price !== '—' ? PRICE_UNIT_SUFFIX[listing?.priceUnit] || '' : '' };
};

export default formatPrice;
