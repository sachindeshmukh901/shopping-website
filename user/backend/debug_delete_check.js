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
    const [rows] = await conn.query(
        `SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
     FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME = ?`,
        [cfg.database, 'users']
    );

    console.log(JSON.stringify(rows, null, 2));
    await conn.end();
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
