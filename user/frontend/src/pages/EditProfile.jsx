import "../styles/editProfile.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../api/api";

import { toast } from "react-toastify";


function EditProfile() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({

        full_name: "",
        phone: "",
        gender: "",
        dob: "",
        city: "",
        state: "",
        pincode: ""

    });

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

            setFormData({

                full_name: res.data.user.full_name || "",
                phone: res.data.user.phone || "",
                gender: res.data.user.gender || "",
                dob: res.data.user.dob
                    ? res.data.user.dob.substring(0, 10)
                    : "",
                city: res.data.user.city || "",
                state: res.data.user.state || "",
                pincode: res.data.user.pincode || ""

            });

        }

        catch (err) {

            toast.error("Unable to Load Profile");

        }

    };

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    };

    const handleUpdate = async () => {

        try {

            const token = localStorage.getItem("token");

            const res = await API.put(

                "/auth/update-profile",

                formData,

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

                "Profile Update Failed"

            );

        }

    };

    return (

        <div className="edit-profile-page">

            <div className="edit-card">

                <div className="top-section">

                    <button

                        className="back-btn"

                        onClick={() => navigate("/profile")}

                    >

                        ← Back

                    </button>

                </div>

                <h2>Edit Profile</h2>

                <div className="form-grid">

                    <div className="form-group">

                        <label>Full Name</label>

                        <input

                            type="text"

                            name="full_name"

                            placeholder="Enter Full Name"

                            value={formData.full_name}

                            onChange={handleChange}

                        />

                    </div>

                    <div className="form-group">

                        <label>Phone Number</label>

                        <input

                            type="text"

                            name="phone"

                            placeholder="Enter Phone Number"

                            value={formData.phone}

                            onChange={handleChange}

                        />

                    </div>

                    <div className="form-group">

                        <label>Gender</label>

                        <select

                            name="gender"

                            value={formData.gender}

                            onChange={handleChange}

                        >

                            <option value="">Select Gender</option>

                            <option value="Male">Male</option>

                            <option value="Female">Female</option>

                            <option value="Other">Other</option>

                        </select>

                    </div>

                    <div className="form-group">

                        <label>Date of Birth</label>

                        <input

                            type="date"

                            name="dob"

                            value={formData.dob}

                            onChange={handleChange}

                        />

                    </div>

                    <div className="form-group">

                        <label>City</label>

                        <input

                            type="text"

                            name="city"

                            placeholder="Enter City"

                            value={formData.city}

                            onChange={handleChange}

                        />

                    </div>

                    <div className="form-group">

                        <label>State</label>

                        <input

                            type="text"

                            name="state"

                            placeholder="Enter State"

                            value={formData.state}

                            onChange={handleChange}

                        />

                    </div>

                    <div className="form-group">

                        <label>Pincode</label>

                        <input

                            type="text"

                            name="pincode"

                            placeholder="Enter Pincode"

                            value={formData.pincode}

                            onChange={handleChange}

                        />

                    </div>

                </div>

                <button

                    className="update-btn"

                    onClick={handleUpdate}

                >

                    UPDATE PROFILE

                </button>

            </div>

        </div>

    );

}

export default EditProfile;