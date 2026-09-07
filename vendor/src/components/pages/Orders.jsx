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
    Loader2
} from "lucide-react";

import "./Orders.css";


function Orders({
    vendor
}) {

    // ======================================================
    // STATES
    // ======================================================

    let [
        orders,
        setOrders
    ] = useState([]);


    let [
        loading,
        setLoading
    ] = useState(true);


    let [
        refreshing,
        setRefreshing
    ] = useState(false);


    let [
        error,
        setError
    ] = useState("");


    let [
        updatingOrder,
        setUpdatingOrder
    ] = useState(null);


    // ======================================================
    // FETCH ORDERS
    // ======================================================

    let fetchOrders = async (
        showLoader = true
    ) => {

        try {

            if (showLoader) {

                setLoading(true);

            }

            else {

                setRefreshing(true);

            }


            setError("");


            let token =
                localStorage.getItem(
                    "vendorToken"
                );


            if (!token) {

                setError(
                    "Vendor session expired. Please login again."
                );

                return;

            }


            let response =
                await fetch(

                    "https://orgos-backend-h7ad.onrender.com/api/orders/vendor",

                    {

                        method:
                            "GET",

                        headers: {

                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`

                        }

                    }

                );


            let data =
                await response.json();


            console.log(
                "Vendor Orders API:",
                data
            );


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem(
                    "vendorToken"
                );

                localStorage.removeItem(
                    "vendor"
                );


                setError(
                    "Vendor session expired. Please login again."
                );

                return;

            }


            if (
                response.ok &&
                data.success
            ) {

                setOrders(
                    Array.isArray(
                        data.orders
                    )
                        ? data.orders
                        : []
                );

            }

            else {

                setError(

                    data.message ||
                    "Failed to fetch vendor orders"

                );

            }

        }

        catch (error) {

            console.error(
                "Fetch Vendor Orders Error:",
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

    let updateOrderStatus = async (
        orderVendorId,
        vendorStatus
    ) => {

        try {

            setUpdatingOrder(
                orderVendorId
            );


            let token =
                localStorage.getItem(
                    "vendorToken"
                );


            if (!token) {

                setError(
                    "Vendor session expired."
                );

                return;

            }


            let response =
                await fetch(

                    `https://orgos-backend-h7ad.onrender.com/api/orders/vendor/${orderVendorId}/status`,

                    {

                        method:
                            "PATCH",

                        headers: {

                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify({

                                vendor_status:
                                    vendorStatus

                            })

                    }

                );


            let data =
                await response.json();


            if (
                response.ok &&
                data.success
            ) {

                // Refresh REAL database data
                await fetchOrders(false);

            }

            else {

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


            alert(
                "Server connection failed"
            );

        }

        finally {

            setUpdatingOrder(
                null
            );

        }

    };


    // ======================================================
    // DATE FORMAT
    // ======================================================

    let formatDate = (
        date
    ) => {

        if (!date) {

            return "N/A";

        }


        let parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "N/A";

        }


        return parsedDate.toLocaleDateString(
            "en-IN",
            {

                day:
                    "2-digit",

                month:
                    "short",

                year:
                    "numeric"

            }

        );

    };


    // ======================================================
    // CURRENCY
    // ======================================================

    let formatCurrency = (
        amount
    ) => {

        return new Intl.NumberFormat(
            "en-IN",
            {

                style:
                    "currency",

                currency:
                    "INR",

                maximumFractionDigits:
                    2

            }

        ).format(
            Number(amount) || 0
        );

    };


    // ======================================================
    // ADDRESS
    // ======================================================

    let getShippingAddress = (
        order
    ) => {

        let parts = [];


        if (
            order.address_line
        ) {

            parts.push(
                order.address_line
            );

        }


        if (
            order.city
        ) {

            parts.push(
                order.city
            );

        }


        if (
            order.state
        ) {

            parts.push(
                order.state
            );

        }


        if (
            order.pincode
        ) {

            parts.push(
                order.pincode
            );

        }


        if (
            parts.length === 0
        ) {

            return "Not available";

        }


        return parts.join(
            ", "
        );

    };


    // ======================================================
    // STATUS CLASS
    // ======================================================

    let getStatusClass = (
        status
    ) => {

        if (
            status ===
            "Delivered"
        ) {

            return "vendor-order-status delivered";

        }


        if (
            status ===
            "Cancelled"
        ) {

            return "vendor-order-status cancelled";

        }


        if (
            status ===
            "Shipped"
        ) {

            return "vendor-order-status shipped";

        }


        if (
            status ===
            "Processing"
        ) {

            return "vendor-order-status processing";

        }


        return "vendor-order-status confirmed";

    };


    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {

        return (

            <div className="vendor-orders-page">

                <div className="vendor-orders-loading">

                    <Loader2
                        size={32}
                        className="vendor-orders-spinner"
                    />

                    <h3>
                        Loading orders...
                    </h3>

                    <p>
                        Fetching real orders from ORGOS database.
                    </p>

                </div>

            </div>

        );

    }


    // ======================================================
    // PAGE
    // ======================================================

    return (

        <div className="vendor-orders-page">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="vendor-orders-header">

                <div>

                    <h1>
                        Orders
                    </h1>

                    <p>
                        Manage orders received from ORGOS customers.
                    </p>

                </div>


                <button
                    className="vendor-refresh-btn"
                    onClick={
                        handleRefresh
                    }
                    disabled={
                        refreshing
                    }
                >

                    <RefreshCw
                        size={18}
                        className={
                            refreshing
                                ? "vendor-orders-spin"
                                : ""
                        }
                    />

                    {
                        refreshing
                            ? "Refreshing..."
                            : "Refresh Orders"
                    }

                </button>

            </div>



            {/* ==================================================
                ERROR
            ================================================== */}

            {
                error && (

                    <div className="vendor-orders-error">

                        <div className="vendor-error-icon">

                            <AlertCircle
                                size={22}
                            />

                        </div>


                        <div>

                            <strong>
                                Unable to load orders
                            </strong>

                            <p>
                                {error}
                            </p>

                            <button
                                onClick={() =>
                                    fetchOrders(true)
                                }
                            >
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

                    <div className="vendor-orders-empty">

                        <Package
                            size={42}
                        />

                        <h3>
                            No orders yet
                        </h3>

                        <p>
                            Orders placed by customers will appear here.
                        </p>

                    </div>

                )
            }



            {/* ==================================================
                ORDERS
            ================================================== */}

            {
                !error &&
                orders.length > 0 && (

                    <div className="vendor-orders-list">

                        {
                            orders.map(
                                (
                                    order
                                ) => {

                                    let currentStatus =
                                        order.vendor_status ||
                                        order.order_status ||
                                        "Confirmed";


                                    let orderItems =
                                        Array.isArray(
                                            order.items
                                        )
                                            ? order.items
                                            : [];


                                    let vendorTotal =
                                        Number(
                                            order.vendor_total
                                        );


                                    if (
                                        !Number.isFinite(
                                            vendorTotal
                                        )
                                    ) {

                                        vendorTotal =
                                            orderItems.reduce(
                                                (
                                                    total,
                                                    item
                                                ) =>
                                                    total +
                                                    Number(
                                                        item.subtotal
                                                        || 0
                                                    ),
                                                0
                                            );

                                    }


                                    return (

                                        <article
                                            className="vendor-order-card"
                                            key={
                                                order.order_vendor_id
                                            }
                                        >


                                            {/* ====================================
                                                ORDER TOP
                                            ==================================== */}

                                            <div className="vendor-order-top">

                                                <div className="vendor-order-meta">

                                                    <div>

                                                        <span className="vendor-order-label">
                                                            ORDER ID
                                                        </span>

                                                        <strong>
                                                            #{order.order_id}
                                                        </strong>

                                                    </div>


                                                    <div className="vendor-order-divider" />


                                                    <div>

                                                        <span className="vendor-order-label">
                                                            ORDER DATE
                                                        </span>

                                                        <strong>
                                                            {formatDate(
                                                                order.created_at
                                                            )}
                                                        </strong>

                                                    </div>

                                                </div>


                                                <div className="vendor-order-actions">

                                                    <span
                                                        className={
                                                            getStatusClass(
                                                                currentStatus
                                                            )
                                                        }
                                                    >

                                                        <CheckCircle2
                                                            size={15}
                                                        />

                                                        {currentStatus}

                                                    </span>


                                                    <select
                                                        value={
                                                            currentStatus
                                                        }

                                                        disabled={
                                                            updatingOrder ===
                                                            order.order_vendor_id
                                                        }

                                                        onChange={
                                                            (event) =>
                                                                updateOrderStatus(

                                                                    order.order_vendor_id,

                                                                    event.target.value

                                                                )
                                                        }
                                                    >

                                                        <option value="Confirmed">
                                                            Confirmed
                                                        </option>

                                                        <option value="Processing">
                                                            Processing
                                                        </option>

                                                        <option value="Shipped">
                                                            Shipped
                                                        </option>

                                                        <option value="Delivered">
                                                            Delivered
                                                        </option>

                                                        <option value="Cancelled">
                                                            Cancelled
                                                        </option>

                                                    </select>

                                                </div>

                                            </div>



                                            {/* ====================================
                                                CUSTOMER INFORMATION
                                            ==================================== */}

                                            <div className="vendor-order-info-grid">


                                                {/* CUSTOMER */}

                                                <div className="vendor-order-info">

                                                    <div className="vendor-order-info-icon">

                                                        <User
                                                            size={18}
                                                        />

                                                    </div>


                                                    <div>

                                                        <span>
                                                            CUSTOMER
                                                        </span>

                                                        <strong>

                                                            {
                                                                order.full_name ||
                                                                "Customer"
                                                            }

                                                        </strong>

                                                    </div>

                                                </div>



                                                {/* PHONE */}

                                                <div className="vendor-order-info">

                                                    <div className="vendor-order-info-icon">

                                                        <Phone
                                                            size={18}
                                                        />

                                                    </div>


                                                    <div>

                                                        <span>
                                                            PHONE
                                                        </span>

                                                        <strong>

                                                            {
                                                                order.phone ||
                                                                "Not available"
                                                            }

                                                        </strong>

                                                    </div>

                                                </div>



                                                {/* SHIPPING */}

                                                <div className="vendor-order-info">

                                                    <div className="vendor-order-info-icon">

                                                        <MapPin
                                                            size={18}
                                                        />

                                                    </div>


                                                    <div>

                                                        <span>
                                                            SHIPPING ADDRESS
                                                        </span>

                                                        <strong>

                                                            {
                                                                getShippingAddress(
                                                                    order
                                                                )
                                                            }

                                                        </strong>

                                                    </div>

                                                </div>



                                                {/* PAYMENT */}

                                                <div className="vendor-order-info">

                                                    <div className="vendor-order-info-icon">

                                                        <CreditCard
                                                            size={18}
                                                        />

                                                    </div>


                                                    <div>

                                                        <span>
                                                            PAYMENT
                                                        </span>

                                                        <strong>
                                                            {
                                                                order.payment_method ||
                                                                "COD"
                                                            }
                                                        </strong>

                                                        <small>
                                                            {
                                                                order.payment_method ===
                                                                    "COD"
                                                                    ? "Pending"
                                                                    : "Paid"
                                                            }
                                                        </small>

                                                    </div>

                                                </div>


                                            </div>



                                            {/* ====================================
                                                ITEMS
                                            ==================================== */}

                                            <div className="vendor-order-items-section">

                                                <div className="vendor-order-items-heading">

                                                    <div>

                                                        <Package
                                                            size={19}
                                                        />

                                                        <strong>
                                                            Order Items
                                                        </strong>

                                                    </div>


                                                    <span>
                                                        {
                                                            orderItems.length
                                                        }

                                                        {
                                                            orderItems.length ===
                                                                1
                                                                ? " product"
                                                                : " products"
                                                        }
                                                    </span>

                                                </div>



                                                {
                                                    orderItems.map(
                                                        (
                                                            item
                                                        ) => {

                                                            let imageUrl =
                                                                item.image
                                                                    ? item.image.startsWith(
                                                                        "http"
                                                                    )
                                                                        ? item.image
                                                                        : `https://orgos-backend-h7ad.onrender.com${item.image}`
                                                                    : "";


                                                            return (

                                                                <div
                                                                    className="vendor-order-item"
                                                                    key={
                                                                        item.order_item_id
                                                                    }
                                                                >


                                                                    <div className="vendor-product-image">

                                                                        {
                                                                            imageUrl
                                                                                ? (

                                                                                    <img
                                                                                        src={
                                                                                            imageUrl
                                                                                        }

                                                                                        alt={
                                                                                            item.product_name
                                                                                        }
                                                                                    />

                                                                                )
                                                                                : (

                                                                                    <Package
                                                                                        size={25}
                                                                                    />

                                                                                )
                                                                        }

                                                                    </div>



                                                                    <div className="vendor-product-details">

                                                                        <strong>
                                                                            {
                                                                                item.product_name ||
                                                                                "Unnamed Product"
                                                                            }
                                                                        </strong>


                                                                        {
                                                                            item.brand && (

                                                                                <span>
                                                                                    {
                                                                                        item.brand
                                                                                    }
                                                                                </span>

                                                                            )
                                                                        }


                                                                        <p>
                                                                            Quantity:{" "}

                                                                            <b>
                                                                                {
                                                                                    item.quantity
                                                                                }
                                                                            </b>

                                                                            {
                                                                                item.size && (
                                                                                    <>
                                                                                        {"  •  Size: "}
                                                                                        <b>
                                                                                            {
                                                                                                item.size
                                                                                            }
                                                                                        </b>
                                                                                    </>
                                                                                )
                                                                            }
                                                                        </p>

                                                                    </div>



                                                                    <div className="vendor-product-price">

                                                                        <span>
                                                                            SUBTOTAL
                                                                        </span>

                                                                        <strong>
                                                                            {
                                                                                formatCurrency(
                                                                                    item.subtotal
                                                                                )
                                                                            }
                                                                        </strong>

                                                                    </div>


                                                                </div>

                                                            );

                                                        }
                                                    )
                                                }

                                            </div>



                                            {/* ====================================
                                                ORDER TOTAL
                                            ==================================== */}

                                            <div className="vendor-order-total">

                                                <span>
                                                    Vendor Order Total
                                                </span>


                                                <strong>
                                                    {
                                                        formatCurrency(
                                                            vendorTotal
                                                        )
                                                    }
                                                </strong>

                                            </div>


                                        </article>

                                    );

                                }
                            )
                        }

                    </div>

                )
            }

        </div>

    );

}


export default Orders;