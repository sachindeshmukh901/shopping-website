const express = require("express");
const router = express.Router();

const blogController = require("../controllers/blogController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/public", blogController.getPublishedBlogs);
router.get("/public/:id", blogController.getBlogById);

router.get("/admin", adminMiddleware.verifyAdminToken, blogController.getAllBlogsForAdmin);
router.post("/admin", adminMiddleware.verifyAdminToken, blogController.createBlog);
router.put("/admin/:id", adminMiddleware.verifyAdminToken, blogController.updateBlog);
router.patch("/admin/:id/status", adminMiddleware.verifyAdminToken, blogController.updateBlogStatus);
router.delete("/admin/:id", adminMiddleware.verifyAdminToken, blogController.deleteBlog);

router.get("/me", authMiddleware.verifyToken, blogController.getPublishedBlogs);

module.exports = router;
