const db = require("../config/db");

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [items] = await db.promise().query(
      `
      SELECT 
        w.wishlist_id,
        w.user_id,
        w.product_id,
        w.added_at,
        p.product_name,
        p.brand,
        p.price,
        p.discount,
        p.image,
        p.rating,
        p.stock
      FROM wishlist w
      JOIN products p ON w.product_id = p.product_id
      WHERE w.user_id = ?
      ORDER BY w.added_at DESC
    `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      wishlist: items,
    });
  } catch (error) {
    console.error("Get Wishlist Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const [existing] = await db.promise().query(
      "SELECT wishlist_id FROM wishlist WHERE user_id = ? AND product_id = ?",
      [userId, product_id]
    );

    if (existing.length === 0) {
      await db.promise().query(
        "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)",
        [userId, product_id]
      );
    }

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    console.error("Add To Wishlist Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist",
      error: error.message,
    });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const [existing] = await db.promise().query(
      "SELECT wishlist_id FROM wishlist WHERE user_id = ? AND product_id = ?",
      [userId, product_id]
    );

    if (existing.length > 0) {
      await db.promise().query(
        "DELETE FROM wishlist WHERE wishlist_id = ?",
        [existing[0].wishlist_id]
      );
      return res.status(200).json({
        success: true,
        action: "removed",
        message: "Removed from wishlist",
      });
    } else {
      await db.promise().query(
        "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)",
        [userId, product_id]
      );
      return res.status(200).json({
        success: true,
        action: "added",
        message: "Added to wishlist",
      });
    }
  } catch (error) {
    console.error("Toggle Wishlist Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update wishlist",
      error: error.message,
    });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { product_id } = req.params;

    await db.promise().query(
      "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?",
      [userId, product_id]
    );

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Remove From Wishlist Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist",
      error: error.message,
    });
  }
};
