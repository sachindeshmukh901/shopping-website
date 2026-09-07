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

    const [userRows] = await conn.query(`
    SELECT u.user_id
    FROM users u
    LEFT JOIN notifications n ON n.user_id = u.user_id
    LEFT JOIN future_price_alert fpa ON fpa.user_id = u.user_id
    LEFT JOIN ai_size_recommendation asr ON asr.user_id = u.user_id
    LEFT JOIN wishlist w ON w.user_id = u.user_id
    LEFT JOIN reviews r ON r.user_id = u.user_id
    LEFT JOIN user_reward_tokens urt ON urt.user_id = u.user_id
    LEFT JOIN user_spin_history ush ON ush.user_id = u.user_id
    LEFT JOIN cart c ON c.user_id = u.user_id
    LEFT JOIN orders o ON o.user_id = u.user_id
    LEFT JOIN user_address ua ON ua.user_id = u.user_id
    WHERE n.user_id IS NOT NULL
       OR fpa.user_id IS NOT NULL
       OR asr.user_id IS NOT NULL
       OR w.user_id IS NOT NULL
       OR r.user_id IS NOT NULL
       OR urt.user_id IS NOT NULL
       OR ush.user_id IS NOT NULL
       OR c.user_id IS NOT NULL
       OR o.user_id IS NOT NULL
       OR ua.user_id IS NOT NULL
    LIMIT 1
  `);

    if (!userRows || userRows.length === 0) {
        console.log('NO_USER_WITH_REFERENCES_FOUND');
        await conn.end();
        return;
    }

    const userId = userRows[0].user_id;
    const connection = await conn.getConnection();

    try {
        await connection.beginTransaction();

        const dependentTables = [
            'notifications',
            'future_price_alert',
            'ai_size_recommendation',
            'wishlist',
            'reviews',
            'user_reward_tokens',
            'user_spin_history'
        ];

        for (const table of dependentTables) {
            await connection.query(`DELETE FROM ${table} WHERE user_id = ?`, [userId]);
        }

        const [cartRows] = await connection.query('SELECT cart_id FROM cart WHERE user_id = ?', [userId]);
        if (cartRows.length > 0) {
            const cartIds = cartRows.map((cart) => cart.cart_id);
            await connection.query('DELETE FROM cart_items WHERE cart_id IN (?)', [cartIds]);
        }
        await connection.query('DELETE FROM cart WHERE user_id = ?', [userId]);

        const [orderRows] = await connection.query('SELECT order_id FROM orders WHERE user_id = ?', [userId]);
        if (orderRows.length > 0) {
            const orderIds = orderRows.map((order) => order.order_id);
            await connection.query('DELETE FROM payments WHERE order_id IN (?)', [orderIds]);
            await connection.query('DELETE FROM returns WHERE order_id IN (?)', [orderIds]);
            await connection.query('DELETE FROM order_items WHERE order_id IN (?)', [orderIds]);
            await connection.query('DELETE FROM order_vendor WHERE order_id IN (?)', [orderIds]);
        }
        await connection.query('DELETE FROM orders WHERE user_id = ?', [userId]);
        await connection.query('DELETE FROM user_address WHERE user_id = ?', [userId]);

        const [result] = await connection.query('DELETE FROM users WHERE user_id = ?', [userId]);
        if (result.affectedRows === 0) {
            throw new Error('USER_NOT_FOUND_AFTER_DELETE');
        }

        console.log(`DELETE_FLOW_OK userId=${userId} affectedRows=${result.affectedRows}`);
        await connection.rollback();
        console.log('ROLLBACK_OK');
    } catch (error) {
        console.error('VALIDATION_FAILED', error.message);
        try {
            await connection.rollback();
        } catch (e) {
            // no-op
        }
        process.exitCode = 1;
    } finally {
        connection.release();
        await conn.end();
    }
})();
