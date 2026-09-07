import { Navigate } from "react-router-dom";

function AdminProtectedRoute({ children }) {

    let localToken = localStorage.getItem("adminToken");

    let sessionToken = sessionStorage.getItem("adminToken");

    let token = localToken || sessionToken;


    // Admin login nahi hai
    if (!token) {

        return (
            <Navigate
                to="/"
                replace
            />
        );

    }


    // Token available hai
    return children;

}

export default AdminProtectedRoute;