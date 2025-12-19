import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = { ...notification, id };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove notification after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, notification.duration || 5000);
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAllNotifications: () => {
    set({ notifications: [] });
  },
}));

// Hook for easy notification usage
export const useNotifications = () => {
  const { addNotification, removeNotification, clearAllNotifications } = useNotificationStore();

  const notify = {
    success: (title: string, message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'title' | 'message'>>) =>
      addNotification({ type: 'success', title, message, ...options }),
    
    error: (title: string, message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'title' | 'message'>>) =>
      addNotification({ type: 'error', title, message, ...options }),
    
    warning: (title: string, message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'title' | 'message'>>) =>
      addNotification({ type: 'warning', title, message, ...options }),
    
    info: (title: string, message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'title' | 'message'>>) =>
      addNotification({ type: 'info', title, message, ...options }),
  };

  return {
    notify,
    removeNotification,
    clearAllNotifications,
  };
};
