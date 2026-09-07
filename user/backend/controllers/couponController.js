const db = require("../config/db");

const SPIN_REWARDS = [
  { label: "5% OFF", value: 5 },
  { label: "10% OFF", value: 10 },
  { label: "15% OFF", value: 15 },
  { label: "20% OFF", value: 20 },
  { label: "25% OFF", value: 25 },
  { label: "30% OFF", value: 30 },
  { label: "40% OFF", value: 40 },
  { label: "50% OFF", value: 50 }
];

function monthKey(date = new Date()) {
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

function createCouponCode(userId, rewardPercent, date = new Date()) {
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  return `SPIN-${userId}-${rewardPercent}-${stamp}`;
}

function buildRewardRecord(userId, rewardPercent, date = new Date()) {
  const reward = SPIN_REWARDS.find((entry) => Number(entry.value) === Number(rewardPercent)) || SPIN_REWARDS[0];
  const code = createCouponCode(userId, reward.value, date);

  return {
    reward: reward.label,
    discountPercent: Number(reward.value),
    couponCode: code,
    coupon: {
      coupon_code: code,
      discount_percent: Number(reward.value),
      status: "Active",
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      min_order_amount: 0,
      description: `Spin reward - ${reward.label}`,
    },
  };
}

function getCurrentMonthSpinWindow() {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
  };
}

exports.validateCoupon = async (req, res) => {
  try {
    const { coupon_code, order_amount = 0 } = req.body;

    if (!coupon_code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const [rows] = await db.promise().query(
      `SELECT * FROM coupons WHERE coupon_code = ? AND status = 'Active'`,
      [coupon_code.trim()]
    );

    if (rows.length === 0) {
      const [rewardRows] = await db.promise().query(
        `SELECT * FROM user_reward_tokens WHERE coupon_code = ? AND status = 'active' AND user_id = ?`,
        [coupon_code.trim(), req.user?.user_id || 0]
      );

      if (rewardRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Invalid or expired coupon code",
        });
      }

      const reward = rewardRows[0];
      const discountAmount = (Number(order_amount) * Number(reward.discount_percent)) / 100;

      return res.status(200).json({
        success: true,
        coupon: {
          coupon_id: reward.reward_id,
          coupon_code: reward.coupon_code,
          discount_percent: reward.discount_percent,
          discount_amount: discountAmount,
          reward_source: reward.source,
          reward_label: reward.reward_label,
        },
        message: `Coupon applied! ${reward.discount_percent}% discount`,
      });
    }

    const coupon = rows[0];

    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "This coupon code has expired",
      });
    }

    if (coupon.min_order_amount && Number(order_amount) < Number(coupon.min_order_amount)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.min_order_amount} required for this coupon`,
      });
    }

    const discountAmount = (Number(order_amount) * Number(coupon.discount_percent)) / 100;

    return res.status(200).json({
      success: true,
      coupon: {
        coupon_id: coupon.coupon_id,
        coupon_code: coupon.coupon_code,
        discount_percent: coupon.discount_percent,
        discount_amount: discountAmount,
      },
      message: `Coupon applied! ${coupon.discount_percent}% discount`,
    });
  } catch (error) {
    console.error("Validate Coupon Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to validate coupon",
      error: error.message,
    });
  }
};

exports.getCoupons = async (req, res) => {
  try {
    const [coupons] = await db.promise().query(
      "SELECT * FROM coupons WHERE status = 'Active' ORDER BY coupon_id DESC"
    );
    return res.status(200).json({
      success: true,
      coupons: coupons,
    });
  } catch (error) {
    console.error("Get Coupons Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
      error: error.message,
    });
  }
};

exports.getSpinStatus = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { month, year } = getCurrentMonthSpinWindow();

    const [rows] = await db.promise().query(
      `SELECT * FROM user_spin_history WHERE user_id = ? AND month_number = ? AND year_number = ? LIMIT 1`,
      [userId, month, year]
    );

    if (rows.length > 0) {
      return res.status(200).json({
        success: true,
        spinUsed: true,
        canSpin: false,
        message: "You have already used your Spin for this month. Come back next month!",
        reward: {
          reward: rows[0].reward,
          coupon_code: rows[0].coupon_code,
          discount_percent: rows[0].discount_percent,
          spin_date: rows[0].spin_date,
        },
        nextEligibleMonth: `${year}-${String(month + 1).padStart(2, "0")}-01`,
      });
    }

    return res.status(200).json({
      success: true,
      spinUsed: false,
      canSpin: true,
      message: "Spin available for this month",
      reward: null,
    });
  } catch (error) {
    console.error("Get Spin Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check spin status",
      error: error.message,
    });
  }
};

exports.spinTheWheel = async (req, res) => {
  const userId = req.user.user_id;
  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();

    const { month, year } = monthKey(new Date());
    const requestedRewardPercent = Number(req.body?.reward_percent ?? req.body?.rewardPercent ?? req.body?.value ?? 0);
    const validRewardValues = SPIN_REWARDS.map((entry) => Number(entry.value));
    const rewardEntry = validRewardValues.includes(requestedRewardPercent)
      ? SPIN_REWARDS.find((entry) => Number(entry.value) === Number(requestedRewardPercent))
      : SPIN_REWARDS[Math.floor(Math.random() * SPIN_REWARDS.length)];

    const [existingRows] = await connection.query(
      `SELECT * FROM user_spin_history WHERE user_id = ? AND month_number = ? AND year_number = ? LIMIT 1 FOR UPDATE`,
      [userId, month, year]
    );

    if (existingRows.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        canSpin: false,
        message: "You have already used your Spin for this month. Come back next month!",
      });
    }

    const reward = buildRewardRecord(userId, rewardEntry.value, new Date());

    const [spinResult] = await connection.query(
      `INSERT INTO user_spin_history (user_id, reward, coupon_code, discount_percent, spin_date, month_number, year_number)
       VALUES (?, ?, ?, ?, CURDATE(), ?, ?)`,
      [userId, reward.reward, reward.couponCode, reward.discountPercent, month, year]
    );

    await connection.query(
      `INSERT INTO user_reward_tokens (user_id, spin_id, coupon_code, reward_label, discount_percent, status, source)
       VALUES (?, ?, ?, ?, ?, 'active', 'spin')`,
      [userId, spinResult.insertId, reward.couponCode, reward.reward, reward.discountPercent]
    );

    const [couponExists] = await connection.query(
      `SELECT * FROM coupons WHERE coupon_code = ? LIMIT 1`,
      [reward.couponCode]
    );

    if (couponExists.length === 0) {
      await connection.query(
        `INSERT INTO coupons (coupon_code, discount_percent, status, expiry_date, min_order_amount)
         VALUES (?, ?, 'Active', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0)`,
        [reward.couponCode, reward.discountPercent]
      );
    }

    await connection.commit();
    connection.release();

    return res.status(200).json({
      success: true,
      canSpin: false,
      spinUsed: true,
      reward: {
        reward: reward.reward,
        coupon_code: reward.couponCode,
        discount_percent: reward.discountPercent,
        spin_date: new Date().toISOString().slice(0, 10),
      },
      message: `Congratulations! You won ${reward.reward}`,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error("Spin The Wheel Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to spin the wheel",
      error: error.message,
    });
  }
};

exports.getMyRewards = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [rows] = await db.promise().query(
      `SELECT * FROM user_reward_tokens WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      rewards: rows,
    });
  } catch (error) {
    console.error("Get My Rewards Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch rewards",
      error: error.message,
    });
  }
};

exports.applyRewardToOrder = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { coupon_code } = req.body;

    if (!coupon_code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const [rows] = await db.promise().query(
      `SELECT * FROM user_reward_tokens WHERE user_id = ? AND coupon_code = ? AND status = 'active' LIMIT 1`,
      [userId, coupon_code.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Reward not found or already used",
      });
    }

    const reward = rows[0];

    await db.promise().query(
      `UPDATE user_reward_tokens SET status = 'used', used_at = CURRENT_TIMESTAMP WHERE reward_id = ?`,
      [reward.reward_id]
    );

    return res.status(200).json({
      success: true,
      reward: {
        reward_id: reward.reward_id,
        coupon_code: reward.coupon_code,
        reward_label: reward.reward_label,
        discount_percent: Number(reward.discount_percent),
      },
      message: "Reward applied successfully",
    });
  } catch (error) {
    console.error("Apply Reward To Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to apply reward",
      error: error.message,
    });
  }
};
