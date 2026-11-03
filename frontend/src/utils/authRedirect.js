// Helpers for sending logged-out users to login/register and bringing them back afterwards.

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password'];

/** Login (or register) URL that returns the user to `location` once they are signed in. */
export const authPath = (location, page = '/login') => {
  const current = `${location.pathname}${location.search || ''}`;
  if (!location.pathname || location.pathname === '/' || AUTH_PAGES.includes(location.pathname)) return page;
  return `${page}?redirect=${encodeURIComponent(current)}`;
};

/** Reads ?redirect= and only allows same-site paths, so the param can't send users to another domain. */
export const getRedirectTarget = (search, fallback = '/dashboard') => {
  const target = new URLSearchParams(search).get('redirect');
  if (!target || !target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) return fallback;
  return target;
};
