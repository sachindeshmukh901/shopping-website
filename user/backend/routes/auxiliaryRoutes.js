const express = require("express");
const router = express.Router();
const auxiliaryController = require("../controllers/auxiliaryController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/notifications", authMiddleware.verifyToken, auxiliaryController.getUserNotifications);
router.post("/returns", authMiddleware.verifyToken, auxiliaryController.createReturnRequest);
router.post("/ai-size", authMiddleware.verifyToken, auxiliaryController.getAISizeRecommendation);
router.post("/price-alert", authMiddleware.verifyToken, auxiliaryController.createPriceAlert);
router.get("/heatmap", auxiliaryController.getHeatmapLocations);
router.get("/delivery", auxiliaryController.getDeliveryInfo);

module.exports = router;
