/**
 * @file Подписка на уведомления через Server-Sent Events.
 * @module shared/hooks/useNotifications
 */

import { useEffect, useState } from 'react';
import { useSessionStore } from '@/entities/session/model/sessionStore';
import { API_URL } from '@/shared/config/env';

const MIN_RETRY_MS = 1_000;
const MAX_RETRY_MS = 30_000;

/**
 * Подключается к потоку уведомлений текущего аккаунта.
 * При обрыве переподключается с экспоненциальной задержкой (1с → 30с),
 * при смене аккаунта (токена) пересоздаёт подключение.
 * @returns {{notifications: Object[], dismiss: function(string): void}}
 */
export const useNotifications = () => {
  const token = useSessionStore((s) => s.accounts[s.activeIndex]?.token);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setNotifications([]);
    if (!token) return undefined;

    let es = null;
    let retryTimer = null;
    let retryDelay = MIN_RETRY_MS;
    let stopped = false;

    const connect = () => {
      const url = `${API_URL}/api/notifications/stream?token=${encodeURIComponent(token)}`;
      es = new EventSource(url);

      es.onopen = () => {
        retryDelay = MIN_RETRY_MS;
      };

      es.onmessage = (e) => {
        let notification;
        try {
          notification = JSON.parse(e.data);
        } catch {
          return;
        }
        setNotifications((prev) =>
          prev.some((n) => n.id === notification.id)
            ? prev
            : [notification, ...prev]
        );
      };

      es.onerror = () => {
        es.close();
        if (stopped) return;
        retryTimer = setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, MAX_RETRY_MS);
      };
    };

    connect();

    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      es?.close();
    };
  }, [token]);

  const dismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return { notifications, dismiss };
};
