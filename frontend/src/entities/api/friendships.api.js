import { client } from '@/shared/api/client.api.js';

export const searchUsers = (login) =>
  client(`/api/users/search?login=${encodeURIComponent(login)}`);

export const sendFriendRequest = (friendId) =>
  client('/api/friends/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ friend_id: friendId }),
  });

export const getFriends = () => client('/api/friends');

export const getIncomingRequests = () => client('/api/friends/requests');

export const respondToRequest = (id, status) =>
  client(`/api/friends/${id}/respond?status=${status}`, { method: 'PATCH' });

export const deleteFriend = (id) =>
  client(`/api/friends/${id}`, { method: 'DELETE' });
