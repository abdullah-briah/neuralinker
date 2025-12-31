import React, { useEffect, useState, useRef, useCallback } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Notifications.css";

const POLL_INTERVAL = 4000; // أسرع + أخف من 5s

const DEFAULT_AVATAR =
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

const Notifications = () => {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const dropdownRef = useRef(null);
    const lastSeenIdRef = useRef(null);
    const isFirstLoadRef = useRef(true);

    const audioRef = useRef(
        new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3")
    );

    /* ===============================
       Fetch Notifications (SMART)
    =============================== */
    const fetchNotifications = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);

            const res = await api.get("/notifications");
            const data = res.data || [];

            // unread count
            const unread = data.reduce(
                (acc, n) => (n.isRead ? acc : acc + 1),
                0
            );

            // 🔔 Sound logic (only real new notification)
            if (data.length > 0) {
                const newestId = data[0].id;

                if (
                    !isFirstLoadRef.current &&
                    lastSeenIdRef.current &&
                    newestId !== lastSeenIdRef.current &&
                    !data[0].isRead
                ) {
                    audioRef.current
                        .play()
                        .catch(() => { }); // ignore autoplay restriction
                }

                lastSeenIdRef.current = newestId;
            }

            isFirstLoadRef.current = false;

            setNotifications(data);
            setUnreadCount(unread);
        } catch (err) {
            console.error("❌ Failed to fetch notifications", err);
        } finally {
            setLoading(false);
        }
    }, []);

    /* ===============================
       Initial load + Polling
    =============================== */
    useEffect(() => {
        fetchNotifications();

        const interval = setInterval(() => {
            // لا نعمل fetch إذا القائمة مفتوحة (تقليل re-render)
            if (!open) {
                fetchNotifications(true);
            }
        }, POLL_INTERVAL);

        return () => clearInterval(interval);
    }, [fetchNotifications, open]);

    /* ===============================
       Close on outside click
    =============================== */
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    /* ===============================
       Mark as read (Optimistic)
    =============================== */
    const markAsRead = async (id) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
            )
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));

        try {
            await api.put(`/notifications/${id}/read`);
        } catch (err) {
            console.error("❌ markAsRead failed", err);
            fetchNotifications(true); // resync
        }
    };

    /* ===============================
       Helpers
    =============================== */
    const getAvatar = (user) => {
        if (!user?.avatarUrl) return DEFAULT_AVATAR;

        if (user.avatarUrl.startsWith("http")) {
            return user.avatarUrl;
        }

        let baseUrl =
            import.meta.env.VITE_API_URL || "http://localhost:4000/api";

        if (baseUrl.endsWith("/api")) {
            baseUrl = baseUrl.slice(0, -4);
        }

        return `${baseUrl}/uploads/${user.avatarUrl}`;
    };

    /* ===============================
       Render
    =============================== */
    return (
        <div className="notifications-container" ref={dropdownRef}>
            <button
                className="notifications-btn"
                onClick={() => {
                    setOpen((p) => !p);
                    if (!open) fetchNotifications(true);
                }}
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="notifications-dot">
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="notifications-dropdown">
                    <div className="notifications-header">
                        <h3>Notifications</h3>
                    </div>

                    <div className="notifications-list">
                        {loading ? (
                            <div className="notif-loading">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="notif-empty">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const jr = n.joinRequest;
                                const user = jr?.user;
                                const ai = jr?.aiInsight;

                                return (
                                    <div
                                        key={n.id}
                                        className={`notification-item ${n.isRead ? "read" : "unread"
                                            }`}
                                        onClick={() => {
                                            if (!n.isRead) markAsRead(n.id);

                                            if (jr?.id && jr?.userId) {
                                                navigate(
                                                    `/profile/${jr.userId}?joinRequestId=${jr.id}`
                                                );
                                            } else if (n.projectId) {
                                                navigate(
                                                    `/projects/${n.projectId}`
                                                );
                                            }

                                            setOpen(false);
                                        }}
                                    >
                                        <div className="notif-content">
                                            <strong>{n.title}</strong>
                                            {n.message && <p>{n.message}</p>}

                                            {user && (
                                                <div className="notif-user-info">
                                                    <img
                                                        src={getAvatar(user)}
                                                        alt={user.name}
                                                        className="notif-avatar"
                                                    />
                                                    <span>{user.name}</span>
                                                </div>
                                            )}

                                            {ai && (
                                                <div className="notif-ai-score">
                                                    Match Score: {ai.score}%
                                                </div>
                                            )}

                                            <span className="notif-time">
                                                {new Date(
                                                    n.createdAt
                                                ).toLocaleString()}
                                            </span>
                                        </div>

                                        {!n.isRead && (
                                            <span className="notif-indicator" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
