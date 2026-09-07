const express = require("express");

const router =
    express.Router();


const earningController =
    require("../controllers/earningController");


const vendorAuthMiddleware =
    require("../middleware/vendorAuthMiddleware");


// ======================================================
// GET VENDOR EARNINGS
// ======================================================
//
// GET /api/earnings/vendor
//
// Vendor ID JWT se aayegi.
// Frontend vendor_id nahi bhejega.
//

router.get(

    "/vendor",

    vendorAuthMiddleware.verifyVendorToken,

    earningController.getVendorEarnings

);


module.exports =
    router;