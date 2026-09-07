const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/validate", couponController.validateCoupon);
router.get("/", couponController.getCoupons);
router.get("/spin-status", authMiddleware.verifyToken, couponController.getSpinStatus);
router.post("/spin", authMiddleware.verifyToken, couponController.spinTheWheel);
router.get("/my-rewards", authMiddleware.verifyToken, couponController.getMyRewards);
router.post("/apply-reward", authMiddleware.verifyToken, couponController.applyRewardToOrder);

module.exports = router;
