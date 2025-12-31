// src/components/Notifications.jsx
import React, { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import api from "../api/axios";
import "../styles/Notifications.css";

// Simple notification sound (base64)
const NOTIFICATION_SOUND = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"; // Placeholder, using a real URL below usually better

const Notifications = ({ currentUserId }) => {
    const navigate = useNavigate(); // Initialize hook
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Track latest notification ID to avoid playing sound on initial load
    const lastNotificationIdRef = useRef(null);
    const audioRef = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"));

    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await api.get("/notifications");
            const data = res.data;

            // count unread
            const unread = data.filter((n) => !n.isRead).length;

            // Check for new notifications to play sound
            if (data.length > 0) {
                const latestId = data[0].id;
                // If we have a previous ID, and the new latest ID is different, and it's unread
                if (lastNotificationIdRef.current && lastNotificationIdRef.current !== latestId) {
                    // Play sound
                    audioRef.current.play().catch(e => console.log("Audio play failed (interaction required first):", e));
                }
                lastNotificationIdRef.current = latestId;
            }

            setNotifications(data);
            setUnreadCount(unread);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setLoading(false);
        }
    };

    // ... rest of component

    const respondJoinRequest = async (joinRequestId, status) => {
        try {
            await api.patch(`/join-requests/${joinRequestId}/respond`, { status });
            // Update immediately
            fetchNotifications();
        } catch (err) {
            console.error("Failed to respond to join request", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(prev - 1, 0));
            await api.put(`/notifications/${id}/read`);
        } catch (err) {
            console.error("Failed to mark notification as read", err);
            fetchNotifications(); // Re-fetch to sync state if error
        }
    };

    return (
        <div className="notifications-container" ref={dropdownRef}>
            <button
                className="notifications-btn"
                onClick={() => setOpen((p) => !p)}
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="notifications-dot">{unreadCount}</span>
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
                            <div className="notif-empty">No notifications yet</div>
                        ) : (
                            notifications.map((n) => {
                                const joinRequest = n.joinRequest;
                                const user = joinRequest?.user;
                                const aiInsight = joinRequest?.aiInsight;

                                // Construct robust avatar URL
                                let avatarSrc = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                                if (user?.avatarUrl) {
                                    if (user.avatarUrl.startsWith("http")) {
                                        avatarSrc = user.avatarUrl;
                                    } else {
                                        let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
                                        if (baseUrl.endsWith("/api")) baseUrl = baseUrl.slice(0, -4);
                                        avatarSrc = `${baseUrl}/uploads/${user.avatarUrl}`;
                                    }
                                }

                                return (
                                    <div
                                        key={n.id}
                                        className={`notification-item ${n.isRead ? "read" : "unread"}`}
                                        onClick={() => {
                                            // Log click data
                                            console.log("Notification Clicked:", n);
                                            console.log("JoinRequest:", n.joinRequest);

                                            if (!n.isRead) markAsRead(n.id);

                                            const joinRequestId = n.joinRequest?.id;
                                            const requesterId = n.joinRequest?.userId;

                                            // Redirect to profile
                                            // Redirect to profile
                                            if (joinRequestId && requesterId) {
                                                console.log(`Navigating to profile/${requesterId}?joinRequestId=${joinRequestId}`);
                                                navigate(`/profile/${requesterId}?joinRequestId=${joinRequestId}`);
                                                setOpen(false); // Close dropdown
                                            } else if (n.projectId) {
                                                // Redirect to project page for other notifications (e.g. Accepted/Rejected/Chat)
                                                console.log(`Navigating to projects/${n.projectId}`);
                                                navigate(`/projects/${n.projectId}`);
                                                setOpen(false);
                                            } else {
                                                console.warn("Missing joinRequestId or requesterId, cannot redirect");
                                            }
                                        }}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className="notif-content">
                                            <strong>{n.title}</strong>
                                            {n.message && <p>{n.message}</p>}

                                            {user && (
                                                <div className="notif-user-info">
                                                    <div>
                                                        <img
                                                            src={avatarSrc}
                                                            alt={user.name}
                                                            className="notif-avatar"
                                                        />
                                                        <span>{user.name}</span>
                                                    </div>
                                                    {user.skills && (
                                                        <div className="notif-skills">
                                                            {Array.isArray(user.skills)
                                                                ? user.skills.join(", ")
                                                                : String(user.skills).replace(/[\[\]"]/g, "")}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {aiInsight && (
                                                <div className="notif-ai-score">
                                                    Match Score: {aiInsight.score}%
                                                </div>
                                            )}

                                            <span className="notif-time">
                                                {new Date(n.createdAt).toLocaleString()}
                                            </span>
                                        </div>

                                        {!n.isRead && (
                                            <span className="notif-indicator" />
                                        )}

                                        {/* Visual hint for clickability if it's a join request */}
                                        {joinRequest && (
                                            <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#a855f7" }}>
                                                Click to view request details
                                            </div>
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
