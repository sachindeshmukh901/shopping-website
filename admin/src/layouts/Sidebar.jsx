import {
    LayoutDashboard,
    Store,
    Users,
    Package,
    FileText,
    CreditCard,
    Truck,
    RotateCcw,
    Map,
    Settings,
    LogOut,
    NotebookPen
} from "lucide-react";

import {
    NavLink,
    useNavigate
} from "react-router-dom";


function Sidebar({
    open = false,
    onClose = () => { }
}) {

    let navigate = useNavigate();


    /*
    =====================================================
    ADMIN SIDEBAR MENU
    =====================================================
    */

    let menuItems = [

        {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
            enabled: true
        },

        {
            name: "Categories",
            path: "/categories",
            icon: Package,
            enabled: true
        },

        {
            name: "Vendors",
            path: "/vendors",
            icon: Store,
            enabled: true
        },

        {
            name: "Customers",
            path: "/users",
            icon: Users,
            enabled: true
        },

        {
            name: "Products",
            path: "/products",
            icon: Package,
            enabled: true
        },

        {
            name: "Orders",
            path: "/orders",
            icon: FileText,
            enabled: true
        },

        {
            name: "Payments",
            path: "/payments",
            icon: CreditCard,
            enabled: true
        },

        {
            name: "Riders",
            path: "/riders",
            icon: Truck,
            enabled: true
        },

        {
            name: "Returns",
            path: "/returns",
            icon: RotateCcw,
            enabled: true
        },

        {
            name: "Blogs",
            path: "/blogs",
            icon: NotebookPen,
            enabled: true
        },

        // {
        //     name: "HeatMap",
        //     path: "/heatmap",
        //     icon: Map,
        //     enabled: true
        // },

        {
            name: "Settings",
            path: "/settings",
            icon: Settings,
            enabled: true
        }

    ];


    /*
    =====================================================
    LOGOUT
    =====================================================
    */

    let handleLogout = () => {

        localStorage.removeItem("adminToken");

        localStorage.removeItem("admin");

        navigate("/", {
            replace: true
        });

    };


    /*
    =====================================================
    CLOSE MOBILE SIDEBAR
    =====================================================
    */

    let handleNavigation = () => {

        onClose();

    };


    return (

        <>

            {/* =========================================
                MOBILE OVERLAY
            ========================================= */}

            {open && (

                <div
                    className="sidebar-overlay"
                    onClick={onClose}
                />

            )}


            {/* =========================================
                SIDEBAR
            ========================================= */}

            <aside
                className={
                    `admin-sidebar ${open
                        ? "sidebar-open"
                        : ""
                    }`
                }
            >


                {/* =====================================
                    BRAND
                ===================================== */}

                <div className="sidebar-brand">

                    <button
                        type="button"
                        className="brand-button"
                        onClick={() => {

                            navigate("/dashboard");

                            onClose();

                        }}
                    >

                        <span className="brand-icon">
                            O
                        </span>


                        <span className="brand-text">

                            <strong>
                                ORGOS
                            </strong>

                            <small>
                                Admin Panel
                            </small>

                        </span>

                    </button>

                </div>


                {/* =====================================
                    NAVIGATION
                ===================================== */}

                <nav className="sidebar-nav">

                    {menuItems.map((item) => {

                        let Icon = item.icon;


                        /*
                        =================================
                        DISABLED MENU
                        =================================
                        */

                        if (!item.enabled) {

                            return (

                                <div
                                    key={item.name}
                                    className="
                                        sidebar-link
                                        sidebar-disabled
                                    "
                                >

                                    <Icon
                                        size={20}
                                        strokeWidth={1.8}
                                    />

                                    <span>
                                        {item.name}
                                    </span>

                                </div>

                            );

                        }


                        /*
                        =================================
                        ENABLED MENU
                        =================================
                        */

                        return (

                            <NavLink
                                key={item.name}
                                to={item.path}
                                end={
                                    item.path ===
                                    "/dashboard"
                                }
                                onClick={
                                    handleNavigation
                                }
                                className={({ isActive }) => {

                                    return `
                                        sidebar-link
                                        ${isActive
                                            ? "sidebar-active"
                                            : ""
                                        }
                                    `;

                                }}
                            >

                                <Icon
                                    size={20}
                                    strokeWidth={1.8}
                                />

                                <span>
                                    {item.name}
                                </span>

                            </NavLink>

                        );

                    })}

                </nav>


                {/* =====================================
                    LOGOUT
                ===================================== */}

                <div className="sidebar-footer">

                    <button
                        type="button"
                        className="logout-button"
                        onClick={handleLogout}
                    >

                        <LogOut
                            size={20}
                            strokeWidth={1.8}
                        />

                        <span>
                            Sign Out
                        </span>

                    </button>

                </div>

            </aside>

        </>

    );

}


export default Sidebar;