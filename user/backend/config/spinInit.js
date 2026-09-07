const db = require("./db");

const DEFAULT_REWARD_POOL = [5, 10, 15, 20, 25, 30, 40, 50];

async function ensureSpinTables() {
    try {
        await db.promise().query(`
      CREATE TABLE IF NOT EXISTS spin_config (
        config_key VARCHAR(100) PRIMARY KEY,
        config_value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

        await db.promise().query(`
      CREATE TABLE IF NOT EXISTS user_spin_history (
        spin_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        reward VARCHAR(100) NOT NULL,
        coupon_code VARCHAR(120) NOT NULL,
        discount_percent DECIMAL(5,2) NOT NULL,
        spin_date DATE NOT NULL,
        month_number INT NOT NULL,
        year_number INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (spin_id),
        UNIQUE KEY uq_user_month_spin (user_id, month_number, year_number),
        KEY idx_user_spin (user_id, year_number, month_number)
      )
    `);

        await db.promise().query(`
      CREATE TABLE IF NOT EXISTS user_reward_tokens (
        reward_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        spin_id BIGINT UNSIGNED NOT NULL,
        coupon_code VARCHAR(120) NOT NULL,
        reward_label VARCHAR(120) NOT NULL,
        discount_percent DECIMAL(5,2) NOT NULL,
        status ENUM('active', 'used', 'expired') NOT NULL DEFAULT 'active',
        source VARCHAR(50) NOT NULL DEFAULT 'spin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        used_at TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (reward_id),
        KEY idx_user_rewards (user_id, status),
        KEY idx_coupon_code (coupon_code),
        CONSTRAINT fk_user_reward_spin FOREIGN KEY (spin_id) REFERENCES user_spin_history (spin_id) ON DELETE CASCADE
      )
    `);

        const configInserts = [
            ["monthly_limit", "1"],
            ["reward_pool", JSON.stringify(DEFAULT_REWARD_POOL)]
        ];

        for (const [key, value] of configInserts) {
            await db.promise().query(
                `INSERT INTO spin_config (config_key, config_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)`,
                [key, value]
            );
        }

        console.log("✅ Spin reward tables initialized");
    } catch (error) {
        console.error("Failed to initialize spin tables:", error.message);
    }
}

module.exports = { ensureSpinTables, DEFAULT_REWARD_POOL };
