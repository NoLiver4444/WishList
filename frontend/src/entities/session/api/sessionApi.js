const API = import.meta.env.VITE_API_URL;

if (!API) {
  console.error('API не определено');
}

export const loginRequest = (body) =>
  fetch(`${API}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(async (r) => {
    const data = await r.json();
    if (!r.ok) throw { status: r.status, ...data };
    return data;
  });

export const registerRequest = (body) =>
  fetch(`${API}/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(async (r) => {
    const data = await r.json();
    if (!r.ok) throw { status: r.status, ...data };
    return data;
  });
