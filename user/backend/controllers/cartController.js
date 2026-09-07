const db = require("../config/db");

// Helper to ensure cart exists for user
async function getOrCreateCartId(userId) {
  let [carts] = await db.promise().query(
    "SELECT cart_id FROM cart WHERE user_id = ?",
    [userId]
  );
  if (carts.length > 0) {
    return carts[0].cart_id;
  }
  const [result] = await db.promise().query(
    "INSERT INTO cart (user_id) VALUES (?)",
    [userId]
  );
  return result.insertId;
}

// GET CART FOR LOGGED-IN USER
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const cartId = await getOrCreateCartId(userId);

    const [items] = await db.promise().query(
      `
      SELECT 
        ci.cart_item_id,
        ci.cart_id,
        ci.product_id,
        ci.size,
        ci.quantity,
        ci.price AS cart_price,
        p.product_name,
        p.brand,
        p.image,
        p.price AS current_price,
        p.discount,
        p.stock,
        ps.stock AS size_stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.product_id
      LEFT JOIN product_sizes ps
        ON ps.product_id = ci.product_id
        AND ps.size = ci.size
      WHERE ci.cart_id = ?
      ORDER BY ci.cart_item_id DESC
    `,
      [cartId]
    );

    return res.status(200).json({
      success: true,
      cart_id: cartId,
      items: items,
    });
  } catch (error) {
    console.error("Get Cart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart items",
      error: error.message,
    });
  }
};

// ADD ITEM TO CART
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { product_id, quantity = 1, size } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Check product
    const [products] = await db.promise().query(
      "SELECT product_id, price, stock FROM products WHERE product_id = ?",
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = products[0];

    // Check whether this product has size variants at all
    const [productSizes] = await db.promise().query(
      "SELECT size, stock FROM product_sizes WHERE product_id = ?",
      [product_id]
    );

    let normalizedSize = size ? String(size).trim() : null;

    if (productSizes.length > 0) {
      // Product has sizes -> a size selection is mandatory
      if (!normalizedSize) {
        return res.status(400).json({
          success: false,
          message: "Please select a size for this product",
        });
      }

      const matchedSize = productSizes.find(
        (s) => s.size === normalizedSize
      );

      if (!matchedSize) {
        return res.status(400).json({
          success: false,
          message: "Selected size is not available for this product",
        });
      }

      if (matchedSize.stock < Number(quantity)) {
        return res.status(400).json({
          success: false,
          message: `Only ${matchedSize.stock} unit(s) left in size ${normalizedSize}`,
        });
      }
    } else {
      // Product has no sizes -> ignore any size sent by client
      normalizedSize = null;
    }

    const cartId = await getOrCreateCartId(userId);

    // Check existing item (same product AND same size)
    const [existing] = await db.promise().query(
      `SELECT cart_item_id, quantity FROM cart_items
       WHERE cart_id = ? AND product_id = ?
       AND (size <=> ?)`,
      [cartId, product_id, normalizedSize]
    );

    if (existing.length > 0) {
      const newQty = existing[0].quantity + Number(quantity);
      await db.promise().query(
        "UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?",
        [newQty, existing[0].cart_item_id]
      );
    } else {
      await db.promise().query(
        "INSERT INTO cart_items (cart_id, product_id, size, quantity, price) VALUES (?, ?, ?, ?, ?)",
        [cartId, product_id, normalizedSize, Number(quantity), product.price]
      );
    }

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
    });
  } catch (error) {
    console.error("Add To Cart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
      error: error.message,
    });
  }
};

// UPDATE CART ITEM QUANTITY
exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { cart_item_id } = req.params;
    const { quantity } = req.body;

    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    const cartId = await getOrCreateCartId(userId);

    await db.promise().query(
      "UPDATE cart_items SET quantity = ? WHERE cart_item_id = ? AND cart_id = ?",
      [Number(quantity), cart_item_id, cartId]
    );

    return res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
    });
  } catch (error) {
    console.error("Update Cart Quantity Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update cart quantity",
      error: error.message,
    });
  }
};

// REMOVE ITEM FROM CART
exports.removeItem = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { cart_item_id } = req.params;
    const cartId = await getOrCreateCartId(userId);

    await db.promise().query(
      "DELETE FROM cart_items WHERE cart_item_id = ? AND cart_id = ?",
      [cart_item_id, cartId]
    );

    return res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    console.error("Remove Cart Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
      error: error.message,
    });
  }
};

// CLEAR ENTIRE CART
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const cartId = await getOrCreateCartId(userId);

    await db.promise().query("DELETE FROM cart_items WHERE cart_id = ?", [
      cartId,
    ]);

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear Cart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message,
    });
  }
};
