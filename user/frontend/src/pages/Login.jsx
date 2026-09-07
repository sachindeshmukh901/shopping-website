import "../styles/login.css";

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";

import { toast } from "react-toastify";


function Login() {

    const navigate = useNavigate();

    const { fetchCart } = useContext(CartContext);
    const { fetchWishlist } = useContext(WishlistContext);

    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({

        email: "",
        password: ""

    });

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    };

    const handleLogin = async () => {

        try {

            if (!formData.email || !formData.password) {

                toast.warning("Please fill all fields");

                return;

            }

            const res = await API.post(

                "/auth/login",

                formData

            );

            localStorage.setItem(

                "token",

                res.data.token

            );

            localStorage.setItem(

                "user",

                JSON.stringify(res.data.user)

            );

            // Ensure future requests include the token immediately
            API.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;

            // Load this user's cart & wishlist right away
            await fetchCart();
            await fetchWishlist();

            toast.success("Login Successful");

            navigate("/dashboard");

        }

        catch (err) {

            toast.error(

                err.response?.data?.message ||

                err.response?.data?.error ||

                "Login Failed"

            );

        }

    };

    return (

        <div className="login-page">

            <div className="login-card">

                <div className="login-content">

                    <button

                        className="back-btn"

                        onClick={() => navigate("/")}

                    >

                        ← Back

                    </button>

                    <h1>Welcome Back</h1>

                    <p className="subtitle">

                        Login to continue shopping on ORGOS.

                    </p>

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

                    <div className="input-group">

                        <label>Password</label>

                        <div className="password-box">

                            <input

                                type={showPassword ? "text" : "password"}

                                name="password"

                                placeholder="Enter Password"

                                value={formData.password}

                                onChange={handleChange}

                            />

                            <span

                                className="eye"

                                onClick={() =>

                                    setShowPassword(!showPassword)

                                }

                            >

                                {showPassword ? "🙈" : "👁"}

                            </span>

                        </div>

                    </div>

                    <div className="login-options">

                        <span

                            className="forgot"

                            onClick={() => navigate("/forgot-password")}

                        >

                            Forgot Password?

                        </span>

                    </div>

                    <button

                        className="login-btn"

                        onClick={handleLogin}

                    >

                        LOGIN

                    </button>

                    <div className="bottom-links">

                        <p>

                            Don't have an account?

                            <span

                                onClick={() => navigate("/account")}

                            >

                                Register

                            </span>

                        </p>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Login;