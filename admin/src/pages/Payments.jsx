import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    RefreshCw,
    AlertCircle,
    Search,
    CreditCard,
    Wallet,
    Smartphone,
    IndianRupee,
    CheckCircle2,
    Clock,
    XCircle,
    Package
} from "lucide-react";

import "./Payments.css";


function Payments() {

    // ======================================================
    // STATES
    // ======================================================

    let [payments, setPayments] = useState([]);

    let [stats, setStats] = useState({

        totalTransactions: 0,
        totalRevenue: 0,
        pendingCount: 0,
        successCount: 0,
        failedCount: 0,
        codCount: 0,
        onlineCount: 0

    });

    let [loading, setLoading] = useState(true);

    let [refreshing, setRefreshing] = useState(false);

    let [error, setError] = useState("");

    let [search, setSearch] = useState("");

    let [statusFilter, setStatusFilter] = useState("All");

    let [methodFilter, setMethodFilter] = useState("All");


    // ======================================================
    // FETCH PAYMENTS
    // ======================================================

    let fetchPayments = async (showLoader = true) => {

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
                    "https://orgos-backend-h7ad.onrender.com/api/admin/payments",
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

                setPayments(
                    Array.isArray(data.payments)
                        ? data.payments
                        : []
                );

                setStats(
                    data.stats || {

                        totalTransactions: 0,
                        totalRevenue: 0,
                        pendingCount: 0,
                        successCount: 0,
                        failedCount: 0,
                        codCount: 0,
                        onlineCount: 0

                    }
                );

            } else {

                setError(
                    data.message ||
                    "Failed to fetch payments"
                );

            }

        }

        catch (error) {

            console.error(
                "Fetch Admin Payments Error:",
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

        fetchPayments(true);

    }, []);


    // ======================================================
    // REFRESH
    // ======================================================

    let handleRefresh = () => {

        fetchPayments(false);

    };


    // ======================================================
    // FILTERED LIST
    // ======================================================

    let filteredPayments =
        useMemo(() => {

            return payments.filter((item) => {

                let matchesStatus =
                    statusFilter === "All" ||
                    (item.payment_status || "Pending").toLowerCase() ===
                    statusFilter.toLowerCase();

                let matchesMethod =
                    methodFilter === "All" ||
                    (item.payment_method || "").toUpperCase() ===
                    methodFilter.toUpperCase();

                let keyword =
                    search.trim().toLowerCase();

                let matchesSearch =
                    !keyword ||
                    [

                        item.transaction_id,

                        item.order_id,

                        item.customer_name,

                        item.customer_email

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase()
                        .includes(keyword);

                return (
                    matchesStatus &&
                    matchesMethod &&
                    matchesSearch
                );

            });

        }, [payments, statusFilter, methodFilter, search]);


    // ======================================================
    // FORMATTERS
    // ======================================================

    let formatDate = (date) => {

        if (!date) return "N/A";

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


    // ======================================================
    // METHOD ICON / LABEL
    // ======================================================

    let getMethodIcon = (method) => {

        let normalized =
            (method || "").toUpperCase();

        if (normalized === "COD") return Wallet;
        if (normalized === "UPI") return Smartphone;
        if (normalized === "CARD") return CreditCard;

        return IndianRupee;

    };

    let getMethodLabel = (method) => {

        let normalized =
            (method || "").toUpperCase();

        if (normalized === "COD") return "Cash on Delivery";
        if (normalized === "UPI") return "UPI";
        if (normalized === "CARD") return "Card";

        return normalized || "Unknown";

    };


    // ======================================================
    // STATUS BADGE
    // ======================================================

    let getStatusClass = (status) => {

        let normalized =
            (status || "Pending").toLowerCase();

        if (normalized === "success" || normalized === "paid") {
            return "admin-payment-status success";
        }

        if (normalized === "failed") {
            return "admin-payment-status failed";
        }

        return "admin-payment-status pending";

    };

    let getStatusIcon = (status) => {

        let normalized =
            (status || "Pending").toLowerCase();

        if (normalized === "success" || normalized === "paid") {
            return CheckCircle2;
        }

        if (normalized === "failed") {
            return XCircle;
        }

        return Clock;

    };


    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {

        return (

            <div className="admin-payments-page">

                <div className="admin-payments-loading">

                    <RefreshCw
                        size={32}
                        className="admin-payments-spin"
                    />

                    <h3>Loading payments...</h3>

                    <p>Fetching real transactions from ORGOS database.</p>

                </div>

            </div>

        );

    }


    // ======================================================
    // PAGE
    // ======================================================

    return (

        <div className="admin-payments-page">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="admin-payments-header">

                <div>

                    <h1>Payments</h1>

                    <p>
                        Every transaction exactly as it was
                        made at checkout — COD, UPI or Card.
                    </p>

                </div>

                <button
                    className="admin-payments-refresh"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >

                    <RefreshCw
                        size={18}
                        className={
                            refreshing ? "admin-payments-spin" : ""
                        }
                    />

                    {refreshing ? "Refreshing..." : "Refresh"}

                </button>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {
                error && (

                    <div className="admin-payments-error">

                        <AlertCircle size={22} />

                        <div>

                            <strong>Unable to load payments</strong>

                            <p>{error}</p>

                            <button onClick={() => fetchPayments(true)}>
                                Try Again
                            </button>

                        </div>

                    </div>

                )
            }


            {/* ==================================================
                STATS
            ================================================== */}

            <div className="admin-payments-stats">

                <div className="admin-payment-stat-card">

                    <div className="stat-icon revenue">
                        <IndianRupee size={20} />
                    </div>

                    <div>
                        <span>Total Revenue</span>
                        <strong>
                            {formatCurrency(stats.totalRevenue)}
                        </strong>
                    </div>

                </div>

                <div className="admin-payment-stat-card">

                    <div className="stat-icon total">
                        <CreditCard size={20} />
                    </div>

                    <div>
                        <span>Transactions</span>
                        <strong>{stats.totalTransactions}</strong>
                    </div>

                </div>

                <div className="admin-payment-stat-card">

                    <div className="stat-icon success">
                        <CheckCircle2 size={20} />
                    </div>

                    <div>
                        <span>Success</span>
                        <strong>{stats.successCount}</strong>
                    </div>

                </div>

                <div className="admin-payment-stat-card">

                    <div className="stat-icon pending">
                        <Clock size={20} />
                    </div>

                    <div>
                        <span>Pending</span>
                        <strong>{stats.pendingCount}</strong>
                    </div>

                </div>

                <div className="admin-payment-stat-card">

                    <div className="stat-icon failed">
                        <XCircle size={20} />
                    </div>

                    <div>
                        <span>Failed</span>
                        <strong>{stats.failedCount}</strong>
                    </div>

                </div>

            </div>


            {/* ==================================================
                FILTERS
            ================================================== */}

            <div className="admin-payments-filters">

                <div className="admin-payments-search">

                    <Search size={18} />

                    <input
                        type="text"
                        value={search}
                        onChange={
                            (event) => setSearch(event.target.value)
                        }
                        placeholder="Search transaction ID, order ID or customer..."
                    />

                </div>

                <select
                    value={statusFilter}
                    onChange={
                        (event) => setStatusFilter(event.target.value)
                    }
                >

                    <option value="All">All Status</option>
                    <option value="Success">Success</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>

                </select>

                <select
                    value={methodFilter}
                    onChange={
                        (event) => setMethodFilter(event.target.value)
                    }
                >

                    <option value="All">All Methods</option>
                    <option value="COD">Cash on Delivery</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>

                </select>

            </div>


            {/* ==================================================
                EMPTY
            ================================================== */}

            {
                !error &&
                filteredPayments.length === 0 && (

                    <div className="admin-payments-empty">

                        <Package size={42} />

                        <h3>No transactions found</h3>

                        <p>
                            Payments made by customers at
                            checkout will appear here.
                        </p>

                    </div>

                )
            }


            {/* ==================================================
                PAYMENTS TABLE
            ================================================== */}

            {
                !error &&
                filteredPayments.length > 0 && (

                    <div className="admin-payments-table-wrapper">

                        <table className="admin-payments-table">

                            <thead>

                                <tr>

                                    <th>Transaction</th>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Method</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>

                                </tr>

                            </thead>

                            <tbody>

                                {
                                    filteredPayments.map((item) => {

                                        let MethodIcon =
                                            getMethodIcon(
                                                item.payment_method
                                            );

                                        let StatusIcon =
                                            getStatusIcon(
                                                item.payment_status
                                            );

                                        return (

                                            <tr
                                                key={
                                                    item.payment_id ||
                                                    item.transaction_id
                                                }
                                            >

                                                <td>

                                                    <span className="admin-payment-txn">
                                                        {
                                                            item.transaction_id ||
                                                            "N/A"
                                                        }
                                                    </span>

                                                </td>

                                                <td>
                                                    #{item.order_id}
                                                </td>

                                                <td>

                                                    <div className="admin-payment-customer">

                                                        <strong>
                                                            {
                                                                item.customer_name ||
                                                                "Customer"
                                                            }
                                                        </strong>

                                                        {
                                                            item.customer_email && (
                                                                <small>
                                                                    {item.customer_email}
                                                                </small>
                                                            )
                                                        }

                                                    </div>

                                                </td>

                                                <td>

                                                    <span className="admin-payment-method">

                                                        <MethodIcon size={14} />

                                                        {
                                                            getMethodLabel(
                                                                item.payment_method
                                                            )
                                                        }

                                                    </span>

                                                </td>

                                                <td>

                                                    <strong>
                                                        {
                                                            formatCurrency(
                                                                item.amount
                                                            )
                                                        }
                                                    </strong>

                                                </td>

                                                <td>

                                                    <span className={getStatusClass(item.payment_status)}>

                                                        <StatusIcon size={13} />

                                                        {
                                                            item.payment_status ||
                                                            "Pending"
                                                        }

                                                    </span>

                                                </td>

                                                <td className="admin-payment-date">

                                                    {formatDate(item.order_date)}

                                                </td>

                                            </tr>

                                        );

                                    })
                                }

                            </tbody>

                        </table>

                    </div>

                )
            }

        </div>

    );

}


export default Payments;
