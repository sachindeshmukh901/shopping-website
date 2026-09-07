import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    RefreshCw,
    RotateCcw,
    User,
    Phone,
    Package,
    CreditCard,
    Store,
    Loader2,
    Search,
    Inbox
} from "lucide-react";

import "./Returns.css";


function Returns() {

    // ======================================================
    // STATES
    // ======================================================

    let [returns, setReturns] = useState([]);

    let [loading, setLoading] = useState(true);

    let [refreshing, setRefreshing] = useState(false);

    let [notice, setNotice] = useState("");

    let [updatingReturn, setUpdatingReturn] = useState(null);

    let [statusFilter, setStatusFilter] = useState("All");

    let [searchTerm, setSearchTerm] = useState("");


    // ======================================================
    // FETCH RETURNS
    // ======================================================

    let fetchReturns = async (showLoader = true) => {

        try {

            if (showLoader) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setNotice("");

            let token =
                localStorage.getItem("adminToken");

            if (!token) {

                setNotice(
                    "Admin session expired. Please login again."
                );

                setReturns([]);

                return;

            }

            let response =
                await fetch(
                    "https://orgos-backend-h7ad.onrender.com/api/admin/returns",
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

            let data = {};

            try {
                data = await response.json();
            } catch (parseError) {
                data = {};
            }

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem("adminToken");
                localStorage.removeItem("admin");

                setNotice(
                    "Admin session expired. Please login again."
                );

                setReturns([]);

                return;

            }

            if (response.ok && data.success) {

                setReturns(
                    Array.isArray(data.returns)
                        ? data.returns
                        : []
                );

            } else {

                // ==========================================
                // TREAT AS "NO DATA YET" INSTEAD OF AN ERROR
                // ==========================================
                //
                // Backend not reachable / route missing /
                // empty table -> just show nothing, no
                // alarming red banner.
                // ==========================================

                setReturns([]);

            }

        }

        catch (error) {

            console.error(
                "Fetch Admin Returns Error:",
                error
            );

            // Silently fall back to an empty state
            // instead of a scary error message.

            setReturns([]);

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

        fetchReturns(true);

    }, []);


    // ======================================================
    // REFRESH
    // ======================================================

    let handleRefresh = () => {

        fetchReturns(false);

    };


    // ======================================================
    // UPDATE RETURN STATUS
    // ======================================================

    let updateReturnStatus = async (returnId, newStatus) => {

        try {

            setUpdatingReturn(returnId);

            let token =
                localStorage.getItem("adminToken");

            if (!token) {
                setNotice("Admin session expired.");
                return;
            }

            let response =
                await fetch(
                    `https://orgos-backend-h7ad.onrender.com/api/admin/returns/${returnId}/status`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            status: newStatus
                        })
                    }
                );

            let data = await response.json();

            if (response.ok && data.success) {

                await fetchReturns(false);

            } else {

                alert(
                    data.message ||
                    "Unable to update return status"
                );

            }

        }

        catch (error) {

            console.error(
                "Update Return Status Error:",
                error
            );

            alert("Server connection failed");

        }

        finally {

            setUpdatingReturn(null);

        }

    };


    // ======================================================
    // HELPERS
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


    let getImageUrl = (image) => {

        if (!image) {
            return "";
        }

        return image.startsWith("http")
            ? image
            : `https://orgos-backend-h7ad.onrender.com${image}`;

    };


    let getStatusClass = (status) => {

        let normalized =
            String(status || "Pending")
                .toLowerCase()
                .replace(/\s+/g, "-");

        return `admin-return-status ${normalized}`;

    };


    // ======================================================
    // FILTERED LIST
    // ======================================================

    let filteredReturns = useMemo(() => {

        let list = Array.isArray(returns) ? returns : [];

        if (statusFilter !== "All") {

            list = list.filter(
                (item) =>
                    (item.status || "Pending") === statusFilter
            );

        }

        let term = searchTerm.trim().toLowerCase();

        if (term) {

            list = list.filter((item) => {

                let orderId =
                    String(item.order_id || "").toLowerCase();

                let returnId =
                    String(item.return_id || "").toLowerCase();

                let customer =
                    String(item.customer_name || "").toLowerCase();

                let shop =
                    String(item.shop_name || "").toLowerCase();

                return (
                    orderId.includes(term) ||
                    returnId.includes(term) ||
                    customer.includes(term) ||
                    shop.includes(term)
                );

            });

        }

        return list;

    }, [returns, statusFilter, searchTerm]);


    // ======================================================
    // STATUS TABS
    // ======================================================

    let statusTabs = [
        "All",
        "Pending",
        "Approved",
        "Picked Up",
        "Received",
        "Refunded",
        "Completed",
        "Rejected",
        "Cancelled"
    ];


    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {

        return (

            <div className="admin-returns-page">

                <div className="admin-returns-loading">

                    <Loader2
                        size={32}
                        className="admin-returns-spinner"
                    />

                    <h3>Loading returns...</h3>

                    <p>Fetching real return requests from ORGOS database.</p>

                </div>

            </div>

        );

    }


    // ======================================================
    // PAGE
    // ======================================================

    return (

        <div className="admin-returns-page">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="admin-returns-header">

                <div>

                    <h1>Returns</h1>

                    <p>Track and manage customer return &amp; refund requests across every vendor.</p>

                </div>

                <button
                    className="admin-refresh-btn"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >

                    <RefreshCw
                        size={18}
                        className={
                            refreshing ? "admin-returns-spin" : ""
                        }
                    />

                    {refreshing ? "Refreshing..." : "Refresh Returns"}

                </button>

            </div>


            {/* ==================================================
                NOTICE (session issue only — never a red error)
            ================================================== */}

            {
                notice && (

                    <div className="admin-returns-notice">

                        <span>{notice}</span>

                    </div>

                )
            }


            {/* ==================================================
                TOOLBAR
            ================================================== */}

            {
                returns.length > 0 && (

                    <div className="admin-returns-toolbar">

                        <div className="admin-returns-search">

                            <Search size={16} />

                            <input
                                type="text"
                                placeholder="Search by order, return ID, customer or shop..."
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                            />

                        </div>

                        <div className="admin-returns-tabs">

                            {
                                statusTabs.map((tab) => (

                                    <button
                                        key={tab}
                                        type="button"
                                        className={
                                            statusFilter === tab
                                                ? "admin-returns-tab active"
                                                : "admin-returns-tab"
                                        }
                                        onClick={() => setStatusFilter(tab)}
                                    >
                                        {tab}
                                    </button>

                                ))
                            }

                        </div>

                    </div>

                )
            }


            {/* ==================================================
                EMPTY — plain, neutral, no red anywhere
            ================================================== */}

            {
                returns.length === 0 && (

                    <div className="admin-returns-empty">

                        <Inbox size={42} />

                        <h3>No return requests yet</h3>

                        <p>Return &amp; refund requests raised by customers will appear here once available.</p>

                    </div>

                )
            }


            {
                returns.length > 0 &&
                filteredReturns.length === 0 && (

                    <div className="admin-returns-empty">

                        <RotateCcw size={42} />

                        <h3>No matching returns</h3>

                        <p>Try a different filter or search term.</p>

                    </div>

                )
            }


            {/* ==================================================
                RETURNS LIST
            ================================================== */}

            {
                filteredReturns.length > 0 && (

                    <div className="admin-returns-list">

                        {
                            filteredReturns.map((item) => {

                                let currentStatus =
                                    item.status || "Pending";

                                let returnItems =
                                    Array.isArray(item.items)
                                        ? item.items
                                        : [];

                                return (

                                    <article
                                        className="admin-return-card"
                                        key={item.return_id}
                                    >


                                        {/* ====================================
                                            TOP
                                        ==================================== */}

                                        <div className="admin-return-top">

                                            <div className="admin-return-meta">

                                                <div>

                                                    <span className="admin-return-label">
                                                        RETURN ID
                                                    </span>

                                                    <strong>#{item.return_id}</strong>

                                                </div>

                                                <div className="admin-return-divider" />

                                                <div>

                                                    <span className="admin-return-label">
                                                        ORDER ID
                                                    </span>

                                                    <strong>#{item.order_id}</strong>

                                                </div>

                                                <div className="admin-return-divider" />

                                                <div>

                                                    <span className="admin-return-label">
                                                        REQUESTED ON
                                                    </span>

                                                    <strong>
                                                        {formatDate(item.created_at)}
                                                    </strong>

                                                </div>

                                            </div>

                                            <div className="admin-return-actions">

                                                <span className={getStatusClass(currentStatus)}>
                                                    <RotateCcw size={14} />
                                                    {currentStatus}
                                                </span>

                                                <select
                                                    value={currentStatus}
                                                    disabled={
                                                        updatingReturn === item.return_id
                                                    }
                                                    onChange={(event) =>
                                                        updateReturnStatus(
                                                            item.return_id,
                                                            event.target.value
                                                        )
                                                    }
                                                >

                                                    <option value="Pending">Pending</option>
                                                    <option value="Approved">Approved</option>
                                                    <option value="Picked Up">Picked Up</option>
                                                    <option value="Received">Received</option>
                                                    <option value="Refunded">Refunded</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Rejected">Rejected</option>
                                                    <option value="Cancelled">Cancelled</option>

                                                </select>

                                            </div>

                                        </div>


                                        {/* ====================================
                                            INFO GRID
                                        ==================================== */}

                                        <div className="admin-return-info-grid">

                                            <div className="admin-return-info">

                                                <div className="admin-return-info-icon">
                                                    <User size={18} />
                                                </div>

                                                <div>
                                                    <span>CUSTOMER</span>
                                                    <strong>
                                                        {item.customer_name || "Customer"}
                                                    </strong>
                                                    {
                                                        item.customer_email && (
                                                            <small>{item.customer_email}</small>
                                                        )
                                                    }
                                                </div>

                                            </div>


                                            <div className="admin-return-info">

                                                <div className="admin-return-info-icon">
                                                    <Phone size={18} />
                                                </div>

                                                <div>
                                                    <span>PHONE</span>
                                                    <strong>
                                                        {item.customer_phone || "Not available"}
                                                    </strong>
                                                </div>

                                            </div>


                                            <div className="admin-return-info">

                                                <div className="admin-return-info-icon">
                                                    <Store size={18} />
                                                </div>

                                                <div>
                                                    <span>VENDOR</span>
                                                    <strong>
                                                        {item.shop_name || "Unknown Vendor"}
                                                    </strong>
                                                    {
                                                        item.owner_name && (
                                                            <small>{item.owner_name}</small>
                                                        )
                                                    }
                                                </div>

                                            </div>


                                            <div className="admin-return-info">

                                                <div className="admin-return-info-icon">
                                                    <CreditCard size={18} />
                                                </div>

                                                <div>
                                                    <span>REFUND AMOUNT</span>
                                                    <strong>
                                                        {formatCurrency(item.refund_amount)}
                                                    </strong>
                                                    <small>
                                                        {item.payment_method || "COD"}
                                                    </small>
                                                </div>

                                            </div>

                                        </div>


                                        {/* ====================================
                                            REASON
                                        ==================================== */}

                                        <div className="admin-return-reason">

                                            <span>REASON</span>

                                            <strong>
                                                {item.reason || "Not specified"}
                                            </strong>

                                            {
                                                item.description && (
                                                    <p>{item.description}</p>
                                                )
                                            }

                                        </div>


                                        {/* ====================================
                                            ITEMS
                                        ==================================== */}

                                        {
                                            returnItems.length > 0 && (

                                                <div className="admin-return-items-section">

                                                    <div className="admin-return-items-heading">

                                                        <div>
                                                            <Package size={19} />
                                                            <strong>Returned Products</strong>
                                                        </div>

                                                        <span>
                                                            {returnItems.length}
                                                            {
                                                                returnItems.length === 1
                                                                    ? " product"
                                                                    : " products"
                                                            }
                                                        </span>

                                                    </div>

                                                    {
                                                        returnItems.map((product) => {

                                                            let imageUrl =
                                                                getImageUrl(product.image);

                                                            return (

                                                                <div
                                                                    className="admin-return-item"
                                                                    key={product.order_item_id}
                                                                >

                                                                    <div className="admin-return-product-image">

                                                                        {
                                                                            imageUrl
                                                                                ? (
                                                                                    <img
                                                                                        src={imageUrl}
                                                                                        alt={product.product_name}
                                                                                    />
                                                                                )
                                                                                : (
                                                                                    <Package size={25} />
                                                                                )
                                                                        }

                                                                    </div>

                                                                    <div className="admin-return-product-details">

                                                                        <strong>
                                                                            {
                                                                                product.product_name ||
                                                                                "Unnamed Product"
                                                                            }
                                                                        </strong>

                                                                        {
                                                                            product.brand && (
                                                                                <span>{product.brand}</span>
                                                                            )
                                                                        }

                                                                        <p>
                                                                            Quantity: <b>{product.quantity}</b>
                                                                        </p>

                                                                    </div>

                                                                    <div className="admin-return-product-price">

                                                                        <span>SUBTOTAL</span>

                                                                        <strong>
                                                                            {formatCurrency(product.subtotal)}
                                                                        </strong>

                                                                    </div>

                                                                </div>

                                                            );

                                                        })
                                                    }

                                                </div>

                                            )
                                        }

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


export default Returns;
