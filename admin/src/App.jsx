import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    Outlet
} from "react-router-dom";


import AdminLayout from "./layouts/AdminLayout";


import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Vendors from "./pages/Vendors";
import Users from "./pages/Users";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import Riders from "./pages/Riders";
import Returns from "./pages/Returns";
import Blogs from "./pages/Blogs";
import HeatMap from "./pages/HeatMap";
import Settings from "./pages/Settings";


/* ======================================================
   ADMIN PROTECTED ROUTE
====================================================== */

function AdminProtectedRoute() {

    let token =
        localStorage.getItem("adminToken");

    let admin =
        localStorage.getItem("admin");


    /*
    ======================================================
    CHECK ADMIN LOGIN
    ======================================================
    */

    if (!token || !admin) {

        return (
            <Navigate
                to="/"
                replace
            />
        );

    }


    /*
    ======================================================
    ADMIN LAYOUT + NESTED ROUTES
    ======================================================
    */

    return (
        <AdminLayout>
            <Outlet />
        </AdminLayout>
    );

}



/* ======================================================
   APP
====================================================== */

function App() {

    return (

        <BrowserRouter>

            <Routes>


                {/* =========================================
                    ADMIN LOGIN
                ========================================= */}

                <Route
                    path="/"
                    element={
                        <Login />
                    }
                />



                {/* =========================================
                    PROTECTED ADMIN AREA

                    Sidebar + Topbar + Page
                ========================================= */}

                <Route
                    element={
                        <AdminProtectedRoute />
                    }
                >


                    {/* =====================================
                        DASHBOARD
                    ===================================== */}

                    <Route
                        path="/dashboard"
                        element={
                            <Dashboard />
                        }
                    />


                    {/* =====================================
                        CATEGORIES
                    ===================================== */}

                    <Route
                        path="/categories"
                        element={
                            <Categories />
                        }
                    />


                    {/* =====================================
                        VENDORS
                    ===================================== */}

                    <Route
                        path="/vendors"
                        element={
                            <Vendors />
                        }
                    />


                    {/* =====================================
                        CUSTOMERS
                    ===================================== */}

                    <Route
                        path="/users"
                        element={
                            <Users />
                        }
                    />


                    {/* =====================================
                        PRODUCTS
                    ===================================== */}

                    <Route
                        path="/products"
                        element={
                            <Products />
                        }
                    />

                    {/* =====================================
                        ORDERS
                    ===================================== */}

                    <Route
                        path="/orders"
                        element={
                            <Orders />
                        }
                    />

                    {/* =====================================
                        PAYMENTS
                    ===================================== */}

                    <Route
                        path="/payments"
                        element={
                            <Payments />
                        }
                    />

                    {/* =====================================
                        RIDERS
                    ===================================== */}

                    <Route
                        path="/riders"
                        element={
                            <Riders />
                        }
                    />

                    {/* =====================================
                        RETURNS
                    ===================================== */}

                    <Route
                        path="/returns"
                        element={
                            <Returns />
                        }
                    />

                    <Route
                        path="/blogs"
                        element={<Blogs />}
                    />

                    <Route
                        path="/heatmap"
                        element={<HeatMap />}
                    />

                    <Route
                        path="/settings"
                        element={<Settings />}
                    />

                    {/* =====================================
                        UNKNOWN URL
                    ===================================== */}

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/dashboard"
                                replace
                            />
                        }
                    />

                </Route>


            </Routes>

        </BrowserRouter>

    );

}


export default App;