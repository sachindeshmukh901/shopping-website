import "../styles/account.css";
import loginBanner from "../assets/images/login-banner.png";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

import { toast } from "react-toastify";


function Account() {

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({

        full_name: "",
        email: "",
        phone: "",
        password: "",
        gender: ""

    });

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    };

    const handleRegister = async () => {

        if (

            !formData.full_name ||
            !formData.email ||
            !formData.phone ||
            !formData.password ||
            !formData.gender

        ) {

            toast.warning("Please fill all fields");
            return;

        }

        try {

            const res = await API.post(

                "/auth/register",

                formData

            );

            toast.success(res.data.message);

            navigate("/login");

        }

        catch (err) {

            toast.error(

                err.response?.data?.message ||

                err.response?.data?.error ||

                "Registration Failed"

            );

        }

    };

    return (

        <div className="account-page">

            <div className="account-card">

                <img
                    src={loginBanner}
                    alt="Banner"
                    className="banner"
                />

                <div className="account-content">

                    <button
                        className="back-btn"
                        onClick={() => navigate("/")}
                    >
                        ← Back
                    </button>

                    <h1>Create Account</h1>

                    <p className="subtitle">
                        Join ORGOS and start shopping smarter.
                    </p>

                    {/* FORM GRID */}

                    <div className="form-grid">

                        {/* Full Name */}

                        <div className="input-group">

                            <label>Full Name</label>

                            <input
                                type="text"
                                name="full_name"
                                placeholder="Enter Full Name"
                                value={formData.full_name}
                                onChange={handleChange}
                            />

                        </div>

                        {/* Email */}

                        <div className="input-group">

                            <label>Email</label>

                            <input
                                type="email"
                                name="email"
                                placeholder="Enter Email"
                                value={formData.email}
                                onChange={handleChange}
                            />

                        </div>

                        {/* Phone */}

                        <div className="input-group">

                            <label>Phone Number</label>

                            <input
                                type="text"
                                name="phone"
                                placeholder="Enter Phone Number"
                                value={formData.phone}
                                onChange={handleChange}
                            />

                        </div>

                        {/* Gender */}

                        <div className="input-group">

                            <label>Gender</label>

                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select Gender
                                </option>

                                <option value="Male">
                                    Male
                                </option>

                                <option value="Female">
                                    Female
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>

                        </div>

                        {/* Password Full Width */}

                        <div className="input-group full-width">

                            <label>Password</label>

                            <div className="password-box">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    placeholder="Enter Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />

                                <span
                                    className="eye"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
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

                    </div>

                    <button
                        className="register-btn"
                        onClick={handleRegister}
                    >

                        REGISTER

                    </button>

                    <div className="bottom-links">

                        <p>

                            Already have an account?

                            <span
                                onClick={() =>
                                    navigate("/login")
                                }
                            >

                                Login

                            </span>

                        </p>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Account;