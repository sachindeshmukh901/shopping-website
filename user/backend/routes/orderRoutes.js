const express = require("express");

const router =
    express.Router();


// ======================================================
// CONTROLLER
// ======================================================

const orderController =
    require("../controllers/orderController");

const razorpayController =
    require("../controllers/razorpayController");


// ======================================================
// USER AUTHENTICATION
// ======================================================

const authMiddleware =
    require("../middleware/authMiddleware");


// ======================================================
// VENDOR AUTHENTICATION
// ======================================================

const vendorAuthMiddleware =
    require("../middleware/vendorAuthMiddleware");

router.post(
    "/payment/create",
    authMiddleware.verifyToken,
    razorpayController.createPaymentOrder
);

router.post(
    "/payment/verify",
    authMiddleware.verifyToken,
    razorpayController.verifyPayment
);


// ======================================================
// GET VENDOR ORDERS
// ======================================================
//
// Final API:
// GET /api/orders/vendor
//
// Vendor ID JWT se aayegi.
// Frontend vendor_id nahi bhejega.
//

router.get(
    "/vendor",
    vendorAuthMiddleware.verifyVendorToken,
    orderController.getVendorOrders
);


// ======================================================
// USER CHECKOUT - CREATE ORDER
// ======================================================
//
// Final API:
// POST /api/orders/checkout
//
// User ID JWT se aayegi.
//

router.post(
    "/checkout",
    authMiddleware.verifyToken,
    orderController.createOrder
);


// ======================================================
// GET USER ORDERS
// ======================================================
//
// Final API:
// GET /api/orders
//
// User ID JWT se aayegi.
//

router.get(
    "/",
    authMiddleware.verifyToken,
    orderController.getUserOrders
);


// ======================================================
// GET USER ORDERS - ALIAS
// ======================================================
//
// Final API:
// GET /api/orders/my-orders
//
// User ID JWT se aayegi.
//

router.get(
    "/my-orders",
    authMiddleware.verifyToken,
    orderController.getUserOrders
);


// ======================================================
// GET USER ADDRESSES
// ======================================================
//
// Final API:
// GET /api/orders/addresses
//
// User ID JWT se aayegi.
//

router.get(
    "/addresses",
    authMiddleware.verifyToken,
    orderController.getUserAddresses
);


// ======================================================
// SAVE USER ADDRESS
// ======================================================
//
// Final API:
// POST /api/orders/addresses
//
// User ID JWT se aayegi.
//

router.post(
    "/addresses",
    authMiddleware.verifyToken,
    orderController.saveUserAddress
);


// ======================================================
// UPDATE VENDOR ORDER STATUS
// ======================================================
//
// Final API:
// PATCH /api/orders/vendor/:orderVendorId/status
//

router.patch(
    "/vendor/:orderVendorId/status",
    vendorAuthMiddleware.verifyVendorToken,
    orderController.updateVendorOrderStatus
);


// ======================================================
// USER CANCEL ORDER
// ======================================================
//
// Final API:
// PATCH /api/orders/:order_id/cancel
//
// User ID JWT se aayegi.
//
// ======================================================

router.patch(
    "/:order_id/cancel",
    authMiddleware.verifyToken,
    orderController.cancelUserOrder
);


// ======================================================
// EXPORT
// ======================================================

module.exports =
    router;