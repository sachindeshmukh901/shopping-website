import "../styles/changePassword.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

import { toast } from "react-toastify";


function ChangePassword() {

    const navigate = useNavigate();

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [formData, setFormData] = useState({

        oldPassword: "",
        newPassword: "",
        confirmPassword: ""

    });

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    };

    const handleSubmit = async () => {

        if (

            !formData.oldPassword ||

            !formData.newPassword ||

            !formData.confirmPassword

        ) {

            toast.warning("Please fill all fields");

            return;

        }

        if (

            formData.newPassword !==

            formData.confirmPassword

        ) {

            toast.info("Passwords do not match");

            return;

        }

        try {

            const token = localStorage.getItem("token");

            const res = await API.put(

                "/auth/change-password",

                {

                    oldPassword: formData.oldPassword,

                    newPassword: formData.newPassword

                },

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            toast.success(res.data.message);

            navigate("/profile");

        }

        catch (err) {

            toast.error(

                err.response?.data?.message ||

                err.response?.data?.error ||

                "Password Change Failed"

            );

        }

    };

    return (

        <div className="change-password-page">

            <div className="change-card">

                <button

                    className="back-btn"

                    onClick={() => navigate("/profile")}

                >

                    ← Back

                </button>

                <h1>Change Password</h1>

                <p>

                    Update your account password securely.

                </p>

                <div className="form-group">

                    <label>Current Password</label>

                    <div className="password-box">

                        <input

                            type={showOld ? "text" : "password"}

                            name="oldPassword"

                            placeholder="Current Password"

                            value={formData.oldPassword}

                            onChange={handleChange}

                        />

                        <span

                            className="eye"

                            onClick={() =>

                                setShowOld(!showOld)

                            }

                        >

                            {showOld ? "🙈" : "👁"}

                        </span>

                    </div>

                </div>

                <div className="form-group">

                    <label>New Password</label>

                    <div className="password-box">

                        <input

                            type={showNew ? "text" : "password"}

                            name="newPassword"

                            placeholder="New Password"

                            value={formData.newPassword}

                            onChange={handleChange}

                        />

                        <span

                            className="eye"

                            onClick={() =>

                                setShowNew(!showNew)

                            }

                        >

                            {showNew ? "🙈" : "👁"}

                        </span>

                    </div>

                </div>

                <div className="form-group">

                    <label>Confirm Password</label>

                    <div className="password-box">

                        <input

                            type={showConfirm ? "text" : "password"}

                            name="confirmPassword"

                            placeholder="Confirm Password"

                            value={formData.confirmPassword}

                            onChange={handleChange}

                        />

                        <span

                            className="eye"

                            onClick={() =>

                                setShowConfirm(!showConfirm)

                            }

                        >

                            {showConfirm ? "🙈" : "👁"}

                        </span>

                    </div>

                </div>

                <button

                    className="change-btn"

                    onClick={handleSubmit}

                >

                    CHANGE PASSWORD

                </button>

            </div>

        </div>

    );

}

export default ChangePassword;