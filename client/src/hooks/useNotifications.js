import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useSocket } from "@/context/SocketContext";
import { getNotifications, markAllAsRead, markAsRead } from "@/services/notification.service";

const MAX_NOTIFICATIONS = 50;

let idCounter = 0;
const nextId = () => ++idCounter;

const normalizeNotification = (notification) => ({
  id: notification.id || notification.notificationId || nextId(),
  type: notification.type || "notification",
  title: notification.title,
  message: notification.message || notification.body || notification.title || "New notification",
  data: notification.data,
  timestamp: notification.timestamp || notification.sentAt || notification.createdAt || new Date().toISOString(),
  read: notification.read ?? notification.isRead ?? false,
  persisted: Boolean(notification.id || notification.notificationId),
});

/**
 * Manages an in-session notification list driven by socket events.
 *
 * Returns { notifications, unreadCount, markRead, markAllRead, clearAll }
 *
 * Listens to:
 *   food:new, food:status_changed  → adds entry for NGO users
 *   request:new                    → adds entry for Restaurant users
 *   request:status_changed         → adds entry for NGO users
 *   notification:new               → generic fallback
 */
export function useNotifications() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);

  const push = useCallback((notification) => {
    setNotifications((prev) => [
      normalizeNotification({ ...notification, read: false }),
      ...prev.slice(0, MAX_NOTIFICATIONS - 1),
    ]);
  }, []);

  useEffect(() => {
    let cancelled = false;

    getNotifications({ page: 1, limit: 20 })
      .then((res) => {
        if (cancelled) return;
        const list = res.data?.notifications || [];
        setNotifications(list.map(normalizeNotification));
      })
      .catch(() => {
        if (!cancelled) setNotifications([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onFoodNew = (payload) => {
      console.log("[Notification] food:new", payload);
      push({
        type: "food:new",
        message: payload.message,
        data: payload.data,
        timestamp: payload.timestamp ?? new Date().toISOString(),
      });
      toast.success(payload.message || "New food available nearby!", {
        icon: "🍱",
        id: `food-new-${payload.data?.id}`,
      });
    };

    const onFoodStatusChanged = (payload) => {
      console.log("[Notification] food:status_changed", payload);
      const status = payload.data?.status;
      push({
        type: "food:status_changed",
        message: `Food listing status changed to ${status}`,
        data: payload.data,
        timestamp: payload.timestamp ?? new Date().toISOString(),
      });
    };

    const onRequestNew = (payload) => {
      console.log("[Notification] request:new", payload);
      push({
        type: "request:new",
        message: payload.message,
        data: payload.data,
        timestamp: payload.timestamp ?? new Date().toISOString(),
      });
      toast.success(payload.message || "New pickup request received!", {
        icon: "📋",
        id: `req-new-${payload.data?.id}`,
      });
    };

    const onRequestStatusChanged = (payload) => {
      console.log("[Notification] request:status_changed", payload);
      const { status } = payload.data || {};
      const message = payload.message || `Request status updated to ${status}`;
      push({
        type: "request:status_changed",
        message,
        data: payload.data,
        timestamp: payload.timestamp ?? new Date().toISOString(),
      });
      if (status === "ACCEPTED" || status === "COMPLETED") {
        toast.success(message, {
          icon: status === "ACCEPTED" ? "✅" : "🎉",
          id: `req-status-${payload.data?.requestId}`,
        });
      } else if (status === "REJECTED") {
        toast.error(payload.message || "Your food request was declined.", {
          id: `req-status-${payload.data?.requestId}`,
        });
      } else {
        toast(message, {
          icon: "ℹ️",
          id: `req-status-${payload.data?.requestId}`,
        });
      }
    };

    const onGeneric = (payload) => {
      console.log("[Notification] notification:new", payload);
      push({
        id: payload.notificationId,
        type: payload.type || "notification",
        title: payload.title,
        message: payload.message || payload.body,
        data: payload.data,
        timestamp: payload.timestamp ?? new Date().toISOString(),
      });
      if (payload.message) toast(payload.message, { icon: "🔔" });
    };

    console.log(socket);

    console.log(
      "[Notification] Registering socket listeners  socketId=" + socket.id,
    );

    socket.on("food:new", onFoodNew);
    socket.on("food:status_changed", onFoodStatusChanged);
    socket.on("request:new", onRequestNew);
    socket.on("request:status_changed", onRequestStatusChanged);
    socket.on("notification:new", onGeneric);

    return () => {
      socket.off("food:new", onFoodNew);
      socket.off("food:status_changed", onFoodStatusChanged);
      socket.off("request:new", onRequestNew);
      socket.off("request:status_changed", onRequestStatusChanged);
      socket.off("notification:new", onGeneric);
    };
  }, [socket, push]);

  const markRead = useCallback(
    (id) => {
      const target = notifications.find((n) => n.id === id);
      if (target?.persisted) markAsRead(id).catch(() => {});

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    },
    [notifications],
  );

  const markAllRead = useCallback(() => {
    markAllAsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, markRead, markAllRead, clearAll };
}
