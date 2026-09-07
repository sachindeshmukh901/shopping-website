const jwt = require("jsonwebtoken");

exports.verifyAdminToken = (req, res, next) => {

    try {

        let authHeader = req.headers.authorization;

        // Token not provided
        if (!authHeader) {

            return res.status(401).json({
                success: false,
                message: "Admin token required"
            });

        }

        // Expected:
        // Authorization: Bearer TOKEN

        let token = authHeader.split(" ")[1];

        if (!token) {

            return res.status(401).json({
                success: false,
                message: "Invalid admin token"
            });

        }

        // Verify JWT
        let decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Role check
        if (
            decoded.role !== "admin" &&
            decoded.role !== "super_admin"
        ) {

            return res.status(403).json({
                success: false,
                message: "Admin access only"
            });

        }

        // Store decoded admin data
        req.admin = decoded;

        next();

    }

    catch (error) {

        return res.status(401).json({
            success: false,
            message: "Admin token expired or invalid"
        });

    }

};