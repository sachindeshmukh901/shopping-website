const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/", categoryController.getAllCategories);
router.post("/", adminMiddleware.verifyAdminToken, categoryController.addCategory);

module.exports = router;
