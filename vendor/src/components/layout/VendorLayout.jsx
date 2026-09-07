import React, {
    useState
} from "react";

import {
    Outlet,
    useLocation,
    useNavigate
} from "react-router-dom";

import brandLogo from "../../assets/logo.png";

import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    IndianRupee,
    BarChart3,
    Star,
    RotateCcw,
    Map,
    Bell,
    Settings,
    LogOut,
    Menu,
    X,
    Store,
    User
} from "lucide-react";


export default function VendorLayout({
    vendor,
    onLogout
}) {

    let navigate =
        useNavigate();


    let location =
        useLocation();


    let [sidebarOpen, setSidebarOpen] =
        useState(false);


    // =================================================
    // VENDOR INFORMATION
    // =================================================

    let shopName =
        vendor?.shop_name ||
        "ORGOS Vendor";


    let ownerName =
        vendor?.owner_name ||
        "Vendor";


    // =================================================
    // NAVIGATION
    // =================================================

    let handleNavigate = (
        path
    ) => {

        setSidebarOpen(false);

        navigate(path);

    };


    // =================================================
    // ACTIVE ROUTE
    // =================================================

    let isActive = (
        path
    ) => {

        if (
            path === "/dashboard"
        ) {

            return (
                location.pathname ===
                "/dashboard"
            );

        }


        return location.pathname.startsWith(
            path
        );

    };


    // =================================================
    // LOGOUT
    // =================================================

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


    // =================================================
    // PAGE TITLE
    // =================================================

    let getPageTitle = () => {

        if (
            location.pathname.startsWith(
                "/products"
            )
        ) {

            return "Products";

        }


        if (
            location.pathname.startsWith(
                "/orders"
            )
        ) {

            return "Orders";

        }


        if (
            location.pathname.startsWith(
                "/earnings"
            )
        ) {

            return "Earnings";

        }


        if (
            location.pathname.startsWith(
                "/analytics"
            )
        ) {

            return "Analytics";

        }


        if (
            location.pathname.startsWith(
                "/reviews"
            )
        ) {

            return "Reviews";

        }


        if (
            location.pathname.startsWith(
                "/returns"
            )
        ) {

            return "Returns";

        }


        if (
            location.pathname.startsWith(
                "/heatmap"
            )
        ) {

            return "HeatMap";

        }


        if (
            location.pathname.startsWith(
                "/notifications"
            )
        ) {

            return "Notifications";

        }


        if (
            location.pathname.startsWith(
                "/settings"
            )
        ) {

            return "Settings";

        }


        return "Dashboard";

    };


    return (

        <div
            className="
                min-h-screen
                bg-[#f7f8fc]
                text-gray-900
            "
        >

            {/* =========================================
                MOBILE OVERLAY
            ========================================= */}

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


            {/* =========================================
                SIDEBAR
            ========================================= */}

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

                    ${sidebarOpen

                        ? "translate-x-0"

                        : "-translate-x-full lg:translate-x-0"
                    }
                `}
            >

                {/* =====================================
                    LOGO
                ===================================== */}

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
                        type="button"
                        onClick={() =>
                            handleNavigate(
                                "/dashboard"
                            )
                        }
                        className="
                            flex
                            items-center
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
                        type="button"
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


                {/* =====================================
                    VENDOR STORE
                ===================================== */}

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


                {/* =====================================
                    NAVIGATION
                ===================================== */}

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
                        active={
                            isActive(
                                "/dashboard"
                            )
                        }
                        onClick={() =>
                            handleNavigate(
                                "/dashboard"
                            )
                        }
                    />


                    {/* PRODUCTS */}

                    <SidebarButton
                        icon={Package}
                        label="Products"
                        active={
                            isActive(
                                "/products"
                            )
                        }
                        onClick={() =>
                            handleNavigate(
                                "/products"
                            )
                        }
                    />


                    {/* ORDERS */}

                    <SidebarButton
                        icon={ShoppingCart}
                        label="Orders"
                        active={
                            isActive(
                                "/orders"
                            )
                        }
                        onClick={() =>
                            handleNavigate(
                                "/orders"
                            )
                        }
                    />


                    {/* EARNINGS */}

                    <SidebarButton
                        icon={IndianRupee}
                        label="Earnings"
                        active={
                            isActive(
                                "/earnings"
                            )
                        }
                        onClick={() =>
                            handleNavigate(
                                "/earnings"
                            )
                        }
                    />


                    {/* ANALYTICS */}

                    <SidebarButton
                        icon={BarChart3}
                        label="Analytics"
                        active={
                            isActive(
                                "/analytics"
                            )
                        }
                        onClick={() =>
                            handleNavigate(
                                "/analytics"
                            )
                        }
                    />


                    {/* REVIEWS */}

                    <SidebarButton
                        icon={Star}
                        label="Reviews"
                        active={
                            isActive(
                                "/reviews"
                            )
                        }
                        onClick={() =>
                            handleNavigate(
                                "/reviews"
                            )
                        }
                    />


                    {/* RETURNS */}

                    <SidebarButton
                        icon={RotateCcw}
                        label="Returns"
                        active={
                            isActive(
                                "/returns"
                            )
                        }
                        onClick={() =>
                            handleNavigate(
                                "/returns"
                            )
                        }
                    />


                    {/* HEATMAP */}

                    <SidebarButton
                        icon={Map}
                        label="HeatMap"
                        active={
                            isActive(
                                "/heatmap"
                            )
                        }
                        onClick={() =>
                            handleNavigate(
                                "/heatmap"
                            )
                        }
                    />


                    {/* ACCOUNT */}

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


                    {/* NOTIFICATIONS */}

                    <SidebarButton
                        icon={Bell}
                        label="Notifications"
                        active={
                            isActive(
                                "/notifications"
                            )
                        }
                        onClick={() =>
                            handleNavigate(
                                "/notifications"
                            )
                        }
                    />


                    {/* SETTINGS */}

                    <SidebarButton
                        icon={Settings}
                        label="Settings"
                        active={
                            isActive(
                                "/settings"
                            )
                        }
                        onClick={() =>
                            handleNavigate(
                                "/settings"
                            )
                        }
                    />

                </nav>


                {/* =====================================
                    LOGOUT
                ===================================== */}

                <div
                    className="
                        p-3
                        border-t
                        border-gray-100
                    "
                >

                    <button
                        type="button"
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


            {/* =========================================
                MAIN
            ========================================= */}

            <div
                className="
                    lg:ml-[260px]
                    min-h-screen
                "
            >

                {/* =====================================
                    HEADER
                ===================================== */}

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
                            type="button"
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

                                {getPageTitle()}

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

                                {shopName}

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
                            type="button"
                            onClick={() =>
                                handleNavigate(
                                    "/notifications"
                                )
                            }
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


                {/* =====================================
                    CURRENT PAGE
                ===================================== */}

                <main>

                    <Outlet />

                </main>

            </div>

        </div>

    );

}


// =====================================================
// SIDEBAR BUTTON
// =====================================================

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

                ${active

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