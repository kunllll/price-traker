const BASE = 'http://localhost:5000/api';

export async function getProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/products${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

export async function getProduct(id, days = 180) {
  const res = await fetch(`${BASE}/products/${id}?days=${days}`);
  if (!res.ok) throw new Error('Failed to load product');
  return res.json();
}

export async function toggleWatchlist(id) {
  const res = await fetch(`${BASE}/products/${id}/watchlist`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to update watchlist');
  return res.json();
}