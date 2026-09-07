import "../styles/profile.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

import { toast } from "react-toastify";


function Profile() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    useEffect(() => {

        fetchProfile();

    }, []);

    const fetchProfile = async () => {

        try {

            const token = localStorage.getItem("token");

            const res = await API.get(

                "/auth/profile",

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            setUser(res.data.user);

        }

        catch (err) {

            toast.error("Session Expired");

            navigate("/login");

        }

    };

    const logout = async () => {

        try {

            const token = localStorage.getItem("token");

            await API.post(

                "/auth/logout",

                {},

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

        }

        catch (err) { }

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

    };

    if (!user) {

        return (

            <div className="loading">

                Loading...

            </div>

        );

    }

    const deleteAccount = async () => {

        const confirmToast = toast.info(
            <div>
                <p style={{ margin: 0, fontWeight: 700 }}>Delete your account?</p>
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                    <button
                        onClick={async () => {
                            toast.dismiss(confirmToast);

                            try {
                                const token = localStorage.getItem("token");

                                const res = await API.delete(
                                    "/auth/delete-account",
                                    {
                                        headers: {
                                            Authorization: `Bearer ${token}`
                                        }
                                    }
                                );

                                toast.success(res.data.message);
                                localStorage.removeItem("token");
                                localStorage.removeItem("user");
                                navigate("/login", { replace: true });
                                window.location.reload();
                            } catch (err) {
                                toast.error(
                                    err.response?.data?.message || "Delete Failed"
                                );
                            }
                        }}
                        style={{
                            background: "#dc2626",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 12px",
                            cursor: "pointer",
                            fontWeight: 700
                        }}
                    >
                        Yes, delete
                    </button>
                    <button
                        onClick={() => toast.dismiss(confirmToast)}
                        style={{
                            background: "#e5e7eb",
                            color: "#111827",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 12px",
                            cursor: "pointer",
                            fontWeight: 700
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>,
            {
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                position: "top-center",
                closeButton: true,
                pauseOnHover: false
            }
        );
    };

    return (

        <div className="profile-page">

            <div className="profile-card">

                {/* Top */}

                <div className="profile-top">

                    <button

                        className="back-btn"

                        onClick={() => navigate("/")}

                    >

                        ← Home

                    </button>

                    <div className="status">

                        🟢 Active

                    </div>

                </div>

                {/* Avatar */}

                <div className="profile-avatar">

                    {user.full_name.charAt(0).toUpperCase()}

                </div>

                <h2>

                    {user.full_name}

                </h2>

                <p className="email">

                    {user.email}

                </p>

                {/* Details */}

                <div className="details">

                    <div className="row">

                        <span>📱 Phone</span>

                        <p>{user.phone}</p>

                    </div>

                    <div className="row">

                        <span>🚻 Gender</span>

                        <p>{user.gender}</p>

                    </div>

                    <div className="row">

                        <span>🎂 DOB</span>

                        <p>

                            {

                                user.dob ?

                                    user.dob.substring(0, 10)

                                    :

                                    "Not Added"

                            }

                        </p>

                    </div>

                    <div className="row">

                        <span>🏙 City</span>

                        <p>

                            {

                                user.city ||

                                "Not Added"

                            }

                        </p>

                    </div>

                    <div className="row">

                        <span>📍 State</span>

                        <p>

                            {

                                user.state ||

                                "Not Added"

                            }

                        </p>

                    </div>

                    <div className="row">

                        <span>📮 Pincode</span>

                        <p>

                            {

                                user.pincode ||

                                "Not Added"

                            }

                        </p>

                    </div>

                </div>

                {/* Buttons */}

                <div className="profile-buttons">

                    <button

                        className="edit-btn"

                        onClick={() =>

                            navigate("/edit-profile")

                        }

                    >

                        Edit Profile

                    </button>

                    <button

                        className="change-btn"

                        onClick={() =>

                            navigate("/change-password")

                        }

                    >

                        Change Password

                    </button>

                    <button

                        className="logout-btn"

                        onClick={logout}

                    >

                        Logout

                    </button>

                    <button

                        className="delete-btn"

                        onClick={deleteAccount}

                    >

                        Delete Account

                    </button>

                </div>

            </div>

        </div>

    );

}

export default Profile;