const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function authHeaders() {
  const token = localStorage.getItem('drip_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function connectWallet(walletAddress) {
  const data = await request('/api/auth/connect', {
    method: 'POST',
    body: JSON.stringify({ walletAddress }),
  });
  localStorage.setItem('drip_token', data.token);
  return data;
}

export function clearAuth() {
  localStorage.removeItem('drip_token');
}

export function getStoredToken() {
  return localStorage.getItem('drip_token');
}

// ── Pieces ───────────────────────────────────────────────────────────────────

export async function fetchPieces(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request(`/api/pieces${qs ? `?${qs}` : ''}`);
}

export async function fetchPiece(id) {
  return request(`/api/pieces/${id}`);
}

export async function uploadPiece(formData) {
  const token = localStorage.getItem('drip_token');
  const res = await fetch(`${BASE}/api/pieces`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData, // multipart/form-data — no Content-Type header (browser sets boundary)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

export async function getAccessToken(pieceId) {
  return request(`/api/pieces/${pieceId}/access-token`);
}

// ── Purchases ────────────────────────────────────────────────────────────────

export async function purchasePiece(pieceId, txHash) {
  return request('/api/purchases', {
    method: 'POST',
    body: JSON.stringify({ pieceId, txHash }),
  });
}

export async function fetchMyPieces() {
  return request('/api/purchases/mine');
}
