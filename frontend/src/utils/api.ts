const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Auth ──────────────────────────────────────────────────────────────
export async function registerUser(name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Registration failed');
  return res.json();
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Login failed');
  return res.json();
}

// ── Trips ─────────────────────────────────────────────────────────────
export async function fetchTrips() {
  const res = await fetch(`${API_URL}/api/trips`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch trips');
  return res.json();
}

export async function createTrip(data: {
  destination: string;
  durationDays: number;
  budgetTier: string;
  interests: string[];
}) {
  const res = await fetch(`${API_URL}/api/trips/generate`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to generate trip');
  return res.json();
}

export async function updateTrip(tripId: string, data: object) {
  const res = await fetch(`${API_URL}/api/trips/${tripId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update trip');
  return res.json();
}

export async function deleteTrip(tripId: string) {
  const res = await fetch(`${API_URL}/api/trips/${tripId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete trip');
  return res.json();
}
