const db = require("../config/db");

// ========================================
// NOTIFICATIONS
// ========================================
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [notifications] = await db.promise().query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    return res.status(200).json({
      success: true,
      notifications: notifications,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

// ========================================
// RETURNS
// ========================================
exports.createReturnRequest = async (req, res) => {
  try {
    const { order_id, product_id, reason } = req.body;
    if (!order_id || !product_id || !reason) {
      return res.status(400).json({ success: false, message: "order_id, product_id, and reason are required" });
    }
    const [result] = await db.promise().query(
      "INSERT INTO returns (order_id, product_id, reason, return_status, return_date) VALUES (?, ?, ?, 'Pending', CURDATE())",
      [order_id, product_id, reason.trim()]
    );
    return res.status(201).json({
      success: true,
      message: "Return request submitted successfully",
      return_id: result.insertId,
    });
  } catch (error) {
    console.error("Create Return Error:", error);
    return res.status(500).json({ success: false, message: "Failed to create return request" });
  }
};

// ========================================
// AI SIZE RECOMMENDATION
// ========================================
exports.getAISizeRecommendation = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { height, weight, chest, waist } = req.body;

    let recSize = "M"; // default fallback logic
    const h = parseFloat(height) || 170;
    const w = parseFloat(weight) || 70;
    const c = parseFloat(chest) || 38;

    if (w < 55 || c < 34) recSize = "S";
    else if (w < 65 || c < 38) recSize = "M";
    else if (w < 78 || c < 42) recSize = "L";
    else if (w < 90 || c < 46) recSize = "XL";
    else recSize = "XXL";

    const [result] = await db.promise().query(
      `INSERT INTO ai_size_recommendation (user_id, height, weight, chest, waist, recommended_size)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, h, w, c, parseFloat(waist) || null, recSize]
    );

    return res.status(200).json({
      success: true,
      recommended_size: recSize,
      recommendation_id: result.insertId,
    });
  } catch (error) {
    console.error("AI Size Error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate size recommendation" });
  }
};

// ========================================
// FUTURE PRICE ALERT
// ========================================
exports.createPriceAlert = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { product_id, target_price, current_price } = req.body;

    if (!product_id || !target_price) {
      return res.status(400).json({ success: false, message: "product_id and target_price are required" });
    }

    const [result] = await db.promise().query(
      `INSERT INTO future_price_alert (user_id, product_id, target_price, current_price, alert_status)
       VALUES (?, ?, ?, ?, 'Active')`,
      [userId, product_id, target_price, current_price || null]
    );

    return res.status(201).json({
      success: true,
      message: "Price alert created successfully",
      alert_id: result.insertId,
    });
  } catch (error) {
    console.error("Price Alert Error:", error);
    return res.status(500).json({ success: false, message: "Failed to create price alert" });
  }
};

// ========================================
// HEATMAP LOCATIONS
// ========================================
exports.getHeatmapLocations = async (req, res) => {
  try {
    const [locations] = await db.promise().query("SELECT * FROM heatmap_locations");
    return res.status(200).json({
      success: true,
      locations: locations,
    });
  } catch (error) {
    console.error("Heatmap Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch heatmap data" });
  }
};

// ========================================
// DELIVERY & RIDERS
// ========================================
exports.getDeliveryInfo = async (req, res) => {
  try {
    const [deliveries] = await db.promise().query(
      `SELECT d.*, r.rider_name, r.phone as rider_phone 
       FROM delivery_management d 
       LEFT JOIN riders r ON d.rider_id = r.rider_id`
    );
    return res.status(200).json({
      success: true,
      deliveries: deliveries,
    });
  } catch (error) {
    console.error("Delivery Info Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch delivery information" });
  }
};
