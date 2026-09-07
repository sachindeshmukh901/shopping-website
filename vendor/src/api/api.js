import axios from "axios";


// ======================================================
// API INSTANCE
// ======================================================

const API = axios.create({

    baseURL:
        "https://orgos-backend-h7ad.onrender.com/api",

    headers: {

        "Content-Type":
            "application/json"

    }

});


// ======================================================
// REQUEST INTERCEPTOR
// ======================================================

API.interceptors.request.use(

    (config) => {

        // ==================================================
        // GET VENDOR TOKEN
        // ==================================================

        const vendorToken =
            localStorage.getItem(
                "vendorToken"
            );


        // ==================================================
        // ADD TOKEN
        // ==================================================

        if (vendorToken) {

            config.headers.Authorization =
                `Bearer ${vendorToken}`;

        }


        // ==================================================
        // LET BROWSER SET MULTIPART BOUNDARY FOR FormData
        // ==================================================
        // The instance default Content-Type is "application/json".
        // When sending FormData (file uploads), that header must
        // NOT be forced to json — otherwise the browser can't add
        // the multipart boundary and the backend (multer) fails
        // to parse the request, so images never get saved.

        if (
            config.data instanceof FormData
        ) {

            delete config.headers["Content-Type"];

        }


        return config;

    },

    (error) => {

        return Promise.reject(
            error
        );

    }

);


// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================

API.interceptors.response.use(

    (response) => {

        return response;

    },

    (error) => {

        // ==================================================
        // AUTH ERROR
        // ==================================================

        if (
            error.response?.status === 401
        ) {

            console.error(
                "Vendor authentication failed:",
                error.response?.data
            );

        }


        return Promise.reject(
            error
        );

    }

);


export default API;