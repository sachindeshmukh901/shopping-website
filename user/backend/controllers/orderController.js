const db = require("../config/db");
const Razorpay = require("razorpay");

function getRazorpay() {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
}


// ======================================================
// GET USER ADDRESSES
// ======================================================

exports.getUserAddresses = async (req, res) => {

    try {

        let userId =
            req.user.user_id;


        const [addresses] =
            await db.promise().query(

                `
                SELECT *
                FROM user_address
                WHERE user_id = ?
                ORDER BY address_id DESC
                `,

                [userId]

            );


        return res.status(200).json({

            success: true,

            addresses:
                addresses

        });

    }

    catch (error) {

        console.error(
            "Get User Addresses Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch addresses",

            error:
                error.message

        });

    }

};



// ======================================================
// SAVE USER ADDRESS
// ======================================================

exports.saveUserAddress = async (req, res) => {

    try {

        let userId =
            req.user.user_id;


        let {
            full_name,
            phone,
            address_line,
            city,
            state,
            pincode,
            address_type = "Home"
        } = req.body;


        if (
            !full_name ||
            !phone ||
            !address_line ||
            !city ||
            !state ||
            !pincode
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "All address fields are required"

            });

        }


        const [result] =
            await db.promise().query(

                `
                INSERT INTO user_address
                (
                    user_id,
                    full_name,
                    phone,
                    address_line,
                    city,
                    state,
                    pincode,
                    address_type
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `,

                [
                    userId,
                    full_name.trim(),
                    phone.trim(),
                    address_line.trim(),
                    city.trim(),
                    state.trim(),
                    pincode.trim(),
                    address_type
                ]

            );


        return res.status(201).json({

            success: true,

            message:
                "Address saved successfully",

            address_id:
                result.insertId

        });

    }

    catch (error) {

        console.error(
            "Save User Address Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to save address",

            error:
                error.message

        });

    }

};



// ======================================================
// CREATE ORDER
// ======================================================

exports.createOrder = async (req, res) => {

    let connection;


    try {

        connection =
            await db.promise().getConnection();


        let userId =
            req.user.user_id;


        let {
            address_id,
            address_details,
            items,
            payment_method = "COD",
            reward_code = null,
            razorpay_payment_id = null,
            razorpay_order_id = null
        } = req.body;


        // ==================================================
        // VALIDATE CART
        // ==================================================

        if (
            !items ||
            !Array.isArray(items) ||
            items.length === 0
        ) {

            connection.release();

            return res.status(400).json({

                success: false,

                message:
                    "Cart items are required for checkout"

            });

        }


        await connection.beginTransaction();


        // ==================================================
        // RESOLVE ADDRESS
        // ==================================================

        let finalAddressId =
            address_id;


        if (
            !finalAddressId &&
            address_details
        ) {

            let {
                full_name,
                phone,
                address_line,
                city,
                state,
                pincode,
                address_type = "Home"
            } = address_details;


            if (
                !full_name ||
                !phone ||
                !address_line ||
                !city ||
                !state ||
                !pincode
            ) {

                await connection.rollback();

                connection.release();

                return res.status(400).json({

                    success: false,

                    message:
                        "Complete shipping address is required"

                });

            }


            const [addrRes] =
                await connection.query(

                    `
                    INSERT INTO user_address
                    (
                        user_id,
                        full_name,
                        phone,
                        address_line,
                        city,
                        state,
                        pincode,
                        address_type
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `,

                    [
                        userId,
                        full_name.trim(),
                        phone.trim(),
                        address_line.trim(),
                        city.trim(),
                        state.trim(),
                        pincode.trim(),
                        address_type
                    ]

                );


            finalAddressId =
                addrRes.insertId;

        }


        // ==================================================
        // GET EXISTING ADDRESS
        // ==================================================

        if (!finalAddressId) {

            const [existingAddrs] =
                await connection.query(

                    `
                    SELECT address_id
                    FROM user_address
                    WHERE user_id = ?
                    ORDER BY address_id DESC
                    LIMIT 1
                    `,

                    [userId]

                );


            if (
                existingAddrs.length > 0
            ) {

                finalAddressId =
                    existingAddrs[0].address_id;

            }

            else {

                await connection.rollback();

                connection.release();

                return res.status(400).json({

                    success: false,

                    message:
                        "Shipping address is required"

                });

            }

        }


        // ==================================================
        // VALIDATE PRODUCTS
        // ==================================================

        let totalAmount =
            0;

        let rewardDiscountAmount =
            0;

        let appliedReward =
            null;

        let validatedItems =
            [];


        let vendorSalesMap =
            {};


        for (
            let item of items
        ) {

            let productId =
                item.product_id ||
                item.id;


            let quantity =
                parseInt(item.quantity) || 1;


            let size =
                item.size
                    ? String(item.size).trim()
                    : null;


            if (!productId) {

                await connection.rollback();

                connection.release();

                return res.status(400).json({

                    success: false,

                    message:
                        "Product ID is missing"

                });

            }


            if (quantity <= 0) {

                await connection.rollback();

                connection.release();

                return res.status(400).json({

                    success: false,

                    message:
                        "Product quantity must be greater than zero"

                });

            }


            const [productRows] =
                await connection.query(

                    `
                    SELECT
                        product_id,
                        vendor_id,
                        product_name,
                        price,
                        discount,
                        stock
                    FROM products
                    WHERE product_id = ?
                    FOR UPDATE
                    `,

                    [productId]

                );


            if (
                productRows.length === 0
            ) {

                await connection.rollback();

                connection.release();

                return res.status(404).json({

                    success: false,

                    message:
                        `Product ID ${productId} not found`

                });

            }


            let product =
                productRows[0];


            // ==================================================
            // SIZE-AWARE STOCK CHECK
            // ==================================================

            const [sizeRows] =
                await connection.query(
                    `
                    SELECT size, stock
                    FROM product_sizes
                    WHERE product_id = ?
                    FOR UPDATE
                    `,
                    [productId]
                );

            let matchedSizeStock = null;

            if (sizeRows.length > 0) {

                // Product has size variants -> a size must be
                // supplied and must be in stock.

                if (!size) {

                    await connection.rollback();

                    connection.release();

                    return res.status(400).json({

                        success: false,

                        message:
                            `Please select a size for "${product.product_name}"`

                    });

                }

                let sizeRow =
                    sizeRows.find((s) => s.size === size);

                if (!sizeRow) {

                    await connection.rollback();

                    connection.release();

                    return res.status(400).json({

                        success: false,

                        message:
                            `Size "${size}" is not available for "${product.product_name}"`

                    });

                }

                if (sizeRow.stock < quantity) {

                    await connection.rollback();

                    connection.release();

                    return res.status(400).json({

                        success: false,

                        message:
                            `Insufficient stock for "${product.product_name}" (Size ${size}). Available: ${sizeRow.stock}, requested: ${quantity}`

                    });

                }

                matchedSizeStock = sizeRow;

            }

            else if (
                product.stock < quantity
            ) {

                await connection.rollback();

                connection.release();

                return res.status(400).json({

                    success: false,

                    message:
                        `Insufficient stock for product "${product.product_name}". Available: ${product.stock}, requested: ${quantity}`

                });

            }


            // ==================================================
            // PRICE
            // ==================================================

            let discountedPrice =
                Number(product.price) *
                (
                    1 -
                    Number(product.discount || 0) /
                    100
                );


            let subtotal =
                discountedPrice *
                quantity;


            totalAmount +=
                subtotal;


            validatedItems.push({

                product_id:
                    product.product_id,

                vendor_id:
                    product.vendor_id,

                product_name:
                    product.product_name,

                size:
                    matchedSizeStock ? size : null,

                quantity:
                    quantity,

                price:
                    discountedPrice,

                subtotal:
                    subtotal

            });


            // ==================================================
            // VENDOR TOTAL
            // ==================================================

            let vendorId =
                product.vendor_id;


            vendorSalesMap[vendorId] =
                (
                    vendorSalesMap[vendorId] || 0
                ) +
                subtotal;

        }


        // ==================================================
        // APPLY ACTIVE SPIN REWARD, IF PRESENT
        // ==================================================

        if (reward_code) {
            const [rewardRows] =
                await connection.query(
                    `
                    SELECT *
                    FROM user_reward_tokens
                    WHERE user_id = ?
                    AND coupon_code = ?
                    AND status = 'active'
                    LIMIT 1
                    FOR UPDATE
                    `,
                    [userId, String(reward_code).trim()]
                );

            if (rewardRows.length === 0) {
                await connection.rollback();
                connection.release();

                return res.status(400).json({
                    success: false,
                    message: "Your spin reward is no longer valid or has already been used."
                });
            }

            appliedReward = rewardRows[0];
            rewardDiscountAmount =
                (totalAmount * Number(appliedReward.discount_percent || 0)) / 100;
        }

        const discountedTotalAmount =
            Math.max(0, totalAmount - rewardDiscountAmount);

        if (payment_method === "RAZORPAY") {
            if (!razorpay_order_id || !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: "Verified Razorpay order is required."
                });
            }

            const razorpayOrder = await getRazorpay().orders.fetch(razorpay_order_id);
            const expectedAmount = Math.round(discountedTotalAmount * 100);

            if (razorpayOrder.amount !== expectedAmount || razorpayOrder.currency !== "INR") {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    success: false,
                    message: "Payment amount verification failed."
                });
            }
        }


        // ==================================================
        // CREATE MAIN ORDER
        // ==================================================

        const [orderRes] =
            await connection.query(

                `
                INSERT INTO orders
                (
                    user_id,
                    address_id,
                    total_amount,
                    payment_method,
                    order_status
                )
                VALUES (?, ?, ?, ?, 'Confirmed')
                `,

                [
                    userId,
                    finalAddressId,
                    discountedTotalAmount,
                    payment_method
                ]

            );


        let orderId =
            orderRes.insertId;


        // ==================================================
        // ORDER ITEMS
        // ==================================================

        for (
            let item of validatedItems
        ) {

            await connection.query(

                `
                INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    size,
                    quantity,
                    price,
                    subtotal
                )
                VALUES (?, ?, ?, ?, ?, ?)
                `,

                [
                    orderId,
                    item.product_id,
                    item.size,
                    item.quantity,
                    item.price,
                    item.subtotal
                ]

            );


            // ==================================================
            // REDUCE STOCK
            // ==================================================

            await connection.query(

                `
                UPDATE products
                SET stock = stock - ?
                WHERE product_id = ?
                `,

                [
                    item.quantity,
                    item.product_id
                ]

            );


            if (item.size) {

                await connection.query(

                    `
                    UPDATE product_sizes
                    SET stock = stock - ?
                    WHERE product_id = ?
                    AND size = ?
                    `,

                    [
                        item.quantity,
                        item.product_id,
                        item.size
                    ]

                );

            }

        }


        // ==================================================
        // CREATE VENDOR ORDER RECORDS
        // ==================================================

        for (
            let [vendorId, vendorTotal]
            of Object.entries(vendorSalesMap)
        ) {

            await connection.query(

                `
                INSERT INTO order_vendor
                (
                    order_id,
                    vendor_id,
                    vendor_total,
                    vendor_status
                )
                VALUES (?, ?, ?, 'Confirmed')
                `,

                [
                    orderId,
                    vendorId,
                    vendorTotal
                ]

            );

        }


        // ==================================================
        // PAYMENT
        // ==================================================

        let transactionId =
            razorpay_payment_id ||
            "TXN-" +
            Date.now() +
            "-" +
            Math.floor(
                Math.random() * 1000
            );


        let paymentStatus =
            payment_method === "COD"
                ? "Pending"
                : "Success";


        await connection.query(

            `
            INSERT INTO payments
            (
                order_id,
                transaction_id,
                payment_method,
                payment_status,
                amount
            )
            VALUES (?, ?, ?, ?, ?)
            `,

            [
                orderId,
                transactionId,
                payment_method,
                paymentStatus,
                discountedTotalAmount
            ]

        );

        if (appliedReward) {
            await connection.query(
                `
                UPDATE user_reward_tokens
                SET status = 'used', used_at = CURRENT_TIMESTAMP
                WHERE reward_id = ?
                `,
                [appliedReward.reward_id]
            );
        }


        // ==================================================
        // VENDOR EARNINGS
        // ==================================================

        for (
            let [vendorId, saleAmount]
            of Object.entries(vendorSalesMap)
        ) {

            let commissionRate =
                0.10;


            let commission =
                saleAmount *
                commissionRate;


            let netEarning =
                saleAmount -
                commission;


            await connection.query(

                `
                UPDATE vendors
                SET total_sales =
                    total_sales + ?
                WHERE vendor_id = ?
                `,

                [
                    saleAmount,
                    vendorId
                ]

            );


            /*
             * Existing project may have its own
             * vendor_earnings structure.
             *
             * Do not allow earnings failure
             * to destroy the order itself.
             *
             * Order + order_vendor are the
             * important records for Vendor Orders.
             */

            try {

                const [vendorEarnings] =
                    await connection.query(

                        `
                        SELECT earning_id
                        FROM vendor_earnings
                        WHERE vendor_id = ?
                        LIMIT 1
                        `,

                        [vendorId]

                    );


                if (
                    vendorEarnings.length > 0
                ) {

                    await connection.query(

                        `
                        UPDATE vendor_earnings
                        SET
                            commission =
                                commission + ?,

                            net_earning =
                                net_earning + ?

                        WHERE vendor_id = ?
                        `,

                        [
                            commission,
                            netEarning,
                            vendorId
                        ]

                    );

                }

            }

            catch (earningError) {

                console.error(
                    "Vendor Earnings Warning:",
                    earningError.message
                );

            }

        }


        // ==================================================
        // CLEAR CART
        // ==================================================

        const [cartRows] =
            await connection.query(

                `
                SELECT cart_id
                FROM cart
                WHERE user_id = ?
                LIMIT 1
                `,

                [userId]

            );


        if (
            cartRows.length > 0
        ) {

            await connection.query(

                `
                DELETE FROM cart_items
                WHERE cart_id = ?
                `,

                [
                    cartRows[0].cart_id
                ]

            );

        }


        // ==================================================
        // USER NOTIFICATION
        // ==================================================

        await connection.query(

            `
            INSERT INTO notifications
            (
                user_id,
                title,
                message,
                notification_type
            )
            VALUES (?, ?, ?, 'Order')
            `,

            [
                userId,
                "Order Placed Successfully",
                `Your order #${orderId} has been confirmed!`
            ]

        );


        // ==================================================
        // COMMIT
        // ==================================================

        await connection.commit();

        connection.release();


        return res.status(201).json({

            success: true,

            message:
                "Order placed successfully!",

            order_id:
                orderId,

            transaction_id:
                transactionId,

            total_amount:
                totalAmount

        });

    }

    catch (error) {

        console.error(
            "Create Order Error:",
            error
        );


        if (connection) {

            try {

                await connection.rollback();

            }

            catch (rollbackError) {

                console.error(
                    "Rollback Error:",
                    rollbackError
                );

            }


            connection.release();

        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to place order",

            error:
                error.message

        });

    }

};



// ======================================================
// GET USER ORDERS
// ======================================================

exports.getUserOrders = async (req, res) => {

    try {

        let userId =
            req.user.user_id;


        const [orders] =
            await db.promise().query(

                `
                SELECT
                    o.*,

                    p.payment_status,
                    p.transaction_id,

                    ua.full_name,
                    ua.phone,
                    ua.address_line,
                    ua.city,
                    ua.state,
                    ua.pincode

                FROM orders o

                LEFT JOIN payments p
                    ON o.order_id = p.order_id

                LEFT JOIN user_address ua
                    ON o.address_id = ua.address_id

                WHERE o.user_id = ?

                ORDER BY o.order_id DESC
                `,

                [userId]

            );


        for (
            let order of orders
        ) {

            const [items] =
                await db.promise().query(

                    `
                    SELECT
                        oi.*,

                        pr.product_name,
                        pr.brand,
                        pr.image,

                        pr.vendor_id

                    FROM order_items oi

                    JOIN products pr
                        ON oi.product_id = pr.product_id

                    WHERE oi.order_id = ?
                    `,

                    [order.order_id]

                );


            order.items =
                items;

        }


        return res.status(200).json({

            success: true,

            orders:
                orders

        });

    }

    catch (error) {

        console.error(
            "Get User Orders Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch user orders",

            error:
                error.message

        });

    }

};



// ======================================================
// GET VENDOR ORDERS
// ======================================================
//
// IMPORTANT:
//
// Vendor ID is NEVER taken from frontend.
//
// JWT:
//
// {
//   vendor_id: 22,
//   email: "...",
//   role: "vendor"
// }
//
// Database relationship:
//
// order_vendor
//      ↓
// orders
//      ↓
// user_address
//
// order_items
//      ↓
// products
//      ↓
// vendor_id
//
// Therefore vendor receives ONLY
// his own order records.
//

// ========================================
// GET VENDOR ORDERS
// ========================================
exports.getVendorOrders = async (req, res) => {

    try {

        let vendorId =
            req.user.vendor_id ||
            req.user.user_id;


        console.log("Vendor Orders Request");
        console.log("Vendor ID:", vendorId);
        console.log("User:", req.user);


        // ========================================
        // GET VENDOR ORDERS
        // ========================================

        const [orders] =
            await db.promise().query(

                `
        SELECT

            ov.order_vendor_id,

            ov.order_id,

            ov.vendor_id,

            ov.vendor_total,

            ov.vendor_status,

            ov.created_at AS vendor_created_at,

            o.user_id,

            o.address_id,

            o.total_amount,

            o.payment_method,

            o.order_status,

            o.order_date,

            ua.full_name,

            ua.phone,

            ua.address_line,

            ua.city,

            ua.state,

            ua.pincode

        FROM order_vendor ov

        INNER JOIN orders o
            ON ov.order_id = o.order_id

        LEFT JOIN user_address ua
            ON o.address_id = ua.address_id

        WHERE ov.vendor_id = ?

        ORDER BY ov.order_id DESC
        `,

                [vendorId]

            );


        console.log(
            "Vendor Orders Found:",
            orders.length
        );


        // ========================================
        // GET PRODUCTS FOR EACH ORDER
        // ========================================

        for (
            let order of orders
        ) {

            const [items] =
                await db.promise().query(

                    `
          SELECT

              oi.order_item_id,

              oi.order_id,

              oi.product_id,

              oi.quantity,

              oi.price,

              oi.subtotal,

              pr.product_name,

              pr.brand,

              pr.image,

              pr.vendor_id

          FROM order_items oi

          INNER JOIN products pr
              ON oi.product_id = pr.product_id

          WHERE
              oi.order_id = ?

              AND pr.vendor_id = ?

          ORDER BY oi.order_item_id ASC

          `,

                    [
                        order.order_id,
                        vendorId
                    ]

                );


            order.items =
                items;


            console.log(
                `Order ${order.order_id} Items:`,
                items.length
            );

        }


        // ========================================
        // SUCCESS RESPONSE
        // ========================================

        return res.status(200).json({

            success: true,

            orders: orders

        });

    }

    catch (error) {

        console.error(
            "Get Vendor Orders Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch vendor orders",

            error:
                error.message

        });

    }

};


// ======================================================
// UPDATE VENDOR ORDER STATUS
// ======================================================

exports.cancelUserOrder = async (req, res) => {
    try {
        const userId = req.user?.user_id;
        const orderId = req.params.order_id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication data not found"
            });
        }

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        const [orderRows] = await db.promise().query(
            `
            SELECT order_id, user_id, order_status
            FROM orders
            WHERE order_id = ? AND user_id = ?
            `,
            [orderId, userId]
        );

        if (orderRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const order = orderRows[0];
        const cancellableStatuses = ["Pending", "Confirmed"];

        if (!cancellableStatuses.includes(order.order_status)) {
            return res.status(400).json({
                success: false,
                message: "This order cannot be cancelled in its current status."
            });
        }

        const [updateResult] = await db.promise().query(
            `
            UPDATE orders
            SET order_status = 'Cancelled'
            WHERE order_id = ? AND user_id = ? AND order_status IN ('Pending', 'Confirmed')
            `,
            [orderId, userId]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(400).json({
                success: false,
                message: "Order cancellation failed."
            });
        }

        await db.promise().query(
            `
            UPDATE order_vendor
            SET vendor_status = 'Cancelled'
            WHERE order_id = ?
            `,
            [orderId]
        );

        await db.promise().query(
            `
            INSERT INTO notifications (user_id, title, message, notification_type)
            VALUES (?, 'Order Cancelled', ?, 'Order')
            `,
            [userId, `Your order #${orderId} has been cancelled successfully.`]
        );

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order_id: Number(orderId),
            order_status: "Cancelled"
        });
    } catch (error) {
        console.error("Cancel User Order Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to cancel order",
            error: error.message
        });
    }
};

exports.updateVendorOrderStatus = async (
    req,
    res
) => {

    try {

        // ==================================================
        // VENDOR FROM JWT
        // ==================================================

        let vendorId =
            req.user?.vendor_id ||
            req.vendor?.vendor_id;


        if (!vendorId) {

            return res.status(401).json({

                success: false,

                message:
                    "Vendor authentication data not found"

            });

        }


        // ==================================================
        // ORDER VENDOR ID
        // ==================================================

        let orderVendorId =
            req.params.orderVendorId;


        let {
            vendor_status
        } = req.body;


        // ==================================================
        // VALIDATE STATUS
        // ==================================================

        let allowedStatuses = [

            "Confirmed",

            "Processing",

            "Shipped",

            "Delivered",

            "Cancelled"

        ];


        if (!vendor_status) {

            return res.status(400).json({

                success: false,

                message:
                    "Order status is required"

            });

        }


        if (
            !allowedStatuses.includes(
                vendor_status
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order status"

            });

        }


        // ==================================================
        // FIND VENDOR ORDER
        // ==================================================

        const [rows] =
            await db.promise().query(

                `
                SELECT

                    ov.order_vendor_id,

                    ov.order_id,

                    ov.vendor_id,

                    o.user_id

                FROM order_vendor ov

                INNER JOIN orders o
                    ON ov.order_id =
                       o.order_id

                WHERE
                    ov.order_vendor_id = ?

                    AND ov.vendor_id = ?
                `,

                [
                    orderVendorId,
                    vendorId
                ]

            );


        if (
            rows.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found for this vendor"

            });

        }


        let orderVendor =
            rows[0];


        // ==================================================
        // UPDATE VENDOR ORDER STATUS
        // ==================================================

        await db.promise().query(

            `
            UPDATE order_vendor

            SET vendor_status = ?

            WHERE
                order_vendor_id = ?

                AND vendor_id = ?
            `,

            [
                vendor_status,

                orderVendorId,

                vendorId
            ]

        );


        // ==================================================
        // UPDATE MAIN ORDER STATUS
        // ==================================================

        await db.promise().query(

            `
            UPDATE orders

            SET order_status = ?

            WHERE order_id = ?
            `,

            [
                vendor_status,

                orderVendor.order_id
            ]

        );


        // ==================================================
        // USER NOTIFICATION
        // ==================================================

        await db.promise().query(

            `
            INSERT INTO notifications
            (
                user_id,
                title,
                message,
                notification_type
            )
            VALUES (?, ?, ?, 'Order')
            `,

            [
                orderVendor.user_id,

                "Order Status Updated",

                `Your order #${orderVendor.order_id} is now ${vendor_status}.`
            ]

        );


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Order status updated successfully",

            order_vendor_id:
                orderVendorId,

            order_id:
                orderVendor.order_id,

            vendor_status:
                vendor_status

        });

    }

    catch (error) {

        console.error(
            "Update Vendor Order Status Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update order status",

            error:
                error.message

        });

    }

};