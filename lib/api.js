const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5166/api';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function authHeader() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function apiGet(endpoint) {
  const res = await fetch(`${API_BASE}/${endpoint}`, { headers: authHeader() });
  if (!res.ok) throw new Error(`GET ${endpoint} falhou (${res.status})`);
  return res.json();
}

export async function apiPost(endpoint, data) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || `POST ${endpoint} falhou`);
  }
  return res.json();
}

export async function apiDelete(endpoint) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: 'DELETE',
    headers: authHeader(),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || `DELETE ${endpoint} falhou`);
  }
  return res.status !== 204 ? res.json().catch(() => null) : null;
}

export async function apiPatch(endpoint, data) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(data ?? {}),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || `PATCH ${endpoint} falhou`);
  }
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}
