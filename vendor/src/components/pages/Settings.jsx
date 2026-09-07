import React, { useState } from "react";
import {
    Settings as SettingsIcon,
    Store,
    User,
    Mail,
    Phone,
    Lock,
    Bell,
    ShieldCheck,
    Save,
    RotateCcw,
    Eye,
    EyeOff
} from "lucide-react";

import "./Settings.css";

function Settings() {

    const [activeTab, setActiveTab] = useState("store");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        shopName: "rkcollection",
        ownerName: "ritvik kumar",
        email: "",
        phone: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        emailNotifications: true,
        orderNotifications: true,
        returnNotifications: true,
        earningNotifications: true
    });

    const [message, setMessage] = useState("");

    function handleChange(event) {

        const {
            name,
            value,
            type,
            checked
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value
        }));
    }

    function handleSave(event) {

        event.preventDefault();

        setMessage("Settings saved successfully.");

        setTimeout(() => {
            setMessage("");
        }, 3000);
    }

    function handleReset() {

        setFormData({
            shopName: "rkcollection",
            ownerName: "ritvik kumar",
            email: "",
            phone: "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
            emailNotifications: true,
            orderNotifications: true,
            returnNotifications: true,
            earningNotifications: true
        });

        setMessage("");
    }

    function renderInputIcon(icon) {
        return (
            <span className="settings-input-icon">
                {icon}
            </span>
        );
    }

    return (
        <div className="settings-page">

            {/* PAGE HEADER */}

            <div className="settings-page-header">

                <div>

                    <div className="settings-title-row">

                        <SettingsIcon
                            size={30}
                            strokeWidth={2}
                        />

                        <h1>
                            Settings
                        </h1>

                    </div>

                    <p>
                        Manage your store, account and notification settings.
                    </p>

                </div>

            </div>


            {/* SUCCESS MESSAGE */}

            {message && (

                <div className="settings-success">

                    <ShieldCheck
                        size={20}
                    />

                    <span>
                        {message}
                    </span>

                </div>

            )}


            {/* MAIN SETTINGS LAYOUT */}

            <div className="settings-layout">


                {/* SETTINGS SIDEBAR */}

                <div className="settings-menu">

                    <button
                        className={
                            activeTab === "store"
                                ? "settings-menu-item active"
                                : "settings-menu-item"
                        }
                        onClick={() => setActiveTab("store")}
                    >

                        <Store size={19} />

                        <div>
                            <strong>
                                Store Information
                            </strong>

                            <span>
                                Manage your store
                            </span>
                        </div>

                    </button>


                    <button
                        className={
                            activeTab === "profile"
                                ? "settings-menu-item active"
                                : "settings-menu-item"
                        }
                        onClick={() => setActiveTab("profile")}
                    >

                        <User size={19} />

                        <div>
                            <strong>
                                Profile
                            </strong>

                            <span>
                                Personal information
                            </span>
                        </div>

                    </button>


                    <button
                        className={
                            activeTab === "security"
                                ? "settings-menu-item active"
                                : "settings-menu-item"
                        }
                        onClick={() => setActiveTab("security")}
                    >

                        <Lock size={19} />

                        <div>
                            <strong>
                                Security
                            </strong>

                            <span>
                                Password & security
                            </span>
                        </div>

                    </button>


                    <button
                        className={
                            activeTab === "notifications"
                                ? "settings-menu-item active"
                                : "settings-menu-item"
                        }
                        onClick={() => setActiveTab("notifications")}
                    >

                        <Bell size={19} />

                        <div>
                            <strong>
                                Notifications
                            </strong>

                            <span>
                                Notification preferences
                            </span>
                        </div>

                    </button>

                </div>


                {/* SETTINGS CONTENT */}

                <div className="settings-content">


                    {/* STORE INFORMATION */}

                    {activeTab === "store" && (

                        <form onSubmit={handleSave}>

                            <div className="settings-card">

                                <div className="settings-card-header">

                                    <div className="settings-card-icon">
                                        <Store size={22} />
                                    </div>

                                    <div>

                                        <h2>
                                            Store Information
                                        </h2>

                                        <p>
                                            Update your ORGOS store information.
                                        </p>

                                    </div>

                                </div>


                                <div className="settings-form-grid">


                                    <div className="settings-field">

                                        <label>
                                            Shop Name
                                        </label>

                                        <div className="settings-input-wrapper">

                                            {renderInputIcon(
                                                <Store size={18} />
                                            )}

                                            <input
                                                type="text"
                                                name="shopName"
                                                value={formData.shopName}
                                                onChange={handleChange}
                                                placeholder="Enter shop name"
                                            />

                                        </div>

                                    </div>


                                    <div className="settings-field">

                                        <label>
                                            Owner Name
                                        </label>

                                        <div className="settings-input-wrapper">

                                            {renderInputIcon(
                                                <User size={18} />
                                            )}

                                            <input
                                                type="text"
                                                name="ownerName"
                                                value={formData.ownerName}
                                                onChange={handleChange}
                                                placeholder="Enter owner name"
                                            />

                                        </div>

                                    </div>


                                    <div className="settings-field">

                                        <label>
                                            Email Address
                                        </label>

                                        <div className="settings-input-wrapper">

                                            {renderInputIcon(
                                                <Mail size={18} />
                                            )}

                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="Enter email address"
                                            />

                                        </div>

                                    </div>


                                    <div className="settings-field">

                                        <label>
                                            Phone Number
                                        </label>

                                        <div className="settings-input-wrapper">

                                            {renderInputIcon(
                                                <Phone size={18} />
                                            )}

                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="Enter phone number"
                                            />

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* ACCOUNT STATUS */}

                            <div className="settings-card">

                                <div className="settings-card-header">

                                    <div className="settings-card-icon">
                                        <ShieldCheck size={22} />
                                    </div>

                                    <div>

                                        <h2>
                                            Account Status
                                        </h2>

                                        <p>
                                            Current status of your vendor account.
                                        </p>

                                    </div>

                                </div>


                                <div className="account-status-box">

                                    <div>

                                        <span className="status-label">
                                            Account Status
                                        </span>

                                        <strong>
                                            Active
                                        </strong>

                                    </div>

                                    <span className="active-badge">
                                        Active
                                    </span>

                                </div>

                            </div>


                            <div className="settings-actions">

                                <button
                                    type="button"
                                    className="settings-reset-btn"
                                    onClick={handleReset}
                                >

                                    <RotateCcw size={18} />

                                    Reset

                                </button>


                                <button
                                    type="submit"
                                    className="settings-save-btn"
                                >

                                    <Save size={18} />

                                    Save Changes

                                </button>

                            </div>

                        </form>

                    )}


                    {/* PROFILE */}

                    {activeTab === "profile" && (

                        <form onSubmit={handleSave}>

                            <div className="settings-card">

                                <div className="settings-card-header">

                                    <div className="settings-card-icon">
                                        <User size={22} />
                                    </div>

                                    <div>

                                        <h2>
                                            Vendor Profile
                                        </h2>

                                        <p>
                                            Manage your personal vendor information.
                                        </p>

                                    </div>

                                </div>


                                <div className="profile-section">

                                    <div className="profile-avatar">
                                        {formData.ownerName
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div>

                                        <h3>
                                            {formData.ownerName}
                                        </h3>

                                        <p>
                                            Vendor
                                        </p>

                                    </div>

                                </div>


                                <div className="settings-form-grid">

                                    <div className="settings-field">

                                        <label>
                                            Full Name
                                        </label>

                                        <div className="settings-input-wrapper">

                                            {renderInputIcon(
                                                <User size={18} />
                                            )}

                                            <input
                                                type="text"
                                                name="ownerName"
                                                value={formData.ownerName}
                                                onChange={handleChange}
                                            />

                                        </div>

                                    </div>


                                    <div className="settings-field">

                                        <label>
                                            Email
                                        </label>

                                        <div className="settings-input-wrapper">

                                            {renderInputIcon(
                                                <Mail size={18} />
                                            )}

                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="Enter email"
                                            />

                                        </div>

                                    </div>


                                    <div className="settings-field">

                                        <label>
                                            Phone
                                        </label>

                                        <div className="settings-input-wrapper">

                                            {renderInputIcon(
                                                <Phone size={18} />
                                            )}

                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="Enter phone"
                                            />

                                        </div>

                                    </div>

                                </div>

                            </div>


                            <div className="settings-actions">

                                <button
                                    type="submit"
                                    className="settings-save-btn"
                                >

                                    <Save size={18} />

                                    Save Changes

                                </button>

                            </div>

                        </form>

                    )}


                    {/* SECURITY */}

                    {activeTab === "security" && (

                        <form onSubmit={handleSave}>

                            <div className="settings-card">

                                <div className="settings-card-header">

                                    <div className="settings-card-icon">
                                        <Lock size={22} />
                                    </div>

                                    <div>

                                        <h2>
                                            Security
                                        </h2>

                                        <p>
                                            Update your account password.
                                        </p>

                                    </div>

                                </div>


                                <div className="settings-security-form">


                                    <div className="settings-field">

                                        <label>
                                            Current Password
                                        </label>

                                        <div className="password-input-wrapper">

                                            <input
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="currentPassword"
                                                value={
                                                    formData.currentPassword
                                                }
                                                onChange={handleChange}
                                                placeholder="Enter current password"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword
                                                    )
                                                }
                                            >

                                                {showPassword
                                                    ? <EyeOff size={18} />
                                                    : <Eye size={18} />
                                                }

                                            </button>

                                        </div>

                                    </div>


                                    <div className="settings-field">

                                        <label>
                                            New Password
                                        </label>

                                        <div className="password-input-wrapper">

                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={
                                                    formData.newPassword
                                                }
                                                onChange={handleChange}
                                                placeholder="Enter new password"
                                            />

                                        </div>

                                    </div>


                                    <div className="settings-field">

                                        <label>
                                            Confirm New Password
                                        </label>

                                        <div className="password-input-wrapper">

                                            <input
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="confirmPassword"
                                                value={
                                                    formData.confirmPassword
                                                }
                                                onChange={handleChange}
                                                placeholder="Confirm new password"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword
                                                    )
                                                }
                                            >

                                                {showConfirmPassword
                                                    ? <EyeOff size={18} />
                                                    : <Eye size={18} />
                                                }

                                            </button>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            <div className="settings-actions">

                                <button
                                    type="submit"
                                    className="settings-save-btn"
                                >

                                    <Save size={18} />

                                    Update Password

                                </button>

                            </div>

                        </form>

                    )}


                    {/* NOTIFICATIONS */}

                    {activeTab === "notifications" && (

                        <form onSubmit={handleSave}>

                            <div className="settings-card">

                                <div className="settings-card-header">

                                    <div className="settings-card-icon">
                                        <Bell size={22} />
                                    </div>

                                    <div>

                                        <h2>
                                            Notification Settings
                                        </h2>

                                        <p>
                                            Choose which notifications you want to receive.
                                        </p>

                                    </div>

                                </div>


                                <div className="notification-list">


                                    <label className="notification-item">

                                        <div>

                                            <strong>
                                                Email Notifications
                                            </strong>

                                            <span>
                                                Receive important account notifications by email.
                                            </span>

                                        </div>

                                        <input
                                            type="checkbox"
                                            name="emailNotifications"
                                            checked={
                                                formData.emailNotifications
                                            }
                                            onChange={handleChange}
                                        />

                                    </label>


                                    <label className="notification-item">

                                        <div>

                                            <strong>
                                                Order Notifications
                                            </strong>

                                            <span>
                                                Get notified when a new order is received.
                                            </span>

                                        </div>

                                        <input
                                            type="checkbox"
                                            name="orderNotifications"
                                            checked={
                                                formData.orderNotifications
                                            }
                                            onChange={handleChange}
                                        />

                                    </label>


                                    <label className="notification-item">

                                        <div>

                                            <strong>
                                                Return Notifications
                                            </strong>

                                            <span>
                                                Get notified about customer return requests.
                                            </span>

                                        </div>

                                        <input
                                            type="checkbox"
                                            name="returnNotifications"
                                            checked={
                                                formData.returnNotifications
                                            }
                                            onChange={handleChange}
                                        />

                                    </label>


                                    <label className="notification-item">

                                        <div>

                                            <strong>
                                                Earnings Notifications
                                            </strong>

                                            <span>
                                                Receive notifications about your store earnings.
                                            </span>

                                        </div>

                                        <input
                                            type="checkbox"
                                            name="earningNotifications"
                                            checked={
                                                formData.earningNotifications
                                            }
                                            onChange={handleChange}
                                        />

                                    </label>

                                </div>

                            </div>


                            <div className="settings-actions">

                                <button
                                    type="submit"
                                    className="settings-save-btn"
                                >

                                    <Save size={18} />

                                    Save Preferences

                                </button>

                            </div>

                        </form>

                    )}

                </div>

            </div>

        </div>
    );
}

export default Settings;