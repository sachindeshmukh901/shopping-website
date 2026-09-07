const express = require("express");

const router = express.Router();

const reviewController =
  require("../controllers/reviewController");

const authMiddleware =
  require("../middleware/authMiddleware");

const vendorAuthMiddleware =
  require("../middleware/vendorAuthMiddleware");


// ======================================================
// USER - ADD REVIEW
// ======================================================

router.post(
  "/",
  authMiddleware.verifyToken,
  reviewController.addReview
);


// ======================================================
// GET PRODUCT REVIEWS
// ======================================================

router.get(
  "/product/:product_id",
  reviewController.getProductReviews
);


// ======================================================
// VENDOR REVIEWS
// ======================================================

router.get(
  "/vendor",
  vendorAuthMiddleware.verifyVendorToken,
  reviewController.getVendorReviews
);


// ======================================================
// VENDOR REVIEW STATISTICS
// ======================================================

router.get(
  "/vendor/stats",
  vendorAuthMiddleware.verifyVendorToken,
  reviewController.getVendorReviewStats
);


module.exports = router;