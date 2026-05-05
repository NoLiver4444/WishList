import { useEffect, useState } from 'react';
import { useSessionStore } from '@/entities/session';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const store = useSessionStore.getState();
    const token = store.accounts[store.activeIndex]?.token;
    if (!token) return;

    const url = `${import.meta.env.VITE_API_URL}/api/notifications/stream`;
    const es = new EventSource(`${url}?token=${token}`);

    es.onmessage = (e) => {
      const notification = JSON.parse(e.data);
      setNotifications(prev => {
        if (prev.some(n => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
    };

    es.onerror = () => es.close();

    return () => es.close();
  }, []);

  const dismiss = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return { notifications, dismiss };
};