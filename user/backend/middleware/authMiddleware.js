const jwt = require("jsonwebtoken");


// ======================================================
// VERIFY NORMAL USER TOKEN
// ======================================================

exports.verifyToken = (req, res, next) => {

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
                    "Token Required"

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
                    "Invalid Token"

            });

        }


        // ==================================================
        // VERIFY TOKEN
        // ==================================================

        let decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // ==================================================
        // SAVE USER
        // ==================================================

        req.user =
            decoded;


        // ==================================================
        // SAVE TOKEN
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
            "Authentication Error:",
            error
        );


        return res.status(401).json({

            success: false,

            message:
                "Token Expired or Invalid"

        });

    }

};