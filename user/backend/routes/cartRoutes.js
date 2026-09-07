const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware.verifyToken, cartController.getCart);
router.post("/", authMiddleware.verifyToken, cartController.addToCart);
router.put("/:cart_item_id", authMiddleware.verifyToken, cartController.updateQuantity);
router.delete("/clear", authMiddleware.verifyToken, cartController.clearCart);
router.delete("/:cart_item_id", authMiddleware.verifyToken, cartController.removeItem);

module.exports = router;
