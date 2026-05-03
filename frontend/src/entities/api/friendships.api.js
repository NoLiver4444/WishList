/**
 * @file API-модуль для работы с друзьями и заявками.
 * Содержит методы для поиска пользователей, отправки запросов и управления списком друзей.
 * @module entities/api/friendships
 */

import { client } from '@/shared/api/client.api';

/**
 * Поиск пользователей по логину.
 * @param {string} login - Строка поиска (логин пользователя).
 * @returns {Promise} Результат поиска со списком подходящих пользователей.
 */
export const searchUsers = (login) =>
  client(`/api/users/search?login=${encodeURIComponent(login)}`);

/**
 * Отправка запроса в друзья.
 * @param {string|number} friendId - ID пользователя, которому отправляется запрос.
 * @returns {Promise}
 */
export const sendFriendRequest = (friendId) =>
  client('/api/friends/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ friend_id: friendId }),
  });

/**
 * Получение списка подтвержденных друзей текущего пользователя.
 * @returns {Promise<Array>} Список друзей.
 */
export const getFriends = () => client('/api/friends');

/**
 * Получение списка входящих заявок в друзья.
 * @returns {Promise<Array>} Список заявок.
 */
export const getIncomingRequests = () => client('/api/friends/requests');

/**
 * Ответ на входящую заявку (принять или отклонить).
 * @param {string|number} id - ID дружбы (friendship_id).
 * @param {'accepted'|'declined'} status - Новый статус заявки.
 * @returns {Promise}
 */
export const respondToRequest = (id, status) =>
  client(`/api/friends/${id}/respond?status=${status}`, { method: 'PATCH' });

/**
 * Удаление пользователя из списка друзей.
 * @param {string|number} id - ID дружбы для удаления.
 * @returns {Promise}
 */
export const deleteFriend = (id) =>
  client(`/api/friends/${id}`, { method: 'DELETE' });
