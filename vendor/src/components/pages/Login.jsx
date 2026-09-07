import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function Login() {

    let navigate = useNavigate();

    let [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    let [loading, setLoading] = useState(false);
    let [error, setError] = useState("");

    let handleChange = (e) => {

        let { name, value } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };


    let handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        if (!formData.email || !formData.password) {
            setError("Email and password are required");
            return;
        }

        try {

            setLoading(true);

            let response = await API.post(
                "/vendor/login",
                formData
            );

            if (response.data.success) {

                // Save JWT token
                localStorage.setItem(
                    "vendorToken",
                    response.data.token
                );

                // Save logged-in vendor information
                localStorage.setItem(
                    "vendor",
                    JSON.stringify(response.data.vendor)
                );

                // Redirect to vendor dashboard
                navigate("/dashboard", {
                    replace: true
                });
            }

        } catch (error) {

            console.error(
                "Vendor Login Error:",
                error
            );

            if (error.response?.data?.message) {

                setError(
                    error.response.data.message
                );

            } else {

                setError(
                    "Unable to login. Please try again."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">

                <div className="text-center mb-8">

                    <h1 className="text-3xl font-bold text-green-900">
                        ORGOS Vendor
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Sign in to your vendor account
                    </p>

                </div>


                {error && (

                    <div className="mb-5 bg-red-50 text-red-600 px-4 py-3 rounded-lg">
                        {error}
                    </div>

                )}


                <form onSubmit={handleSubmit}>

                    <div className="mb-5">

                        <label className="block mb-2 font-medium">
                            Email Address
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter vendor email"
                            className="w-full border rounded-lg px-4 py-3"
                        />

                    </div>


                    <div className="mb-6">

                        <label className="block mb-2 font-medium">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            className="w-full border rounded-lg px-4 py-3"
                        />

                    </div>


                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-900 text-white py-3 rounded-lg font-semibold"
                    >

                        {loading
                            ? "Signing in..."
                            : "Login"
                        }

                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;