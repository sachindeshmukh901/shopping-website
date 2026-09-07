import {
    useEffect,
    useState
} from "react";

import {
    RefreshCw,
    CheckCircle2,
    User,
    Phone,
    MapPin,
    CreditCard,
    Package,
    AlertCircle,
    Loader2,
    Store
} from "lucide-react";

import "./Orders.css";


function Orders() {

    // ======================================================
    // STATES
    // ======================================================

    let [orders, setOrders] = useState([]);

    let [loading, setLoading] = useState(true);

    let [refreshing, setRefreshing] = useState(false);

    let [error, setError] = useState("");

    let [updatingOrder, setUpdatingOrder] = useState(null);


    // ======================================================
    // FETCH ORDERS
    // ======================================================

    let fetchOrders = async (showLoader = true) => {

        try {

            if (showLoader) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");

            let token =
                localStorage.getItem("adminToken");

            if (!token) {

                setError(
                    "Admin session expired. Please login again."
                );

                return;

            }

            let response =
                await fetch(
                    "https://orgos-backend-l7mx.onrender.com/api/admin/orders",
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

            let data = await response.json();

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem("adminToken");
                localStorage.removeItem("admin");

                setError(
                    "Admin session expired. Please login again."
                );

                return;

            }

            if (response.ok && data.success) {

                setOrders(
                    Array.isArray(data.orders)
                        ? data.orders
                        : []
                );

            } else {

                setError(
                    data.message ||
                    "Failed to fetch orders"
                );

            }

        }

        catch (error) {

            console.error(
                "Fetch Admin Orders Error:",
                error
            );

            setError(
                "Unable to connect with ORGOS backend server."
            );

        }

        finally {

            setLoading(false);
            setRefreshing(false);

        }

    };


    // ======================================================
    // INITIAL LOAD
    // ======================================================

    useEffect(() => {

        fetchOrders(true);

    }, []);


    // ======================================================
    // REFRESH
    // ======================================================

    let handleRefresh = () => {

        fetchOrders(false);

    };


    // ======================================================
    // UPDATE ORDER STATUS
    // ======================================================

    let updateOrderStatus = async (orderId, newStatus) => {

        try {

            setUpdatingOrder(orderId);

            let token =
                localStorage.getItem("adminToken");

            if (!token) {

                setError("Admin session expired.");
                return;

            }

            let response =
                await fetch(
                    `https://orgos-backend-l7mx.onrender.com/api/admin/orders/${orderId}/status`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            order_status: newStatus
                        })
                    }
                );

            let data = await response.json();

            if (response.ok && data.success) {

                await fetchOrders(false);

            } else {

                alert(
                    data.message ||
                    "Unable to update order status"
                );

            }

        }

        catch (error) {

            console.error(
                "Update Order Status Error:",
                error
            );

            alert("Server connection failed");

        }

        finally {

            setUpdatingOrder(null);

        }

    };


    // ======================================================
    // DATE FORMAT
    // ======================================================

    let formatDate = (date) => {

        if (!date) {
            return "N/A";
        }

        let parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "N/A";
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    // ======================================================
    // CURRENCY
    // ======================================================

    let formatCurrency = (amount) => {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2
            }
        ).format(Number(amount) || 0);

    };


    // ======================================================
    // ADDRESS
    // ======================================================

    let getShippingAddress = (order) => {

        let parts = [];

        if (order.address_line) {
            parts.push(order.address_line);
        }

        if (order.city) {
            parts.push(order.city);
        }

        if (order.state) {
            parts.push(order.state);
        }

        if (order.pincode) {
            parts.push(order.pincode);
        }

        if (parts.length === 0) {
            return "Not available";
        }

        return parts.join(", ");

    };


    // ======================================================
    // IMAGE URL
    // ======================================================

    let getImageUrl = (image) => {

        if (!image) {
            return "";
        }

        return image.startsWith("http")
            ? image
            : `https://orgos-backend-l7mx.onrender.com${image}`;

    };


    // ======================================================
    // STATUS CLASS
    // ======================================================

    let getStatusClass = (status) => {

        if (status === "Delivered") {
            return "admin-order-status delivered";
        }

        if (status === "Cancelled") {
            return "admin-order-status cancelled";
        }

        if (status === "Shipped") {
            return "admin-order-status shipped";
        }

        if (status === "Processing") {
            return "admin-order-status processing";
        }

        if (status === "Confirmed") {
            return "admin-order-status confirmed";
        }

        return "admin-order-status pending";

    };


    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {

        return (

            <div className="admin-orders-page">

                <div className="admin-orders-loading">

                    <Loader2
                        size={32}
                        className="admin-orders-spinner"
                    />

                    <h3>Loading orders...</h3>

                    <p>Fetching real orders from ORGOS database.</p>

                </div>

            </div>

        );

    }


    // ======================================================
    // PAGE
    // ======================================================

    return (

        <div className="admin-orders-page">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="admin-orders-header">

                <div>

                    <h1>Orders</h1>

                    <p>Manage all orders placed across the ORGOS platform.</p>

                </div>

                <button
                    className="admin-refresh-btn"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >

                    <RefreshCw
                        size={18}
                        className={
                            refreshing ? "admin-orders-spin" : ""
                        }
                    />

                    {refreshing ? "Refreshing..." : "Refresh Orders"}

                </button>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {
                error && (

                    <div className="admin-orders-error">

                        <div className="admin-error-icon">
                            <AlertCircle size={22} />
                        </div>

                        <div>

                            <strong>Unable to load orders</strong>

                            <p>{error}</p>

                            <button onClick={() => fetchOrders(true)}>
                                Try Again
                            </button>

                        </div>

                    </div>

                )
            }


            {/* ==================================================
                EMPTY
            ================================================== */}

            {
                !error &&
                orders.length === 0 && (

                    <div className="admin-orders-empty">

                        <Package size={42} />

                        <h3>No orders yet</h3>

                        <p>Orders placed by customers will appear here.</p>

                    </div>

                )
            }


            {/* ==================================================
                ORDERS
            ================================================== */}

            {
                !error &&
                orders.length > 0 && (

                    <div className="admin-orders-list">

                        {
                            orders.map((order) => {

                                let currentStatus =
                                    order.order_status || "Pending";

                                let orderItems =
                                    Array.isArray(order.items)
                                        ? order.items
                                        : [];

                                let orderTotal =
                                    Number(order.total_amount);

                                if (!Number.isFinite(orderTotal)) {

                                    orderTotal =
                                        orderItems.reduce(
                                            (total, item) =>
                                                total + Number(item.subtotal || 0),
                                            0
                                        );

                                }

                                let customerName =
                                    order.customer_name ||
                                    order.shipping_name ||
                                    "Customer";

                                let customerPhone =
                                    order.customer_phone ||
                                    order.shipping_phone ||
                                    "Not available";

                                return (

                                    <article
                                        className="admin-order-card"
                                        key={order.order_id}
                                    >


                                        {/* ====================================
                                            ORDER TOP
                                        ==================================== */}

                                        <div className="admin-order-top">

                                            <div className="admin-order-meta">

                                                <div>

                                                    <span className="admin-order-label">
                                                        ORDER ID
                                                    </span>

                                                    <strong>#{order.order_id}</strong>

                                                </div>

                                                <div className="admin-order-divider" />

                                                <div>

                                                    <span className="admin-order-label">
                                                        ORDER DATE
                                                    </span>

                                                    <strong>
                                                        {formatDate(order.order_date)}
                                                    </strong>

                                                </div>

                                            </div>

                                            <div className="admin-order-actions">

                                                <span className={getStatusClass(currentStatus)}>

                                                    <CheckCircle2 size={15} />

                                                    {currentStatus}

                                                </span>

                                                <select
                                                    value={currentStatus}
                                                    disabled={
                                                        updatingOrder === order.order_id
                                                    }
                                                    onChange={(event) =>
                                                        updateOrderStatus(
                                                            order.order_id,
                                                            event.target.value
                                                        )
                                                    }
                                                >

                                                    <option value="Pending">Pending</option>
                                                    <option value="Confirmed">Confirmed</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>

                                                </select>

                                            </div>

                                        </div>


                                        {/* ====================================
                                            CUSTOMER INFORMATION
                                        ==================================== */}

                                        <div className="admin-order-info-grid">

                                            {/* CUSTOMER */}

                                            <div className="admin-order-info">

                                                <div className="admin-order-info-icon">
                                                    <User size={18} />
                                                </div>

                                                <div>
                                                    <span>CUSTOMER</span>
                                                    <strong>{customerName}</strong>
                                                    {
                                                        order.customer_email && (
                                                            <small>{order.customer_email}</small>
                                                        )
                                                    }
                                                </div>

                                            </div>


                                            {/* PHONE */}

                                            <div className="admin-order-info">

                                                <div className="admin-order-info-icon">
                                                    <Phone size={18} />
                                                </div>

                                                <div>
                                                    <span>PHONE</span>
                                                    <strong>{customerPhone}</strong>
                                                </div>

                                            </div>


                                            {/* SHIPPING */}

                                            <div className="admin-order-info">

                                                <div className="admin-order-info-icon">
                                                    <MapPin size={18} />
                                                </div>

                                                <div>
                                                    <span>SHIPPING ADDRESS</span>
                                                    <strong>{getShippingAddress(order)}</strong>
                                                </div>

                                            </div>


                                            {/* PAYMENT */}

                                            <div className="admin-order-info">

                                                <div className="admin-order-info-icon">
                                                    <CreditCard size={18} />
                                                </div>

                                                <div>
                                                    <span>PAYMENT</span>
                                                    <strong>
                                                        {order.payment_method || "COD"}
                                                    </strong>
                                                    <small>
                                                        {
                                                            order.payment_status ||
                                                            (
                                                                order.payment_method === "COD"
                                                                    ? "Pending"
                                                                    : "Paid"
                                                            )
                                                        }
                                                    </small>
                                                </div>

                                            </div>

                                        </div>


                                        {/* ====================================
                                            ITEMS
                                        ==================================== */}

                                        <div className="admin-order-items-section">

                                            <div className="admin-order-items-heading">

                                                <div>
                                                    <Package size={19} />
                                                    <strong>Order Items</strong>
                                                </div>

                                                <span>
                                                    {orderItems.length}
                                                    {
                                                        orderItems.length === 1
                                                            ? " product"
                                                            : " products"
                                                    }
                                                </span>

                                            </div>

                                            {
                                                orderItems.map((item) => {

                                                    let imageUrl =
                                                        getImageUrl(item.image);

                                                    return (

                                                        <div
                                                            className="admin-order-item"
                                                            key={item.order_item_id}
                                                        >

                                                            <div className="admin-product-image">

                                                                {
                                                                    imageUrl
                                                                        ? (
                                                                            <img
                                                                                src={imageUrl}
                                                                                alt={item.product_name}
                                                                            />
                                                                        )
                                                                        : (
                                                                            <Package size={25} />
                                                                        )
                                                                }

                                                            </div>

                                                            <div className="admin-product-details">

                                                                <strong>
                                                                    {
                                                                        item.product_name ||
                                                                        "Unnamed Product"
                                                                    }
                                                                </strong>

                                                                {
                                                                    item.brand && (
                                                                        <span>{item.brand}</span>
                                                                    )
                                                                }

                                                                <p>
                                                                    Quantity: <b>{item.quantity}</b>
                                                                    {
                                                                        item.size && (
                                                                            <>
                                                                                {"  •  Size: "}
                                                                                <b>{item.size}</b>
                                                                            </>
                                                                        )
                                                                    }
                                                                </p>

                                                                {
                                                                    item.shop_name && (

                                                                        <p className="admin-order-item-vendor">

                                                                            <Store size={12} />

                                                                            {item.shop_name}

                                                                        </p>

                                                                    )
                                                                }

                                                            </div>

                                                            <div className="admin-product-price">

                                                                <span>SUBTOTAL</span>

                                                                <strong>
                                                                    {formatCurrency(item.subtotal)}
                                                                </strong>

                                                            </div>

                                                        </div>

                                                    );

                                                })
                                            }

                                        </div>


                                        {/* ====================================
                                            ORDER TOTAL
                                        ==================================== */}

                                        <div className="admin-order-total">

                                            <span>Order Total</span>

                                            <strong>{formatCurrency(orderTotal)}</strong>

                                        </div>


                                    </article>

                                );

                            })
                        }

                    </div>

                )
            }

        </div>

    );

}


export default Orders;
