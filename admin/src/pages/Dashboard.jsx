import { useEffect, useState } from "react";
import {
    Users,
    Store,
    ShoppingCart,
    Wallet,
    Calendar,
    RefreshCw,
    ArrowUpRight
} from "lucide-react";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell
} from "recharts";

import { useNavigate } from "react-router-dom";


function StatCard({
    title,
    value,
    icon: Icon,
    type
}) {

    let iconClass = "stat-icon-purple";

    if (type === "green") {
        iconClass = "stat-icon-green";
    }

    if (type === "orange") {
        iconClass = "stat-icon-orange";
    }

    if (type === "blue") {
        iconClass = "stat-icon-blue";
    }

    return (
        <div className="dashboard-stat-card">

            <div className="stat-card-content">

                <div>
                    <p className="stat-card-title">
                        {title}
                    </p>

                    <h3 className="stat-card-value">
                        {value}
                    </h3>

                    <p className="stat-card-description">
                        Current platform count
                    </p>
                </div>

                <div className={`stat-card-icon ${iconClass}`}>
                    <Icon size={22} strokeWidth={2} />
                </div>

            </div>

        </div>
    );
}


function Dashboard() {

    let navigate = useNavigate();

    let [admin, setAdmin] = useState(null);

    let [loading, setLoading] = useState(true);

    let [stats, setStats] = useState({
        totalUsers: 0,
        totalVendors: 0,
        pendingVendors: 0,
        approvedVendors: 0
    });

    let [recentRegistrations, setRecentRegistrations] =
        useState([]);


    let salesData = [
        {
            name: "Jan",
            sales: 12000
        },
        {
            name: "Feb",
            sales: 18000
        },
        {
            name: "Mar",
            sales: 15000
        },
        {
            name: "Apr",
            sales: 24000
        },
        {
            name: "May",
            sales: 21000
        },
        {
            name: "Jun",
            sales: 29000
        }
    ];


    let categoryData = [
        {
            name: "Men",
            value: 40
        },
        {
            name: "Women",
            value: 30
        },
        {
            name: "Kids",
            value: 18
        },
        {
            name: "Accessories",
            value: 12
        }
    ];


    let COLORS = [
        "#6544ff",
        "#ec4899",
        "#84cc16",
        "#f97316"
    ];


    let formattedDate =
        new Date().toLocaleDateString(
            "en-GB",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    useEffect(() => {

        let storedAdmin =
            localStorage.getItem("admin");

        let token =
            localStorage.getItem("adminToken");


        if (!token) {

            navigate("/", {
                replace: true
            });

            return;

        }


        if (storedAdmin) {

            try {

                setAdmin(
                    JSON.parse(storedAdmin)
                );

            } catch (error) {

                console.error(
                    "Admin parse error:",
                    error
                );

            }

        }

    }, [navigate]);


    let fetchDashboardStats = async () => {

        try {

            let token =
                localStorage.getItem("adminToken");


            if (!token) {

                navigate("/");

                return;

            }


            let response =
                await fetch(
                    "https://orgos-backend-h7ad.onrender.com/api/admin/dashboard/stats",
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
                response.ok &&
                data.success
            ) {

                setStats({

                    totalUsers:
                        data.stats?.total_users ?? 0,

                    totalVendors:
                        data.stats?.total_vendors ?? 0,

                    pendingVendors:
                        data.stats?.pending_vendors ?? 0,

                    approvedVendors:
                        data.stats?.approved_vendors ?? 0

                });

            } else {

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

                    navigate("/");

                }

            }

        } catch (error) {

            console.error(
                "Dashboard Stats Error:",
                error
            );

        }

    };


    let fetchRecentRegistrations =
        async () => {

            try {

                let token =
                    localStorage.getItem(
                        "adminToken"
                    );


                if (!token) {
                    return;
                }


                let response =
                    await fetch(
                        "https://orgos-backend-h7ad.onrender.com/api/admin/recent-registrations",
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
                    response.ok &&
                    data.success
                ) {

                    setRecentRegistrations(
                        data.registrations || []
                    );

                }

            } catch (error) {

                console.error(
                    "Recent Registrations Error:",
                    error
                );

            }

        };


    let loadDashboard =
        async () => {

            setLoading(true);

            await Promise.all([
                fetchDashboardStats(),
                fetchRecentRegistrations()
            ]);

            setLoading(false);

        };


    useEffect(() => {

        loadDashboard();

    }, []);


    let formatDate = (date) => {

        if (!date) {
            return "-";
        }


        let parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "-";

        }


        return parsedDate.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    return (

        <div className="dashboard-page">


            {/* =================================
                WELCOME
            ================================= */}

            <div className="dashboard-welcome">

                <h2>

                    Welcome,{" "}

                    {admin?.name ||
                        "ORGOS Admin"}

                    👋

                </h2>

                <p>
                    Here is the latest update
                    for your ORGOS platform.
                </p>

            </div>


            {/* =================================
                KPI CARDS
            ================================= */}

            <div className="dashboard-stats-grid">

                <StatCard
                    title="TOTAL CUSTOMERS"
                    value={
                        loading
                            ? "..."
                            : stats.totalUsers
                    }
                    icon={Users}
                    type="purple"
                />


                <StatCard
                    title="TOTAL VENDORS"
                    value={
                        loading
                            ? "..."
                            : stats.totalVendors
                    }
                    icon={Store}
                    type="green"
                />


                <StatCard
                    title="PENDING VENDORS"
                    value={
                        loading
                            ? "..."
                            : stats.pendingVendors
                    }
                    icon={ShoppingCart}
                    type="orange"
                />


                <StatCard
                    title="APPROVED VENDORS"
                    value={
                        loading
                            ? "..."
                            : stats.approvedVendors
                    }
                    icon={Wallet}
                    type="blue"
                />

            </div>


            {/* =================================
                SALES + REGISTRATIONS
            ================================= */}

            <div className="dashboard-main-grid">


                {/* SALES */}

                <div className="dashboard-card sales-card">

                    <div className="dashboard-card-header">

                        <div>

                            <h3>
                                Sales Overview
                            </h3>

                            <p>
                                Monthly sales performance
                            </p>

                        </div>


                        <select>

                            <option>
                                This Year
                            </option>

                            <option>
                                This Month
                            </option>

                        </select>

                    </div>


                    <div className="sales-chart">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            <LineChart
                                data={salesData}
                            >

                                <CartesianGrid
                                    strokeDasharray="4 4"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey="name"
                                />

                                <YAxis />

                                <Tooltip />

                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#6544ff"
                                    strokeWidth={3}
                                    dot={{
                                        r: 4
                                    }}
                                />

                            </LineChart>

                        </ResponsiveContainer>

                    </div>

                </div>


                {/* RECENT REGISTRATIONS */}

                <div className="dashboard-card registrations-card">

                    <div className="dashboard-card-header">

                        <div>

                            <h3>
                                Recent Registrations
                            </h3>

                            <p>
                                Latest customers and vendors
                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                navigate("/users")
                            }
                        >
                            View All
                            <ArrowUpRight
                                size={15}
                            />
                        </button>

                    </div>


                    <div className="registrations-list">

                        {recentRegistrations.length === 0 ? (

                            <div className="empty-registration">

                                <Users
                                    size={30}
                                />

                                <span>
                                    No recent registrations
                                </span>

                            </div>

                        ) : (

                            recentRegistrations.map(
                                (item, index) => (

                                    <div
                                        className="registration-item"
                                        key={
                                            item.id ||
                                            index
                                        }
                                    >

                                        <div className="registration-avatar">

                                            {item.name
                                                ?.charAt(0)
                                                ?.toUpperCase() ||
                                                "U"}

                                        </div>


                                        <div className="registration-info">

                                            <strong>
                                                {item.name}
                                            </strong>

                                            <span>
                                                {item.type}
                                            </span>

                                        </div>


                                        <span className="registration-date">

                                            {formatDate(
                                                item.registered_at
                                            )}

                                        </span>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </div>

            </div>


            {/* =================================
                BOTTOM SECTION
            ================================= */}

            <div className="dashboard-bottom-grid">


                {/* CATEGORIES */}

                <div className="dashboard-card category-card">

                    <div className="dashboard-card-header">

                        <div>

                            <h3>
                                Top Categories
                            </h3>

                            <p>
                                Product distribution
                            </p>

                        </div>

                    </div>


                    <div className="category-chart">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            <PieChart>

                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    dataKey="value"
                                >

                                    {categoryData.map(
                                        (
                                            item,
                                            index
                                        ) => (

                                            <Cell
                                                key={index}
                                                fill={
                                                    COLORS[
                                                    index %
                                                    COLORS.length
                                                    ]
                                                }
                                            />

                                        )
                                    )}

                                </Pie>

                                <Tooltip />

                            </PieChart>

                        </ResponsiveContainer>

                    </div>


                    <div className="category-legend">

                        {categoryData.map(
                            (item, index) => (

                                <div
                                    className="category-legend-item"
                                    key={item.name}
                                >

                                    <span
                                        className="category-dot"
                                        style={{
                                            background:
                                                COLORS[
                                                index %
                                                COLORS.length
                                                ]
                                        }}
                                    />

                                    <span>
                                        {item.name}
                                    </span>

                                </div>

                            )
                        )}

                    </div>

                </div>


                {/* PLATFORM SUMMARY */}

                <div className="dashboard-card summary-card">

                    <div className="dashboard-card-header">

                        <div>

                            <h3>
                                Platform Summary
                            </h3>

                            <p>
                                Current ORGOS statistics
                            </p>

                        </div>

                    </div>


                    <div className="summary-list">

                        <div className="summary-row">

                            <span>
                                Total Customers
                            </span>

                            <strong>
                                {stats.totalUsers}
                            </strong>

                        </div>


                        <div className="summary-row">

                            <span>
                                Total Vendors
                            </span>

                            <strong>
                                {stats.totalVendors}
                            </strong>

                        </div>


                        <div className="summary-row">

                            <span>
                                Approved Vendors
                            </span>

                            <strong className="summary-green">
                                {stats.approvedVendors}
                            </strong>

                        </div>


                        <div className="summary-row">

                            <span>
                                Pending Vendors
                            </span>

                            <strong className="summary-orange">
                                {stats.pendingVendors}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* QUICK ACTIONS */}

                <div className="dashboard-card quick-card">

                    <div className="dashboard-card-header">

                        <div>

                            <h3>
                                Quick Actions
                            </h3>

                            <p>
                                Manage ORGOS easily
                            </p>

                        </div>

                    </div>


                    <div className="quick-actions">

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/vendors")
                            }
                        >

                            <Store
                                size={19}
                            />

                            Manage Vendors

                            <ArrowUpRight
                                size={16}
                            />

                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                navigate("/users")
                            }
                        >

                            <Users
                                size={19}
                            />

                            Manage Customers

                            <ArrowUpRight
                                size={16}
                            />

                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                navigate("/products")
                            }
                        >

                            <ShoppingCart
                                size={19}
                            />

                            Manage Products

                            <ArrowUpRight
                                size={16}
                            />

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}


export default Dashboard;