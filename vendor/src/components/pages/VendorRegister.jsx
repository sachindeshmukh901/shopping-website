import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../../api/api";

import {
    Store,
    User,
    Mail,
    Phone,
    Lock,
    FileText,
    MapPin,
    Building2,
    Map,
    Navigation,
    Eye,
    EyeOff,
    Loader2,
    CheckCircle2,
    ArrowLeft
} from "lucide-react";


export default function VendorRegister() {

    let navigate = useNavigate();


    // ==========================================
    // FORM STATE
    // ==========================================

    let [formData, setFormData] = useState({

        shop_name: "",
        owner_name: "",
        email: "",
        phone: "",
        password: "",
        gst_number: "",
        address: "",
        city: "",
        state: "",
        pincode: ""

    });


    // ==========================================
    // OTHER STATES
    // ==========================================

    let [showPassword, setShowPassword] =
        useState(false);

    let [loading, setLoading] =
        useState(false);

    let [errorMessage, setErrorMessage] =
        useState("");

    let [successData, setSuccessData] =
        useState(null);


    // ==========================================
    // HANDLE INPUT
    // ==========================================

    let handleChange = (event) => {

        let { name, value } =
            event.target;


        // Phone only numbers
        if (name === "phone") {

            value = value
                .replace(/\D/g, "")
                .slice(0, 10);

        }


        // Pincode only numbers
        if (name === "pincode") {

            value = value
                .replace(/\D/g, "")
                .slice(0, 6);

        }


        setFormData((previousData) => ({

            ...previousData,

            [name]: value

        }));


        if (errorMessage) {

            setErrorMessage("");

        }

    };


    // ==========================================
    // FRONTEND VALIDATION
    // ==========================================

    let validateForm = () => {

        if (!formData.shop_name.trim()) {

            return "Shop name is required.";

        }


        if (!formData.owner_name.trim()) {

            return "Owner name is required.";

        }


        if (!formData.email.trim()) {

            return "Email address is required.";

        }


        let emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailPattern.test(
                formData.email
            )
        ) {

            return "Please enter a valid email address.";

        }


        if (!formData.phone) {

            return "Phone number is required.";

        }


        if (formData.phone.length !== 10) {

            return "Phone number must contain 10 digits.";

        }


        if (!formData.password) {

            return "Password is required.";

        }


        if (formData.password.length < 6) {

            return "Password must contain at least 6 characters.";

        }


        if (
            formData.pincode &&
            formData.pincode.length !== 6
        ) {

            return "Pincode must contain 6 digits.";

        }


        return null;

    };


    // ==========================================
    // REGISTER VENDOR
    // ==========================================

    let handleSubmit = async (event) => {

        event.preventDefault();


        let validationError =
            validateForm();


        if (validationError) {

            setErrorMessage(
                validationError
            );

            return;

        }


        try {

            setLoading(true);

            setErrorMessage("");


            // ==================================
            // PREPARE API DATA
            // ==================================

            let payload = {

                shop_name:
                    formData.shop_name.trim(),

                owner_name:
                    formData.owner_name.trim(),

                email:
                    formData.email
                        .trim()
                        .toLowerCase(),

                phone:
                    formData.phone,

                password:
                    formData.password,

                gst_number:
                    formData.gst_number
                        .trim()
                        .toUpperCase(),

                address:
                    formData.address.trim(),

                city:
                    formData.city.trim(),

                state:
                    formData.state.trim(),

                pincode:
                    formData.pincode

            };


            // ==================================
            // EXISTING BACKEND API
            // ==================================

            let response =
                await API.post(
                    "/vendor/register",
                    payload
                );


            console.log(
                "Vendor Registration:",
                response.data
            );


            if (response.data.success) {

                setSuccessData(
                    response.data
                );

                return;

            }


            setErrorMessage(
                response.data.message ||
                "Vendor registration failed."
            );

        }

        catch (error) {

            console.error(
                "Vendor Registration Error:",
                error
            );


            setErrorMessage(

                error.response?.data?.message ||

                "Unable to register vendor. Please try again."

            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================
    // REGISTRATION SUCCESS SCREEN
    // ==========================================

    if (successData) {

        return (

            <div
                className="
                    min-h-screen
                    bg-[#f6f8f6]

                    flex
                    items-center
                    justify-center

                    p-4
                "
            >

                <div
                    className="
                        w-full
                        max-w-[500px]

                        bg-white

                        border
                        border-gray-200

                        rounded-[24px]

                        shadow-sm

                        p-7
                        sm:p-10

                        text-center
                    "
                >

                    <div
                        className="
                            w-16
                            h-16

                            mx-auto

                            rounded-full

                            bg-green-100

                            flex
                            items-center
                            justify-center

                            mb-5
                        "
                    >

                        <CheckCircle2
                            className="
                                w-8
                                h-8
                                text-green-600
                            "
                        />

                    </div>


                    <h1
                        className="
                            text-2xl
                            font-extrabold
                            text-gray-900
                        "
                    >

                        Registration Successful

                    </h1>


                    <p
                        className="
                            text-sm
                            text-gray-500

                            mt-2
                        "
                    >

                        Your ORGOS vendor account
                        has been created successfully.

                    </p>


                    {/* STATUS */}

                    <div
                        className="
                            bg-orange-50

                            border
                            border-orange-200

                            rounded-2xl

                            p-5

                            mt-6
                        "
                    >

                        <p
                            className="
                                text-xs
                                font-bold

                                uppercase
                                tracking-wider

                                text-orange-600
                            "
                        >

                            Account Status

                        </p>


                        <p
                            className="
                                text-xl
                                font-extrabold

                                text-orange-700

                                mt-1
                            "
                        >

                            {successData.vendor?.status ||
                                "Pending"}

                        </p>


                        <p
                            className="
                                text-sm
                                text-orange-700/80

                                mt-3
                                leading-6
                            "
                        >

                            Your account is waiting
                            for ORGOS Admin approval.
                            You will be able to login
                            after your vendor account
                            has been approved.

                        </p>

                    </div>


                    {/* VENDOR INFORMATION */}

                    {successData.vendor && (

                        <div
                            className="
                                bg-gray-50

                                rounded-2xl

                                p-5

                                mt-5

                                text-left
                            "
                        >

                            <RegistrationInfo
                                label="Vendor ID"
                                value={
                                    `#${successData.vendor.vendor_id}`
                                }
                            />


                            <RegistrationInfo
                                label="Shop"
                                value={
                                    successData.vendor.shop_name
                                }
                            />


                            <RegistrationInfo
                                label="Owner"
                                value={
                                    successData.vendor.owner_name
                                }
                            />


                            <RegistrationInfo
                                label="Email"
                                value={
                                    successData.vendor.email
                                }
                                last
                            />

                        </div>

                    )}


                    <button

                        type="button"

                        onClick={() =>
                            navigate(
                                "/",
                                {
                                    replace: true
                                }
                            )
                        }

                        className="
                            w-full

                            mt-6

                            bg-[#175c2e]
                            text-white

                            py-3.5

                            rounded-xl

                            text-sm
                            font-bold

                            hover:bg-[#124923]

                            transition-colors
                        "
                    >

                        Go to Vendor Login

                    </button>

                </div>

            </div>

        );

    }


    // ==========================================
    // REGISTRATION FORM
    // ==========================================

    return (

        <div
            className="
                min-h-screen

                bg-[#f6f8f6]

                flex
                items-center
                justify-center

                px-4
                py-10
            "
        >

            <div
                className="
                    w-full
                    max-w-[850px]

                    bg-white

                    border
                    border-gray-200

                    rounded-[24px]

                    shadow-sm

                    overflow-hidden
                "
            >


                {/* ==================================
                    HEADER
                ================================== */}

                <div
                    className="
                        px-6
                        sm:px-8

                        pt-8
                        pb-6

                        border-b
                        border-gray-100
                    "
                >

                    <button

                        type="button"

                        onClick={() =>
                            navigate("/")
                        }

                        className="
                            flex
                            items-center
                            gap-2

                            text-sm
                            font-semibold

                            text-gray-500

                            hover:text-[#175c2e]

                            mb-6
                        "
                    >

                        <ArrowLeft
                            className="
                                w-4
                                h-4
                            "
                        />

                        Back to Login

                    </button>


                    <div
                        className="
                            flex
                            items-center
                            gap-4
                        "
                    >

                        <div
                            className="
                                w-12
                                h-12

                                rounded-xl

                                bg-[#175c2e]

                                text-white

                                flex
                                items-center
                                justify-center
                            "
                        >

                            <Store
                                className="
                                    w-6
                                    h-6
                                "
                            />

                        </div>


                        <div>

                            <h1
                                className="
                                    text-2xl
                                    font-extrabold
                                    text-gray-900
                                "
                            >

                                Become an ORGOS Vendor

                            </h1>


                            <p
                                className="
                                    text-sm
                                    text-gray-500

                                    mt-1
                                "
                            >

                                Register your store
                                to start selling on ORGOS.

                            </p>

                        </div>

                    </div>

                </div>


                {/* ==================================
                    FORM
                ================================== */}

                <form
                    onSubmit={handleSubmit}

                    className="
                        p-6
                        sm:p-8
                    "
                >


                    {/* ERROR */}

                    {errorMessage && (

                        <div
                            className="
                                bg-red-50

                                border
                                border-red-200

                                text-red-700

                                rounded-xl

                                px-4
                                py-3

                                mb-6

                                text-sm
                                font-medium
                            "
                        >

                            {errorMessage}

                        </div>

                    )}


                    <div
                        className="
                            grid
                            grid-cols-1
                            md:grid-cols-2

                            gap-5
                        "
                    >


                        <InputField
                            icon={Store}
                            label="Shop Name"
                            name="shop_name"
                            value={
                                formData.shop_name
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Enter shop name"
                            required
                        />


                        <InputField
                            icon={User}
                            label="Owner Name"
                            name="owner_name"
                            value={
                                formData.owner_name
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Enter owner name"
                            required
                        />


                        <InputField
                            icon={Mail}
                            label="Email Address"
                            name="email"
                            type="email"
                            value={
                                formData.email
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="vendor@example.com"
                            required
                        />


                        <InputField
                            icon={Phone}
                            label="Phone Number"
                            name="phone"
                            value={
                                formData.phone
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="10 digit phone number"
                            required
                        />


                        {/* PASSWORD */}

                        <div>

                            <label
                                className="
                                    block
                                    text-sm
                                    font-bold
                                    text-gray-700

                                    mb-2
                                "
                            >

                                Password
                                <span className="text-red-500">
                                    {" "}*
                                </span>

                            </label>


                            <div
                                className="
                                    relative
                                "
                            >

                                <Lock
                                    className="
                                        absolute
                                        left-4
                                        top-1/2

                                        -translate-y-1/2

                                        w-[18px]
                                        h-[18px]

                                        text-gray-400
                                    "
                                />


                                <input

                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }

                                    name="password"

                                    value={
                                        formData.password
                                    }

                                    onChange={
                                        handleChange
                                    }

                                    placeholder="Create password"

                                    className="
                                        w-full

                                        border
                                        border-gray-200

                                        rounded-xl

                                        py-3
                                        pl-11
                                        pr-12

                                        outline-none

                                        text-sm

                                        focus:border-[#175c2e]
                                        focus:ring-2
                                        focus:ring-[#175c2e]/10
                                    "

                                />


                                <button

                                    type="button"

                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }

                                    className="
                                        absolute
                                        right-4
                                        top-1/2

                                        -translate-y-1/2

                                        text-gray-400
                                        hover:text-gray-700
                                    "
                                >

                                    {showPassword ? (

                                        <EyeOff
                                            className="
                                                w-[18px]
                                                h-[18px]
                                            "
                                        />

                                    ) : (

                                        <Eye
                                            className="
                                                w-[18px]
                                                h-[18px]
                                            "
                                        />

                                    )}

                                </button>

                            </div>

                        </div>


                        <InputField
                            icon={FileText}
                            label="GST Number"
                            name="gst_number"
                            value={
                                formData.gst_number
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Optional GST number"
                        />


                        {/* ADDRESS */}

                        <div className="md:col-span-2">

                            <InputField
                                icon={MapPin}
                                label="Address"
                                name="address"
                                value={
                                    formData.address
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter complete business address"
                            />

                        </div>


                        <InputField
                            icon={Building2}
                            label="City"
                            name="city"
                            value={
                                formData.city
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Enter city"
                        />


                        <InputField
                            icon={Map}
                            label="State"
                            name="state"
                            value={
                                formData.state
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Enter state"
                        />


                        <InputField
                            icon={Navigation}
                            label="Pincode"
                            name="pincode"
                            value={
                                formData.pincode
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="6 digit pincode"
                        />

                    </div>


                    {/* ==================================
                        SUBMIT
                    ================================== */}

                    <button

                        type="submit"

                        disabled={loading}

                        className="
                            w-full

                            mt-7

                            bg-[#175c2e]
                            text-white

                            py-3.5

                            rounded-xl

                            text-sm
                            font-bold

                            flex
                            items-center
                            justify-center
                            gap-2

                            hover:bg-[#124923]

                            disabled:opacity-60
                            disabled:cursor-not-allowed

                            transition-colors
                        "
                    >

                        {loading ? (

                            <>
                                <Loader2
                                    className="
                                        w-5
                                        h-5
                                        animate-spin
                                    "
                                />

                                Creating Vendor Account...
                            </>

                        ) : (

                            <>
                                <Store
                                    className="
                                        w-5
                                        h-5
                                    "
                                />

                                Create Vendor Account
                            </>

                        )}

                    </button>


                    {/* LOGIN */}

                    <p
                        className="
                            text-center

                            text-sm
                            text-gray-500

                            mt-6
                        "
                    >

                        Already have a vendor account?{" "}

                        <button

                            type="button"

                            onClick={() =>
                                navigate("/")
                            }

                            className="
                                font-bold
                                text-[#175c2e]

                                hover:underline
                            "
                        >

                            Sign In

                        </button>

                    </p>

                </form>

            </div>

        </div>

    );

}


// ==========================================
// INPUT FIELD
// ==========================================

function InputField({
    icon: Icon,
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    required = false
}) {

    return (

        <div>

            <label
                className="
                    block

                    text-sm
                    font-bold
                    text-gray-700

                    mb-2
                "
            >

                {label}

                {required && (

                    <span className="text-red-500">
                        {" "}*
                    </span>

                )}

            </label>


            <div className="relative">

                <Icon
                    className="
                        absolute
                        left-4
                        top-1/2

                        -translate-y-1/2

                        w-[18px]
                        h-[18px]

                        text-gray-400
                    "
                />


                <input

                    type={type}

                    name={name}

                    value={value}

                    onChange={onChange}

                    placeholder={placeholder}

                    className="
                        w-full

                        border
                        border-gray-200

                        rounded-xl

                        py-3
                        pl-11
                        pr-4

                        text-sm

                        outline-none

                        focus:border-[#175c2e]
                        focus:ring-2
                        focus:ring-[#175c2e]/10

                        transition
                    "

                />

            </div>

        </div>

    );

}


// ==========================================
// SUCCESS INFORMATION
// ==========================================

function RegistrationInfo({
    label,
    value,
    last = false
}) {

    return (

        <div
            className={`
                flex
                items-center
                justify-between

                gap-4

                py-3

                ${
                    !last
                        ? "border-b border-gray-200"
                        : ""
                }
            `}
        >

            <span
                className="
                    text-xs
                    text-gray-400
                "
            >

                {label}

            </span>


            <span
                className="
                    text-sm
                    font-bold
                    text-gray-800

                    text-right
                    break-all
                "
            >

                {value || "-"}

            </span>

        </div>

    );

}