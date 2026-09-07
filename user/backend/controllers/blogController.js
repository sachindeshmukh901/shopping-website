const db = require("../config/db");

const allowedStatuses = ["draft", "published"];

const normalizeSlug = (title) => {
    if (!title) return "blog-post";

    return String(title)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "blog-post";
};

exports.getPublishedBlogs = async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            `SELECT
                blog_id,
                title,
                slug,
                summary,
                content,
                image_url,
                status,
                created_at,
                updated_at,
                published_at
             FROM blogs
             WHERE status = 'published'
             ORDER BY published_at DESC, created_at DESC`
        );

        return res.status(200).json({
            success: true,
            blogs: rows
        });
    } catch (error) {
        console.error("Get published blogs error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch published blogs",
            error: error.message
        });
    }
};

exports.getBlogById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.promise().query(
            `SELECT
                blog_id,
                title,
                slug,
                summary,
                content,
                image_url,
                status,
                created_at,
                updated_at,
                published_at
             FROM blogs
             WHERE blog_id = ? AND status = 'published'`,
            [id]
        );

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        return res.status(200).json({
            success: true,
            blog: rows[0]
        });
    } catch (error) {
        console.error("Get blog by id error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch blog",
            error: error.message
        });
    }
};

exports.getAllBlogsForAdmin = async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            `SELECT
                blog_id,
                title,
                slug,
                summary,
                content,
                image_url,
                status,
                created_at,
                updated_at,
                published_at
             FROM blogs
             ORDER BY created_at DESC`
        );

        return res.status(200).json({
            success: true,
            total: rows.length,
            blogs: rows
        });
    } catch (error) {
        console.error("Get all blogs error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch blogs",
            error: error.message
        });
    }
};

exports.createBlog = async (req, res) => {
    try {
        const {
            title,
            slug,
            summary,
            content,
            image_url,
            status = "draft"
        } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be draft or published"
            });
        }

        const finalSlug = slug || normalizeSlug(title);

        const [existing] = await db.promise().query(
            "SELECT blog_id FROM blogs WHERE slug = ?",
            [finalSlug]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "A blog with this slug already exists"
            });
        }

        const publishedAt = status === "published" ? new Date() : null;

        const [result] = await db.promise().query(
            `INSERT INTO blogs
                (title, slug, summary, content, image_url, status, published_at, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title.trim(),
                finalSlug,
                summary || "",
                content,
                image_url || null,
                status,
                publishedAt,
                req.admin?.admin_id || req.user?.user_id || null
            ]
        );

        const [rows] = await db.promise().query(
            `SELECT
                blog_id,
                title,
                slug,
                summary,
                content,
                image_url,
                status,
                created_at,
                updated_at,
                published_at
             FROM blogs
             WHERE blog_id = ?`,
            [result.insertId]
        );

        return res.status(201).json({
            success: true,
            message: "Blog created successfully",
            blog: rows[0]
        });
    } catch (error) {
        console.error("Create blog error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create blog",
            error: error.message
        });
    }
};

exports.updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            slug,
            summary,
            content,
            image_url,
            status
        } = req.body;

        const [existing] = await db.promise().query(
            "SELECT * FROM blogs WHERE blog_id = ?",
            [id]
        );

        if (!existing.length) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        const blog = existing[0];
        const nextStatus = status && allowedStatuses.includes(status) ? status : blog.status;
        const nextTitle = title || blog.title;
        const nextSlug = slug || blog.slug || normalizeSlug(nextTitle);
        const nextSummary = summary !== undefined ? summary : blog.summary;
        const nextContent = content || blog.content;
        const nextImageUrl = image_url !== undefined ? image_url : blog.image_url;

        if (nextSlug !== blog.slug) {
            const [duplicate] = await db.promise().query(
                "SELECT blog_id FROM blogs WHERE slug = ? AND blog_id != ?",
                [nextSlug, id]
            );

            if (duplicate.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "A blog with this slug already exists"
                });
            }
        }

        const publishedAt = nextStatus === "published" ? (blog.published_at || new Date()) : null;

        await db.promise().query(
            `UPDATE blogs
             SET title = ?, slug = ?, summary = ?, content = ?, image_url = ?, status = ?, published_at = ?
             WHERE blog_id = ?`,
            [
                nextTitle.trim(),
                nextSlug,
                nextSummary || "",
                nextContent,
                nextImageUrl || null,
                nextStatus,
                publishedAt,
                id
            ]
        );

        const [rows] = await db.promise().query(
            `SELECT
                blog_id,
                title,
                slug,
                summary,
                content,
                image_url,
                status,
                created_at,
                updated_at,
                published_at
             FROM blogs
             WHERE blog_id = ?`,
            [id]
        );

        return res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            blog: rows[0]
        });
    } catch (error) {
        console.error("Update blog error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update blog",
            error: error.message
        });
    }
};

exports.deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.promise().query(
            "DELETE FROM blogs WHERE blog_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Blog deleted successfully"
        });
    } catch (error) {
        console.error("Delete blog error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete blog",
            error: error.message
        });
    }
};

exports.updateBlogStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be draft or published"
            });
        }

        const [existing] = await db.promise().query(
            "SELECT * FROM blogs WHERE blog_id = ?",
            [id]
        );

        if (!existing.length) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        const blog = existing[0];
        const publishedAt = status === "published" ? (blog.published_at || new Date()) : null;

        await db.promise().query(
            "UPDATE blogs SET status = ?, published_at = ? WHERE blog_id = ?",
            [status, publishedAt, id]
        );

        return res.status(200).json({
            success: true,
            message: `Blog marked as ${status}`
        });
    } catch (error) {
        console.error("Update blog status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update blog status",
            error: error.message
        });
    }
};
