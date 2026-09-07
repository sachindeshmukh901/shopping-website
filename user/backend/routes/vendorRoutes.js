const express = require("express");

const router =
    express.Router();

const bulkUpload =
    require("../middleware/bulkUploadMiddleware");


// ======================================================
// CONTROLLERS
// ======================================================

const vendorController =
    require("../controllers/vendorController");

const orderController =
    require("../controllers/orderController");

const categoryController =
    require("../controllers/categoryController");


// ======================================================
// MIDDLEWARE
// ======================================================

const vendorAuthMiddleware =
    require("../middleware/vendorAuthMiddleware");

const upload =
    require("../middleware/uploadMiddleware");


// ======================================================
// VENDOR REGISTRATION
// ======================================================

router.post(
    "/register",
    vendorController.registerVendor
);


// ======================================================
// VENDOR LOGIN
// ======================================================

router.post(
    "/login",
    vendorController.login
);


// ======================================================
// VENDOR CATEGORIES
// ======================================================

router.get(
    "/categories",
    vendorAuthMiddleware.verifyVendorToken,
    categoryController.getAllCategories
);


// ======================================================
// VENDOR PROFILE
// ======================================================

router.get(
    "/profile",
    vendorAuthMiddleware.verifyVendorToken,
    vendorController.getProfile
);


// ======================================================
// VENDOR DASHBOARD
// ======================================================

router.get(
    "/dashboard/stats",
    vendorAuthMiddleware.verifyVendorToken,
    vendorController.getDashboardStats
);


// ======================================================
// VENDOR ORDERS
// ======================================================

router.get(
    "/orders",
    vendorAuthMiddleware.verifyVendorToken,
    orderController.getVendorOrders
);


// ======================================================
// UPDATE VENDOR ORDER STATUS
// ======================================================

router.patch(
    "/orders/:order_id/status",
    vendorAuthMiddleware.verifyVendorToken,
    orderController.updateVendorOrderStatus
);


// ======================================================
// VENDOR PRODUCTS
// ======================================================

router.get(

    "/products",

    vendorAuthMiddleware.verifyVendorToken,

    vendorController.getMyProducts

);


router.post(

    "/products",

    vendorAuthMiddleware.verifyVendorToken,

    upload.single("image"),

    vendorController.addProduct

);


router.put(

    "/products/:product_id",

    vendorAuthMiddleware.verifyVendorToken,

    upload.single("image"),

    vendorController.updateProduct

);


router.delete(

    "/products/:product_id",

    vendorAuthMiddleware.verifyVendorToken,

    vendorController.deleteProduct

);


// ======================================================
// BULK PRODUCT IMPORT / EXPORT
// ======================================================

// DOWNLOAD EXCEL TEMPLATE

router.get(

    "/products/import/template",

    vendorAuthMiddleware.verifyVendorToken,

    vendorController.downloadProductTemplate

);


// PREVIEW / IMPORT EXCEL

router.post(

    "/products/import",

    vendorAuthMiddleware.verifyVendorToken,

    bulkUpload.single("file"),

    vendorController.bulkImportProducts

);


// EXPORT PRODUCTS

router.get(

    "/products/export",

    vendorAuthMiddleware.verifyVendorToken,

    vendorController.exportProducts

);

// ======================================================
// VENDOR LOGOUT
// ======================================================

router.post(
    "/logout",
    vendorAuthMiddleware.verifyVendorToken,
    vendorController.logout
);


// ======================================================
// DELETE VENDOR ACCOUNT
// ======================================================

router.delete(
    "/delete-account",
    vendorAuthMiddleware.verifyVendorToken,
    vendorController.deleteAccount
);


// ======================================================
// VENDOR HEATMAP
// ======================================================

router.get(
    "/heatmap",
    vendorAuthMiddleware.verifyVendorToken,
    vendorController.getVendorHeatMap
);


// ======================================================
// EXPORT
// ======================================================

module.exports =
    router;