// Land area is always stored in sq ft; landAreaUnit records how the seller entered it.
export const SQFT_PER_ACRE = 43560;

export const AREA_UNITS = [
  { value: 'SQFT', label: 'sq ft' },
  { value: 'ACRE', label: 'acre' },
];

const round = (n, decimals) => Math.round(n * 10 ** decimals) / 10 ** decimals;

/** Value typed by the user (in `unit`) -> sq ft for the API. */
export const toSqft = (value, unit) => {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return undefined;
  return unit === 'ACRE' ? round(n * SQFT_PER_ACRE, 2) : n;
};

/** Stored sq ft -> number to show in a form input for `unit`. */
export const fromSqft = (sqft, unit) => {
  if (sqft === null || sqft === undefined || sqft === '') return '';
  const n = Number(sqft);
  return unit === 'ACRE' ? round(n / SQFT_PER_ACRE, 4) : n;
};

/** Human-readable area, e.g. "2.5 acres" or "4,500 sq ft". */
export const formatArea = (sqft, unit) => {
  if (sqft === null || sqft === undefined || sqft === '') return '';
  if (unit === 'ACRE') {
    const acres = round(Number(sqft) / SQFT_PER_ACRE, 2);
    return `${acres.toLocaleString('en-IN')} ${acres === 1 ? 'acre' : 'acres'}`;
  }
  return `${Number(sqft).toLocaleString('en-IN')} sq ft`;
};
