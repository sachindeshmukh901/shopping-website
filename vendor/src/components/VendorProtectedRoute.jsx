import { Navigate } from "react-router-dom";

function VendorProtectedRoute({ children }) {

    let token = localStorage.getItem("vendorToken");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default VendorProtectedRoute;