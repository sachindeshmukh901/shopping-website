import "../styles/forgotPassword.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../api/api";

import { toast } from "react-toastify";


function ForgotPassword() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({

        email: "",
        newPassword: ""

    });

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    };

    const handleResetPassword = async () => {

        try {

            if (!formData.email || !formData.newPassword) {

                toast.warning("Please fill all fields");

                return;

            }

            const res = await API.put(

                "/auth/forgot-password",

                formData

            );

            toast.success(res.data.message);

            navigate("/login");

        }

        catch (err) {

            toast.error(

                err.response?.data?.message ||

                err.response?.data?.error ||

                "Password Reset Failed"

            );

        }

    };

    return (

        <div className="forgot-page">

            <div className="forgot-card">

                <button

                    className="back-btn"

                    onClick={() => navigate("/login")}

                >

                    ← Back

                </button>

                <h1>Forgot Password</h1>

                <p>

                    Enter your registered email and create a new password.

                </p>

                <div className="form-group">

                    <label>Email</label>

                    <input

                        type="email"

                        name="email"

                        placeholder="Enter Email"

                        value={formData.email}

                        onChange={handleChange}

                    />

                </div>

                <div className="form-group">

                    <label>New Password</label>

                    <div className="password-box">

                        <input

                            type={

                                showPassword

                                    ? "text"

                                    : "password"

                            }

                            name="newPassword"

                            placeholder="Enter New Password"

                            value={formData.newPassword}

                            onChange={handleChange}

                        />

                        <span

                            className="eye"

                            onClick={() =>

                                setShowPassword(!showPassword)

                            }

                        >

                            {

                                showPassword

                                    ? "🙈"

                                    : "👁"

                            }

                        </span>

                    </div>

                </div>

                <button

                    className="reset-btn"

                    onClick={handleResetPassword}

                >

                    RESET PASSWORD

                </button>

            </div>

        </div>

    );

}

export default ForgotPassword;