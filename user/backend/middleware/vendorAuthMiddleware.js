const jwt = require("jsonwebtoken");

const db = require("../config/db");


// ======================================================
// VERIFY VENDOR TOKEN
// ======================================================

exports.verifyVendorToken = async (req, res, next) => {

    try {

        // ==================================================
        // GET AUTHORIZATION HEADER
        // ==================================================

        let authHeader =
            req.headers.authorization;


        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Access denied. Vendor token required."

            });

        }


        // ==================================================
        // GET TOKEN
        // ==================================================

        let token =
            authHeader.split(" ")[1];


        if (!token) {

            return res.status(401).json({

                success: false,

                message:
                    "Vendor token is missing."

            });

        }


        // ==================================================
        // VERIFY JWT
        // ==================================================

        let decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        console.log(
            "Decoded Vendor Token:",
            decoded
        );


        // ==================================================
        // CHECK VENDOR ROLE
        // ==================================================

        if (
            decoded.role &&
            decoded.role !== "vendor"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Access denied. Vendor account required."

            });

        }


        // ==================================================
        // GET VENDOR ID
        // ==================================================

        let vendorId =
            decoded.vendor_id ||
            decoded.vendorId ||
            decoded.user_id ||
            decoded.userId;


        if (!vendorId) {

            console.error(
                "Vendor ID missing from token:",
                decoded
            );

            return res.status(401).json({

                success: false,

                message:
                    "Vendor ID is missing from authentication token."

            });

        }


        // ==================================================
        // CHECK TOKEN BLACKLIST
        // ==================================================

        let [blacklistedTokens] =
            await db.promise().query(

                `
                SELECT blacklist_id
                FROM vendor_token_blacklist
                WHERE token = ?
                LIMIT 1
                `,

                [token]

            );


        if (
            blacklistedTokens.length > 0
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Session expired. Please login again."

            });

        }


        // ==================================================
        // CREATE VENDOR OBJECT
        // ==================================================

        req.vendor = {

            ...decoded,

            vendor_id:
                vendorId

        };


        // ==================================================
        // ALSO SET req.user
        // ==================================================
        // This keeps compatibility with controllers
        // that may still use req.user.
        // ==================================================

        req.user = {

            ...decoded,

            vendor_id:
                vendorId

        };


        // ==================================================
        // SAVE ORIGINAL TOKEN
        // ==================================================

        req.token =
            token;


        // ==================================================
        // NEXT
        // ==================================================

        next();

    }

    catch (error) {

        console.error(
            "Vendor Authentication Error:",
            error
        );


        // ==================================================
        // TOKEN EXPIRED
        // ==================================================

        if (
            error.name === "TokenExpiredError"
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Vendor session expired. Please login again."

            });

        }


        // ==================================================
        // INVALID TOKEN
        // ==================================================

        if (
            error.name === "JsonWebTokenError"
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid vendor token."

            });

        }


        // ==================================================
        // SERVER ERROR
        // ==================================================

        return res.status(500).json({

            success: false,

            message:
                "Vendor authentication failed.",

            error:
                error.message

        });

    }

};