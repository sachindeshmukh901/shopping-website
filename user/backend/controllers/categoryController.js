const db = require("../config/db");

const normalizeTargetPage = (value) => {
  const page = String(value || "").trim();
  if (!page) return null;

  const normalized = page.toLowerCase();

  if (["men", "mens", "male"].includes(normalized)) return "Men";
  if (["women", "ladies", "female"].includes(normalized)) return "Women";
  if (["kids", "children", "boy", "girl"].includes(normalized)) return "Kids";
  if (["accessories", "accessory", "bags", "watch", "watches", "wallets", "sunglasses"].includes(normalized)) return "Accessories";
  if (["unisex"].includes(normalized)) return "Unisex";

  return page;
};

const ensureTargetPageColumn = async () => {
  try {
    const [rows] = await db.promise().query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'categories'
         AND COLUMN_NAME = 'target_page'`
    );

    if (rows.length === 0) {
      await db.promise().query(
        `ALTER TABLE categories ADD COLUMN target_page VARCHAR(50) NULL AFTER category_name`
      );
    }
  } catch (error) {
    console.error("Category column check error:", error);
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.promise().query(
      `SELECT * FROM categories ORDER BY category_name ASC`
    );

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { category_name, description, category_image, target_page } = req.body;
    const trimmedCategoryName = String(category_name || "").trim();

    if (!trimmedCategoryName) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    await ensureTargetPageColumn();

    const [existingCategories] = await db.promise().query(
      `SELECT category_id FROM categories WHERE LOWER(category_name) = LOWER(?)`,
      [trimmedCategoryName]
    );

    if (existingCategories.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const normalizedDescription = description ? String(description).trim() : null;
    const normalizedImage = category_image ? String(category_image).trim() : null;
    const normalizedTargetPage = normalizeTargetPage(target_page);

    const [result] = await db.promise().query(
      `INSERT INTO categories (category_name, description, category_image, target_page, status)
       VALUES (?, ?, ?, ?, 'Active')`,
      [trimmedCategoryName, normalizedDescription, normalizedImage, normalizedTargetPage]
    );

    return res.status(201).json({
      success: true,
      message: "Category added successfully",
      category_id: result.insertId,
      category: {
        category_id: result.insertId,
        category_name: trimmedCategoryName,
        description: normalizedDescription,
        category_image: normalizedImage,
        target_page: normalizedTargetPage,
        status: "Active",
      },
    });
  } catch (error) {
    console.error("Add Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add category",
      error: error.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { category_id } = req.params;
    const { category_name, description, category_image, target_page } = req.body;

    if (!category_id) {
      return res.status(400).json({
        success: false,
        message: "Category id is required",
      });
    }

    await ensureTargetPageColumn();

    const [categoryRows] = await db.promise().query(
      `SELECT * FROM categories WHERE category_id = ?`,
      [category_id]
    );

    if (categoryRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const trimmedCategoryName = String(category_name || "").trim();
    if (!trimmedCategoryName) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const [duplicateRows] = await db.promise().query(
      `SELECT category_id FROM categories WHERE LOWER(category_name) = LOWER(?) AND category_id != ?`,
      [trimmedCategoryName, category_id]
    );

    if (duplicateRows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const normalizedDescription = description ? String(description).trim() : null;
    const normalizedImage = category_image ? String(category_image).trim() : null;
    const normalizedTargetPage = normalizeTargetPage(target_page);

    await db.promise().query(
      `UPDATE categories
       SET category_name = ?, description = ?, category_image = ?, target_page = ?
       WHERE category_id = ?`,
      [trimmedCategoryName, normalizedDescription, normalizedImage, normalizedTargetPage, category_id]
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: {
        category_id,
        category_name: trimmedCategoryName,
        description: normalizedDescription,
        category_image: normalizedImage,
        target_page: normalizedTargetPage,
        status: categoryRows[0].status || "Active",
      },
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { category_id } = req.params;

    if (!category_id) {
      return res.status(400).json({
        success: false,
        message: "Category id is required",
      });
    }

    const [categoryRows] = await db.promise().query(
      `SELECT category_id FROM categories WHERE category_id = ?`,
      [category_id]
    );

    if (categoryRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const [productRows] = await db.promise().query(
      `SELECT product_id FROM products WHERE category_id = ? LIMIT 1`,
      [category_id]
    );

    if (productRows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This category is used by one or more products. Reassign or delete those products before deleting the category.",
      });
    }

    await db.promise().query(
      `DELETE FROM categories WHERE category_id = ?`,
      [category_id]
    );

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};
