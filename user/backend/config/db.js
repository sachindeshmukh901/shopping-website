const mysql = require("mysql2");
require("dotenv").config();


// ========================================
// MYSQL CONNECTION POOL
// ========================================

const db = mysql.createPool({

    host: process.env.DB_HOST,

    port: process.env.DB_PORT,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    },

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0

});


// ========================================
// TEST DATABASE CONNECTION
// ========================================

db.getConnection((err, connection) => {

    if (err) {

        console.log("❌ Database Connection Failed");

        console.log(err.message);

        return;

    }


    console.log("✅ Database Connected Successfully");


    connection.release();

});


module.exports = db;