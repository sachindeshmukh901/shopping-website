const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const categoryController = require("../controllers/categoryController");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");


// ========================================
// ADMIN AUTH
// ========================================

router.post(
    "/create",
    adminController.createAdmin
);

router.post(
    "/login",
    adminController.loginAdmin
);


// ========================================
// ADMIN DASHBOARD
// ========================================

router.get(
    "/dashboard/stats",
    adminMiddleware.verifyAdminToken,
    adminController.getDashboardStats
);

router.get(
    "/recent-registrations",
    adminMiddleware.verifyAdminToken,
    adminController.getRecentRegistrations
);


// ========================================
// VENDOR MANAGEMENT
// ========================================

router.get(
    "/vendors",
    adminMiddleware.verifyAdminToken,
    adminController.getAllVendors
);

router.get(
    "/vendors/pending",
    adminMiddleware.verifyAdminToken,
    adminController.getPendingVendors
);

router.put(
    "/vendors/:vendor_id/approve",
    adminMiddleware.verifyAdminToken,
    adminController.approveVendor
);

router.put(
    "/vendors/:vendor_id/reject",
    adminMiddleware.verifyAdminToken,
    adminController.rejectVendor
);


// ========================================
// USER MANAGEMENT
// ========================================

router.get(
    "/users",
    adminMiddleware.verifyAdminToken,
    adminController.getAllUsers
);

router.put(
    "/users/:user_id/block",
    adminMiddleware.verifyAdminToken,
    adminController.blockUser
);

router.put(
    "/users/:user_id/unblock",
    adminMiddleware.verifyAdminToken,
    adminController.unblockUser
);


// ========================================
// CATEGORY MANAGEMENT
// ========================================

router.get(
    "/categories",
    adminMiddleware.verifyAdminToken,
    categoryController.getAllCategories
);

router.post(
    "/categories",
    adminMiddleware.verifyAdminToken,
    categoryController.addCategory
);

router.put(
    "/categories/:category_id",
    adminMiddleware.verifyAdminToken,
    categoryController.updateCategory
);

router.delete(
    "/categories/:category_id",
    adminMiddleware.verifyAdminToken,
    categoryController.deleteCategory
);


// ========================================
// PRODUCT MANAGEMENT
// ========================================

// Get ALL products from ALL vendors
router.get(
    "/products",
    adminMiddleware.verifyAdminToken,
    adminController.getAllProducts
);


// Admin ADD product
router.post(
    "/products",
    adminMiddleware.verifyAdminToken,
    upload.single("image"),
    adminController.addProduct
);


// Admin UPDATE product
router.put(
    "/products/:product_id",
    adminMiddleware.verifyAdminToken,
    upload.single("image"),
    adminController.updateProduct
);


// Admin DELETE product
router.delete(
    "/products/:product_id",
    adminMiddleware.verifyAdminToken,
    adminController.deleteProduct
);


// Admin activate/deactivate product
router.put(
    "/products/:product_id/status",
    adminMiddleware.verifyAdminToken,
    adminController.updateProductStatus
);


// ========================================
// ORDERS MANAGEMENT
// ========================================

router.get(
    "/orders",
    adminMiddleware.verifyAdminToken,
    adminController.getAllOrders
);


router.patch(
    "/orders/:order_id/status",
    adminMiddleware.verifyAdminToken,
    adminController.updateOrderStatus
);


// ========================================
// PAYMENTS MANAGEMENT
// ========================================

router.get(
    "/payments",
    adminMiddleware.verifyAdminToken,
    adminController.getAllPayments
);


// ========================================
// RIDERS MANAGEMENT
// ========================================

router.get(
    "/riders",
    adminMiddleware.verifyAdminToken,
    adminController.getAllRiders
);

router.post(
    "/riders",
    adminMiddleware.verifyAdminToken,
    adminController.addRider
);

router.delete(
    "/riders/:rider_id",
    adminMiddleware.verifyAdminToken,
    adminController.deleteRider
);


// ========================================
// DELIVERIES MANAGEMENT
// ========================================

router.get(
    "/deliveries",
    adminMiddleware.verifyAdminToken,
    adminController.getAllDeliveries
);

router.patch(
    "/deliveries/:order_id/assign",
    adminMiddleware.verifyAdminToken,
    adminController.assignRiderToDelivery
);


// ========================================
// RETURNS MANAGEMENT
// ========================================

router.get(
    "/returns",
    adminMiddleware.verifyAdminToken,
    adminController.getAllReturns
);

router.put(
    "/returns/:return_id/status",
    adminMiddleware.verifyAdminToken,
    adminController.updateReturnStatus
);

router.patch(
    "/returns/:return_id/status",
    adminMiddleware.verifyAdminToken,
    adminController.updateReturnStatus
);


// ========================================
// PAYOUTS MANAGEMENT
// ========================================

router.get(
    "/payouts",
    adminMiddleware.verifyAdminToken,
    adminController.getAllPayouts
);

router.put(
    "/payouts/:payout_id/status",
    adminMiddleware.verifyAdminToken,
    adminController.updatePayoutStatus
);


module.exports = router;