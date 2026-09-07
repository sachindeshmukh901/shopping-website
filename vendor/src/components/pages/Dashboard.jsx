import React, {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import API from "../../api/api";

import {
    Package,
    IndianRupee,
    Star,
    ShoppingCart,
    TrendingUp,
    Loader2,
    AlertCircle,
    RefreshCw,
    ClipboardList,
    ChevronRight
} from "lucide-react";


// ======================================================
// DASHBOARD
// ======================================================

export default function Dashboard({
    vendor
}) {

    let navigate =
        useNavigate();


    // ==================================================
    // STATES
    // ==================================================

    let [loading, setLoading] =
        useState(true);

    let [refreshing, setRefreshing] =
        useState(false);

    let [error, setError] =
        useState("");

    let [dashboardData, setDashboardData] =
        useState(null);

    let [vendorOrders, setVendorOrders] =
        useState([]);


    // ==================================================
    // FETCH DASHBOARD + REAL ORDERS
    // ==================================================

    let fetchDashboardData = async (
        showRefreshLoader = false
    ) => {

        try {

            if (showRefreshLoader) {

                setRefreshing(true);

            }

            else {

                setLoading(true);

            }


            setError("");


            // ==================================================
            // FETCH BOTH APIs
            // ==================================================

            let results =
                await Promise.allSettled([

                    API.get(
                        "/vendor/dashboard/stats"
                    ),

                    API.get(
                        "/orders/vendor"
                    )

                ]);


            // ==================================================
            // DASHBOARD API
            // ==================================================

            let dashboardResponse =
                results[0];

            let ordersResponse =
                results[1];


            // ==================================================
            // DASHBOARD DATA
            // ==================================================

            if (
                dashboardResponse.status ===
                "fulfilled"
            ) {

                let response =
                    dashboardResponse.value;


                console.log(
                    "Vendor Dashboard API:",
                    response.data
                );


                if (
                    response.data?.success
                ) {

                    setDashboardData(
                        response.data
                    );

                }

            }

            else {

                console.error(
                    "Dashboard API Error:",
                    dashboardResponse.reason
                );

            }


            // ==================================================
            // REAL VENDOR ORDERS
            // ==================================================

            if (
                ordersResponse.status ===
                "fulfilled"
            ) {

                let response =
                    ordersResponse.value;


                console.log(
                    "Vendor Orders API:",
                    response.data
                );


                if (
                    response.data?.success
                ) {

                    let orders =
                        Array.isArray(
                            response.data.orders
                        )
                            ? response.data.orders
                            : [];


                    setVendorOrders(
                        orders
                    );

                }

                else {

                    setVendorOrders(
                        []
                    );

                }

            }

            else {

                console.error(
                    "Vendor Orders API Error:",
                    ordersResponse.reason
                );

                setVendorOrders(
                    []
                );

            }


            // ==================================================
            // CHECK BOTH API FAILURE
            // ==================================================

            if (
                dashboardResponse.status ===
                "rejected" &&

                ordersResponse.status ===
                "rejected"
            ) {

                let dashboardError =
                    dashboardResponse.reason;

                setError(
                    dashboardError?.response?.data?.message ||
                    "Unable to load vendor dashboard."
                );

            }

        }

        catch (error) {

            console.error(
                "Dashboard Error:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Unable to load vendor dashboard."
            );

        }

        finally {

            setLoading(false);

            setRefreshing(false);

        }

    };


    // ==================================================
    // INITIAL LOAD
    // ==================================================

    useEffect(() => {

        fetchDashboardData();

    }, []);


    // ==================================================
    // VENDOR DATA
    // ==================================================

    let currentVendor =
        dashboardData?.vendor ||
        vendor ||
        {};


    let stats =
        dashboardData?.stats ||
        {};


    // ==================================================
    // BASIC VENDOR INFORMATION
    // ==================================================

    let shopName =
        currentVendor.shop_name ||
        currentVendor.shopName ||
        "ORGOS Vendor";


    let ownerName =
        currentVendor.owner_name ||
        currentVendor.ownerName ||
        currentVendor.name ||
        "Vendor";


    let email =
        currentVendor.email ||
        "Not available";


    let phone =
        currentVendor.phone ||
        currentVendor.mobile ||
        "Not available";


    let vendorId =
        currentVendor.vendor_id ||
        currentVendor.id ||
        null;


    let vendorStatus =
        currentVendor.status ||
        currentVendor.vendor_status ||
        "Active";


    // ==================================================
    // PRODUCTS
    // ==================================================

    let totalProducts =
        Number(
            stats.total_products ??
            currentVendor.total_products ??
            0
        );


    // ==================================================
    // REAL ORDER CALCULATIONS
    //
    // IMPORTANT:
    // Orders page already uses:
    //
    // GET /api/orders/vendor
    //
    // So dashboard will also use the same source.
    // ==================================================

    let totalOrders =
        vendorOrders.length;


    // ==================================================
    // ORDER STATUS CALCULATION
    // ==================================================

    let pendingOrders =
        vendorOrders.filter(
            (order) => {

                let status =
                    order.vendor_status ||
                    order.order_status ||
                    "Confirmed";


                return (
                    status !== "Delivered" &&
                    status !== "Cancelled"
                );

            }
        ).length;


    let completedOrders =
        vendorOrders.filter(
            (order) => {

                let status =
                    order.vendor_status ||
                    order.order_status ||
                    "";


                return (
                    status === "Delivered"
                );

            }
        ).length;


    // ==================================================
    // TOTAL SALES
    // ==================================================

    let orderSales =
        vendorOrders.reduce(
            (
                total,
                order
            ) => {

                let vendorTotal =
                    Number(
                        order.vendor_total
                    );


                if (
                    Number.isFinite(
                        vendorTotal
                    )
                ) {

                    return (
                        total +
                        vendorTotal
                    );

                }


                // ==========================================
                // FALLBACK TO ORDER ITEMS
                // ==========================================

                let items =
                    Array.isArray(
                        order.items
                    )
                        ? order.items
                        : [];


                let itemTotal =
                    items.reduce(
                        (
                            itemSum,
                            item
                        ) => {

                            return (
                                itemSum +
                                Number(
                                    item.subtotal ||
                                    0
                                )
                            );

                        },
                        0
                    );


                return (
                    total +
                    itemTotal
                );

            },
            0
        );


    // ==================================================
    // TOTAL SALES
    //
    // If real orders exist, calculate from orders.
    // Otherwise use dashboard API value.
    // ==================================================

    let totalSales =
        vendorOrders.length > 0

            ? orderSales

            : Number(
                stats.total_sales ??
                currentVendor.total_sales ??
                0
            );


    // ==================================================
    // RATING
    // ==================================================

    let rating =
        Number(
            stats.rating ??
            currentVendor.rating ??
            0
        );


    // ==================================================
    // CURRENCY FORMAT
    // ==================================================

    let formatCurrency = (
        amount
    ) => {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }
        ).format(
            Number(amount) || 0
        );

    };


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (

            <div
                className="
                    min-h-[calc(100vh-76px)]
                    flex
                    items-center
                    justify-center
                    p-6
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        items-center
                        gap-4
                    "
                >

                    <Loader2
                        className="
                            w-8
                            h-8
                            animate-spin
                            text-[#175c2e]
                        "
                    />


                    <p
                        className="
                            text-sm
                            font-semibold
                            text-gray-500
                        "
                    >
                        Loading vendor dashboard...
                    </p>

                </div>

            </div>

        );

    }


    // ==================================================
    // DASHBOARD
    // ==================================================

    return (

        <div
            className="
                p-4
                sm:p-6
                lg:p-8
                bg-[#f8faf8]
                min-h-[calc(100vh-76px)]
            "
        >

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <div
                    className="
                        mb-6
                        flex
                        items-center
                        justify-between
                        gap-3
                        bg-red-50
                        border
                        border-red-200
                        text-red-700
                        rounded-xl
                        px-4
                        py-3
                        text-sm
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <AlertCircle
                            className="
                                w-5
                                h-5
                                shrink-0
                            "
                        />

                        <span>
                            {error}
                        </span>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            fetchDashboardData(
                                true
                            )
                        }
                        className="
                            px-3
                            py-1.5
                            rounded-lg
                            bg-red-100
                            hover:bg-red-200
                            font-semibold
                            text-xs
                        "
                    >
                        Retry
                    </button>

                </div>

            )}


            {/* ==================================================
                HEADER
            ================================================== */}

            <div
                className="
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-4
                    mb-7
                "
            >

                <div>

                    <h2
                        className="
                            text-2xl
                            font-extrabold
                            text-gray-900
                        "
                    >
                        Welcome back, {ownerName}
                    </h2>


                    <p
                        className="
                            text-sm
                            text-gray-500
                            mt-1
                        "
                    >
                        Here's what's happening with {shopName} today.
                    </p>

                </div>


                <button
                    type="button"
                    disabled={
                        refreshing
                    }
                    onClick={() =>
                        fetchDashboardData(
                            true
                        )
                    }
                    className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        px-4
                        py-2.5
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        text-gray-700
                        text-sm
                        font-bold
                        hover:border-[#175c2e]/30
                        hover:text-[#175c2e]
                        transition-all
                        disabled:opacity-60
                    "
                >

                    <RefreshCw
                        className={`
                            w-4
                            h-4

                            ${refreshing
                                ? "animate-spin"
                                : ""
                            }
                        `}
                    />

                    Refresh

                </button>

            </div>


            {/* ==================================================
                KPI CARDS
            ================================================== */}

            <div
                className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    xl:grid-cols-4
                    gap-5
                    mb-7
                "
            >

                {/* ==================================================
                    TOTAL PRODUCTS
                ================================================== */}

                <DashboardCard
                    icon={Package}
                    title="Total Products"
                    value={
                        totalProducts
                    }
                    description="Products in your store"
                    onClick={() =>
                        navigate(
                            "/products"
                        )
                    }
                />


                {/* ==================================================
                    TOTAL ORDERS
                ================================================== */}

                <DashboardCard
                    icon={ShoppingCart}
                    title="Total Orders"
                    value={
                        totalOrders
                    }
                    description="Customer orders received"
                    onClick={() =>
                        navigate(
                            "/orders"
                        )
                    }
                />


                {/* ==================================================
                    TOTAL SALES
                ================================================== */}

                <DashboardCard
                    icon={IndianRupee}
                    title="Total Sales"
                    value={
                        formatCurrency(
                            totalSales
                        )
                    }
                    description="Total recorded sales"
                    onClick={() =>
                        navigate(
                            "/earnings"
                        )
                    }
                />


                {/* ==================================================
                    STORE RATING
                ================================================== */}

                <DashboardCard
                    icon={Star}
                    title="Store Rating"
                    value={
                        rating.toFixed(1)
                    }
                    description="Average vendor rating"
                />

            </div>


            {/* ==================================================
                MAIN GRID
            ================================================== */}

            <div
                className="
                    grid
                    grid-cols-1
                    xl:grid-cols-3
                    gap-6
                "
            >

                {/* ==================================================
                    STORE OVERVIEW
                ================================================== */}

                <div
                    className="
                        xl:col-span-2
                        bg-white
                        border
                        border-gray-200
                        rounded-[20px]
                        p-6
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            mb-6
                        "
                    >

                        <div>

                            <h3
                                className="
                                    text-base
                                    font-extrabold
                                    text-gray-900
                                "
                            >
                                Store Overview
                            </h3>


                            <p
                                className="
                                    text-xs
                                    text-gray-400
                                    mt-1
                                "
                            >
                                Your live vendor account information
                            </p>

                        </div>


                        <TrendingUp
                            className="
                                w-5
                                h-5
                                text-[#175c2e]
                            "
                        />

                    </div>


                    <div
                        className="
                            grid
                            grid-cols-1
                            sm:grid-cols-2
                            gap-4
                        "
                    >

                        <InfoBox
                            label="Shop Name"
                            value={
                                shopName
                            }
                        />


                        <InfoBox
                            label="Owner Name"
                            value={
                                ownerName
                            }
                        />


                        <InfoBox
                            label="Email"
                            value={
                                email
                            }
                        />


                        <InfoBox
                            label="Phone"
                            value={
                                phone
                            }
                        />


                        <InfoBox
                            label="Vendor ID"
                            value={
                                vendorId
                                    ? `#${vendorId}`
                                    : "Not available"
                            }
                        />


                        <InfoBox
                            label="Account Status"
                            value={
                                vendorStatus
                            }
                            status
                        />

                    </div>

                </div>


                {/* ==================================================
                    QUICK ACTIONS
                ================================================== */}

                <div
                    className="
                        bg-white
                        border
                        border-gray-200
                        rounded-[20px]
                        p-6
                    "
                >

                    <h3
                        className="
                            text-base
                            font-extrabold
                            text-gray-900
                        "
                    >
                        Quick Actions
                    </h3>


                    <p
                        className="
                            text-xs
                            text-gray-400
                            mt-1
                            mb-5
                        "
                    >
                        Manage your ORGOS store
                    </p>


                    <div
                        className="
                            space-y-3
                        "
                    >

                        {/* PRODUCTS */}

                        <QuickAction
                            icon={Package}
                            title="Manage Products"
                            description="Add, edit or remove products"
                            onClick={() =>
                                navigate(
                                    "/products"
                                )
                            }
                        />


                        {/* ORDERS */}

                        <QuickAction
                            icon={ShoppingCart}
                            title="View Orders"
                            description="Manage customer orders"
                            onClick={() =>
                                navigate(
                                    "/orders"
                                )
                            }
                        />


                        {/* EARNINGS */}

                        <QuickAction
                            icon={IndianRupee}
                            title="Earnings"
                            description="Track your vendor earnings"
                            onClick={() =>
                                navigate(
                                    "/earnings"
                                )
                            }
                        />

                    </div>

                </div>

            </div>


            {/* ==================================================
                ORDER SUMMARY
            ================================================== */}

            <div
                className="
                    mt-6
                    grid
                    grid-cols-1
                    md:grid-cols-3
                    gap-5
                "
            >

                {/* TOTAL ORDERS */}

                <SummaryCard
                    icon={ClipboardList}
                    title="Total Orders"
                    value={
                        totalOrders
                    }
                    onClick={() =>
                        navigate(
                            "/orders"
                        )
                    }
                />


                {/* PENDING ORDERS */}

                <SummaryCard
                    icon={Loader2}
                    title="Pending Orders"
                    value={
                        pendingOrders
                    }
                    onClick={() =>
                        navigate(
                            "/orders"
                        )
                    }
                />


                {/* COMPLETED ORDERS */}

                <SummaryCard
                    icon={Star}
                    title="Completed Orders"
                    value={
                        completedOrders
                    }
                    onClick={() =>
                        navigate(
                            "/orders"
                        )
                    }
                />

            </div>

        </div>

    );

}


// ======================================================
// DASHBOARD CARD
// ======================================================

function DashboardCard({
    icon: Icon,
    title,
    value,
    description,
    onClick
}) {

    return (

        <div
            onClick={
                onClick
            }
            className={`
                bg-white
                border
                border-gray-200
                rounded-[20px]
                p-5
                transition-all

                ${onClick
                    ? `
                            cursor-pointer
                            hover:-translate-y-0.5
                            hover:shadow-md
                            hover:border-[#175c2e]/30
                        `
                    : ""
                }
            `}
        >

            <div
                className="
                    flex
                    items-start
                    justify-between
                    gap-4
                "
            >

                <div>

                    <p
                        className="
                            text-xs
                            font-semibold
                            text-gray-400
                        "
                    >
                        {title}
                    </p>


                    <h3
                        className="
                            text-2xl
                            font-extrabold
                            text-gray-900
                            mt-2
                        "
                    >
                        {value}
                    </h3>


                    <p
                        className="
                            text-xs
                            text-gray-400
                            mt-2
                        "
                    >
                        {description}
                    </p>

                </div>


                <div
                    className="
                        w-11
                        h-11
                        rounded-xl
                        bg-[#175c2e]/10
                        flex
                        items-center
                        justify-center
                        shrink-0
                    "
                >

                    <Icon
                        className="
                            w-5
                            h-5
                            text-[#175c2e]
                        "
                    />

                </div>

            </div>

        </div>

    );

}


// ======================================================
// INFO BOX
// ======================================================

function InfoBox({
    label,
    value,
    status = false
}) {

    return (

        <div
            className="
                bg-gray-50
                border
                border-gray-100
                rounded-xl
                p-4
            "
        >

            <p
                className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-gray-400
                    mb-2
                "
            >
                {label}
            </p>


            {status ? (

                <span
                    className="
                        inline-flex
                        px-3
                        py-1
                        bg-green-100
                        text-green-700
                        rounded-full
                        text-xs
                        font-bold
                    "
                >
                    {value}
                </span>

            ) : (

                <p
                    className="
                        text-sm
                        font-bold
                        text-gray-800
                        break-words
                    "
                >
                    {value}
                </p>

            )}

        </div>

    );

}


// ======================================================
// QUICK ACTION
// ======================================================

function QuickAction({
    icon: Icon,
    title,
    description,
    onClick
}) {

    return (

        <button
            type="button"
            onClick={
                onClick
            }
            className="
                w-full
                flex
                items-center
                gap-3
                text-left
                border
                border-gray-100
                rounded-xl
                p-3
                hover:bg-gray-50
                hover:border-gray-200
                transition-all
            "
        >

            <div
                className="
                    w-10
                    h-10
                    rounded-xl
                    bg-[#175c2e]/10
                    flex
                    items-center
                    justify-center
                    shrink-0
                "
            >

                <Icon
                    className="
                        w-[18px]
                        h-[18px]
                        text-[#175c2e]
                    "
                />

            </div>


            <div
                className="
                    min-w-0
                    flex-1
                "
            >

                <p
                    className="
                        text-sm
                        font-bold
                        text-gray-800
                    "
                >
                    {title}
                </p>


                <p
                    className="
                        text-[11px]
                        text-gray-400
                        mt-0.5
                    "
                >
                    {description}
                </p>

            </div>


            <ChevronRight
                className="
                    w-4
                    h-4
                    text-gray-300
                    shrink-0
                "
            />

        </button>

    );

}


// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({
    icon: Icon,
    title,
    value,
    onClick
}) {

    return (

        <button
            type="button"
            onClick={
                onClick
            }
            className="
                w-full
                bg-white
                border
                border-gray-200
                rounded-[20px]
                p-5
                flex
                items-center
                gap-4
                text-left
                hover:shadow-md
                hover:border-[#175c2e]/30
                transition-all
            "
        >

            <div
                className="
                    w-11
                    h-11
                    rounded-xl
                    bg-[#175c2e]/10
                    flex
                    items-center
                    justify-center
                    shrink-0
                "
            >

                <Icon
                    className="
                        w-5
                        h-5
                        text-[#175c2e]
                    "
                />

            </div>


            <div>

                <p
                    className="
                        text-xs
                        font-semibold
                        text-gray-400
                    "
                >
                    {title}
                </p>


                <p
                    className="
                        text-xl
                        font-extrabold
                        text-gray-900
                        mt-1
                    "
                >
                    {value}
                </p>

            </div>

        </button>

    );

}