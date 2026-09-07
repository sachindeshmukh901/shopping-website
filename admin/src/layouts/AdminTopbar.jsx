import {
    Menu,
    Bell
} from "lucide-react";

import { useLocation } from "react-router-dom";


function AdminTopbar({ onMenuClick }) {

    let location = useLocation();


    let adminData =
        localStorage.getItem("admin");


    let admin = null;


    try {

        admin =
            adminData
                ? JSON.parse(adminData)
                : null;

    }

    catch (error) {

        admin = null;

    }


    // =========================================
    // PAGE TITLE
    // =========================================

    let getPageTitle = () => {

        let path = location.pathname;


        if (path === "/dashboard") {
            return "Dashboard";
        }


        if (path === "/vendors") {
            return "Vendor Management";
        }


        if (path === "/users") {
            return "Customer Management";
        }


        if (path === "/products") {
            return "Product Management";
        }


        return "Admin Panel";

    };


    // =========================================
    // PAGE DESCRIPTION
    // =========================================

    let getPageDescription = () => {

        let path = location.pathname;


        if (path === "/dashboard") {
            return "Overview of your ORGOS platform";
        }


        if (path === "/vendors") {
            return "Manage vendors and vendor accounts";
        }


        if (path === "/users") {
            return "Manage registered customers";
        }


        if (path === "/products") {
            return "Manage products from all vendors";
        }


        return "ORGOS administration";

    };


    // =========================================
    // ADMIN DATA
    // =========================================

    let adminName =
        admin?.name ||
        "Administrator";


    let firstLetter =
        adminName
            .charAt(0)
            .toUpperCase();


    return (

        <header className="admin-topbar">


            {/* =================================
                LEFT SIDE
            ================================= */}

            <div className="topbar-left">


                <button
                    type="button"
                    className="mobile-menu-button"
                    onClick={onMenuClick}
                    aria-label="Open menu"
                >

                    <Menu size={22} />

                </button>


                <div className="topbar-heading">

                    <h1>
                        {getPageTitle()}
                    </h1>


                    <p>
                        {getPageDescription()}
                    </p>

                </div>


            </div>



            {/* =================================
                RIGHT SIDE
            ================================= */}

            <div className="topbar-right">


                {/* =================================
                    NOTIFICATION
                ================================= */}

                <button
                    type="button"
                    className="notification-button"
                    aria-label="Notifications"
                >

                    <Bell size={19} />

                    <span className="notification-dot">
                    </span>

                </button>



                {/* =================================
                    ADMIN PROFILE
                ================================= */}

                <div className="topbar-profile">


                    <div className="topbar-avatar">

                        {firstLetter}

                    </div>


                    <div className="topbar-user-info">

                        <strong>
                            {adminName}
                        </strong>


                        <span>
                            Administrator
                        </span>

                    </div>


                </div>


            </div>


        </header>

    );

}


export default AdminTopbar;