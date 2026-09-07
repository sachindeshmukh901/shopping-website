const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", authController.register);

router.post("/login", authController.login);

router.get("/profile", authMiddleware.verifyToken, authController.getProfile);

router.put("/update-profile", authMiddleware.verifyToken, authController.updateProfile);

router.put("/change-password", authMiddleware.verifyToken, authController.changePassword);

router.put("/forgot-password", authController.forgotPassword);

router.post("/logout", authMiddleware.verifyToken, authController.logout);

router.delete("/delete-account", authMiddleware.verifyToken, authController.deleteAccount);

module.exports = router;

