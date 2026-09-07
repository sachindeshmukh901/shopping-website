const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const cfg = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  const conn = await mysql.createConnection(cfg);
  const tables = [
    'notifications',
    'future_price_alert',
    'ai_size_recommendation',
    'wishlist',
    'reviews',
    'user_reward_tokens',
    'user_spin_history',
    'cart',
    'cart_items',
    'orders',
    'order_items',
    'returns',
    'user_address',
    'users'
  ];

  for (const table of tables) {
    const [rows] = await conn.query('SHOW CREATE TABLE ??', [table]);
    console.log(`\n--- ${table} ---`);
    console.log(rows[0]['Create Table']);
  }

  await conn.end();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
