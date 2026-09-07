import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    RefreshCw,
    AlertCircle,
    Search,
    Plus,
    Trash2,
    Truck,
    Bike,
    Package,
    X,
    User,
    Phone
} from "lucide-react";

import "./Riders.css";


function Riders() {

    // ======================================================
    // STATES
    // ======================================================

    let [activeTab, setActiveTab] = useState("riders");

    let [riders, setRiders] = useState([]);

    let [deliveries, setDeliveries] = useState([]);

    let [loading, setLoading] = useState(true);

    let [refreshing, setRefreshing] = useState(false);

    let [error, setError] = useState("");

    let [search, setSearch] = useState("");

    let [showAddModal, setShowAddModal] = useState(false);

    let [newRiderName, setNewRiderName] = useState("");

    let [newRiderPhone, setNewRiderPhone] = useState("");

    let [saving, setSaving] = useState(false);

    let [deletingId, setDeletingId] = useState(null);

    let [assigningId, setAssigningId] = useState(null);


    // ======================================================
    // TOKEN HELPER
    // ======================================================

    let authHeaders = () => {

        let token =
            localStorage.getItem("adminToken");

        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        };

    };


    // ======================================================
    // FETCH RIDERS + DELIVERIES
    // ======================================================

    let fetchData = async (showLoader = true) => {

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

            let [ridersRes, deliveriesRes] =
                await Promise.all([

                    fetch(
                        "https://orgos-backend-l7mx.onrender.com/api/admin/riders",
                        {
                            method: "GET",
                            headers: authHeaders()
                        }
                    ),

                    fetch(
                        "https://orgos-backend-l7mx.onrender.com/api/admin/deliveries",
                        {
                            method: "GET",
                            headers: authHeaders()
                        }
                    )

                ]);

            let ridersData =
                await ridersRes.json();

            let deliveriesData =
                await deliveriesRes.json();

            if (
                ridersRes.status === 401 ||
                ridersRes.status === 403
            ) {

                localStorage.removeItem("adminToken");
                localStorage.removeItem("admin");

                setError(
                    "Admin session expired. Please login again."
                );

                return;

            }

            if (ridersRes.ok && ridersData.success) {

                setRiders(
                    Array.isArray(ridersData.riders)
                        ? ridersData.riders
                        : []
                );

            } else {

                setError(
                    ridersData.message ||
                    "Failed to fetch riders"
                );

            }

            if (deliveriesRes.ok && deliveriesData.success) {

                setDeliveries(
                    Array.isArray(deliveriesData.deliveries)
                        ? deliveriesData.deliveries
                        : []
                );

            }

        }

        catch (error) {

            console.error(
                "Fetch Riders Error:",
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

        fetchData(true);

    }, []);


    // ======================================================
    // ADD RIDER
    // ======================================================

    let handleAddRider = async (event) => {

        event.preventDefault();

        if (!newRiderName.trim() || !newRiderPhone.trim()) {

            alert("Rider name and phone are required");
            return;

        }

        try {

            setSaving(true);

            let response =
                await fetch(
                    "https://orgos-backend-l7mx.onrender.com/api/admin/riders",
                    {
                        method: "POST",
                        headers: authHeaders(),
                        body: JSON.stringify({
                            rider_name: newRiderName.trim(),
                            phone: newRiderPhone.trim()
                        })
                    }
                );

            let data = await response.json();

            if (response.ok && data.success) {

                setShowAddModal(false);
                setNewRiderName("");
                setNewRiderPhone("");

                await fetchData(false);

            }

            else {

                alert(
                    data.message ||
                    "Unable to add rider"
                );

            }

        }

        catch (error) {

            console.error(
                "Add Rider Error:",
                error
            );

            alert("Server connection failed");

        }

        finally {

            setSaving(false);

        }

    };


    // ======================================================
    // DELETE RIDER
    // ======================================================

    let handleDeleteRider = async (rider) => {

        let confirmed =
            window.confirm(
                `Remove rider "${rider.rider_name}"?`
            );

        if (!confirmed) return;

        try {

            setDeletingId(rider.rider_id);

            let response =
                await fetch(
                    `https://orgos-backend-l7mx.onrender.com/api/admin/riders/${rider.rider_id}`,
                    {
                        method: "DELETE",
                        headers: authHeaders()
                    }
                );

            let data = await response.json();

            if (response.ok && data.success) {

                await fetchData(false);

            }

            else {

                alert(
                    data.message ||
                    "Unable to remove rider"
                );

            }

        }

        catch (error) {

            console.error(
                "Delete Rider Error:",
                error
            );

            alert("Server connection failed");

        }

        finally {

            setDeletingId(null);

        }

    };


    // ======================================================
    // ASSIGN RIDER TO DELIVERY
    // ======================================================

    let handleAssignRider = async (orderId, riderId) => {

        if (!riderId) return;

        try {

            setAssigningId(orderId);

            let response =
                await fetch(
                    `https://orgos-backend-l7mx.onrender.com/api/admin/deliveries/${orderId}/assign`,
                    {
                        method: "PATCH",
                        headers: authHeaders(),
                        body: JSON.stringify({
                            rider_id: riderId
                        })
                    }
                );

            let data = await response.json();

            if (response.ok && data.success) {

                await fetchData(false);

            }

            else {

                alert(
                    data.message ||
                    "Unable to assign rider"
                );

            }

        }

        catch (error) {

            console.error(
                "Assign Rider Error:",
                error
            );

            alert("Server connection failed");

        }

        finally {

            setAssigningId(null);

        }

    };


    // ======================================================
    // FILTERED
    // ======================================================

    let filteredRiders =
        useMemo(() => {

            let keyword =
                search.trim().toLowerCase();

            if (!keyword) return riders;

            return riders.filter((item) =>
                [item.rider_name, item.phone]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase()
                    .includes(keyword)
            );

        }, [riders, search]);


    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {

        return (

            <div className="admin-riders-page">

                <div className="admin-riders-loading">

                    <RefreshCw
                        size={32}
                        className="admin-riders-spin"
                    />

                    <h3>Loading riders...</h3>

                </div>

            </div>

        );

    }


    // ======================================================
    // PAGE
    // ======================================================

    return (

        <div className="admin-riders-page">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="admin-riders-header">

                <div>

                    <h1>Riders</h1>

                    <p>Manage delivery riders and assign them to orders.</p>

                </div>

                <div className="admin-riders-header-actions">

                    <button
                        className="admin-riders-refresh"
                        onClick={() => fetchData(false)}
                        disabled={refreshing}
                    >

                        <RefreshCw
                            size={18}
                            className={
                                refreshing ? "admin-riders-spin" : ""
                            }
                        />

                        {refreshing ? "Refreshing..." : "Refresh"}

                    </button>

                    <button
                        className="admin-riders-add"
                        onClick={() => setShowAddModal(true)}
                    >

                        <Plus size={18} />

                        Add Rider

                    </button>

                </div>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {
                error && (

                    <div className="admin-riders-error">

                        <AlertCircle size={22} />

                        <div>

                            <strong>Something went wrong</strong>

                            <p>{error}</p>

                            <button onClick={() => fetchData(true)}>
                                Try Again
                            </button>

                        </div>

                    </div>

                )
            }


            {/* ==================================================
                TABS
            ================================================== */}

            <div className="admin-riders-tabs">

                <button
                    className={
                        activeTab === "riders" ? "active" : ""
                    }
                    onClick={() => setActiveTab("riders")}
                >

                    <Bike size={16} />

                    Riders ({riders.length})

                </button>

                <button
                    className={
                        activeTab === "deliveries" ? "active" : ""
                    }
                    onClick={() => setActiveTab("deliveries")}
                >

                    <Truck size={16} />

                    Deliveries ({deliveries.length})

                </button>

            </div>


            {/* ==================================================
                RIDERS TAB
            ================================================== */}

            {
                activeTab === "riders" && (

                    <>

                        <div className="admin-riders-search">

                            <Search size={18} />

                            <input
                                type="text"
                                value={search}
                                onChange={
                                    (event) => setSearch(event.target.value)
                                }
                                placeholder="Search rider name or phone..."
                            />

                        </div>

                        {
                            filteredRiders.length === 0 ? (

                                <div className="admin-riders-empty">

                                    <Bike size={40} />

                                    <h3>No riders yet</h3>

                                    <p>Add your first delivery rider to get started.</p>

                                </div>

                            ) : (

                                <div className="admin-riders-grid">

                                    {
                                        filteredRiders.map((rider) => (

                                            <div
                                                className="admin-rider-card"
                                                key={rider.rider_id}
                                            >

                                                <div className="admin-rider-avatar">
                                                    <User size={20} />
                                                </div>

                                                <div className="admin-rider-info">

                                                    <strong>
                                                        {rider.rider_name}
                                                    </strong>

                                                    <span>

                                                        <Phone size={12} />

                                                        {rider.phone}

                                                    </span>

                                                    <span className="admin-rider-count">
                                                        {rider.active_deliveries || 0} active {
                                                            rider.active_deliveries === 1
                                                                ? "delivery"
                                                                : "deliveries"
                                                        }
                                                    </span>

                                                </div>

                                                <button
                                                    className="admin-rider-delete"
                                                    disabled={
                                                        deletingId === rider.rider_id
                                                    }
                                                    onClick={() =>
                                                        handleDeleteRider(rider)
                                                    }
                                                >

                                                    <Trash2 size={16} />

                                                </button>

                                            </div>

                                        ))
                                    }

                                </div>

                            )
                        }

                    </>

                )
            }


            {/* ==================================================
                DELIVERIES TAB
            ================================================== */}

            {
                activeTab === "deliveries" && (

                    deliveries.length === 0 ? (

                        <div className="admin-riders-empty">

                            <Package size={40} />

                            <h3>No deliveries yet</h3>

                            <p>Orders will show up here once placed.</p>

                        </div>

                    ) : (

                        <div className="admin-deliveries-table-wrapper">

                            <table className="admin-deliveries-table">

                                <thead>

                                    <tr>

                                        <th>Order</th>
                                        <th>Customer</th>
                                        <th>Status</th>
                                        <th>Assigned Rider</th>
                                        <th>Assign</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {
                                        deliveries.map((item) => (

                                            <tr key={item.order_id}>

                                                <td>#{item.order_id}</td>

                                                <td>
                                                    {
                                                        item.customer_name ||
                                                        "Customer"
                                                    }
                                                </td>

                                                <td>

                                                    <span className="admin-delivery-status">
                                                        {
                                                            item.delivery_status ||
                                                            item.order_status ||
                                                            "Pending"
                                                        }
                                                    </span>

                                                </td>

                                                <td>
                                                    {
                                                        item.rider_name ||
                                                        "Unassigned"
                                                    }
                                                </td>

                                                <td>

                                                    <select
                                                        value=""
                                                        disabled={
                                                            assigningId === item.order_id
                                                        }
                                                        onChange={
                                                            (event) =>
                                                                handleAssignRider(
                                                                    item.order_id,
                                                                    event.target.value
                                                                )
                                                        }
                                                    >

                                                        <option value="" disabled>
                                                            Assign rider...
                                                        </option>

                                                        {
                                                            riders.map((rider) => (

                                                                <option
                                                                    key={rider.rider_id}
                                                                    value={rider.rider_id}
                                                                >
                                                                    {rider.rider_name}
                                                                </option>

                                                            ))
                                                        }

                                                    </select>

                                                </td>

                                            </tr>

                                        ))
                                    }

                                </tbody>

                            </table>

                        </div>

                    )

                )
            }


            {/* ==================================================
                ADD RIDER MODAL
            ================================================== */}

            {
                showAddModal && (

                    <div
                        className="admin-riders-modal-overlay"
                        onClick={() => setShowAddModal(false)}
                    >

                        <div
                            className="admin-riders-modal"
                            onClick={(event) => event.stopPropagation()}
                        >

                            <div className="admin-riders-modal-header">

                                <h3>Add New Rider</h3>

                                <button
                                    onClick={() => setShowAddModal(false)}
                                >
                                    <X size={18} />
                                </button>

                            </div>

                            <form onSubmit={handleAddRider}>

                                <label>Rider Name</label>

                                <input
                                    type="text"
                                    value={newRiderName}
                                    onChange={
                                        (event) =>
                                            setNewRiderName(event.target.value)
                                    }
                                    placeholder="e.g. Rahul Sharma"
                                    autoFocus
                                />

                                <label>Phone Number</label>

                                <input
                                    type="text"
                                    value={newRiderPhone}
                                    onChange={
                                        (event) =>
                                            setNewRiderPhone(event.target.value)
                                    }
                                    placeholder="e.g. 9876543210"
                                />

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="admin-riders-submit"
                                >

                                    {saving ? "Adding..." : "Add Rider"}

                                </button>

                            </form>

                        </div>

                    </div>

                )
            }

        </div>

    );

}


export default Riders;
