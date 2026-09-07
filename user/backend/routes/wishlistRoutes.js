const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware.verifyToken, wishlistController.getWishlist);
router.post("/", authMiddleware.verifyToken, wishlistController.addToWishlist);
router.post("/toggle", authMiddleware.verifyToken, wishlistController.toggleWishlist);
router.delete("/:product_id", authMiddleware.verifyToken, wishlistController.removeFromWishlist);

module.exports = router;
