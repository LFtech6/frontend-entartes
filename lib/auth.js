export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const s = localStorage.getItem('user');
  try { return s ? JSON.parse(s) : null; } catch { return null; }
}

export function isAuthenticated() {
  return !!getToken();
}

export function logout(router) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/');
}
