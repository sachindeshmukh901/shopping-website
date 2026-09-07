import React, {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import API from "../../api/api";

import brandLogo from "../../assets/logo.png";

import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    IndianRupee,
    BarChart3,
    Star,
    RotateCcw,
    Bell,
    Settings,
    LogOut,
    Menu,
    X,
    TrendingUp,
    Store,
    User,
    Loader2,
    AlertCircle
} from "lucide-react";


export default function Dashboard({
    vendor,
    onLogout
}) {

    let navigate = useNavigate();


    // ==========================================
    // STATES
    // ==========================================

    let [sidebarOpen, setSidebarOpen] =
        useState(false);

    let [loading, setLoading] =
        useState(true);

    let [error, setError] =
        useState("");

    let [dashboardData, setDashboardData] =
        useState(null);


    // ==========================================
    // GET REAL DASHBOARD DATA
    // ==========================================

    let fetchDashboardData = async () => {

        try {

            setLoading(true);

            setError("");


            let response =
                await API.get(
                    "/vendor/dashboard/stats"
                );


            console.log(
                "Vendor Dashboard Response:",
                response.data
            );


            if (response.data.success) {

                setDashboardData(
                    response.data
                );

            }

            else {

                setError(
                    response.data.message ||
                    "Unable to load dashboard."
                );

            }

        }

        catch (error) {

            console.error(
                "Vendor Dashboard Error:",
                error
            );


            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {

                setError(
                    error.response?.data?.message ||
                    "Your vendor session is no longer valid."
                );

            }

            else {

                setError(
                    error.response?.data?.message ||
                    "Unable to load vendor dashboard."
                );

            }

        }

        finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchDashboardData();

    }, []);


    // ==========================================
    // VENDOR DATA
    // ==========================================

    let currentVendor =
        dashboardData?.vendor ||
        vendor ||
        {};


    let stats =
        dashboardData?.stats ||
        {};


    let totalProducts =
        Number(
            stats.total_products ??
            currentVendor.total_products ??
            0
        );


    let totalSales =
        Number(
            stats.total_sales ??
            currentVendor.total_sales ??
            0
        );


    let rating =
        Number(
            stats.rating ??
            currentVendor.rating ??
            0
        );


    let shopName =
        currentVendor.shop_name ||
        "ORGOS Vendor";


    let ownerName =
        currentVendor.owner_name ||
        "Vendor";


    // ==========================================
    // FORMAT CURRENCY
    // ==========================================

    let formatCurrency = (amount) => {

        return new Intl.NumberFormat(
            "en-GB",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }
        ).format(
            Number(amount) || 0
        );

    };


    // ==========================================
    // LOGOUT
    // ==========================================

    let handleLogout = () => {

        setSidebarOpen(false);


        if (onLogout) {

            onLogout();

            return;

        }


        localStorage.removeItem(
            "vendorToken"
        );

        localStorage.removeItem(
            "vendor"
        );


        navigate(
            "/",
            {
                replace: true
            }
        );

    };


    // ==========================================
    // NAVIGATE
    // ==========================================

    let goToDashboard = () => {

        setSidebarOpen(false);

        navigate("/dashboard");

    };


    let goToProducts = () => {

        setSidebarOpen(false);

        navigate("/products");

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div
                className="
                    min-h-screen
                    bg-[#f7f8fc]
                    flex
                    items-center
                    justify-center
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


    return (

        <div
            className="
                min-h-screen
                bg-[#f7f8fc]
                text-gray-900
            "
        >


            {/* ======================================
                MOBILE OVERLAY
            ====================================== */}

            {sidebarOpen && (

                <div

                    onClick={() =>
                        setSidebarOpen(false)
                    }

                    className="
                        fixed
                        inset-0
                        bg-black/40
                        z-40
                        lg:hidden
                    "

                />

            )}


            {/* ======================================
                SIDEBAR
            ====================================== */}

            <aside
                className={`
                    fixed
                    top-0
                    left-0
                    bottom-0
                    z-50

                    w-[260px]

                    bg-white

                    border-r
                    border-gray-200

                    flex
                    flex-col

                    transition-transform
                    duration-300

                    ${
                        sidebarOpen

                            ? "translate-x-0"

                            : "-translate-x-full lg:translate-x-0"
                    }
                `}
            >


                {/* LOGO */}

                <div
                    className="
                        h-[76px]
                        px-6
                        flex
                        items-center
                        justify-between
                        border-b
                        border-gray-100
                    "
                >

                    <button

                        onClick={goToDashboard}

                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <img

                            src={brandLogo}

                            alt="ORGOS"

                            className="
                                h-10
                                w-auto
                                object-contain
                            "

                        />

                    </button>


                    <button

                        onClick={() =>
                            setSidebarOpen(false)
                        }

                        className="
                            lg:hidden
                            p-2
                            rounded-lg
                            hover:bg-gray-100
                        "
                    >

                        <X
                            className="
                                w-5
                                h-5
                            "
                        />

                    </button>

                </div>


                {/* STORE */}

                <div
                    className="
                        px-4
                        py-5
                    "
                >

                    <div
                        className="
                            bg-[#f4f8f5]
                            border
                            border-[#175c2e]/10
                            rounded-2xl
                            p-4
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                            "
                        >

                            <div
                                className="
                                    w-10
                                    h-10
                                    rounded-xl
                                    bg-[#175c2e]
                                    text-white
                                    flex
                                    items-center
                                    justify-center
                                    shrink-0
                                "
                            >

                                <Store
                                    className="
                                        w-5
                                        h-5
                                    "
                                />

                            </div>


                            <div
                                className="
                                    min-w-0
                                "
                            >

                                <p
                                    className="
                                        text-sm
                                        font-extrabold
                                        text-gray-900
                                        truncate
                                    "
                                >

                                    {shopName}

                                </p>


                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                        truncate
                                        mt-0.5
                                    "
                                >

                                    {ownerName}

                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* NAVIGATION */}

                <nav
                    className="
                        flex-1
                        px-3
                        overflow-y-auto
                    "
                >

                    <p
                        className="
                            px-3
                            mb-2
                            text-[10px]
                            font-bold
                            tracking-[0.15em]
                            text-gray-400
                            uppercase
                        "
                    >

                        Main Menu

                    </p>


                    {/* DASHBOARD */}

                    <SidebarButton

                        icon={LayoutDashboard}

                        label="Dashboard"

                        active={true}

                        onClick={
                            goToDashboard
                        }

                    />


                    {/* PRODUCTS */}

                    <SidebarButton

                        icon={Package}

                        label="Products"

                        onClick={
                            goToProducts
                        }

                    />


                    {/* ORDERS */}

                    <SidebarButton

                        icon={ShoppingCart}

                        label="Orders"

                    />


                    {/* EARNINGS */}

                    <SidebarButton

                        icon={IndianRupee}

                        label="Earnings"

                    />


                    {/* ANALYTICS */}

                    <SidebarButton

                        icon={BarChart3}

                        label="Analytics"

                    />


                    {/* REVIEWS */}

                    <SidebarButton

                        icon={Star}

                        label="Reviews"

                    />


                    {/* RETURNS */}

                    <SidebarButton

                        icon={RotateCcw}

                        label="Returns"

                    />


                    <p
                        className="
                            px-3
                            mt-7
                            mb-2
                            text-[10px]
                            font-bold
                            tracking-[0.15em]
                            text-gray-400
                            uppercase
                        "
                    >

                        Account

                    </p>


                    <SidebarButton

                        icon={Bell}

                        label="Notifications"

                    />


                    <SidebarButton

                        icon={Settings}

                        label="Settings"

                    />

                </nav>


                {/* LOGOUT */}

                <div
                    className="
                        p-3
                        border-t
                        border-gray-100
                    "
                >

                    <button

                        onClick={
                            handleLogout
                        }

                        className="
                            w-full
                            flex
                            items-center
                            gap-3
                            px-4
                            py-3
                            rounded-xl
                            text-sm
                            font-bold
                            text-red-600
                            hover:bg-red-50
                            transition-colors
                        "
                    >

                        <LogOut
                            className="
                                w-5
                                h-5
                            "
                        />

                        Sign Out

                    </button>

                </div>

            </aside>


            {/* ======================================
                MAIN AREA
            ====================================== */}

            <div
                className="
                    lg:ml-[260px]
                    min-h-screen
                "
            >


                {/* ==================================
                    TOPBAR
                ================================== */}

                <header
                    className="
                        h-[76px]
                        bg-white
                        border-b
                        border-gray-200

                        sticky
                        top-0
                        z-30

                        px-4
                        sm:px-6
                        lg:px-8

                        flex
                        items-center
                        justify-between
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-4
                        "
                    >

                        <button

                            onClick={() =>
                                setSidebarOpen(true)
                            }

                            className="
                                lg:hidden
                                p-2
                                rounded-xl
                                hover:bg-gray-100
                            "
                        >

                            <Menu
                                className="
                                    w-5
                                    h-5
                                "
                            />

                        </button>


                        <div>

                            <h1
                                className="
                                    text-lg
                                    sm:text-xl
                                    font-extrabold
                                    text-gray-900
                                "
                            >

                                Dashboard

                            </h1>


                            <p
                                className="
                                    hidden
                                    sm:block
                                    text-xs
                                    text-gray-400
                                    mt-0.5
                                "
                            >

                                Welcome back, {ownerName}

                            </p>

                        </div>

                    </div>


                    {/* PROFILE */}

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <button
                            className="
                                relative
                                p-2.5
                                rounded-xl
                                border
                                border-gray-200
                                hover:bg-gray-50
                            "
                        >

                            <Bell
                                className="
                                    w-5
                                    h-5
                                    text-gray-600
                                "
                            />

                        </button>


                        <div
                            className="
                                hidden
                                sm:flex
                                items-center
                                gap-3
                            "
                        >

                            <div
                                className="
                                    w-10
                                    h-10
                                    rounded-full
                                    bg-[#175c2e]/10
                                    flex
                                    items-center
                                    justify-center
                                "
                            >

                                <User
                                    className="
                                        w-5
                                        h-5
                                        text-[#175c2e]
                                    "
                                />

                            </div>


                            <div
                                className="
                                    hidden
                                    md:block
                                "
                            >

                                <p
                                    className="
                                        text-sm
                                        font-bold
                                        text-gray-800
                                    "
                                >

                                    {ownerName}

                                </p>


                                <p
                                    className="
                                        text-[11px]
                                        text-gray-400
                                    "
                                >

                                    Vendor

                                </p>

                            </div>

                        </div>

                    </div>

                </header>


                {/* ==================================
                    CONTENT
                ================================== */}

                <main
                    className="
                        p-4
                        sm:p-6
                        lg:p-8
                    "
                >


                    {/* ERROR */}

                    {error && (

                        <div
                            className="
                                mb-6
                                flex
                                items-center
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

                            <AlertCircle
                                className="
                                    w-5
                                    h-5
                                    shrink-0
                                "
                            />

                            {error}

                        </div>

                    )}


                    {/* WELCOME */}

                    <div
                        className="
                            mb-7
                        "
                    >

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


                    {/* ==================================
                        KPI CARDS
                    ================================== */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            xl:grid-cols-3
                            gap-5
                            mb-7
                        "
                    >


                        {/* PRODUCTS */}

                        <DashboardCard

                            icon={Package}

                            title="Total Products"

                            value={
                                totalProducts
                            }

                            description="Products in your store"

                            onClick={
                                goToProducts
                            }

                        />


                        {/* SALES */}

                        <DashboardCard

                            icon={IndianRupee}

                            title="Total Sales"

                            value={
                                formatCurrency(
                                    totalSales
                                )
                            }

                            description="Your total recorded sales"

                        />


                        {/* RATING */}

                        <DashboardCard

                            icon={Star}

                            title="Store Rating"

                            value={
                                rating.toFixed(1)
                            }

                            description="Average vendor rating"

                        />

                    </div>


                    {/* ==================================
                        MAIN GRID
                    ================================== */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            xl:grid-cols-3
                            gap-6
                        "
                    >


                        {/* STORE OVERVIEW */}

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

                                        Live vendor account information

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
                                        currentVendor.email ||
                                        "Not available"
                                    }

                                />


                                <InfoBox

                                    label="Phone"

                                    value={
                                        currentVendor.phone ||
                                        "Not available"
                                    }

                                />


                                <InfoBox

                                    label="Vendor ID"

                                    value={
                                        currentVendor.vendor_id
                                            ? `#${currentVendor.vendor_id}`
                                            : "Not available"
                                    }

                                />


                                <InfoBox

                                    label="Account Status"

                                    value={
                                        currentVendor.status ||
                                        "Approved"
                                    }

                                    status

                                />

                            </div>

                        </div>


                        {/* QUICK ACTIONS */}

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

                                <QuickAction

                                    icon={Package}

                                    title="Manage Products"

                                    description="Add, edit or remove products"

                                    onClick={
                                        goToProducts
                                    }

                                />


                                <QuickAction

                                    icon={ShoppingCart}

                                    title="View Orders"

                                    description="Orders module coming next"

                                />


                                <QuickAction

                                    icon={IndianRupee}

                                    title="Earnings"

                                    description="Track vendor earnings"

                                />

                            </div>

                        </div>

                    </div>

                </main>

            </div>

        </div>

    );

}


// ==========================================
// SIDEBAR BUTTON
// ==========================================

function SidebarButton({
    icon: Icon,
    label,
    active = false,
    onClick
}) {

    return (

        <button

            type="button"

            onClick={onClick}

            className={`
                w-full

                flex
                items-center
                gap-3

                px-4
                py-3

                mb-1

                rounded-xl

                text-sm
                font-semibold

                transition-all

                ${
                    active

                        ? `
                            bg-[#175c2e]
                            text-white
                            shadow-sm
                        `

                        : `
                            text-gray-600
                            hover:bg-gray-100
                            hover:text-gray-900
                        `
                }
            `}
        >

            <Icon
                className="
                    w-[18px]
                    h-[18px]
                    shrink-0
                "
            />

            {label}

        </button>

    );

}


// ==========================================
// DASHBOARD CARD
// ==========================================

function DashboardCard({
    icon: Icon,
    title,
    value,
    description,
    onClick
}) {

    return (

        <div

            onClick={onClick}

            className={`
                bg-white

                border
                border-gray-200

                rounded-[20px]

                p-5

                transition-all

                ${
                    onClick

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


// ==========================================
// INFO BOX
// ==========================================

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


// ==========================================
// QUICK ACTION
// ==========================================

function QuickAction({
    icon: Icon,
    title,
    description,
    onClick
}) {

    return (

        <button

            type="button"

            onClick={onClick}

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

        </button>

    );

}