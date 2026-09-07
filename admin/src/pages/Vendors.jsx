import {
    Store,
    Users,
    Clock3,
    CheckCircle2,
    XCircle,
    Search,
    RefreshCw
} from "lucide-react";

import {
    useEffect,
    useState
} from "react";

import { useNavigate } from "react-router-dom";


function Vendors() {

    let navigate = useNavigate();


    let [vendors, setVendors] = useState([]);

    let [loading, setLoading] = useState(true);

    let [error, setError] = useState("");

    let [search, setSearch] = useState("");

    let [filter, setFilter] = useState("All");

    let [actionLoading, setActionLoading] =
        useState(null);



    // =========================================
    // FETCH ALL VENDORS
    // =========================================

    let fetchVendors = async () => {

        try {

            setLoading(true);

            setError("");


            let token =
                localStorage.getItem(
                    "adminToken"
                );


            if (!token) {

                navigate("/", {
                    replace: true
                });

                return;

            }


            let response =
                await fetch(
                    "https://orgos-backend-h7ad.onrender.com/api/admin/vendors",
                    {
                        method: "GET",

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


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem(
                    "adminToken"
                );

                localStorage.removeItem(
                    "admin"
                );

                navigate("/", {
                    replace: true
                });

                return;

            }


            if (
                response.ok &&
                data.success
            ) {

                setVendors(
                    data.vendors || []
                );

            } else {

                setError(
                    data.message ||
                    "Failed to fetch vendors"
                );

            }

        } catch (error) {

            console.error(
                "Fetch Vendors Error:",
                error
            );

            setError(
                "Unable to connect with server"
            );

        } finally {

            setLoading(false);

        }

    };



    useEffect(() => {

        fetchVendors();

    }, []);



    // =========================================
    // UPDATE VENDOR STATUS
    // =========================================

    let updateVendorStatus = async (
        vendorId,
        status
    ) => {

        try {

            let token =
                localStorage.getItem(
                    "adminToken"
                );


            setActionLoading(
                vendorId
            );


            let endpoint =
                status === "Approved"
                    ? "approve"
                    : "reject";


            let response =
                await fetch(
                    `https://orgos-backend-h7ad.onrender.com/api/admin/vendors/${vendorId}/${endpoint}`,
                    {
                        method: "PUT",

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


            if (
                response.ok &&
                data.success
            ) {

                await fetchVendors();

            } else {

                alert(
                    data.message ||
                    "Unable to update vendor"
                );

            }

        } catch (error) {

            console.error(
                "Update Vendor Error:",
                error
            );

            alert(
                "Server connection failed"
            );

        } finally {

            setActionLoading(null);

        }

    };



    // =========================================
    // COUNTS
    // =========================================

    let totalVendors =
        vendors.length;


    let pendingVendors =
        vendors.filter(
            (vendor) =>
                vendor.status === "Pending"
        ).length;


    let approvedVendors =
        vendors.filter(
            (vendor) =>
                vendor.status === "Approved"
        ).length;


    let rejectedVendors =
        vendors.filter(
            (vendor) =>
                vendor.status === "Rejected"
        ).length;



    // =========================================
    // FILTER
    // =========================================

    let filteredVendors =
        vendors.filter((vendor) => {

            let searchText =
                search
                    .toLowerCase()
                    .trim();


            let matchesSearch =

                !searchText ||

                vendor.shop_name
                    ?.toLowerCase()
                    .includes(searchText) ||

                vendor.owner_name
                    ?.toLowerCase()
                    .includes(searchText) ||

                vendor.email
                    ?.toLowerCase()
                    .includes(searchText) ||

                vendor.phone
                    ?.toLowerCase()
                    .includes(searchText) ||

                vendor.city
                    ?.toLowerCase()
                    .includes(searchText);


            let matchesFilter =

                filter === "All" ||
                vendor.status === filter;


            return (
                matchesSearch &&
                matchesFilter
            );

        });



    // =========================================
    // DATE FORMAT
    // =========================================

    let formatDate = (date) => {

        if (!date) {
            return "N/A";
        }


        let value =
            new Date(date);


        if (
            Number.isNaN(
                value.getTime()
            )
        ) {

            return "N/A";

        }


        return value.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };



    // =========================================
    // RENDER
    // =========================================

    return (

        <div className="page-container">


            {/* =================================
                HEADER
            ================================= */}

            <div className="page-heading-row">

                <div>


                </div>


                <button
                    type="button"
                    className="outline-button"
                    onClick={fetchVendors}
                    disabled={loading}
                >

                    <RefreshCw
                        size={15}
                    />

                    {loading
                        ? "Refreshing..."
                        : "Refresh"}

                </button>

            </div>



            {/* =================================
                KPI CARDS
            ================================= */}

            <div className="stats-grid four">


                {/* TOTAL */}

                <div
                    className="kpi-card"
                    onClick={() =>
                        setFilter("All")
                    }
                    style={{
                        cursor: "pointer"
                    }}
                >

                    <div className="kpi-content">

                        <span className="kpi-title">
                            TOTAL VENDORS
                        </span>

                        <span className="kpi-value">
                            {loading
                                ? "—"
                                : totalVendors}
                        </span>

                        <span className="kpi-subtitle">
                            All registered vendors
                        </span>

                    </div>


                    <div className="kpi-icon purple">

                        <Store
                            size={22}
                        />

                    </div>

                </div>



                {/* APPROVED */}

                <div
                    className="kpi-card"
                    onClick={() =>
                        setFilter("Approved")
                    }
                    style={{
                        cursor: "pointer"
                    }}
                >

                    <div className="kpi-content">

                        <span className="kpi-title">
                            APPROVED
                        </span>

                        <span className="kpi-value">
                            {loading
                                ? "—"
                                : approvedVendors}
                        </span>

                        <span className="kpi-subtitle">
                            Approved vendors
                        </span>

                    </div>


                    <div className="kpi-icon success">

                        <CheckCircle2
                            size={22}
                        />

                    </div>

                </div>



                {/* PENDING */}

                <div
                    className="kpi-card"
                    onClick={() =>
                        setFilter("Pending")
                    }
                    style={{
                        cursor: "pointer"
                    }}
                >

                    <div className="kpi-content">

                        <span className="kpi-title">
                            PENDING
                        </span>

                        <span className="kpi-value">
                            {loading
                                ? "—"
                                : pendingVendors}
                        </span>

                        <span className="kpi-subtitle">
                            Waiting for approval
                        </span>

                    </div>


                    <div className="kpi-icon orange">

                        <Clock3
                            size={22}
                        />

                    </div>

                </div>



                {/* REJECTED */}

                <div
                    className="kpi-card"
                    onClick={() =>
                        setFilter("Rejected")
                    }
                    style={{
                        cursor: "pointer"
                    }}
                >

                    <div className="kpi-content">

                        <span className="kpi-title">
                            REJECTED
                        </span>

                        <span className="kpi-value">
                            {loading
                                ? "—"
                                : rejectedVendors}
                        </span>

                        <span className="kpi-subtitle">
                            Rejected vendors
                        </span>

                    </div>


                    <div className="kpi-icon red">

                        <XCircle
                            size={22}
                        />

                    </div>

                </div>

            </div>



            {/* =================================
                ERROR
            ================================= */}

            {error && (

                <div className="page-error">

                    {error}

                </div>

            )}



            {/* =================================
                VENDOR TABLE
            ================================= */}

            <div className="table-card">


                {/* HEADER */}

                <div className="table-card-header">

                    <div>

                        <h2>
                            Vendors
                            {" "}
                            ({filteredVendors.length})
                        </h2>

                        <p>
                            View and manage vendor
                            accounts.
                        </p>

                    </div>


                    <div className="vendor-table-controls">


                        {/* SEARCH */}

                        <div className="table-search">

                            <Search
                                size={18}
                            />

                            <input
                                type="text"
                                placeholder="Search vendors..."
                                value={search}
                                onChange={
                                    (event) =>
                                        setSearch(
                                            event.target.value
                                        )
                                }
                            />

                        </div>


                        {/* FILTER */}

                        <select
                            className="vendor-filter"
                            value={filter}
                            onChange={
                                (event) =>
                                    setFilter(
                                        event.target.value
                                    )
                            }
                        >

                            <option value="All">
                                All
                            </option>

                            <option value="Pending">
                                Pending
                            </option>

                            <option value="Approved">
                                Approved
                            </option>

                            <option value="Rejected">
                                Rejected
                            </option>

                        </select>

                    </div>

                </div>



                {/* LOADING */}

                {loading ? (

                    <div className="table-empty">

                        Loading vendors...

                    </div>

                ) : filteredVendors.length === 0 ? (

                    <div className="table-empty">

                        <Store
                            size={34}
                        />

                        <p>
                            No vendors found
                        </p>

                    </div>

                ) : (

                    <div className="table-scroll">

                        <table className="admin-table">


                            <thead>

                                <tr>

                                    <th>
                                        VENDOR
                                    </th>

                                    <th>
                                        CONTACT
                                    </th>

                                    <th>
                                        LOCATION
                                    </th>

                                    <th>
                                        PRODUCTS
                                    </th>

                                    <th>
                                        SALES
                                    </th>

                                    <th>
                                        STATUS
                                    </th>

                                    <th>
                                        ACTION
                                    </th>

                                </tr>

                            </thead>



                            <tbody>

                                {filteredVendors.map(
                                    (vendor) => {

                                        let isPending =
                                            vendor.status ===
                                            "Pending";


                                        let isApproved =
                                            vendor.status ===
                                            "Approved";


                                        return (

                                            <tr
                                                key={
                                                    vendor.vendor_id
                                                }
                                            >


                                                {/* VENDOR */}

                                                <td>

                                                    <div className="vendor-cell">

                                                        <div className="vendor-avatar">

                                                            <Store
                                                                size={20}
                                                            />

                                                        </div>


                                                        <div>

                                                            <strong>
                                                                {
                                                                    vendor.shop_name ||
                                                                    "Unnamed Shop"
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    vendor.owner_name ||
                                                                    "Owner not available"
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>



                                                {/* CONTACT */}

                                                <td>

                                                    <div className="table-primary">

                                                        {
                                                            vendor.email ||
                                                            "N/A"
                                                        }

                                                    </div>

                                                    <div className="table-secondary">

                                                        {
                                                            vendor.phone ||
                                                            "N/A"
                                                        }

                                                    </div>

                                                </td>



                                                {/* LOCATION */}

                                                <td>

                                                    <div className="table-primary">

                                                        {
                                                            vendor.city ||
                                                            "N/A"
                                                        }

                                                    </div>

                                                    <div className="table-secondary">

                                                        {
                                                            vendor.state ||
                                                            ""
                                                        }

                                                    </div>

                                                </td>



                                                {/* PRODUCTS */}

                                                <td>

                                                    <strong>

                                                        {
                                                            Number(
                                                                vendor.total_products ||
                                                                0
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )
                                                        }

                                                    </strong>

                                                </td>



                                                {/* SALES */}

                                                <td>

                                                    <strong>

                                                        ₹
                                                        {
                                                            Number(
                                                                vendor.total_sales ||
                                                                0
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )
                                                        }

                                                    </strong>

                                                </td>



                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={
                                                            `status-badge ${isApproved
                                                                ? "active"
                                                                : isPending
                                                                    ? "pending"
                                                                    : "inactive"
                                                            }`
                                                        }
                                                    >

                                                        {
                                                            vendor.status ||
                                                            "Unknown"
                                                        }

                                                    </span>

                                                </td>



                                                {/* ACTION */}

                                                <td>

                                                    <div className="vendor-actions">


                                                        {isPending && (

                                                            <>

                                                                <button
                                                                    type="button"
                                                                    className="table-action success"
                                                                    disabled={
                                                                        actionLoading ===
                                                                        vendor.vendor_id
                                                                    }
                                                                    onClick={() =>
                                                                        updateVendorStatus(
                                                                            vendor.vendor_id,
                                                                            "Approved"
                                                                        )
                                                                    }
                                                                >

                                                                    <CheckCircle2
                                                                        size={15}
                                                                    />

                                                                    {
                                                                        actionLoading ===
                                                                            vendor.vendor_id
                                                                            ? "Updating..."
                                                                            : "Approve"
                                                                    }

                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    className="table-action danger"
                                                                    disabled={
                                                                        actionLoading ===
                                                                        vendor.vendor_id
                                                                    }
                                                                    onClick={() =>
                                                                        updateVendorStatus(
                                                                            vendor.vendor_id,
                                                                            "Rejected"
                                                                        )
                                                                    }
                                                                >

                                                                    <XCircle
                                                                        size={15}
                                                                    />

                                                                    Reject

                                                                </button>

                                                            </>

                                                        )}



                                                        {isApproved && (

                                                            <button
                                                                type="button"
                                                                className="table-action danger"
                                                                disabled={
                                                                    actionLoading ===
                                                                    vendor.vendor_id
                                                                }
                                                                onClick={() =>
                                                                    updateVendorStatus(
                                                                        vendor.vendor_id,
                                                                        "Rejected"
                                                                    )
                                                                }
                                                            >

                                                                <XCircle
                                                                    size={15}
                                                                />

                                                                {
                                                                    actionLoading ===
                                                                        vendor.vendor_id
                                                                        ? "Updating..."
                                                                        : "Reject"
                                                                }

                                                            </button>

                                                        )}



                                                        {!isPending &&
                                                            !isApproved && (

                                                                <button
                                                                    type="button"
                                                                    className="table-action success"
                                                                    disabled={
                                                                        actionLoading ===
                                                                        vendor.vendor_id
                                                                    }
                                                                    onClick={() =>
                                                                        updateVendorStatus(
                                                                            vendor.vendor_id,
                                                                            "Approved"
                                                                        )
                                                                    }
                                                                >

                                                                    <CheckCircle2
                                                                        size={15}
                                                                    />

                                                                    {
                                                                        actionLoading ===
                                                                            vendor.vendor_id
                                                                            ? "Updating..."
                                                                            : "Approve"
                                                                    }

                                                                </button>

                                                            )}

                                                    </div>

                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>



            {/* =================================
                VENDOR SUMMARY
            ================================= */}

            <div className="content-card">

                <div className="content-card-header">

                    <div>

                        <h2>
                            Vendor Overview
                        </h2>

                        <p>
                            Quick summary of vendor
                            registrations.
                        </p>

                    </div>


                    <Users
                        size={21}
                        className="card-header-icon"
                    />

                </div>


                <div className="vendor-summary-grid">


                    <div className="vendor-summary-item">

                        <div className="summary-icon purple">

                            <Store
                                size={19}
                            />

                        </div>

                        <div>

                            <strong>
                                Total Vendors
                            </strong>

                            <span>
                                All registered vendors
                            </span>

                        </div>

                        <b>
                            {totalVendors}
                        </b>

                    </div>



                    <div className="vendor-summary-item">

                        <div className="summary-icon green">

                            <CheckCircle2
                                size={19}
                            />

                        </div>

                        <div>

                            <strong>
                                Approved
                            </strong>

                            <span>
                                Active vendor accounts
                            </span>

                        </div>

                        <b>
                            {approvedVendors}
                        </b>

                    </div>



                    <div className="vendor-summary-item">

                        <div className="summary-icon orange">

                            <Clock3
                                size={19}
                            />

                        </div>

                        <div>

                            <strong>
                                Pending
                            </strong>

                            <span>
                                Awaiting approval
                            </span>

                        </div>

                        <b>
                            {pendingVendors}
                        </b>

                    </div>



                    <div className="vendor-summary-item">

                        <div className="summary-icon red">

                            <XCircle
                                size={19}
                            />

                        </div>

                        <div>

                            <strong>
                                Rejected
                            </strong>

                            <span>
                                Rejected vendor accounts
                            </span>

                        </div>

                        <b>
                            {rejectedVendors}
                        </b>

                    </div>

                </div>

            </div>


        </div>

    );

}


export default Vendors;