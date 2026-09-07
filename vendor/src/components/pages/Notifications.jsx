import React, { useMemo, useState } from "react";
import {
    Bell,
    Check,
    CheckCheck,
    Trash2,
    Search,
    Package,
    ShoppingCart,
    CreditCard,
    RotateCcw,
    Star,
    AlertCircle,
    X,
    RefreshCw
} from "lucide-react";

import "./Notifications.css";


// ======================================================
// INITIAL NOTIFICATIONS
// ======================================================

let initialNotifications = [
    {
        id: 1,
        type: "order",
        title: "New Order Received",
        message: "You have received a new order #203 worth ₹532.95.",
        date: "16 Aug 2026",
        time: "01:20 PM",
        read: false
    },
    {
        id: 2,
        type: "payment",
        title: "Payment Received",
        message: "Payment for order #203 has been successfully received.",
        date: "16 Aug 2026",
        time: "01:15 PM",
        read: false
    },
    {
        id: 3,
        type: "return",
        title: "New Return Request",
        message: "A customer has requested a return for order #202.",
        date: "16 Aug 2026",
        time: "12:45 PM",
        read: false
    },
    {
        id: 4,
        type: "product",
        title: "Product Stock Alert",
        message: "Your product Formal Shirt is running low on stock.",
        date: "15 Aug 2026",
        time: "06:30 PM",
        read: true
    },
    {
        id: 5,
        type: "review",
        title: "New Customer Review",
        message: "A customer has submitted a new review for your product.",
        date: "15 Aug 2026",
        time: "04:20 PM",
        read: true
    },
    {
        id: 6,
        type: "order",
        title: "Order Delivered",
        message: "Order #201 has been successfully delivered to the customer.",
        date: "15 Aug 2026",
        time: "02:10 PM",
        read: true
    },
    {
        id: 7,
        type: "system",
        title: "Account Updated",
        message: "Your vendor account information has been successfully updated.",
        date: "14 Aug 2026",
        time: "11:30 AM",
        read: true
    }
];


// ======================================================
// NOTIFICATION ICON
// ======================================================

function NotificationIcon({ type }) {

    if (type === "order") {
        return <ShoppingCart size={20} />;
    }

    if (type === "payment") {
        return <CreditCard size={20} />;
    }

    if (type === "return") {
        return <RotateCcw size={20} />;
    }

    if (type === "product") {
        return <Package size={20} />;
    }

    if (type === "review") {
        return <Star size={20} />;
    }

    if (type === "system") {
        return <Check size={20} />;
    }

    return <AlertCircle size={20} />;
}


// ======================================================
// NOTIFICATION TYPE CLASS
// ======================================================

function getNotificationClass(type) {

    if (type === "order") {
        return "notification-order";
    }

    if (type === "payment") {
        return "notification-payment";
    }

    if (type === "return") {
        return "notification-return";
    }

    if (type === "product") {
        return "notification-product";
    }

    if (type === "review") {
        return "notification-review";
    }

    return "notification-system";
}


// ======================================================
// MAIN COMPONENT
// ======================================================

function Notifications() {

    let [notifications, setNotifications] =
        useState(initialNotifications);

    let [activeFilter, setActiveFilter] =
        useState("all");

    let [searchText, setSearchText] =
        useState("");

    let [showDeleteModal, setShowDeleteModal] =
        useState(false);

    let [notificationToDelete, setNotificationToDelete] =
        useState(null);


    // ==================================================
    // UNREAD COUNT
    // ==================================================

    let unreadCount =
        notifications.filter(
            (item) => !item.read
        ).length;


    // ==================================================
    // FILTER + SEARCH
    // ==================================================

    let filteredNotifications =
        useMemo(() => {

            let result =
                [...notifications];

            if (activeFilter === "unread") {

                result =
                    result.filter(
                        (item) => !item.read
                    );
            }

            if (activeFilter === "read") {

                result =
                    result.filter(
                        (item) => item.read
                    );
            }

            if (searchText.trim()) {

                let search =
                    searchText
                        .toLowerCase()
                        .trim();

                result =
                    result.filter(
                        (item) =>
                            item.title
                                .toLowerCase()
                                .includes(search) ||
                            item.message
                                .toLowerCase()
                                .includes(search)
                    );
            }

            return result;

        }, [
            notifications,
            activeFilter,
            searchText
        ]);


    // ==================================================
    // MARK AS READ
    // ==================================================

    function markAsRead(id) {

        setNotifications((previous) =>
            previous.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        read: true
                    }
                    : item
            )
        );
    }


    // ==================================================
    // MARK ALL AS READ
    // ==================================================

    function markAllAsRead() {

        setNotifications((previous) =>
            previous.map((item) => ({
                ...item,
                read: true
            }))
        );
    }


    // ==================================================
    // DELETE CONFIRM
    // ==================================================

    function openDeleteModal(id) {

        setNotificationToDelete(id);

        setShowDeleteModal(true);
    }


    // ==================================================
    // DELETE NOTIFICATION
    // ==================================================

    function deleteNotification() {

        if (!notificationToDelete) {
            return;
        }

        setNotifications((previous) =>
            previous.filter(
                (item) =>
                    item.id !== notificationToDelete
            )
        );

        setNotificationToDelete(null);

        setShowDeleteModal(false);
    }


    // ==================================================
    // CLEAR ALL
    // ==================================================

    function clearAllNotifications() {

        setNotifications([]);
    }


    // ==================================================
    // REFRESH
    // ==================================================

    function refreshNotifications() {

        setNotifications((previous) => [
            ...previous
        ]);
    }


    // ==================================================
    // RENDER
    // ==================================================

    return (

        <div className="notifications-page">


            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <div className="notifications-header">

                <div className="notifications-heading">

                    <div className="notifications-title-row">

                        <div className="notifications-main-icon">
                            <Bell size={25} />
                        </div>

                        <div>

                            <h1>
                                Notifications
                            </h1>

                            <p>
                                Stay updated with your store activity.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="notifications-header-actions">

                    <button
                        className="notification-refresh-btn"
                        onClick={refreshNotifications}
                    >
                        <RefreshCw size={17} />

                        Refresh
                    </button>

                    <button
                        className="mark-all-btn"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                    >
                        <CheckCheck size={17} />

                        Mark all as read
                    </button>

                </div>

            </div>


            {/* ==================================================
                SUMMARY
            ================================================== */}

            <div className="notification-summary">

                <div className="notification-summary-card">

                    <div className="summary-icon">
                        <Bell size={21} />
                    </div>

                    <div>

                        <span>
                            Total Notifications
                        </span>

                        <strong>
                            {notifications.length}
                        </strong>

                    </div>

                </div>


                <div className="notification-summary-card">

                    <div className="summary-icon unread-summary">
                        <AlertCircle size={21} />
                    </div>

                    <div>

                        <span>
                            Unread
                        </span>

                        <strong>
                            {unreadCount}
                        </strong>

                    </div>

                </div>


                <div className="notification-summary-card">

                    <div className="summary-icon read-summary">
                        <CheckCheck size={21} />
                    </div>

                    <div>

                        <span>
                            Read
                        </span>

                        <strong>
                            {notifications.length - unreadCount}
                        </strong>

                    </div>

                </div>

            </div>


            {/* ==================================================
                TOOLBAR
            ================================================== */}

            <div className="notifications-toolbar">

                <div className="notification-search">

                    <Search size={19} />

                    <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchText}
                        onChange={(event) =>
                            setSearchText(
                                event.target.value
                            )
                        }
                    />

                    {searchText && (

                        <button
                            className="clear-search"
                            onClick={() =>
                                setSearchText("")
                            }
                        >
                            <X size={16} />
                        </button>

                    )}

                </div>


                <div className="notification-filters">

                    <button
                        className={
                            activeFilter === "all"
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() =>
                            setActiveFilter("all")
                        }
                    >
                        All

                        <span>
                            {notifications.length}
                        </span>

                    </button>


                    <button
                        className={
                            activeFilter === "unread"
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() =>
                            setActiveFilter("unread")
                        }
                    >
                        Unread

                        <span>
                            {unreadCount}
                        </span>

                    </button>


                    <button
                        className={
                            activeFilter === "read"
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() =>
                            setActiveFilter("read")
                        }
                    >
                        Read
                    </button>

                </div>

            </div>


            {/* ==================================================
                NOTIFICATIONS CARD
            ================================================== */}

            <div className="notifications-container">

                <div className="notifications-container-header">

                    <div>

                        <h2>
                            Recent Notifications
                        </h2>

                        <p>
                            {filteredNotifications.length} notifications found
                        </p>

                    </div>


                    {notifications.length > 0 && (

                        <button
                            className="clear-all-btn"
                            onClick={clearAllNotifications}
                        >
                            <Trash2 size={16} />

                            Clear all
                        </button>

                    )}

                </div>


                {/* ==================================================
                    LIST
                ================================================== */}

                {filteredNotifications.length > 0 ? (

                    <div className="notification-list">

                        {filteredNotifications.map(
                            (notification) => (

                                <div
                                    key={notification.id}
                                    className={
                                        notification.read
                                            ? "notification-item"
                                            : "notification-item unread"
                                    }
                                >

                                    <div
                                        className={
                                            `notification-type-icon ${getNotificationClass(
                                                notification.type
                                            )
                                            }`
                                        }
                                    >
                                        <NotificationIcon
                                            type={
                                                notification.type
                                            }
                                        />
                                    </div>


                                    <div className="notification-content">

                                        <div className="notification-top">

                                            <div className="notification-title-wrapper">

                                                <h3>
                                                    {
                                                        notification.title
                                                    }
                                                </h3>

                                                {!notification.read && (
                                                    <span className="unread-dot"></span>
                                                )}

                                            </div>

                                            <span className="notification-time">

                                                {
                                                    notification.date
                                                }

                                                {" • "}

                                                {
                                                    notification.time
                                                }

                                            </span>

                                        </div>


                                        <p>
                                            {
                                                notification.message
                                            }
                                        </p>


                                        <div className="notification-actions">

                                            {!notification.read && (

                                                <button
                                                    onClick={() =>
                                                        markAsRead(
                                                            notification.id
                                                        )
                                                    }
                                                >
                                                    <Check size={15} />

                                                    Mark as read
                                                </button>

                                            )}

                                            <button
                                                className="delete-notification"
                                                onClick={() =>
                                                    openDeleteModal(
                                                        notification.id
                                                    )
                                                }
                                            >
                                                <Trash2 size={15} />

                                                Delete
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                ) : (

                    <div className="notification-empty">

                        <div className="empty-icon">

                            <Bell size={38} />

                        </div>

                        <h3>
                            No notifications found
                        </h3>

                        <p>
                            You are all caught up. New notifications
                            will appear here.
                        </p>

                    </div>

                )}

            </div>


            {/* ==================================================
                DELETE MODAL
            ================================================== */}

            {showDeleteModal && (

                <div className="notification-modal-overlay">

                    <div className="notification-modal">

                        <div className="modal-icon">
                            <Trash2 size={23} />
                        </div>

                        <h3>
                            Delete Notification?
                        </h3>

                        <p>
                            Are you sure you want to delete this
                            notification? This action cannot be undone.
                        </p>

                        <div className="modal-actions">

                            <button
                                className="modal-cancel"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setNotificationToDelete(null);
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                className="modal-delete"
                                onClick={
                                    deleteNotification
                                }
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );
}


export default Notifications;