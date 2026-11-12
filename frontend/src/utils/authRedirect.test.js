import { getRedirectTarget } from './authRedirect';

describe('getRedirectTarget', () => {
  test.each([
    ['?redirect=%2Flistings%2F12', '/listings/12'],
    ['?redirect=%2Fdashboard%3Ftab%3Djobs', '/dashboard?tab=jobs'],
  ])('keeps same-site path %s', (search, expected) => {
    expect(getRedirectTarget(search)).toBe(expected);
  });

  test.each([
    '', '?redirect=https%3A%2F%2Fevil.com', '?redirect=%2F%2Fevil.com', '?redirect=%2F%5Cevil.com',
    '?redirect=%2Fok%5C..%5C%5Cevil.com', '?redirect=%2F%09%2Fevil.com', '?redirect=%2F%0A%2Fevil.com', '?redirect=javascript%3Aalert(1)',
  ])('falls back for %s', (search) => {
    expect(getRedirectTarget(search)).toBe('/dashboard');
  });
});
