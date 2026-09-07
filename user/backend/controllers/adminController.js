const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// ===============================
// GET ALL VENDORS
// ===============================

exports.getAllVendors = async (req, res) => {

    try {

        const [vendors] = await db.promise().query(
            `SELECT 
                vendor_id,
                shop_name,
                owner_name,
                email,
                phone,
                gst_number,
                city,
                state,
                rating,
                total_products,
                total_sales,
                joined_date,
                status
             FROM vendors
             ORDER BY vendor_id DESC`
        );

        return res.status(200).json({

            success: true,

            total: vendors.length,

            vendors: vendors

        });

    }

    catch (error) {

        console.log("Get Vendors Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch vendors",

            error: error.message

        });

    }

};


// ===============================
// GET PENDING VENDORS
// ===============================

exports.getPendingVendors = async (req, res) => {

    try {

        const [vendors] = await db.promise().query(
            `SELECT
                vendor_id,
                shop_name,
                owner_name,
                email,
                phone,
                gst_number,
                address,
                city,
                state,
                pincode,
                joined_date,
                status
             FROM vendors
             WHERE status = 'Pending'
             ORDER BY vendor_id DESC`
        );

        return res.status(200).json({

            success: true,

            total: vendors.length,

            vendors: vendors

        });

    }

    catch (error) {

        console.log("Pending Vendors Error:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch pending vendors",

            error: error.message

        });

    }

};

// ===============================
// APPROVE VENDOR
// ===============================

exports.approveVendor = async (req, res) => {

    try {

        const vendorId = req.params.vendor_id;

        // Check vendor exists
        const [vendors] = await db.promise().query(
            "SELECT * FROM vendors WHERE vendor_id = ?",
            [vendorId]
        );

        if (vendors.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });

        }

        // Check already approved
        if (vendors[0].status === "Approved") {

            return res.status(400).json({
                success: false,
                message: "Vendor is already approved"
            });

        }

        // Approve vendor
        await db.promise().query(
            "UPDATE vendors SET status = 'Approved' WHERE vendor_id = ?",
            [vendorId]
        );

        return res.status(200).json({
            success: true,
            message: "Vendor approved successfully"
        });

    }

    catch (error) {

        console.log("Approve Vendor Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to approve vendor",
            error: error.message
        });

    }

};


// ===============================
// REJECT VENDOR
// ===============================

exports.rejectVendor = async (req, res) => {

    try {

        const vendorId = req.params.vendor_id;

        // Check vendor exists
        const [vendors] = await db.promise().query(
            "SELECT * FROM vendors WHERE vendor_id = ?",
            [vendorId]
        );

        if (vendors.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });

        }

        // Check already rejected
        if (vendors[0].status === "Rejected") {

            return res.status(400).json({
                success: false,
                message: "Vendor is already rejected"
            });

        }

        // Reject vendor
        await db.promise().query(
            "UPDATE vendors SET status = 'Rejected' WHERE vendor_id = ?",
            [vendorId]
        );

        return res.status(200).json({
            success: true,
            message: "Vendor rejected successfully"
        });

    }

    catch (error) {

        console.log("Reject Vendor Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to reject vendor",
            error: error.message
        });

    }

};



// ========================================
// CREATE ADMIN
// ========================================

exports.createAdmin = async (req, res) => {

    try {

        let { name, email, password } = req.body;

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });

        }

        // Check existing admin
        let [existingAdmin] = await db.promise().query(
            "SELECT admin_id FROM admins WHERE email = ?",
            [email]
        );

        if (existingAdmin.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Admin already exists"
            });

        }

        // Hash password
        let hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // Insert admin
        let [result] = await db.promise().query(

            `INSERT INTO admins
            (
                name,
                email,
                password,
                role,
                status
            )
            VALUES (?, ?, ?, 'admin', 'Active')`,

            [
                name,
                email,
                hashedPassword
            ]

        );

        return res.status(201).json({

            success: true,

            message: "Admin created successfully",

            admin: {
                admin_id: result.insertId,
                name: name,
                email: email,
                role: "admin"
            }

        });

    }

    catch (error) {

        console.log("Create Admin Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create admin",
            error: error.message
        });

    }

};


// ========================================
// ADMIN LOGIN
// ========================================

exports.loginAdmin = async (req, res) => {

    try {

        let { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });

        }

        // Find admin
        let [admins] = await db.promise().query(
            "SELECT * FROM admins WHERE email = ?",
            [email]
        );

        if (admins.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }

        let admin = admins[0];

        // Check account status
        if (admin.status !== "Active") {

            return res.status(403).json({
                success: false,
                message: "Admin account is inactive"
            });

        }

        // Check password
        let passwordMatch = await bcrypt.compare(
            password,
            admin.password
        );

        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }

        // Generate JWT
        let token = jwt.sign(

            {
                admin_id: admin.admin_id,
                email: admin.email,
                role: admin.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "1d"
            }

        );

        return res.status(200).json({

            success: true,

            message: "Admin login successful",

            token: token,

            admin: {

                admin_id: admin.admin_id,
                name: admin.name,
                email: admin.email,
                role: admin.role

            }

        });

    }

    catch (error) {

        console.log("Admin Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Admin login failed",
            error: error.message
        });

    }

};


// ========================================
// ADMIN DASHBOARD STATS
// ========================================

exports.getDashboardStats = async (req, res) => {

    try {

        // Total Users
        let [userResult] = await db.promise().query(
            "SELECT COUNT(*) AS total_users FROM users"
        );

        // Total Vendors
        let [vendorResult] = await db.promise().query(
            "SELECT COUNT(*) AS total_vendors FROM vendors"
        );

        // Pending Vendors
        let [pendingResult] = await db.promise().query(
            `SELECT COUNT(*) AS pending_vendors
             FROM vendors
             WHERE status = 'Pending'`
        );

        // Approved Vendors
        let [approvedResult] = await db.promise().query(
            `SELECT COUNT(*) AS approved_vendors
             FROM vendors
             WHERE status = 'Approved'`
        );

        // Rejected Vendors
        let [rejectedResult] = await db.promise().query(
            `SELECT COUNT(*) AS rejected_vendors
             FROM vendors
             WHERE status = 'Rejected'`
        );


        return res.status(200).json({

            success: true,

            stats: {

                total_users:
                    userResult[0].total_users,

                total_vendors:
                    vendorResult[0].total_vendors,

                pending_vendors:
                    pendingResult[0].pending_vendors,

                approved_vendors:
                    approvedResult[0].approved_vendors,

                rejected_vendors:
                    rejectedResult[0].rejected_vendors

            }

        });

    }

    catch (error) {

        console.log(
            "Dashboard Stats Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch dashboard statistics",

            error: error.message

        });

    }

};


// ===============================
// GET RECENT REGISTRATIONS
// ===============================

exports.getRecentRegistrations = async (req, res) => {

    try {

        // =========================
        // LATEST USERS
        // =========================

        const [users] = await db.promise().query(`
            SELECT
                user_id AS id,
                full_name AS name,
                created_at AS registered_at,
                'Customer' AS type
            FROM users
            ORDER BY created_at DESC
            LIMIT 5
        `);


        // =========================
        // LATEST VENDORS
        // =========================

        const [vendors] = await db.promise().query(`
            SELECT
                vendor_id AS id,
                owner_name AS name,
                joined_date AS registered_at,
                'Vendor' AS type
            FROM vendors
            ORDER BY joined_date DESC
            LIMIT 5
        `);


        // =========================
        // COMBINE
        // =========================

        let registrations = [
            ...users,
            ...vendors
        ];


        // =========================
        // SORT LATEST FIRST
        // =========================

        registrations.sort((a, b) => {

            return (
                new Date(b.registered_at) -
                new Date(a.registered_at)
            );

        });


        // ONLY LATEST 5

        registrations =
            registrations.slice(0, 5);


        // =========================
        // RESPONSE
        // =========================

        return res.status(200).json({

            success: true,

            total: registrations.length,

            registrations

        });

    }

    catch (error) {

        console.log(
            "Recent Registrations Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch recent registrations",

            error: error.message

        });

    }

};

// ==========================================
// GET ALL USERS
// ==========================================

exports.getAllUsers = async (req, res) => {

    try {

        let [users] = await db.promise().query(
            `
            SELECT
                user_id,
                full_name,
                email,
                phone,
                gender,
                dob,
                city,
                state,
                pincode,
                profile_image,
                created_at,
                status
            FROM users
            ORDER BY user_id DESC
            `
        );

        return res.status(200).json({

            success: true,

            total: users.length,

            users: users

        });

    } catch (error) {

        console.log(
            "Get All Users Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to fetch users",

            error: error.message

        });

    }

};

// ==========================================
// BLOCK USER
// ==========================================

exports.blockUser = async (req, res) => {

    try {

        let userId = req.params.user_id;

        // Check user exists
        let [users] = await db.promise().query(
            "SELECT user_id, full_name, status FROM users WHERE user_id = ?",
            [userId]
        );

        if (users.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        // Already blocked
        if (users[0].status === "Blocked") {

            return res.status(400).json({
                success: false,
                message: "User is already blocked"
            });

        }

        // Block user
        await db.promise().query(
            "UPDATE users SET status = 'Blocked' WHERE user_id = ?",
            [userId]
        );

        return res.status(200).json({

            success: true,

            message: "User blocked successfully",

            user: {
                user_id: users[0].user_id,
                full_name: users[0].full_name,
                status: "Blocked"
            }

        });

    } catch (error) {

        console.log(
            "Block User Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to block user",
            error: error.message
        });

    }

};

// ==========================================
// UNBLOCK USER
// ==========================================

exports.unblockUser = async (req, res) => {

    try {

        let userId = req.params.user_id;

        // Check user exists
        let [users] = await db.promise().query(
            "SELECT user_id, full_name, status FROM users WHERE user_id = ?",
            [userId]
        );

        if (users.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        // Already active
        if (users[0].status === "Active") {

            return res.status(400).json({
                success: false,
                message: "User is already active"
            });

        }

        // Activate user
        await db.promise().query(
            "UPDATE users SET status = 'Active' WHERE user_id = ?",
            [userId]
        );

        return res.status(200).json({

            success: true,

            message: "User unblocked successfully",

            user: {
                user_id: users[0].user_id,
                full_name: users[0].full_name,
                status: "Active"
            }

        });

    } catch (error) {

        console.log(
            "Unblock User Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to unblock user",
            error: error.message
        });

    }

};

// ==========================================
// GET ALL PRODUCTS (ADMIN)
// ==========================================
exports.getAllProducts = async (req, res) => {
    try {
        const [products] = await db.promise().query(
            `SELECT p.*, c.category_name, v.shop_name, v.owner_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.category_id
             LEFT JOIN vendors v ON p.vendor_id = v.vendor_id
             ORDER BY p.product_id DESC`
        );

        return res.status(200).json({
            success: true,
            products: products
        });
    } catch (error) {
        console.error("Admin Get Products Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch products" });
    }
};

// ==========================================
// ADD PRODUCT (ADMIN)
// ==========================================
exports.addProduct = async (req, res) => {

    try {

        let {
            vendor_id,
            category_id,
            product_name,
            description,
            brand,
            fabric,
            color,
            gender,
            price,
            discount,
            stock
        } = req.body;


        // ==============================
        // REQUIRED FIELDS
        // ==============================

        if (
            !vendor_id ||
            !category_id ||
            !product_name ||
            !price ||
            stock === undefined
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Vendor, category, product name, price and stock are required"

            });

        }


        // ==============================
        // CHECK VENDOR
        // ==============================

        let [vendors] = await db.promise().query(

            `SELECT vendor_id, status
             FROM vendors
             WHERE vendor_id = ?`,

            [vendor_id]

        );


        if (vendors.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Vendor not found"

            });

        }


        // ==============================
        // CHECK VENDOR STATUS
        // ==============================

        if (vendors[0].status !== "Approved") {

            return res.status(400).json({

                success: false,

                message:
                    "Product can only be added for an approved vendor"

            });

        }


        // ==============================
        // CHECK CATEGORY
        // ==============================

        let [categories] = await db.promise().query(

            `SELECT category_id
             FROM categories
             WHERE category_id = ?`,

            [category_id]

        );


        if (categories.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Category not found"

            });

        }


        // ==============================
        // IMAGE
        // ==============================

        let image = null;

        if (req.file) {

            image = `/uploads/products/${req.file.filename}`;

        }


        // ==============================
        // INSERT PRODUCT
        // ==============================

        let [result] = await db.promise().query(

            `INSERT INTO products
            (
                vendor_id,
                category_id,
                product_name,
                description,
                brand,
                fabric,
                color,
                gender,
                price,
                discount,
                stock,
                image,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,

            [
                vendor_id,
                category_id,
                product_name,
                description || null,
                brand || null,
                fabric || null,
                color || null,
                gender || null,
                Number(price),
                Number(discount || 0),
                Number(stock),
                image
            ]

        );


        // ==============================
        // RESPONSE
        // ==============================

        return res.status(201).json({

            success: true,

            message: "Product added successfully",

            product_id: result.insertId

        });

    }

    catch (error) {

        console.error(
            "Admin Add Product Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to add product",

            error: error.message

        });

    }

};


// ==========================================
// UPDATE PRODUCT (ADMIN)
// ==========================================
exports.updateProduct = async (req, res) => {

    try {

        let { product_id } = req.params;

        let {
            vendor_id,
            category_id,
            product_name,
            description,
            brand,
            fabric,
            color,
            gender,
            price,
            discount,
            stock
        } = req.body;


        // ==============================
        // CHECK PRODUCT
        // ==============================

        let [products] = await db.promise().query(

            `SELECT *
             FROM products
             WHERE product_id = ?`,

            [product_id]

        );


        if (products.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Product not found"

            });

        }


        let oldProduct = products[0];


        // ==============================
        // VALIDATE VENDOR
        // ==============================

        if (vendor_id) {

            let [vendors] = await db.promise().query(

                `SELECT vendor_id, status
                 FROM vendors
                 WHERE vendor_id = ?`,

                [vendor_id]

            );


            if (vendors.length === 0) {

                return res.status(404).json({

                    success: false,

                    message: "Vendor not found"

                });

            }


            if (vendors[0].status !== "Approved") {

                return res.status(400).json({

                    success: false,

                    message:
                        "Product can only belong to an approved vendor"

                });

            }

        }


        // ==============================
        // VALIDATE CATEGORY
        // ==============================

        if (category_id) {

            let [categories] = await db.promise().query(

                `SELECT category_id
                 FROM categories
                 WHERE category_id = ?`,

                [category_id]

            );


            if (categories.length === 0) {

                return res.status(404).json({

                    success: false,

                    message: "Category not found"

                });

            }

        }


        // ==============================
        // IMAGE
        // ==============================

        let image = oldProduct.image;

        if (req.file) {

            image = `/uploads/products/${req.file.filename}`;

        }


        // ==============================
        // UPDATE
        // ==============================

        await db.promise().query(

            `UPDATE products
             SET
                vendor_id = ?,
                category_id = ?,
                product_name = ?,
                description = ?,
                brand = ?,
                fabric = ?,
                color = ?,
                gender = ?,
                price = ?,
                discount = ?,
                stock = ?,
                image = ?
             WHERE product_id = ?`,

            [
                vendor_id || oldProduct.vendor_id,
                category_id || oldProduct.category_id,
                product_name || oldProduct.product_name,
                description !== undefined
                    ? description
                    : oldProduct.description,
                brand !== undefined
                    ? brand
                    : oldProduct.brand,
                fabric !== undefined
                    ? fabric
                    : oldProduct.fabric,
                color !== undefined
                    ? color
                    : oldProduct.color,
                gender !== undefined
                    ? gender
                    : oldProduct.gender,
                price !== undefined
                    ? Number(price)
                    : oldProduct.price,
                discount !== undefined
                    ? Number(discount)
                    : oldProduct.discount,
                stock !== undefined
                    ? Number(stock)
                    : oldProduct.stock,
                image,
                product_id
            ]

        );


        return res.status(200).json({

            success: true,

            message: "Product updated successfully"

        });

    }

    catch (error) {

        console.error(
            "Admin Update Product Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to update product",

            error: error.message

        });

    }

};


// ==========================================
// DELETE PRODUCT (ADMIN)
// ==========================================
exports.deleteProduct = async (req, res) => {

    try {

        let { product_id } = req.params;


        // ==============================
        // CHECK PRODUCT
        // ==============================

        let [products] = await db.promise().query(

            `SELECT product_id
             FROM products
             WHERE product_id = ?`,

            [product_id]

        );


        if (products.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Product not found"

            });

        }


        // ==============================
        // DELETE PRODUCT
        // ==============================

        await db.promise().query(

            `DELETE FROM products
             WHERE product_id = ?`,

            [product_id]

        );


        return res.status(200).json({

            success: true,

            message: "Product deleted successfully"

        });

    }

    catch (error) {

        console.error(
            "Admin Delete Product Error:",
            error
        );


        // ==============================
        // FOREIGN KEY ERROR
        // ==============================

        if (error.code === "ER_ROW_IS_REFERENCED_2") {

            return res.status(409).json({

                success: false,

                message:
                    "Product cannot be deleted because it is already used in an order or another record"

            });

        }


        return res.status(500).json({

            success: false,

            message: "Failed to delete product",

            error: error.message

        });

    }

};

// ==========================================
// UPDATE PRODUCT STATUS (ADMIN)
// ==========================================
exports.updateProductStatus = async (req, res) => {
    try {
        const { product_id } = req.params;
        const { status } = req.body;

        if (!status || !["Active", "Inactive"].includes(status)) {
            return res.status(400).json({ success: false, message: "Valid status ('Active' or 'Inactive') is required" });
        }

        await db.promise().query("UPDATE products SET status = ? WHERE product_id = ?", [status, product_id]);

        return res.status(200).json({
            success: true,
            message: `Product status updated to ${status}`
        });
    } catch (error) {
        console.error("Admin Update Product Status Error:", error);
        return res.status(500).json({ success: false, message: "Failed to update product status" });
    }
};

// ==========================================
// GET ALL ORDERS (ADMIN)
// ==========================================
exports.getAllOrders = async (req, res) => {
    try {
        const [orders] = await db.promise().query(
            `SELECT
                o.order_id,
                o.user_id,
                o.address_id,
                o.total_amount,
                o.payment_method,
                o.order_status,
                o.order_date,
                u.full_name AS customer_name,
                u.email AS customer_email,
                u.phone AS customer_phone,
                p.payment_status,
                p.transaction_id,
                ua.full_name AS shipping_name,
                ua.phone AS shipping_phone,
                ua.address_line,
                ua.city,
                ua.state,
                ua.pincode
             FROM orders o
             LEFT JOIN users u ON o.user_id = u.user_id
             LEFT JOIN payments p ON o.order_id = p.order_id
             LEFT JOIN user_address ua ON o.address_id = ua.address_id
             ORDER BY o.order_id DESC`
        );

        // ==========================================
        // GET ITEMS FOR EACH ORDER
        // ==========================================

        for (let order of orders) {

            const [items] = await db.promise().query(
                `SELECT
                    oi.order_item_id,
                    oi.order_id,
                    oi.product_id,
                    oi.size,
                    oi.quantity,
                    oi.price,
                    oi.subtotal,
                    pr.product_name,
                    pr.brand,
                    pr.image,
                    pr.vendor_id,
                    v.shop_name,
                    v.owner_name
                 FROM order_items oi
                 LEFT JOIN products pr ON oi.product_id = pr.product_id
                 LEFT JOIN vendors v ON pr.vendor_id = v.vendor_id
                 WHERE oi.order_id = ?
                 ORDER BY oi.order_item_id ASC`,
                [order.order_id]
            );

            order.items = items;

        }

        return res.status(200).json({
            success: true,
            orders: orders
        });
    } catch (error) {
        console.error("Admin Get Orders Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
};


// ==========================================
// UPDATE ORDER STATUS (ADMIN)
// ==========================================
exports.updateOrderStatus = async (req, res) => {
    try {

        const { order_id } = req.params;
        const { order_status } = req.body;

        const allowedStatuses = [
            "Pending",
            "Confirmed",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled"
        ];

        if (!order_status) {
            return res.status(400).json({
                success: false,
                message: "Order status is required"
            });
        }

        if (!allowedStatuses.includes(order_status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const [rows] = await db.promise().query(
            `SELECT order_id, user_id FROM orders WHERE order_id = ?`,
            [order_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        await db.promise().query(
            `UPDATE orders SET order_status = ? WHERE order_id = ?`,
            [order_status, order_id]
        );

        // Keep per-vendor status rows in sync with the admin-level status
        await db.promise().query(
            `UPDATE order_vendor SET vendor_status = ? WHERE order_id = ?`,
            [order_status, order_id]
        );

        await db.promise().query(
            `INSERT INTO notifications
             (user_id, title, message, notification_type)
             VALUES (?, ?, ?, 'Order')`,
            [
                rows[0].user_id,
                "Order Status Updated",
                `Your order #${order_id} is now ${order_status}.`
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order_id: order_id,
            order_status: order_status
        });

    } catch (error) {
        console.error("Admin Update Order Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update order status",
            error: error.message
        });
    }
};

// ==========================================
// GET ALL PAYOUTS & APPROVE (ADMIN)
// ==========================================
exports.getAllPayouts = async (req, res) => {
    try {
        const [payouts] = await db.promise().query(
            `SELECT vp.*, v.shop_name, v.owner_name
             FROM vendor_payouts vp
             JOIN vendors v ON vp.vendor_id = v.vendor_id
             ORDER BY vp.payout_id DESC`
        );

        return res.status(200).json({
            success: true,
            payouts: payouts
        });
    } catch (error) {
        console.error("Admin Get Payouts Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch payouts" });
    }
};

exports.updatePayoutStatus = async (req, res) => {
    try {
        const { payout_id } = req.params;
        const { payout_status } = req.body;

        if (!payout_status || !["Completed", "Pending"].includes(payout_status)) {
            return res.status(400).json({ success: false, message: "Valid payout_status required" });
        }

        await db.promise().query("UPDATE vendor_payouts SET payout_status = ? WHERE payout_id = ?", [payout_status, payout_id]);

        return res.status(200).json({
            success: true,
            message: `Payout status updated to ${payout_status}`
        });
    } catch (error) {
        console.error("Admin Update Payout Status Error:", error);
        return res.status(500).json({ success: false, message: "Failed to update payout status" });
    }
};


// ==========================================
// GET ALL PAYMENTS / TRANSACTIONS (ADMIN)
// ==========================================
//
// Mirrors exactly what happens on the user
// checkout page (Cash on Delivery / UPI / Card),
// pulled straight from the payments table that
// orderController writes to when a user pays.
// ==========================================

exports.getAllPayments = async (req, res) => {

    try {

        const [payments] =
            await db.promise().query(

                `
                SELECT

                    p.*,

                    o.order_date,

                    o.order_status,

                    o.total_amount AS order_total,

                    u.full_name AS customer_name,

                    u.email AS customer_email,

                    u.phone AS customer_phone

                FROM payments p

                INNER JOIN orders o
                    ON p.order_id = o.order_id

                LEFT JOIN users u
                    ON o.user_id = u.user_id

                ORDER BY o.order_date DESC
                `

            );


        // ==================================================
        // STATS
        // ==================================================

        let totalTransactions =
            payments.length;

        let totalRevenue = 0;
        let pendingCount = 0;
        let successCount = 0;
        let failedCount = 0;
        let codCount = 0;
        let onlineCount = 0;

        payments.forEach((item) => {

            let status =
                (item.payment_status || "").toLowerCase();

            let method =
                (item.payment_method || "").toUpperCase();


            if (status === "success" || status === "paid") {

                totalRevenue += Number(item.amount || 0);
                successCount++;

            }

            else if (status === "pending") {

                pendingCount++;

            }

            else if (status === "failed") {

                failedCount++;

            }


            if (method === "COD") {

                codCount++;

            }

            else {

                onlineCount++;

            }

        });


        return res.status(200).json({

            success: true,

            stats: {

                totalTransactions:
                    totalTransactions,

                totalRevenue:
                    totalRevenue,

                pendingCount:
                    pendingCount,

                successCount:
                    successCount,

                failedCount:
                    failedCount,

                codCount:
                    codCount,

                onlineCount:
                    onlineCount

            },

            payments:
                payments

        });

    } catch (error) {

        console.error(
            "Admin Get Payments Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch payments",

            error:
                error.message

        });

    }

};


// ==========================================
// GET ALL RIDERS (ADMIN)
// ==========================================

exports.getAllRiders = async (req, res) => {

    try {

        const [riders] =
            await db.promise().query(
                `SELECT *
                 FROM riders
                 ORDER BY rider_id DESC`
            );


        // ==================================================
        // ACTIVE DELIVERY COUNT PER RIDER
        // ==================================================

        const [deliveryCounts] =
            await db.promise().query(
                `SELECT
                    rider_id,
                    COUNT(*) AS active_deliveries
                 FROM delivery_management
                 WHERE
                    rider_id IS NOT NULL
                    AND (
                        delivery_status IS NULL
                        OR delivery_status NOT IN ('Delivered', 'Cancelled')
                    )
                 GROUP BY rider_id`
            )
            .catch(() => [[]]);

        let countMap = {};

        (Array.isArray(deliveryCounts) ? deliveryCounts : [])
            .forEach((row) => {

                countMap[row.rider_id] =
                    row.active_deliveries;

            });

        riders.forEach((rider) => {

            rider.active_deliveries =
                countMap[rider.rider_id] || 0;

        });


        return res.status(200).json({

            success: true,

            count:
                riders.length,

            riders:
                riders

        });

    } catch (error) {

        console.error(
            "Admin Get Riders Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch riders",
            error: error.message
        });

    }

};


// ==========================================
// ADD RIDER (ADMIN)
// ==========================================

exports.addRider = async (req, res) => {

    try {

        const {
            rider_name,
            phone
        } = req.body;

        if (!rider_name || !phone) {

            return res.status(400).json({
                success: false,
                message: "Rider name and phone are required"
            });

        }

        const [result] =
            await db.promise().query(
                `INSERT INTO riders
                 (rider_name, phone)
                 VALUES (?, ?)`,
                [
                    rider_name.trim(),
                    phone.trim()
                ]
            );

        return res.status(201).json({
            success: true,
            message: "Rider added successfully",
            rider_id: result.insertId
        });

    } catch (error) {

        console.error(
            "Admin Add Rider Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to add rider",
            error: error.message
        });

    }

};


// ==========================================
// DELETE RIDER (ADMIN)
// ==========================================

exports.deleteRider = async (req, res) => {

    try {

        const { rider_id } = req.params;

        // Unassign this rider from any deliveries first
        // (safe cleanup, not historical data).
        await db.promise()
            .query(
                `UPDATE delivery_management
                 SET rider_id = NULL
                 WHERE rider_id = ?`,
                [rider_id]
            )
            .catch(() => null);

        await db.promise().query(
            `DELETE FROM riders WHERE rider_id = ?`,
            [rider_id]
        );

        return res.status(200).json({
            success: true,
            message: "Rider removed successfully"
        });

    } catch (error) {

        console.error(
            "Admin Delete Rider Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to delete rider",
            error: error.message
        });

    }

};


// ==========================================
// GET ALL DELIVERIES (ADMIN)
// ==========================================

exports.getAllDeliveries = async (req, res) => {

    try {

        const [deliveries] =
            await db.promise().query(
                `SELECT
                    d.*,

                    r.rider_name,

                    r.phone AS rider_phone,

                    o.order_date,

                    o.total_amount,

                    o.order_status,

                    u.full_name AS customer_name,

                    u.phone AS customer_phone

                 FROM delivery_management d

                 LEFT JOIN riders r
                    ON d.rider_id = r.rider_id

                 LEFT JOIN orders o
                    ON d.order_id = o.order_id

                 LEFT JOIN users u
                    ON o.user_id = u.user_id

                 ORDER BY d.order_id DESC`
            );

        return res.status(200).json({

            success: true,

            count:
                deliveries.length,

            deliveries:
                deliveries

        });

    } catch (error) {

        console.error(
            "Admin Get Deliveries Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch deliveries",
            error: error.message
        });

    }

};


// ==========================================
// ASSIGN RIDER TO DELIVERY (ADMIN)
// ==========================================

exports.assignRiderToDelivery = async (req, res) => {

    try {

        const { order_id } = req.params;

        const { rider_id } = req.body;

        if (!rider_id) {

            return res.status(400).json({
                success: false,
                message: "rider_id is required"
            });

        }


        // ==================================================
        // CREATE A delivery_management ROW IF ONE
        // DOESN'T ALREADY EXIST FOR THIS ORDER
        // ==================================================

        const [existing] =
            await db.promise().query(
                `SELECT *
                 FROM delivery_management
                 WHERE order_id = ?`,
                [order_id]
            );

        if (existing.length === 0) {

            try {

                await db.promise().query(
                    `INSERT INTO delivery_management
                     (order_id, rider_id, delivery_status)
                     VALUES (?, ?, 'Assigned')`,
                    [order_id, rider_id]
                );

            }

            catch (insertError) {

                // delivery_status column may not exist on
                // this schema — retry with just the FKs.
                if (insertError.code === "ER_BAD_FIELD_ERROR") {

                    await db.promise().query(
                        `INSERT INTO delivery_management
                         (order_id, rider_id)
                         VALUES (?, ?)`,
                        [order_id, rider_id]
                    );

                }

                else {

                    throw insertError;

                }

            }

        }

        else {

            try {

                await db.promise().query(
                    `UPDATE delivery_management
                     SET
                        rider_id = ?,
                        delivery_status = 'Assigned'
                     WHERE order_id = ?`,
                    [rider_id, order_id]
                );

            }

            catch (updateError) {

                if (updateError.code === "ER_BAD_FIELD_ERROR") {

                    await db.promise().query(
                        `UPDATE delivery_management
                         SET rider_id = ?
                         WHERE order_id = ?`,
                        [rider_id, order_id]
                    );

                }

                else {

                    throw updateError;

                }

            }

        }

        return res.status(200).json({
            success: true,
            message: "Rider assigned successfully"
        });

    } catch (error) {

        console.error(
            "Admin Assign Rider Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to assign rider",
            error: error.message
        });

    }

};


// ==========================================
// GET ALL RETURNS (ADMIN)
// ==========================================
//
// Pulls every return request placed by any
// vendor's customers, joined with order +
// vendor info, exactly like the vendor's own
// returns endpoint but platform-wide.
// ==========================================

exports.getAllReturns = async (req, res) => {

    try {

        const [returns] = await db.promise().query(
            `SELECT
                r.return_id,
                r.order_id,
                r.vendor_id,
                r.reason,
                r.description,
                r.status,
                r.refund_amount,
                r.created_at,
                r.updated_at,
                o.order_date,
                o.payment_method,
                o.order_status,
                o.user_id,
                u.full_name AS customer_name,
                u.email AS customer_email,
                u.phone AS customer_phone,
                v.shop_name,
                v.owner_name
             FROM returns r
             LEFT JOIN orders o ON r.order_id = o.order_id
             LEFT JOIN users u ON o.user_id = u.user_id
             LEFT JOIN vendors v ON r.vendor_id = v.vendor_id
             ORDER BY r.created_at DESC`
        );

        // ==========================================
        // ATTACH REAL PRODUCT ITEMS TO EACH RETURN
        // ==========================================

        for (let item of returns) {

            const [items] = await db.promise().query(
                `SELECT
                    oi.order_item_id,
                    oi.product_id,
                    oi.size,
                    oi.quantity,
                    oi.price,
                    oi.subtotal,
                    pr.product_name,
                    pr.image,
                    pr.brand
                 FROM order_items oi
                 INNER JOIN products pr ON oi.product_id = pr.product_id
                 WHERE oi.order_id = ?
                 AND pr.vendor_id = ?`,
                [item.order_id, item.vendor_id]
            );

            item.items = items;

        }

        return res.status(200).json({
            success: true,
            count: returns.length,
            returns: returns
        });

    } catch (error) {

        console.error("Admin Get Returns Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch returns",
            error: error.message
        });

    }

};


// ==========================================
// UPDATE RETURN STATUS (ADMIN)
// ==========================================

exports.updateReturnStatus = async (req, res) => {

    try {

        const { return_id } = req.params;
        const { status } = req.body;

        let allowedStatuses = [
            "Pending",
            "Approved",
            "Rejected",
            "Picked Up",
            "Received",
            "Refunded",
            "Completed",
            "Cancelled"
        ];

        let normalizedStatus = String(status || "").trim();

        let matchedStatus = allowedStatuses.find(
            (item) => item.toLowerCase() === normalizedStatus.toLowerCase()
        );

        if (!matchedStatus) {

            return res.status(400).json({
                success: false,
                message: "Valid return status is required",
                allowedStatuses: allowedStatuses
            });

        }

        const [existing] = await db.promise().query(
            "SELECT return_id FROM returns WHERE return_id = ?",
            [return_id]
        );

        if (existing.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Return request not found"
            });

        }

        await db.promise().query(
            `UPDATE returns
             SET status = ?, updated_at = NOW()
             WHERE return_id = ?`,
            [matchedStatus, return_id]
        );

        return res.status(200).json({
            success: true,
            message: `Return status updated to ${matchedStatus}`,
            return_id: return_id,
            status: matchedStatus
        });

    } catch (error) {

        console.error("Admin Update Return Status Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update return status",
            error: error.message
        });

    }

};
