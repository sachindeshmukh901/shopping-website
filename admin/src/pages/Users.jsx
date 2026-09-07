import {
    Users as UsersIcon,
    UserCheck,
    UserX,
    Search,
    RefreshCw,
    ShieldCheck,
    Mail,
    Phone
} from "lucide-react";

import {
    useEffect,
    useState
} from "react";

import { useNavigate } from "react-router-dom";


function Users() {

    let navigate = useNavigate();


    let [users, setUsers] = useState([]);

    let [loading, setLoading] = useState(true);

    let [error, setError] = useState("");

    let [search, setSearch] = useState("");

    let [filter, setFilter] = useState("All");

    let [actionLoading, setActionLoading] =
        useState(null);



    // =========================================
    // FETCH USERS
    // =========================================

    let fetchUsers = async () => {

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
                    "https://orgos-backend-l7mx.onrender.com/api/admin/users",
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

                setUsers(
                    data.users || []
                );

            } else {

                setError(
                    data.message ||
                    "Failed to fetch users"
                );

            }

        } catch (error) {

            console.error(
                "Fetch Users Error:",
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

        fetchUsers();

    }, []);



    // =========================================
    // BLOCK / UNBLOCK USER
    // =========================================

    let updateUserStatus = async (
        userId,
        status
    ) => {

        try {

            let token =
                localStorage.getItem(
                    "adminToken"
                );


            setActionLoading(userId);


            let endpoint =
                status === "Blocked"
                    ? "block"
                    : "unblock";


            let response =
                await fetch(
                    `https://orgos-backend-l7mx.onrender.com/api/admin/users/${userId}/${endpoint}`,
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

                await fetchUsers();

            } else {

                alert(
                    data.message ||
                    "Unable to update user"
                );

            }

        } catch (error) {

            console.error(
                "Update User Error:",
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

    let totalUsers =
        users.length;


    let activeUsers =
        users.filter(
            (user) =>
                user.status === "Active"
        ).length;


    let blockedUsers =
        users.filter(
            (user) =>
                user.status === "Blocked"
        ).length;


    let otherUsers =
        users.filter(
            (user) =>
                user.status !== "Active" &&
                user.status !== "Blocked"
        ).length;



    // =========================================
    // FILTER USERS
    // =========================================

    let filteredUsers =
        users.filter((user) => {

            let searchText =
                search
                    .toLowerCase()
                    .trim();


            let matchesSearch =

                !searchText ||

                user.full_name
                    ?.toLowerCase()
                    .includes(searchText) ||

                user.email
                    ?.toLowerCase()
                    .includes(searchText) ||

                user.phone
                    ?.toLowerCase()
                    .includes(searchText) ||

                user.city
                    ?.toLowerCase()
                    .includes(searchText) ||

                user.state
                    ?.toLowerCase()
                    .includes(searchText);


            let matchesFilter =

                filter === "All" ||
                user.status === filter;


            return (
                matchesSearch &&
                matchesFilter
            );

        });



    // =========================================
    // FORMAT DATE
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
    // INITIALS
    // =========================================

    let getInitials = (name) => {

        if (!name) {
            return "U";
        }


        let parts =
            name
                .trim()
                .split(" ")
                .filter(Boolean);


        if (parts.length === 1) {

            return parts[0]
                .substring(0, 2)
                .toUpperCase();

        }


        return (
            parts[0][0] +
            parts[parts.length - 1][0]
        ).toUpperCase();

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
                    onClick={fetchUsers}
                    disabled={loading}
                >

                    <RefreshCw
                        size={17}
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
                            TOTAL CUSTOMERS
                        </span>

                        <span className="kpi-value">
                            {loading
                                ? "—"
                                : totalUsers}
                        </span>

                        <span className="kpi-subtitle">
                            All registered customers
                        </span>

                    </div>


                    <div className="kpi-icon purple">

                        <UsersIcon
                            size={22}
                        />

                    </div>

                </div>



                {/* ACTIVE */}

                <div
                    className="kpi-card"
                    onClick={() =>
                        setFilter("Active")
                    }
                    style={{
                        cursor: "pointer"
                    }}
                >

                    <div className="kpi-content">

                        <span className="kpi-title">
                            ACTIVE
                        </span>

                        <span className="kpi-value">
                            {loading
                                ? "—"
                                : activeUsers}
                        </span>

                        <span className="kpi-subtitle">
                            Active customer accounts
                        </span>

                    </div>


                    <div className="kpi-icon success">

                        <UserCheck
                            size={22}
                        />

                    </div>

                </div>



                {/* BLOCKED */}

                <div
                    className="kpi-card"
                    onClick={() =>
                        setFilter("Blocked")
                    }
                    style={{
                        cursor: "pointer"
                    }}
                >

                    <div className="kpi-content">

                        <span className="kpi-title">
                            BLOCKED
                        </span>

                        <span className="kpi-value">
                            {loading
                                ? "—"
                                : blockedUsers}
                        </span>

                        <span className="kpi-subtitle">
                            Blocked accounts
                        </span>

                    </div>


                    <div className="kpi-icon red">

                        <UserX
                            size={22}
                        />

                    </div>

                </div>



                {/* OTHER */}

                <div className="kpi-card">

                    <div className="kpi-content">

                        <span className="kpi-title">
                            OTHER STATUS
                        </span>

                        <span className="kpi-value">
                            {loading
                                ? "—"
                                : otherUsers}
                        </span>

                        <span className="kpi-subtitle">
                            Other account statuses
                        </span>

                    </div>


                    <div className="kpi-icon orange">

                        <ShieldCheck
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
                USERS TABLE
            ================================= */}

            <div className="table-card">


                {/* TABLE HEADER */}

                <div className="table-card-header">

                    <div>

                        <h2>
                            Customers
                            {" "}
                            ({filteredUsers.length})
                        </h2>

                        <p>
                            View and manage customer
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
                                placeholder="Search customers..."
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

                            <option value="Active">
                                Active
                            </option>

                            <option value="Blocked">
                                Blocked
                            </option>

                        </select>

                    </div>

                </div>



                {/* LOADING */}

                {loading ? (

                    <div className="table-empty">

                        Loading customers...

                    </div>

                ) : filteredUsers.length === 0 ? (

                    <div className="table-empty">

                        <UsersIcon
                            size={36}
                        />

                        <p>
                            No customers found
                        </p>

                    </div>

                ) : (

                    <div className="table-scroll">

                        <table className="admin-table">


                            <thead>

                                <tr>

                                    <th>
                                        CUSTOMER
                                    </th>

                                    <th>
                                        CONTACT
                                    </th>

                                    <th>
                                        LOCATION
                                    </th>

                                    <th>
                                        GENDER
                                    </th>

                                    <th>
                                        JOINED
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

                                {filteredUsers.map(
                                    (user) => {

                                        let isBlocked =
                                            user.status ===
                                            "Blocked";


                                        return (

                                            <tr
                                                key={
                                                    user.user_id
                                                }
                                            >


                                                {/* CUSTOMER */}

                                                <td>

                                                    <div className="vendor-cell">

                                                        <div className="vendor-avatar">

                                                            {
                                                                user.profile_image
                                                                    ? (
                                                                        <img
                                                                            src={
                                                                                user.profile_image.startsWith(
                                                                                    "http"
                                                                                )
                                                                                    ? user.profile_image
                                                                                    : `https://orgos-backend-l7mx.onrender.com${user.profile_image}`
                                                                            }
                                                                            alt={
                                                                                user.full_name ||
                                                                                "Customer"
                                                                            }
                                                                        />
                                                                    )
                                                                    : (
                                                                        <span>
                                                                            {
                                                                                getInitials(
                                                                                    user.full_name
                                                                                )
                                                                            }
                                                                        </span>
                                                                    )
                                                            }

                                                        </div>


                                                        <div>

                                                            <strong>
                                                                {
                                                                    user.full_name ||
                                                                    "Unnamed Customer"
                                                                }
                                                            </strong>

                                                            <span>
                                                                ID #
                                                                {
                                                                    user.user_id
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>



                                                {/* CONTACT */}

                                                <td>

                                                    <div className="contact-info">

                                                        <div className="table-primary">

                                                            <Mail
                                                                size={14}
                                                            />

                                                            {
                                                                user.email ||
                                                                "N/A"
                                                            }

                                                        </div>


                                                        <div className="table-secondary">

                                                            <Phone
                                                                size={14}
                                                            />

                                                            {
                                                                user.phone ||
                                                                "N/A"
                                                            }

                                                        </div>

                                                    </div>

                                                </td>



                                                {/* LOCATION */}

                                                <td>

                                                    <div className="table-primary">

                                                        {
                                                            user.city ||
                                                            "N/A"
                                                        }

                                                    </div>

                                                    <div className="table-secondary">

                                                        {
                                                            user.state ||
                                                            ""
                                                        }

                                                        {
                                                            user.pincode
                                                                ? ` - ${user.pincode}`
                                                                : ""
                                                        }

                                                    </div>

                                                </td>



                                                {/* GENDER */}

                                                <td>

                                                    {
                                                        user.gender ||
                                                        "N/A"
                                                    }

                                                </td>



                                                {/* JOINED */}

                                                <td>

                                                    {
                                                        formatDate(
                                                            user.created_at
                                                        )
                                                    }

                                                </td>



                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={
                                                            `status-badge ${isBlocked
                                                                ? "inactive"
                                                                : "active"
                                                            }`
                                                        }
                                                    >

                                                        {
                                                            user.status ||
                                                            "Unknown"
                                                        }

                                                    </span>

                                                </td>



                                                {/* ACTION */}

                                                <td>

                                                    <div className="vendor-actions">


                                                        {isBlocked ? (

                                                            <button
                                                                type="button"
                                                                className="table-action success"
                                                                disabled={
                                                                    actionLoading ===
                                                                    user.user_id
                                                                }
                                                                onClick={() =>
                                                                    updateUserStatus(
                                                                        user.user_id,
                                                                        "Active"
                                                                    )
                                                                }
                                                            >

                                                                <UserCheck
                                                                    size={15}
                                                                />

                                                                {
                                                                    actionLoading ===
                                                                        user.user_id
                                                                        ? "Updating..."
                                                                        : "Unblock"
                                                                }

                                                            </button>

                                                        ) : (

                                                            <button
                                                                type="button"
                                                                className="table-action danger"
                                                                disabled={
                                                                    actionLoading ===
                                                                    user.user_id
                                                                }
                                                                onClick={() =>
                                                                    updateUserStatus(
                                                                        user.user_id,
                                                                        "Blocked"
                                                                    )
                                                                }
                                                            >

                                                                <UserX
                                                                    size={15}
                                                                />

                                                                {
                                                                    actionLoading ===
                                                                        user.user_id
                                                                        ? "Updating..."
                                                                        : "Block"
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
                CUSTOMER OVERVIEW
            ================================= */}

            <div className="content-card">

                <div className="content-card-header">

                    <div>

                        <h2>
                            Customer Overview
                        </h2>

                        <p>
                            Quick summary of customer
                            account status.
                        </p>

                    </div>


                    <UsersIcon
                        size={21}
                        className="card-header-icon"
                    />

                </div>


                <div className="vendor-summary-grid">


                    <div className="vendor-summary-item">

                        <div className="summary-icon purple">

                            <UsersIcon
                                size={19}
                            />

                        </div>

                        <div>

                            <strong>
                                Total Customers
                            </strong>

                            <span>
                                All registered users
                            </span>

                        </div>

                        <b>
                            {totalUsers}
                        </b>

                    </div>



                    <div className="vendor-summary-item">

                        <div className="summary-icon green">

                            <UserCheck
                                size={19}
                            />

                        </div>

                        <div>

                            <strong>
                                Active Customers
                            </strong>

                            <span>
                                Currently active accounts
                            </span>

                        </div>

                        <b>
                            {activeUsers}
                        </b>

                    </div>



                    <div className="vendor-summary-item">

                        <div className="summary-icon red">

                            <UserX
                                size={19}
                            />

                        </div>

                        <div>

                            <strong>
                                Blocked Customers
                            </strong>

                            <span>
                                Restricted accounts
                            </span>

                        </div>

                        <b>
                            {blockedUsers}
                        </b>

                    </div>



                    <div className="vendor-summary-item">

                        <div className="summary-icon orange">

                            <ShieldCheck
                                size={19}
                            />

                        </div>

                        <div>

                            <strong>
                                Other Status
                            </strong>

                            <span>
                                Other account states
                            </span>

                        </div>

                        <b>
                            {otherUsers}
                        </b>

                    </div>

                </div>

            </div>


        </div>

    );

}


export default Users;