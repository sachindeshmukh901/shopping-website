const express = require("express");

const router =
    express.Router();


// ======================================================
// CONTROLLER
// ======================================================

const returnController =
    require("../controllers/returnController");


// ======================================================
// AUTH
// ======================================================

const vendorAuthMiddleware =
    require("../middleware/vendorAuthMiddleware");


// ======================================================
// USER AUTH (CUSTOMER)
// ======================================================

const authMiddleware =
    require("../middleware/authMiddleware");


// ======================================================
// DEBUG
// ======================================================

console.log(
    "Return Routes Controller:",
    Object.keys(
        returnController
    )
);


// ======================================================
// SAFETY CHECK
// ======================================================

if (
    typeof returnController.getVendorReturns !==
    "function"
) {

    throw new Error(
        "getVendorReturns controller is not a function"
    );

}


if (
    typeof returnController.getReturnById !==
    "function"
) {

    throw new Error(
        "getReturnById controller is not a function"
    );

}


if (
    typeof returnController.updateReturnStatus !==
    "function"
) {

    throw new Error(
        "updateReturnStatus controller is not a function"
    );

}


if (
    typeof returnController.createReturn !==
    "function"
) {

    throw new Error(
        "createReturn controller is not a function"
    );

}


if (
    typeof returnController.createCustomerReturn !==
    "function"
) {

    throw new Error(
        "createCustomerReturn controller is not a function"
    );

}


if (
    typeof returnController.getUserReturns !==
    "function"
) {

    throw new Error(
        "getUserReturns controller is not a function"
    );

}


// ======================================================
// GET VENDOR RETURNS
// ======================================================
//
// GET
// /api/returns/vendor
//
// ======================================================

router.get(

    "/vendor",

    vendorAuthMiddleware.verifyVendorToken,

    returnController.getVendorReturns

);


// ======================================================
// CUSTOMER - GET MY RETURNS
// ======================================================
//
// GET
// /api/returns/my
//
// NOTE: this must be registered before the
// "/:returnId" route below, otherwise Express would
// treat "my" as a returnId param.
// ======================================================

router.get(

    "/my",

    authMiddleware.verifyToken,

    returnController.getUserReturns

);


// ======================================================
// CUSTOMER - CREATE RETURN REQUEST
// ======================================================
//
// POST
// /api/returns/request
//
// ======================================================

router.post(

    "/request",

    authMiddleware.verifyToken,

    returnController.createCustomerReturn

);


// ======================================================
// GET SINGLE RETURN
// ======================================================
//
// GET
// /api/returns/:returnId
//
// ======================================================

router.get(

    "/:returnId",

    vendorAuthMiddleware.verifyVendorToken,

    returnController.getReturnById

);


// ======================================================
// CREATE RETURN
// ======================================================
//
// POST
// /api/returns
//
// ======================================================

router.post(

    "/",

    vendorAuthMiddleware.verifyVendorToken,

    returnController.createReturn

);


// ======================================================
// UPDATE RETURN STATUS
// ======================================================
//
// PUT
// /api/returns/:returnId/status
//
// ======================================================

router.put(

    "/:returnId/status",

    vendorAuthMiddleware.verifyVendorToken,

    returnController.updateReturnStatus

);


// ======================================================
// PATCH RETURN STATUS
// ======================================================
//
// PATCH
// /api/returns/:returnId/status
//
// ======================================================

router.patch(

    "/:returnId/status",

    vendorAuthMiddleware.verifyVendorToken,

    returnController.updateReturnStatus

);


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports =
    router;