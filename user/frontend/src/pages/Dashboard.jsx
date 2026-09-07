import "../styles/dashboard.css";

import {
    useContext,
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useSearchParams
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import API from "../api/api";

import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";


import { toast } from "react-toastify";


function Dashboard() {

    const navigate = useNavigate();

    const [searchParams, setSearchParams] =
        useSearchParams();

    const activeTab =
        searchParams.get("tab") || "overview";


    // ==========================================================
    // TAB CHANGE
    // ==========================================================

    const setActiveTab = (tab) => {

        setSearchParams({
            tab
        });

    };


    // ==========================================================
    // USER / PROFILE
    // ==========================================================

    const [user, setUser] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    // ==========================================================
    // ORDERS
    // ==========================================================

    const [orders, setOrders] =
        useState([]);

    const [ordersLoading, setOrdersLoading] =
        useState(false);


    // ==========================================================
    // RETURNS
    // ==========================================================

    const [returns, setReturns] =
        useState([]);

    const [returnsLoading, setReturnsLoading] =
        useState(false);

    const [returnModalOrder, setReturnModalOrder] =
        useState(null);

    const [returnModalItem, setReturnModalItem] =
        useState(null);

    const [returnReason, setReturnReason] =
        useState("");

    const [returnDescription, setReturnDescription] =
        useState("");

    const [returnSubmitting, setReturnSubmitting] =
        useState(false);

    const returnReasons = [

        "Wrong item received",

        "Product damaged / defective",

        "Size doesn't fit",

        "Quality not as expected",

        "Item different from description",

        "Changed my mind",

        "Other"

    ];


    // ==========================================================
    // ADDRESSES
    // ==========================================================

    const [addresses, setAddresses] =
        useState([]);

    const [addressesLoading, setAddressesLoading] =
        useState(false);


    // ==========================================================
    // CART / WISHLIST
    // ==========================================================

    const {
        cartItems,
        addToCart,
        fetchCart
    } = useContext(CartContext);


    const {
        wishlistItems,
        removeFromWishlist,
        fetchWishlist
    } = useContext(WishlistContext);


    // ==========================================================
    // ADDRESS FORM
    // ==========================================================

    const [addressForm, setAddressForm] = useState({

        full_name: "",
        phone: "",
        address_line: "",
        city: "",
        state: "",
        pincode: "",
        address_type: "Home"

    });


    const [editingAddressId, setEditingAddressId] =
        useState(null);

    const [showAddressForm, setShowAddressForm] =
        useState(false);


    // ==========================================================
    // PROFILE FORM
    // ==========================================================

    const [profileForm, setProfileForm] = useState({

        full_name: "",
        phone: "",
        gender: "",
        dob: "",
        city: "",
        state: "",
        pincode: ""

    });


    // ==========================================================
    // PASSWORD FORM
    // ==========================================================

    const [passwordForm, setPasswordForm] = useState({

        oldPassword: "",
        newPassword: "",
        confirmPassword: ""

    });


    // ==========================================================
    // IMAGE URL
    // ==========================================================

    const getImageUrl = (image) => {

        if (!image) {

            return "/placeholder-product.png";

        }


        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {

            return image;

        }


        let apiBaseUrl =
            API.defaults?.baseURL || "";


        apiBaseUrl =
            apiBaseUrl.replace(
                /\/api\/?$/,
                ""
            );


        if (image.startsWith("/")) {

            return `${apiBaseUrl}${image}`;

        }


        if (
            image.startsWith("uploads/")
        ) {

            return `${apiBaseUrl}/${image}`;

        }


        return `${apiBaseUrl}/uploads/${image}`;

    };


    // ==========================================================
    // STATUS CLASS
    // ==========================================================

    const statusClass = (status) => {

        const currentStatus =
            String(status || "").toLowerCase();


        if (
            currentStatus === "delivered"
        ) {

            return "status-badge delivered";

        }


        if (
            currentStatus === "cancelled"
        ) {

            return "status-badge cancelled";

        }


        if (
            currentStatus === "confirmed"
        ) {

            return "status-badge processing";

        }


        if (
            currentStatus === "processing"
        ) {

            return "status-badge processing";

        }


        if (
            currentStatus === "shipped"
        ) {

            return "status-badge processing";

        }


        return "status-badge processing";

    };


    // ==========================================================
    // FETCH PROFILE
    // ==========================================================

    useEffect(() => {

        fetchProfile();

    }, []);


    const fetchProfile = async () => {

        const token =
            localStorage.getItem("token");


        if (!token) {

            navigate("/login");

            return;

        }


        try {

            const res =
                await API.get(

                    "/auth/profile",

                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }

                );


            const profileUser =
                res.data.user;


            setUser(
                profileUser
            );


            setProfileForm({

                full_name:
                    profileUser.full_name || "",

                phone:
                    profileUser.phone || "",

                gender:
                    profileUser.gender || "",

                dob:
                    profileUser.dob
                        ? profileUser.dob.substring(0, 10)
                        : "",

                city:
                    profileUser.city || "",

                state:
                    profileUser.state || "",

                pincode:
                    profileUser.pincode || ""

            });

        }

        catch (error) {

            console.error(
                "Profile Error:",
                error
            );


            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );


            toast.error(
                "Session expired. Please login again."
            );


            navigate("/login");

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================================
    // FETCH ORDERS
    // ==========================================================

    useEffect(() => {

        if (user) {

            fetchOrders();

            fetchReturns();

        }

    }, [user]);


    const fetchOrders = async () => {

        try {

            setOrdersLoading(true);


            const token =
                localStorage.getItem("token");


            const res =
                await API.get(

                    "/orders/my-orders",

                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }

                );


            console.log(
                "Orders API Response:",
                res.data
            );


            if (
                res.data.success
            ) {

                setOrders(
                    res.data.orders || []
                );

            }

            else {

                setOrders([]);

            }

        }

        catch (error) {

            console.error(
                "Get Orders Error:",
                error
            );


            if (
                error.response?.status === 401
            ) {

                localStorage.removeItem(
                    "token"
                );

                navigate("/login");

                return;

            }


            setOrders([]);

        }

        finally {

            setOrdersLoading(false);

        }

    };


    // ==========================================================
    // FETCH RETURNS
    // ==========================================================

    const fetchReturns = async () => {

        try {

            setReturnsLoading(true);

            const res =
                await API.get(
                    "/returns/my"
                );

            if (
                res.data.success
            ) {

                setReturns(
                    res.data.returns || []
                );

            }

            else {

                setReturns([]);

            }

        }

        catch (error) {

            console.error(
                "Get Returns Error:",
                error
            );

            setReturns([]);

        }

        finally {

            setReturnsLoading(false);

        }

    };


    // ==========================================================
    // RETURN MODAL — OPEN / CLOSE
    // ==========================================================

    const openReturnModal = (order, item) => {

        setReturnModalOrder(order);

        setReturnModalItem(item);

        setReturnReason("");

        setReturnDescription("");

    };

    const closeReturnModal = () => {

        setReturnModalOrder(null);

        setReturnModalItem(null);

        setReturnReason("");

        setReturnDescription("");

    };


    // ==========================================================
    // FIND EXISTING RETURN FOR AN ORDER / ITEM
    // ==========================================================

    const findReturnForItem = (order, item) => {

        return returns.find(

            (r) =>

                r.order_id === order.order_id &&

                (
                    !item?.vendor_id ||
                    r.vendor_id === item.vendor_id
                )

        );

    };


    // ==========================================================
    // SUBMIT RETURN REQUEST
    // ==========================================================

    const handleSubmitReturn = async () => {

        if (!returnReason) {

            toast.error(
                "Please select a reason for the return."
            );

            return;

        }

        try {

            setReturnSubmitting(true);

            const res =
                await API.post(

                    "/returns/request",

                    {
                        order_id:
                            returnModalOrder.order_id,

                        product_id:
                            returnModalItem?.product_id,

                        reason:
                            returnReason,

                        description:
                            returnDescription
                    }

                );

            if (res.data.success) {

                toast.success(
                    "Return request submitted successfully."
                );

                closeReturnModal();

                fetchReturns();

            }

            else {

                toast.error(
                    res.data.message ||
                    "Failed to submit return request."
                );

            }

        }

        catch (error) {

            console.error(
                "Create Return Error:",
                error
            );

            toast.error(

                error.response?.data?.message ||

                "Failed to submit return request."

            );

        }

        finally {

            setReturnSubmitting(false);

        }

    };


    // ==========================================================
    // FETCH ADDRESSES
    // ==========================================================

    useEffect(() => {

        if (user) {

            fetchAddresses();

        }

    }, [user]);


    const fetchAddresses = async () => {

        try {

            setAddressesLoading(true);


            const token =
                localStorage.getItem("token");


            const res =
                await API.get(

                    "/orders/addresses",

                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }

                );


            console.log(
                "Addresses API Response:",
                res.data
            );


            if (
                res.data.success
            ) {

                setAddresses(
                    res.data.addresses || []
                );

            }

            else {

                setAddresses([]);

            }

        }

        catch (error) {

            console.error(
                "Get Addresses Error:",
                error
            );


            setAddresses([]);

        }

        finally {

            setAddressesLoading(false);

        }

    };


    // ==========================================================
    // ADDRESS CHANGE
    // ==========================================================

    const handleAddressChange = (e) => {

        setAddressForm({

            ...addressForm,

            [e.target.name]:
                e.target.value

        });

    };


    // ==========================================================
    // RESET ADDRESS FORM
    // ==========================================================

    const resetAddressForm = () => {

        setAddressForm({

            full_name: "",
            phone: "",
            address_line: "",
            city: "",
            state: "",
            pincode: "",
            address_type: "Home"

        });


        setEditingAddressId(
            null
        );

        setShowAddressForm(
            false
        );

    };


    // ==========================================================
    // SAVE ADDRESS
    // ==========================================================

    const handleSaveAddress = async () => {

        if (

            !addressForm.full_name ||
            !addressForm.phone ||
            !addressForm.address_line ||
            !addressForm.city ||
            !addressForm.state ||
            !addressForm.pincode

        ) {

            toast.warning(
                "Please fill all address fields."
            );

            return;

        }


        try {

            const token =
                localStorage.getItem("token");


            if (editingAddressId) {

                toast.info(
                    "Update Address API is not available in the current backend."
                );

                return;

            }


            const res =
                await API.post(

                    "/orders/addresses",

                    addressForm,

                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }

                );


            if (
                res.data.success
            ) {

                toast.success(
                    "Address saved successfully."
                );


                await fetchAddresses();

                resetAddressForm();

            }

        }

        catch (error) {

            console.error(
                "Save Address Error:",
                error
            );


            toast.error(

                error.response?.data?.message ||
                "Failed to save address."

            );

        }

    };


    // ==========================================================
    // EDIT ADDRESS
    // ==========================================================

    const handleEditAddress = (address) => {

        setAddressForm({

            full_name:
                address.full_name || "",

            phone:
                address.phone || "",

            address_line:
                address.address_line || "",

            city:
                address.city || "",

            state:
                address.state || "",

            pincode:
                address.pincode || "",

            address_type:
                address.address_type || "Home"

        });


        setEditingAddressId(
            address.address_id
        );


        setShowAddressForm(
            true
        );

    };


    // ==========================================================
    // DELETE ADDRESS
    // ==========================================================

    const handleDeleteAddress = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this address?"
            );


        if (!confirmDelete) {

            return;

        }


        toast.info(
            "Delete Address API is not available in the current backend."
        );

    };


    // ==========================================================
    // SET DEFAULT ADDRESS
    // ==========================================================

    const handleSetDefaultAddress = async (id) => {

        toast.info(
            "Set Default Address API is not available in the current backend."
        );

    };


    // ==========================================================
    // PROFILE CHANGE
    // ==========================================================

    const handleProfileChange = (e) => {

        setProfileForm({

            ...profileForm,

            [e.target.name]:
                e.target.value

        });

    };


    // ==========================================================
    // UPDATE PROFILE
    // ==========================================================

    const handleProfileUpdate = async () => {

        try {

            const token =
                localStorage.getItem("token");


            const res =
                await API.put(

                    "/auth/update-profile",

                    profileForm,

                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }

                );


            toast.success(
                res.data.message ||
                "Profile updated successfully."
            );


            await fetchProfile();

        }

        catch (error) {

            console.error(
                "Update Profile Error:",
                error
            );


            toast.error(

                error.response?.data?.message ||
                error.response?.data?.error ||
                "Profile update failed."

            );

        }

    };


    // ==========================================================
    // PASSWORD CHANGE
    // ==========================================================

    const handlePasswordChange = (e) => {

        setPasswordForm({

            ...passwordForm,

            [e.target.name]:
                e.target.value

        });

    };


    // ==========================================================
    // PASSWORD SUBMIT
    // ==========================================================

    const handlePasswordSubmit = async () => {

        if (

            !passwordForm.oldPassword ||
            !passwordForm.newPassword ||
            !passwordForm.confirmPassword

        ) {

            toast.warning(
                "Please fill all password fields."
            );

            return;

        }


        if (
            passwordForm.newPassword !==
            passwordForm.confirmPassword
        ) {

            toast.info(
                "New password and confirm password do not match."
            );

            return;

        }


        try {

            const token =
                localStorage.getItem("token");


            const res =
                await API.put(

                    "/auth/change-password",

                    {

                        oldPassword:
                            passwordForm.oldPassword,

                        newPassword:
                            passwordForm.newPassword

                    },

                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }

                );


            toast.success(
                res.data.message ||
                "Password changed successfully."
            );


            setPasswordForm({

                oldPassword: "",
                newPassword: "",
                confirmPassword: ""

            });

        }

        catch (error) {

            console.error(
                "Change Password Error:",
                error
            );


            toast.error(

                error.response?.data?.message ||
                error.response?.data?.error ||
                "Password change failed."

            );

        }

    };


    // ==========================================================
    // LOGOUT
    // ==========================================================

    const handleLogout = async () => {

        try {

            const token =
                localStorage.getItem("token");


            await API.post(

                "/auth/logout",

                {},

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            );

        }

        catch (error) {

            console.log(
                "Logout API Error:",
                error
            );

        }


        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );


        await fetchCart();

        await fetchWishlist();


        navigate(
            "/login",
            {
                replace: true
            }
        );

    };


    // ==========================================================
    // BUY NOW FROM WISHLIST
    // ==========================================================

    const handleBuyFromWishlist = async (item) => {

        // ----------------------------------------
        // STOCK CHECK
        // ----------------------------------------

        if (
            Number(item.stock || 0) <= 0
        ) {

            toast.error(
                "This product is currently out of stock."
            );

            return;

        }


        // ----------------------------------------
        // ADD PRODUCT TO CART
        // ----------------------------------------

        const success =
            await addToCart({

                product_id:
                    item.product_id ||
                    item.id,

                id:
                    item.product_id ||
                    item.id,

                name:
                    item.name,

                image:
                    item.image,

                brand:
                    item.brand,

                price:
                    item.price,

                stock:
                    item.stock

            });


        // ----------------------------------------
        // ONLY GO TO CART AFTER SUCCESS
        // ----------------------------------------

        if (success) {

            navigate("/cart");

        }

    };


    // ==========================================================
    // DELETE ACCOUNT
    // ==========================================================

    const handleDeleteAccount = async () => {

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

                                toast.success(
                                    res.data.message || "Account deleted successfully."
                                );

                                localStorage.removeItem("token");
                                localStorage.removeItem("user");
                                navigate("/", { replace: true });
                                window.location.reload();
                            } catch (error) {
                                console.error("Delete Account Error:", error);
                                toast.error(
                                    error.response?.data?.message || "Delete account failed."
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


    // ==========================================================
    // ORDER CANCEL
    // ==========================================================

    const handleCancelOrder = async (orderId) => {

        if (!orderId) {
            toast.error("Order ID not found.");
            return;
        }

        const confirmCancel = window.confirm("Are you sure you want to cancel this order?");

        if (!confirmCancel) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const res = await API.patch(
                `/orders/${orderId}/cancel`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.data?.success) {
                toast.success(res.data.message || "Order cancelled successfully.");
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order.order_id === orderId
                            ? { ...order, order_status: "Cancelled" }
                            : order
                    )
                );
                return;
            }

            toast.error(res.data?.message || "Unable to cancel this order.");
        } catch (error) {
            console.error("Cancel Order Error:", error);
            toast.error(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Unable to cancel this order right now."
            );
        }

    };


    // ==========================================================
    // RENDER GUARD
    // ==========================================================

    if (
        loading ||
        !user
    ) {

        return (

            <>

                <Navbar />

                <div className="dashboard-loading">

                    Loading your dashboard...

                </div>

                <Footer />

            </>

        );

    }


    // ==========================================================
    // SAFE USER NAME
    // ==========================================================

    const userName =
        user.full_name ||
        "User";


    const firstName =
        userName.split(" ")[0];


    const avatarLetter =
        userName
            .charAt(0)
            .toUpperCase();


    // ==========================================================
    // RENDER
    // ==========================================================

    return (

        <>

            <Navbar />


            <div className="dashboard-page">

                <div className="dashboard-shell">


                    {/* ==================================================
                        SIDEBAR
                    ================================================== */}

                    <aside className="dashboard-sidebar">


                        {/* USER */}

                        <div className="sidebar-user">

                            <div className="sidebar-avatar">

                                {avatarLetter}

                            </div>


                            <div>

                                <h3>
                                    {userName}
                                </h3>

                                <p>
                                    {user.email}
                                </p>

                            </div>

                        </div>


                        {/* NAVIGATION */}

                        <nav className="sidebar-nav">


                            <button

                                className={
                                    activeTab === "overview"
                                        ? "active"
                                        : ""
                                }

                                onClick={() =>
                                    setActiveTab(
                                        "overview"
                                    )
                                }

                            >
                                🏠 Overview
                            </button>


                            <button

                                className={
                                    activeTab === "orders"
                                        ? "active"
                                        : ""
                                }

                                onClick={() =>
                                    setActiveTab(
                                        "orders"
                                    )
                                }

                            >
                                📦 My Orders
                            </button>


                            <button

                                className={
                                    activeTab === "returns"
                                        ? "active"
                                        : ""
                                }

                                onClick={() =>
                                    setActiveTab(
                                        "returns"
                                    )
                                }

                            >
                                ↩ My Returns
                            </button>


                            <button

                                className={
                                    activeTab === "wishlist"
                                        ? "active"
                                        : ""
                                }

                                onClick={() =>
                                    setActiveTab(
                                        "wishlist"
                                    )
                                }

                            >
                                ❤ Wishlist
                            </button>


                            <button

                                className={
                                    activeTab === "addresses"
                                        ? "active"
                                        : ""
                                }

                                onClick={() =>
                                    setActiveTab(
                                        "addresses"
                                    )
                                }

                            >
                                📍 Saved Addresses
                            </button>


                            <button

                                className={
                                    activeTab === "profile"
                                        ? "active"
                                        : ""
                                }

                                onClick={() =>
                                    setActiveTab(
                                        "profile"
                                    )
                                }

                            >
                                🧑 My Profile
                            </button>


                            <button

                                className={
                                    activeTab === "security"
                                        ? "active"
                                        : ""
                                }

                                onClick={() =>
                                    setActiveTab(
                                        "security"
                                    )
                                }

                            >
                                🔒 Security
                            </button>


                        </nav>


                        {/* LOGOUT */}

                        <button

                            className="sidebar-logout"

                            onClick={
                                handleLogout
                            }

                        >
                            ⏻ Logout
                        </button>


                    </aside>


                    {/* ==================================================
                        MAIN CONTENT
                    ================================================== */}

                    <main className="dashboard-main">


                        {/* ==================================================
                            OVERVIEW
                        ================================================== */}

                        {activeTab === "overview" && (

                            <section>

                                <h1>
                                    Welcome back,{" "}
                                    {firstName} 👋
                                </h1>


                                <p className="section-subtitle">

                                    Here's a quick look at your
                                    ORGOS account.

                                </p>


                                {/* STATS */}

                                <div className="stats-grid">


                                    <div

                                        className="stat-card"

                                        onClick={() =>
                                            setActiveTab(
                                                "orders"
                                            )
                                        }

                                    >

                                        <h2>
                                            {orders.length}
                                        </h2>

                                        <p>
                                            Total Orders
                                        </p>

                                    </div>


                                    <div

                                        className="stat-card"

                                        onClick={() =>
                                            setActiveTab(
                                                "wishlist"
                                            )
                                        }

                                    >

                                        <h2>
                                            {wishlistItems.length}
                                        </h2>

                                        <p>
                                            Wishlist Items
                                        </p>

                                    </div>


                                    <div

                                        className="stat-card"

                                        onClick={() =>
                                            navigate(
                                                "/cart"
                                            )
                                        }

                                    >

                                        <h2>
                                            {cartItems.length}
                                        </h2>

                                        <p>
                                            Items In Cart
                                        </p>

                                    </div>


                                    <div

                                        className="stat-card"

                                        onClick={() =>
                                            setActiveTab(
                                                "addresses"
                                            )
                                        }

                                    >

                                        <h2>
                                            {addresses.length}
                                        </h2>

                                        <p>
                                            Saved Addresses
                                        </p>

                                    </div>


                                </div>


                                {/* RECENT ORDERS */}

                                <div className="overview-panel">


                                    <div className="panel-header">

                                        <h3>
                                            Recent Orders
                                        </h3>


                                        <span

                                            onClick={() =>
                                                setActiveTab(
                                                    "orders"
                                                )
                                            }

                                        >
                                            View All
                                        </span>

                                    </div>


                                    {ordersLoading ? (

                                        <p className="empty-text">

                                            Loading orders...

                                        </p>

                                    ) : orders.length === 0 ? (

                                        <p className="empty-text">

                                            You haven't placed any
                                            orders yet.

                                        </p>

                                    ) : (

                                        orders
                                            .slice(0, 3)
                                            .map(
                                                (order) => (

                                                    <div

                                                        className="mini-order-row"

                                                        key={
                                                            order.order_id
                                                        }

                                                    >

                                                        <span>

                                                            #{order.order_id}

                                                        </span>


                                                        <span>

                                                            {order.created_at
                                                                ? new Date(
                                                                    order.created_at
                                                                ).toLocaleDateString()
                                                                : "N/A"}

                                                        </span>


                                                        <span

                                                            className={
                                                                statusClass(
                                                                    order.order_status
                                                                )
                                                            }

                                                        >

                                                            {
                                                                order.order_status ||
                                                                "Confirmed"
                                                            }

                                                        </span>


                                                        <span>

                                                            ₹
                                                            {Number(
                                                                order.total_amount ||
                                                                0
                                                            ).toFixed(2)}

                                                        </span>


                                                    </div>

                                                )
                                            )

                                    )}


                                </div>


                                <button

                                    className="primary-btn"

                                    onClick={() =>
                                        navigate(
                                            "/shop"
                                        )
                                    }

                                >
                                    Continue Shopping
                                </button>


                            </section>

                        )}


                        {/* ==================================================
                            ORDERS
                        ================================================== */}

                        {activeTab === "orders" && (

                            <section>

                                <h1>
                                    My Orders
                                </h1>


                                <p className="section-subtitle">

                                    Track your orders and
                                    payment status.

                                </p>


                                {ordersLoading ? (

                                    <div className="empty-state">

                                        <p>
                                            Loading your orders...
                                        </p>

                                    </div>

                                ) : orders.length === 0 ? (

                                    <div className="empty-state">

                                        <p>
                                            No orders yet.
                                        </p>


                                        <button

                                            className="primary-btn"

                                            onClick={() =>
                                                navigate(
                                                    "/shop"
                                                )
                                            }

                                        >
                                            Start Shopping
                                        </button>

                                    </div>

                                ) : (

                                    orders.map(
                                        (order) => (

                                            <div

                                                className="order-card"

                                                key={
                                                    order.order_id
                                                }

                                            >


                                                {/* ORDER HEADER */}

                                                <div className="order-card-top">


                                                    <div>

                                                        <h4>

                                                            Order #
                                                            {order.order_id}

                                                        </h4>


                                                        <p className="muted">

                                                            Placed on{" "}

                                                            {order.created_at
                                                                ? new Date(
                                                                    order.created_at
                                                                ).toLocaleDateString()
                                                                : "N/A"}

                                                        </p>

                                                    </div>


                                                    <span

                                                        className={
                                                            statusClass(
                                                                order.order_status
                                                            )
                                                        }

                                                    >

                                                        {
                                                            order.order_status ||
                                                            "Confirmed"
                                                        }

                                                    </span>


                                                </div>


                                                {/* ORDER ITEMS */}

                                                <div className="order-items">


                                                    {order.items &&
                                                        order.items.length > 0 ? (

                                                        order.items.map(
                                                            (
                                                                item,
                                                                index
                                                            ) => (

                                                                <div

                                                                    className="order-item-row"

                                                                    key={

                                                                        item.order_item_id ||
                                                                        item.product_id ||
                                                                        index

                                                                    }

                                                                >


                                                                    {/* PRODUCT */}

                                                                    <div className="order-product-info">


                                                                        {item.image ? (

                                                                            <img

                                                                                src={
                                                                                    getImageUrl(
                                                                                        item.image
                                                                                    )
                                                                                }

                                                                                alt={
                                                                                    item.product_name ||
                                                                                    "Product"
                                                                                }

                                                                                className="order-product-image"

                                                                                onError={(
                                                                                    e
                                                                                ) => {

                                                                                    e.currentTarget.src =
                                                                                        "/placeholder-product.png";

                                                                                }}

                                                                            />

                                                                        ) : (

                                                                            <div className="order-product-placeholder">

                                                                                No Image

                                                                            </div>

                                                                        )}


                                                                        <div>

                                                                            <span className="order-product-name">

                                                                                {
                                                                                    item.product_name ||
                                                                                    "Product"
                                                                                }

                                                                                {item.size && (
                                                                                    <span className="order-item-size">
                                                                                        {" "}(Size: {item.size})
                                                                                    </span>
                                                                                )}

                                                                                {" × "}

                                                                                {
                                                                                    item.quantity ||
                                                                                    1
                                                                                }

                                                                            </span>


                                                                            {item.brand && (

                                                                                <small className="muted">

                                                                                    {
                                                                                        item.brand
                                                                                    }

                                                                                </small>

                                                                            )}

                                                                        </div>


                                                                    </div>


                                                                    {/* PRICE */}

                                                                    <span>

                                                                        ₹
                                                                        {Number(

                                                                            item.subtotal ||

                                                                            (
                                                                                Number(
                                                                                    item.price ||
                                                                                    0
                                                                                ) *

                                                                                Number(
                                                                                    item.quantity ||
                                                                                    1
                                                                                )
                                                                            )

                                                                        ).toFixed(2)}

                                                                    </span>


                                                                    {/* RETURN */}

                                                                    {
                                                                        order.order_status ===
                                                                            "Delivered"
                                                                            ? (
                                                                                (() => {

                                                                                    let existingReturn =
                                                                                        findReturnForItem(
                                                                                            order,
                                                                                            item
                                                                                        );

                                                                                    if (existingReturn) {

                                                                                        return (

                                                                                            <span className="return-status-pill">
                                                                                                Return:{" "}
                                                                                                {
                                                                                                    existingReturn.status
                                                                                                }
                                                                                            </span>

                                                                                        );

                                                                                    }

                                                                                    return (

                                                                                        <button
                                                                                            className="text-btn"
                                                                                            onClick={() =>
                                                                                                openReturnModal(
                                                                                                    order,
                                                                                                    item
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            Return Item
                                                                                        </button>

                                                                                    );

                                                                                })()
                                                                            )
                                                                            : null
                                                                    }


                                                                </div>

                                                            )

                                                        )

                                                    ) : (

                                                        <p className="empty-text">

                                                            No items found
                                                            for this order.

                                                        </p>

                                                    )}


                                                </div>


                                                {/* PAYMENT */}

                                                <div className="order-card-bottom">


                                                    <div>

                                                        <div>

                                                            Payment:{" "}

                                                            <b>

                                                                {
                                                                    order.payment_method
                                                                        ? order.payment_method.toUpperCase()
                                                                        : "N/A"
                                                                }

                                                            </b>

                                                        </div>


                                                        <div>

                                                            Payment Status:{" "}

                                                            <b>

                                                                {
                                                                    order.payment_status ||
                                                                    "Pending"
                                                                }

                                                            </b>

                                                        </div>


                                                        {order.transaction_id && (

                                                            <div className="muted">

                                                                Transaction ID:{" "}

                                                                {
                                                                    order.transaction_id
                                                                }

                                                            </div>

                                                        )}


                                                    </div>


                                                    <b>

                                                        Total: ₹
                                                        {Number(
                                                            order.total_amount ||
                                                            0
                                                        ).toFixed(2)}

                                                    </b>


                                                </div>


                                                {/* CANCEL */}

                                                {(

                                                    order.order_status ===
                                                    "Confirmed" ||

                                                    order.order_status ===
                                                    "Processing"

                                                ) && (

                                                        <button

                                                            className="text-btn danger"

                                                            onClick={() =>
                                                                handleCancelOrder(
                                                                    order.order_id
                                                                )
                                                            }

                                                        >
                                                            Cancel Order
                                                        </button>

                                                    )}


                                            </div>

                                        )
                                    )

                                )}


                            </section>

                        )}


                        {/* ==================================================
                            RETURNS
                        ================================================== */}

                        {activeTab === "returns" && (

                            <section>

                                <h1>
                                    My Returns
                                </h1>

                                <p className="section-subtitle">
                                    Track the status of the return
                                    requests you've submitted.
                                </p>

                                {returnsLoading ? (

                                    <div className="loading-block">
                                        Loading your returns...
                                    </div>

                                ) : returns.length === 0 ? (

                                    <div className="empty-state">

                                        <p>
                                            You haven't requested any
                                            returns yet.
                                        </p>

                                        <button
                                            className="primary-btn"
                                            onClick={() =>
                                                setActiveTab(
                                                    "orders"
                                                )
                                            }
                                        >
                                            View My Orders
                                        </button>

                                    </div>

                                ) : (

                                    returns.map(
                                        (ret) => (

                                            <div
                                                className="order-card"
                                                key={
                                                    ret.return_id
                                                }
                                            >

                                                {/* RETURN HEADER */}

                                                <div className="order-card-top">

                                                    <div>

                                                        <h4>
                                                            Return for Order #
                                                            {ret.order_id}
                                                        </h4>

                                                        <p className="muted">
                                                            Requested on{" "}
                                                            {ret.created_at
                                                                ? new Date(
                                                                    ret.created_at
                                                                ).toLocaleDateString()
                                                                : "N/A"}
                                                        </p>

                                                        {ret.shop_name && (

                                                            <p className="muted">
                                                                Vendor:{" "}
                                                                {ret.shop_name}
                                                            </p>

                                                        )}

                                                    </div>

                                                    <span
                                                        className={
                                                            statusClass(
                                                                ret.status
                                                            )
                                                        }
                                                    >
                                                        {
                                                            ret.status ||
                                                            "Pending"
                                                        }
                                                    </span>

                                                </div>


                                                {/* RETURN ITEMS */}

                                                <div className="order-items">

                                                    {ret.items &&
                                                        ret.items.length > 0 ? (

                                                        ret.items.map(
                                                            (
                                                                item,
                                                                index
                                                            ) => (

                                                                <div
                                                                    className="order-item-row"
                                                                    key={
                                                                        item.order_item_id ||
                                                                        item.product_id ||
                                                                        index
                                                                    }
                                                                >

                                                                    <div className="order-product-info">

                                                                        {item.image ? (

                                                                            <img
                                                                                src={
                                                                                    getImageUrl(
                                                                                        item.image
                                                                                    )
                                                                                }
                                                                                alt={
                                                                                    item.product_name ||
                                                                                    "Product"
                                                                                }
                                                                                className="order-product-image"
                                                                                onError={(e) => {
                                                                                    e.currentTarget.src =
                                                                                        "/placeholder-product.png";
                                                                                }}
                                                                            />

                                                                        ) : (

                                                                            <div className="order-product-placeholder">
                                                                                No Image
                                                                            </div>

                                                                        )}

                                                                        <div>

                                                                            <span className="order-product-name">
                                                                                {
                                                                                    item.product_name ||
                                                                                    "Product"
                                                                                }
                                                                                {item.size && (
                                                                                    <span className="order-item-size">
                                                                                        {" "}(Size: {item.size})
                                                                                    </span>
                                                                                )}
                                                                                {" × "}
                                                                                {
                                                                                    item.quantity ||
                                                                                    1
                                                                                }
                                                                            </span>

                                                                        </div>

                                                                    </div>

                                                                </div>

                                                            )
                                                        )

                                                    ) : (

                                                        <p className="empty-text">
                                                            No item details available.
                                                        </p>

                                                    )}

                                                </div>


                                                {/* RETURN REASON */}

                                                <div className="order-card-bottom">

                                                    <div>

                                                        <div>
                                                            Reason:{" "}
                                                            <b>
                                                                {
                                                                    ret.reason ||
                                                                    "Not specified"
                                                                }
                                                            </b>
                                                        </div>

                                                        {ret.description && (

                                                            <div className="muted">
                                                                {ret.description}
                                                            </div>

                                                        )}

                                                    </div>

                                                    <b>
                                                        Refund: ₹
                                                        {Number(
                                                            ret.refund_amount ||
                                                            0
                                                        ).toFixed(2)}
                                                    </b>

                                                </div>

                                            </div>

                                        )
                                    )

                                )}

                            </section>

                        )}


                        {/* ==================================================
                            WISHLIST
                        ================================================== */}

                        {activeTab === "wishlist" && (

                            <section>


                                <h1>
                                    Wishlist
                                </h1>


                                <p className="section-subtitle">

                                    Products you've saved
                                    for later.

                                </p>


                                {wishlistItems.length === 0 ? (

                                    <div className="empty-state">

                                        <p>
                                            Your wishlist is empty.
                                        </p>


                                        <button

                                            className="primary-btn"

                                            onClick={() =>
                                                navigate(
                                                    "/shop"
                                                )
                                            }

                                        >
                                            Browse Products
                                        </button>

                                    </div>

                                ) : (

                                    <div className="wishlist-grid">


                                        {wishlistItems.map(
                                            (item) => (

                                                <div

                                                    className="wishlist-card"

                                                    key={
                                                        item.id
                                                    }

                                                >

                                                    <img

                                                        src={
                                                            item.image ||
                                                            "/placeholder-product.png"
                                                        }

                                                        alt={
                                                            item.name
                                                        }

                                                        onError={(
                                                            e
                                                        ) => {

                                                            e.currentTarget.src =
                                                                "/placeholder-product.png";

                                                        }}

                                                    />


                                                    <h4>
                                                        {item.name}
                                                    </h4>


                                                    <p>

                                                        ₹
                                                        {item.price}

                                                        {item.oldPrice &&
                                                            item.oldPrice >
                                                            item.price && (

                                                                <span className="wishlist-old-price">

                                                                    {" "}
                                                                    ₹
                                                                    {
                                                                        item.oldPrice
                                                                    }

                                                                </span>

                                                            )}

                                                    </p>


                                                    <p

                                                        className={
                                                            item.stock > 0
                                                                ? "wishlist-stock"
                                                                : "wishlist-stock out"
                                                        }

                                                    >

                                                        {item.stock > 0
                                                            ? `In Stock (${item.stock})`
                                                            : "Out of Stock"}

                                                    </p>


                                                    <div className="wishlist-card-actions">


                                                        <button

                                                            className="primary-btn wishlist-buy-btn"

                                                            disabled={
                                                                item.stock <= 0
                                                            }

                                                            onClick={() =>
                                                                handleBuyFromWishlist(
                                                                    item
                                                                )
                                                            }

                                                        >

                                                            {item.stock > 0
                                                                ? "Buy Now"
                                                                : "Out of Stock"}

                                                        </button>


                                                        <button

                                                            className="text-btn danger"

                                                            onClick={() =>
                                                                removeFromWishlist(
                                                                    item.id
                                                                )
                                                            }

                                                        >
                                                            Remove
                                                        </button>


                                                    </div>


                                                </div>

                                            )
                                        )}


                                    </div>

                                )}


                            </section>

                        )}


                        {/* ==================================================
                            ADDRESSES
                        ================================================== */}

                        {activeTab === "addresses" && (

                            <section>


                                <div className="panel-header">


                                    <h1>
                                        Saved Addresses
                                    </h1>


                                    {!showAddressForm && (

                                        <button

                                            className="primary-btn"

                                            onClick={() =>
                                                setShowAddressForm(
                                                    true
                                                )
                                            }

                                        >
                                            + Add New Address
                                        </button>

                                    )}


                                </div>


                                {/* ADDRESS FORM */}

                                {showAddressForm && (

                                    <div className="address-form">


                                        <div className="form-grid">


                                            <input

                                                type="text"

                                                name="full_name"

                                                placeholder="Full Name"

                                                value={
                                                    addressForm.full_name
                                                }

                                                onChange={
                                                    handleAddressChange
                                                }

                                            />


                                            <input

                                                type="text"

                                                name="phone"

                                                placeholder="Mobile Number"

                                                value={
                                                    addressForm.phone
                                                }

                                                onChange={
                                                    handleAddressChange
                                                }

                                            />


                                            <textarea

                                                name="address_line"

                                                placeholder="Full Address"

                                                value={
                                                    addressForm.address_line
                                                }

                                                onChange={
                                                    handleAddressChange
                                                }

                                            />


                                            <input

                                                type="text"

                                                name="city"

                                                placeholder="City"

                                                value={
                                                    addressForm.city
                                                }

                                                onChange={
                                                    handleAddressChange
                                                }

                                            />


                                            <input

                                                type="text"

                                                name="state"

                                                placeholder="State"

                                                value={
                                                    addressForm.state
                                                }

                                                onChange={
                                                    handleAddressChange
                                                }

                                            />


                                            <input

                                                type="text"

                                                name="pincode"

                                                placeholder="Pincode"

                                                value={
                                                    addressForm.pincode
                                                }

                                                onChange={
                                                    handleAddressChange
                                                }

                                            />


                                            <select

                                                name="address_type"

                                                value={
                                                    addressForm.address_type
                                                }

                                                onChange={
                                                    handleAddressChange
                                                }

                                            >

                                                <option value="Home">
                                                    Home
                                                </option>

                                                <option value="Work">
                                                    Work
                                                </option>

                                                <option value="Other">
                                                    Other
                                                </option>

                                            </select>


                                        </div>


                                        <div className="form-actions">


                                            <button

                                                className="primary-btn"

                                                onClick={
                                                    handleSaveAddress
                                                }

                                            >

                                                {editingAddressId
                                                    ? "Update Address"
                                                    : "Save Address"}

                                            </button>


                                            <button

                                                className="text-btn"

                                                onClick={
                                                    resetAddressForm
                                                }

                                            >
                                                Cancel
                                            </button>


                                        </div>


                                    </div>

                                )}


                                {/* ADDRESS LIST */}

                                {addressesLoading ? (

                                    <p className="empty-text">

                                        Loading addresses...

                                    </p>

                                ) : addresses.length === 0 &&
                                    !showAddressForm ? (

                                    <p className="empty-text">

                                        No saved addresses yet.

                                    </p>

                                ) : (

                                    <div className="address-grid">


                                        {addresses.map(
                                            (address) => (

                                                <div

                                                    className="address-card"

                                                    key={
                                                        address.address_id
                                                    }

                                                >


                                                    <span className="default-tag">

                                                        {
                                                            address.address_type ||
                                                            "Home"
                                                        }

                                                    </span>


                                                    <h4>

                                                        {
                                                            address.full_name
                                                        }

                                                    </h4>


                                                    <p>

                                                        {
                                                            address.address_line
                                                        }

                                                    </p>


                                                    <p>

                                                        {
                                                            address.city
                                                        }

                                                        ,{" "}

                                                        {
                                                            address.state
                                                        }

                                                        {" - "}

                                                        {
                                                            address.pincode
                                                        }

                                                    </p>


                                                    <p>

                                                        📞{" "}

                                                        {
                                                            address.phone
                                                        }

                                                    </p>


                                                    <div className="address-actions">


                                                        <button

                                                            className="text-btn"

                                                            onClick={() =>
                                                                handleEditAddress(
                                                                    address
                                                                )
                                                            }

                                                        >
                                                            Edit
                                                        </button>


                                                        <button

                                                            className="text-btn"

                                                            onClick={() =>
                                                                handleSetDefaultAddress(
                                                                    address.address_id
                                                                )
                                                            }

                                                        >
                                                            Set Default
                                                        </button>


                                                        <button

                                                            className="text-btn danger"

                                                            onClick={() =>
                                                                handleDeleteAddress(
                                                                    address.address_id
                                                                )
                                                            }

                                                        >
                                                            Delete
                                                        </button>


                                                    </div>


                                                </div>

                                            )
                                        )}


                                    </div>

                                )}


                            </section>

                        )}


                        {/* ==================================================
                            PROFILE
                        ================================================== */}

                        {activeTab === "profile" && (

                            <section>


                                <h1>
                                    My Profile
                                </h1>


                                <p className="section-subtitle">

                                    Keep your personal details
                                    up to date.

                                </p>


                                <div className="form-grid">


                                    <div className="input-group">

                                        <label>
                                            Full Name
                                        </label>


                                        <input

                                            type="text"

                                            name="full_name"

                                            value={
                                                profileForm.full_name
                                            }

                                            onChange={
                                                handleProfileChange
                                            }

                                        />

                                    </div>


                                    <div className="input-group">

                                        <label>
                                            Email
                                        </label>


                                        <input

                                            type="email"

                                            value={
                                                user.email || ""
                                            }

                                            disabled

                                        />

                                    </div>


                                    <div className="input-group">

                                        <label>
                                            Phone
                                        </label>


                                        <input

                                            type="text"

                                            name="phone"

                                            value={
                                                profileForm.phone
                                            }

                                            onChange={
                                                handleProfileChange
                                            }

                                        />

                                    </div>


                                    <div className="input-group">

                                        <label>
                                            Gender
                                        </label>


                                        <select

                                            name="gender"

                                            value={
                                                profileForm.gender
                                            }

                                            onChange={
                                                handleProfileChange
                                            }

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


                                    <div className="input-group">

                                        <label>
                                            Date of Birth
                                        </label>


                                        <input

                                            type="date"

                                            name="dob"

                                            value={
                                                profileForm.dob
                                            }

                                            onChange={
                                                handleProfileChange
                                            }

                                        />

                                    </div>


                                    <div className="input-group">

                                        <label>
                                            City
                                        </label>


                                        <input

                                            type="text"

                                            name="city"

                                            value={
                                                profileForm.city
                                            }

                                            onChange={
                                                handleProfileChange
                                            }

                                        />

                                    </div>


                                    <div className="input-group">

                                        <label>
                                            State
                                        </label>


                                        <input

                                            type="text"

                                            name="state"

                                            value={
                                                profileForm.state
                                            }

                                            onChange={
                                                handleProfileChange
                                            }

                                        />

                                    </div>


                                    <div className="input-group">

                                        <label>
                                            Pincode
                                        </label>


                                        <input

                                            type="text"

                                            name="pincode"

                                            value={
                                                profileForm.pincode
                                            }

                                            onChange={
                                                handleProfileChange
                                            }

                                        />

                                    </div>


                                </div>


                                <button

                                    className="primary-btn"

                                    onClick={
                                        handleProfileUpdate
                                    }

                                >
                                    Save Changes
                                </button>


                            </section>

                        )}


                        {/* ==================================================
                            SECURITY
                        ================================================== */}

                        {activeTab === "security" && (

                            <section>


                                <h1>
                                    Security
                                </h1>


                                <p className="section-subtitle">

                                    Manage your password and
                                    account access.

                                </p>


                                {/* CHANGE PASSWORD */}

                                <div className="security-block">


                                    <h3>
                                        Change Password
                                    </h3>


                                    <div className="form-grid">


                                        <div className="input-group">

                                            <label>
                                                Current Password
                                            </label>


                                            <input

                                                type="password"

                                                name="oldPassword"

                                                value={
                                                    passwordForm.oldPassword
                                                }

                                                onChange={
                                                    handlePasswordChange
                                                }

                                            />

                                        </div>


                                        <div className="input-group">

                                            <label>
                                                New Password
                                            </label>


                                            <input

                                                type="password"

                                                name="newPassword"

                                                value={
                                                    passwordForm.newPassword
                                                }

                                                onChange={
                                                    handlePasswordChange
                                                }

                                            />

                                        </div>


                                        <div className="input-group">

                                            <label>
                                                Confirm New Password
                                            </label>


                                            <input

                                                type="password"

                                                name="confirmPassword"

                                                value={
                                                    passwordForm.confirmPassword
                                                }

                                                onChange={
                                                    handlePasswordChange
                                                }

                                            />

                                        </div>


                                    </div>


                                    <button

                                        className="primary-btn"

                                        onClick={
                                            handlePasswordSubmit
                                        }

                                    >
                                        Update Password
                                    </button>


                                </div>


                                {/* DANGER ZONE */}

                                <div className="security-block danger-zone">


                                    <h3>
                                        Danger Zone
                                    </h3>


                                    <p className="muted">

                                        Deleting your account is
                                        permanent and cannot be undone.

                                    </p>


                                    <button

                                        className="danger-btn"

                                        onClick={
                                            handleDeleteAccount
                                        }

                                    >
                                        Delete My Account
                                    </button>


                                </div>


                            </section>

                        )}


                    </main>


                </div>

            </div>


            {/* ==================================================
                RETURN REQUEST MODAL
            ================================================== */}

            {returnModalOrder && (

                <div
                    className="return-modal-overlay"
                    onClick={closeReturnModal}
                >

                    <div
                        className="return-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <h3>
                            Request a Return
                        </h3>

                        <p className="muted">
                            Order #{returnModalOrder.order_id}
                            {returnModalItem?.product_name
                                ? ` — ${returnModalItem.product_name}`
                                : ""}
                        </p>

                        <label>
                            Reason for return
                        </label>

                        <select
                            value={returnReason}
                            onChange={(e) =>
                                setReturnReason(
                                    e.target.value
                                )
                            }
                        >

                            <option value="">
                                Select a reason
                            </option>

                            {returnReasons.map(
                                (reason) => (

                                    <option
                                        key={reason}
                                        value={reason}
                                    >
                                        {reason}
                                    </option>

                                )
                            )}

                        </select>

                        <label>
                            Additional details (optional)
                        </label>

                        <textarea
                            rows={4}
                            value={returnDescription}
                            onChange={(e) =>
                                setReturnDescription(
                                    e.target.value
                                )
                            }
                            placeholder="Tell us more about the issue..."
                        />

                        <div className="return-modal-actions">

                            <button
                                className="text-btn"
                                onClick={closeReturnModal}
                                disabled={returnSubmitting}
                            >
                                Cancel
                            </button>

                            <button
                                className="btn-primary"
                                onClick={handleSubmitReturn}
                                disabled={returnSubmitting}
                            >
                                {returnSubmitting
                                    ? "Submitting..."
                                    : "Submit Return Request"}
                            </button>

                        </div>

                    </div>

                </div>

            )}


            <Footer />

        </>

    );

}


export default Dashboard;