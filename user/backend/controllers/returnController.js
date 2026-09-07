const db = require("../config/db");


// ======================================================
// GET VENDOR ID
// ======================================================

function getVendorId(req) {

    return (
        req.user?.vendor_id ||
        req.vendor?.vendor_id ||
        req.user?.user_id ||
        req.user?.id ||
        req.vendor_id ||
        null
    );

}


// ======================================================
// GET VENDOR RETURNS
// ======================================================

exports.getVendorReturns = async (
    req,
    res
) => {

    try {

        let vendorId =
            getVendorId(req);


        if (!vendorId) {

            return res.status(401).json({

                success: false,

                message:
                    "Vendor authentication data not found"

            });

        }


        // ==================================================
        // GET RETURNS
        // ==================================================

        const [returns] =
            await db.promise().query(

                `
                SELECT

                    r.return_id,

                    r.order_id,

                    r.product_id,

                    r.reason,

                    r.return_status AS status,

                    r.return_date AS created_at,

                    o.order_date,

                    o.payment_method,

                    p.product_name,

                    p.image,

                    p.brand,

                    ov.order_vendor_id,

                    ov.vendor_total,

                    ov.vendor_status

                FROM returns r

                LEFT JOIN orders o
                    ON r.order_id = o.order_id

                LEFT JOIN order_items oi
                    ON oi.order_id = r.order_id
                    AND oi.product_id = r.product_id

                LEFT JOIN products p
                    ON p.product_id = r.product_id

                LEFT JOIN order_vendor ov
                    ON ov.order_id = r.order_id
                    AND ov.vendor_id = p.vendor_id

                WHERE p.vendor_id = ?

                ORDER BY r.return_date DESC
                `,

                [vendorId]

            );


        // ==================================================
        // ATTACH REAL PRODUCT ITEMS TO EACH RETURN
        // ==================================================
        //
        // returns table doesn't store which specific
        // product(s) the return is for, so we pull the
        // vendor's items for that order from order_items.
        // ==================================================

        for (let item of returns) {

            const [items] =
                await db.promise().query(

                    `
                    SELECT

                        oi.order_item_id,

                        oi.product_id,

                        oi.quantity,

                        oi.price,

                        oi.subtotal,

                        pr.product_name,

                        pr.image,

                        pr.brand

                    FROM order_items oi

                    INNER JOIN products pr
                        ON oi.product_id = pr.product_id

                    WHERE
                        oi.order_id = ?
                        AND pr.vendor_id = ?
                    `,

                    [
                        item.order_id,
                        vendorId
                    ]

                );

            item.items = items;

        }


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            count:
                returns.length,

            returns:
                returns

        });

    }

    catch (error) {

        console.error(
            "Get Vendor Returns Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch vendor returns",

            error:
                error.message

        });

    }

};



// ======================================================
// GET RETURN BY ID
// ======================================================

exports.getReturnById = async (
    req,
    res
) => {

    try {

        let vendorId =
            getVendorId(req);


        if (!vendorId) {

            return res.status(401).json({

                success: false,

                message:
                    "Vendor authentication data not found"

            });

        }


        let returnId =
            req.params.returnId ||
            req.params.id;


        if (!returnId) {

            return res.status(400).json({

                success: false,

                message:
                    "Return ID is required"

            });

        }


        const [rows] =
            await db.promise().query(

                `
                SELECT

                    r.return_id,

                    r.order_id,

                    r.product_id,

                    r.reason,

                    r.return_status AS status,

                    r.return_date AS created_at,

                    o.order_date,

                    o.payment_method,

                    o.order_status,

                    p.product_name,

                    p.image,

                    p.brand,

                    ov.order_vendor_id,

                    ov.vendor_total,

                    ov.vendor_status

                FROM returns r

                LEFT JOIN orders o
                    ON r.order_id = o.order_id

                LEFT JOIN products p
                    ON p.product_id = r.product_id

                LEFT JOIN order_vendor ov
                    ON ov.order_id = r.order_id
                    AND ov.vendor_id = p.vendor_id

                WHERE
                    r.return_id = ?
                    AND p.vendor_id = ?

                LIMIT 1
                `,

                [
                    returnId,
                    vendorId
                ]

            );


        if (
            rows.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Return request not found"

            });

        }


        // ==================================================
        // ATTACH REAL PRODUCT ITEMS
        // ==================================================

        const [items] =
            await db.promise().query(

                `
                SELECT

                    oi.order_item_id,

                    oi.product_id,

                    oi.quantity,

                    oi.price,

                    oi.subtotal,

                    pr.product_name,

                    pr.image,

                    pr.brand

                FROM order_items oi

                INNER JOIN products pr
                    ON oi.product_id = pr.product_id

                WHERE
                    oi.order_id = ?
                    AND pr.vendor_id = ?
                `,

                [
                    rows[0].order_id,
                    vendorId
                ]

            );

        rows[0].items = items;


        return res.status(200).json({

            success: true,

            return:
                rows[0]

        });

    }

    catch (error) {

        console.error(
            "Get Return By ID Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch return",

            error:
                error.message

        });

    }

};



// ======================================================
// UPDATE RETURN STATUS
// ======================================================

exports.updateReturnStatus = async (
    req,
    res
) => {

    try {

        let vendorId =
            getVendorId(req);


        if (!vendorId) {

            return res.status(401).json({

                success: false,

                message:
                    "Vendor authentication data not found"

            });

        }


        let returnId =
            req.params.returnId ||
            req.params.id;


        if (!returnId) {

            return res.status(400).json({

                success: false,

                message:
                    "Return ID is required"

            });

        }


        let status =
            req.body?.status;


        if (!status) {

            return res.status(400).json({

                success: false,

                message:
                    "Return status is required"

            });

        }


        // ==================================================
        // ALLOWED STATUS
        // ==================================================

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


        let normalizedStatus =
            String(
                status
            ).trim();


        let matchedStatus =
            allowedStatuses.find(
                (item) =>
                    item.toLowerCase() ===
                    normalizedStatus.toLowerCase()
            );


        if (!matchedStatus) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid return status",

                allowedStatuses:
                    allowedStatuses

            });

        }


        // ==================================================
        // CHECK RETURN
        // ==================================================

        const [existing] =
            await db.promise().query(

                `
                SELECT
                    r.return_id
                FROM returns r
                INNER JOIN products p
                    ON p.product_id = r.product_id
                WHERE
                    r.return_id = ?
                    AND p.vendor_id = ?
                LIMIT 1
                `,

                [
                    returnId,
                    vendorId
                ]

            );


        if (
            existing.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Return request not found"

            });

        }


        // ==================================================
        // UPDATE
        // ==================================================

        await db.promise().query(

            `
            UPDATE returns r
            INNER JOIN products p
                ON p.product_id = r.product_id
            SET
                r.return_status = ?
            WHERE
                r.return_id = ?
                AND p.vendor_id = ?
            `,

            [
                matchedStatus,
                returnId,
                vendorId
            ]

        );


        return res.status(200).json({

            success: true,

            message:
                "Return status updated successfully",

            return_id:
                returnId,

            status:
                matchedStatus

        });

    }

    catch (error) {

        console.error(
            "Update Return Status Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update return status",

            error:
                error.message

        });

    }

};



// ======================================================
// CREATE RETURN
// ======================================================

exports.createReturn = async (
    req,
    res
) => {

    try {

        let vendorId =
            getVendorId(req);


        if (!vendorId) {

            return res.status(401).json({

                success: false,

                message:
                    "Vendor authentication data not found"

            });

        }


        let {

            order_id,

            order_vendor_id,

            reason,

            description,

            refund_amount

        } = req.body;


        if (!order_id) {

            return res.status(400).json({

                success: false,

                message:
                    "Order ID is required"

            });

        }


        if (!reason) {

            return res.status(400).json({

                success: false,

                message:
                    "Return reason is required"

            });

        }


        // ==================================================
        // CHECK ORDER VENDOR
        // ==================================================

        let vendorQuery = `
            SELECT
                order_vendor_id,
                order_id,
                vendor_id,
                vendor_total,
                vendor_status
            FROM order_vendor
            WHERE
                order_id = ?
                AND vendor_id = ?
        `;

        let vendorParams = [
            order_id,
            vendorId
        ];


        if (order_vendor_id) {

            vendorQuery = `
                SELECT
                    order_vendor_id,
                    order_id,
                    vendor_id,
                    vendor_total,
                    vendor_status
                FROM order_vendor
                WHERE
                    order_vendor_id = ?
                    AND order_id = ?
                    AND vendor_id = ?
            `;

            vendorParams = [
                order_vendor_id,
                order_id,
                vendorId
            ];

        }


        const [vendorOrders] =
            await db.promise().query(

                vendorQuery,

                vendorParams

            );


        if (
            vendorOrders.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Vendor order not found"

            });

        }


        let vendorOrder =
            vendorOrders[0];


        // ==================================================
        // CHECK EXISTING RETURN
        // ==================================================

        const [existingReturns] =
            await db.promise().query(

                `
                SELECT
                    r.return_id,
                    r.return_status AS status
                FROM returns r
                INNER JOIN products p
                    ON p.product_id = r.product_id
                WHERE
                    r.order_id = ?
                    AND p.vendor_id = ?
                ORDER BY r.return_id DESC
                LIMIT 1
                `,

                [
                    order_id,
                    vendorId
                ]

            );


        if (
            existingReturns.length > 0
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "A return request already exists for this order",

                return:
                    existingReturns[0]

            });

        }


        // ==================================================
        // REFUND AMOUNT
        // ==================================================

        let amount =
            Number(
                refund_amount
            );


        if (
            !Number.isFinite(amount) ||
            amount < 0
        ) {

            amount =
                Number(
                    vendorOrder.vendor_total || 0
                );

        }


        // ==================================================
        // INSERT RETURN
        // ==================================================

        const [result] =
            await db.promise().query(

                `
                INSERT INTO returns
                (
                    order_id,
                    product_id,
                    reason,
                    return_status,
                    return_date
                )

                VALUES
                (
                    ?,
                    ?,
                    ?,
                    'Pending',
                    NOW()
                )
                `,

                [
                    vendorOrder.order_id,
                    vendorOrder.product_id || null,
                    reason
                ]

            );


        return res.status(201).json({

            success: true,

            message:
                "Return request created successfully",

            return_id:
                result.insertId

        });

    }

    catch (error) {

        console.error(
            "Create Return Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to create return request",

            error:
                error.message

        });

    }

};



// ======================================================
// CUSTOMER: CREATE RETURN REQUEST
// ======================================================
//
// POST /api/returns/request
//
// Customer (logged in user) requests a return for a
// product they purchased. The order must belong to the
// user, the product must belong to the vendor, and the
// vendor's portion of the order must already be
// "Delivered" before a return can be requested.
// ======================================================

exports.createCustomerReturn = async (
    req,
    res
) => {

    try {

        let userId =
            req.user?.user_id ||
            req.user?.id;


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "User authentication data not found"

            });

        }


        let {

            order_id,

            product_id,

            reason,

            description

        } = req.body;


        if (!order_id) {

            return res.status(400).json({

                success: false,

                message:
                    "Order ID is required"

            });

        }


        if (!reason) {

            return res.status(400).json({

                success: false,

                message:
                    "Return reason is required"

            });

        }


        // ==================================================
        // MAKE SURE THE ORDER BELONGS TO THIS USER
        // ==================================================

        const [orders] =
            await db.promise().query(

                `
                SELECT
                    order_id,
                    user_id,
                    order_status
                FROM orders
                WHERE
                    order_id = ?
                    AND user_id = ?
                LIMIT 1
                `,

                [
                    order_id,
                    userId
                ]

            );


        if (
            orders.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found for this account"

            });

        }


        // ==================================================
        // FIND THE VENDOR FOR THIS ORDER / PRODUCT
        // ==================================================
        //
        // If a product_id was supplied, resolve the vendor
        // that actually owns that item on this order.
        // Otherwise fall back to the first vendor on the
        // order (single-vendor orders / general request).
        // ==================================================

        let itemQuery = `
            SELECT
                oi.order_item_id,
                oi.product_id,
                pr.vendor_id
            FROM order_items oi
            INNER JOIN products pr
                ON oi.product_id = pr.product_id
            WHERE oi.order_id = ?
        `;

        let itemParams = [order_id];


        if (product_id) {

            itemQuery += " AND oi.product_id = ?";

            itemParams.push(product_id);

        }

        itemQuery += " LIMIT 1";


        const [orderItems] =
            await db.promise().query(

                itemQuery,

                itemParams

            );


        if (
            orderItems.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Product not found on this order"

            });

        }

        let vendorId =
            orderItems[0].vendor_id;


        // ==================================================
        // VENDOR PORTION MUST BE DELIVERED
        // ==================================================

        const [vendorOrders] =
            await db.promise().query(

                `
                SELECT
                    order_vendor_id,
                    order_id,
                    vendor_id,
                    vendor_total,
                    vendor_status
                FROM order_vendor
                WHERE
                    order_id = ?
                    AND vendor_id = ?
                LIMIT 1
                `,

                [
                    order_id,
                    vendorId
                ]

            );


        if (
            vendorOrders.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Vendor order not found"

            });

        }


        let vendorOrder =
            vendorOrders[0];


        if (
            vendorOrder.vendor_status &&
            vendorOrder.vendor_status !== "Delivered"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Returns can only be requested after the order has been delivered"

            });

        }


        // ==================================================
        // CHECK EXISTING RETURN
        // ==================================================

        const [existingReturns] =
            await db.promise().query(

                `
                SELECT
                    r.return_id,
                    r.return_status AS status
                FROM returns r
                INNER JOIN products p
                    ON p.product_id = r.product_id
                WHERE
                    r.order_id = ?
                    AND p.vendor_id = ?
                ORDER BY r.return_id DESC
                LIMIT 1
                `,

                [
                    order_id,
                    vendorId
                ]

            );


        if (
            existingReturns.length > 0
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "A return request already exists for this order",

                return:
                    existingReturns[0]

            });

        }


        // ==================================================
        // INSERT RETURN
        // ==================================================

        const [result] =
            await db.promise().query(

                `
                INSERT INTO returns
                (
                    order_id,
                    product_id,
                    reason,
                    return_status,
                    return_date
                )

                VALUES
                (
                    ?,
                    ?,
                    ?,
                    'Pending',
                    NOW()
                )
                `,

                [
                    order_id,
                    orderItems[0].product_id,
                    reason
                ]

            );


        return res.status(201).json({

            success: true,

            message:
                "Return request submitted successfully",

            return_id:
                result.insertId

        });

    }

    catch (error) {

        console.error(
            "Create Customer Return Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to submit return request",

            error:
                error.message

        });

    }

};



// ======================================================
// CUSTOMER: GET MY RETURNS
// ======================================================
//
// GET /api/returns/my
//
// Returns every return request the logged in customer
// has made, across all vendors, so they can track status.
// ======================================================

exports.getUserReturns = async (
    req,
    res
) => {

    try {

        let userId =
            req.user?.user_id ||
            req.user?.id;


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "User authentication data not found"

            });

        }


        const [returns] =
            await db.promise().query(

                `
                SELECT

                    r.return_id,

                    r.order_id,

                    r.product_id,

                    r.reason,

                    r.return_status AS status,

                    r.return_date AS created_at,

                    o.order_date,

                    o.payment_method,

                    p.product_name,

                    p.image,

                    v.shop_name,

                    v.owner_name

                FROM returns r

                INNER JOIN orders o
                    ON r.order_id = o.order_id

                LEFT JOIN products p
                    ON p.product_id = r.product_id

                LEFT JOIN vendors v
                    ON v.vendor_id = p.vendor_id

                WHERE o.user_id = ?

                ORDER BY r.return_date DESC
                `,

                [userId]

            );


        for (
            let item of returns
        ) {

            const [items] =
                await db.promise().query(

                    `
                    SELECT

                        oi.order_item_id,

                        oi.product_id,

                        oi.quantity,

                        oi.price,

                        oi.subtotal,

                        pr.product_name,

                        pr.image,

                        pr.brand

                    FROM order_items oi

                    INNER JOIN products pr
                        ON oi.product_id = pr.product_id

                    WHERE
                        oi.order_id = ?
                        AND pr.vendor_id = ?
                    `,

                    [
                        item.order_id,
                        item.vendor_id
                    ]

                );

            item.items = items;

        }


        return res.status(200).json({

            success: true,

            count:
                returns.length,

            returns:
                returns

        });

    }

    catch (error) {

        console.error(
            "Get User Returns Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch your return requests",

            error:
                error.message

        });

    }

};



// ======================================================
// EXPORT CHECK
// ======================================================

console.log(
    "Return Controller:",
    Object.keys(
        module.exports
    )
);