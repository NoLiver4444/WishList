/**
 * @file API методы для аутентификации и регистрации.
 * @module shared/api/sessionApi
 */

const API = import.meta.env.VITE_API_URL;

if (!API) {
  console.error('API не определено');
}

/**
 * @typedef {Object} AuthResponse
 * @property {string} token - Токен доступа.
 * @property {User} user - Объект пользователя.
 */

/**
 * Выполняет запрос на вход в систему.
 * * @param {Object} body - Данные для входа.
 * @param {string} body.email - Email пользователя.
 * @param {string} body.password - Пароль.
 * @returns {Promise<AuthResponse>} Данные сессии.
 * @throws {Object} Ошибка с полем status и данными ответа.
 */
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

/**
 * Выполняет запрос на регистрацию нового пользователя.
 * * @param {Object} body - Данные для регистрации.
 * @param {string} body.name - Имя пользователя.
 * @param {string} body.email - Email.
 * @param {string} body.password - Пароль.
 * @returns {Promise<AuthResponse>} Данные новой сессии.
 * @throws {Object} Ошибка с полем status и данными ответа.
 */
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
