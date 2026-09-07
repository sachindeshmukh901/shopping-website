import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import AdminTopbar from "./AdminTopbar";

function AdminLayout() {

    let [sidebarOpen, setSidebarOpen] = useState(false);

    let handleOpenSidebar = () => {
        setSidebarOpen(true);
    };

    let handleCloseSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="admin-layout">

            <Sidebar
                open={sidebarOpen}
                onClose={handleCloseSidebar}
            />

            <main className="admin-main">

                <AdminTopbar
                    onMenuClick={handleOpenSidebar}
                />

                <div className="admin-content">

                    <Outlet />

                </div>

            </main>

        </div>
    );
}

export default AdminLayout;