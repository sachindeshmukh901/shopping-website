const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {

    console.log(req.body);

    try {

        const {
            full_name,
            email,
            phone,
            password,
            gender
        } = req.body;

        if (
            !full_name ||
            !email ||
            !phone ||
            !password ||
            !gender
        ) {

            return res.status(400).json({

                success: false,
                message: "All fields are required"

            });

        }

        db.query(

            "SELECT * FROM users WHERE email = ?",

            [email],

            async (err, result) => {

                if (err) {

                    return res.status(500).json({

                        success: false,
                        error: err.message

                    });

                }

                if (result.length > 0) {

                    return res.status(400).json({

                        success: false,
                        message: "Email already exists"

                    });

                }

                const hashedPassword = await bcrypt.hash(password, 10);

                db.query(

                    `INSERT INTO users
                    (full_name,email,phone,password,gender)
                    VALUES (?,?,?,?,?)`,

                    [
                        full_name,
                        email,
                        phone,
                        hashedPassword,
                        gender
                    ],

                    (err) => {

                        if (err) {

                            return res.status(500).json({

                                success: false,
                                error: err.message

                            });

                        }

                        return res.status(201).json({

                            success: true,
                            message: "User Registered Successfully"

                        });

                    }

                );

            }

        );

    } catch (error) {

        return res.status(500).json({

            success: false,
            error: error.message

        });

    }

};



exports.login = (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {

        return res.status(400).json({
            success: false,
            message: "Email and Password are required"
        });

    }

    db.query(

        "SELECT * FROM users WHERE email = ?",

        [email],

        async (err, result) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    error: err.message
                });

            }

            if (result.length === 0) {

                return res.status(401).json({
                    success: false,
                    message: "this user not exist"
                });

            }

            const user = result[0];

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid Password"
                });

            }

            const token = jwt.sign(

                {
                    user_id: user.user_id,
                    email: user.email
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d"
                }

            );

            res.status(200).json({

                success: true,

                message: "Login Successful",

                token,

                user: {

                    user_id: user.user_id,
                    full_name: user.full_name,
                    email: user.email,
                    phone: user.phone,
                    gender: user.gender

                }

            });

        }

    );

};


exports.getProfile = (req, res) => {

    const userId = req.user.user_id;

    db.query(

        `SELECT
        user_id,
        full_name,
        email,
        phone,
        gender,
        dob,
        city,
        state,
        pincode,
        profile_image,
        status
        FROM users
        WHERE user_id=?`,

        [userId],

        (err, result) => {

            if (err) {

                return res.status(500).json({

                    success: false,
                    error: err.message

                });

            }

            res.json({

                success: true,

                user: result[0]

            });

        }

    );

};

exports.updateProfile = (req, res) => {

    const userId = req.user.user_id;

    const {

        full_name,
        phone,
        gender,
        dob,
        city,
        state,
        pincode

    } = req.body;

    db.query(

        `UPDATE users
        SET
        full_name=?,
        phone=?,
        gender=?,
        dob=?,
        city=?,
        state=?,
        pincode=?
        WHERE user_id=?`,

        [

            full_name,
            phone,
            gender,
            dob,
            city,
            state,
            pincode,
            userId

        ],

        (err, result) => {

            if (err) {

                return res.status(500).json({

                    success: false,
                    error: err.message

                });

            }

            res.json({

                success: true,
                message: "Profile Updated Successfully"

            });

        }

    );

};


exports.changePassword = async (req, res) => {

    try {

        const userId = req.user.user_id;

        const {

            oldPassword,
            newPassword

        } = req.body;

        if (!oldPassword || !newPassword) {

            return res.status(400).json({

                success: false,
                message: "All fields are required"

            });

        }

        db.query(

            "SELECT password FROM users WHERE user_id=?",

            [userId],

            async (err, result) => {

                if (err) {

                    return res.status(500).json({

                        success: false,
                        error: err.message

                    });

                }

                if (result.length === 0) {

                    return res.status(404).json({

                        success: false,
                        message: "User not found"

                    });

                }

                const match = await bcrypt.compare(

                    oldPassword,

                    result[0].password

                );

                if (!match) {

                    return res.status(400).json({

                        success: false,
                        message: "Old Password Incorrect"

                    });

                }

                const hashedPassword = await bcrypt.hash(

                    newPassword,

                    10

                );

                db.query(

                    "UPDATE users SET password=? WHERE user_id=?",

                    [

                        hashedPassword,

                        userId

                    ],

                    (err) => {

                        if (err) {

                            return res.status(500).json({

                                success: false,
                                error: err.message

                            });

                        }

                        res.json({

                            success: true,
                            message: "Password Changed Successfully"

                        });

                    }

                );

            }

        );

    }

    catch (error) {

        res.status(500).json({

            success: false,
            error: error.message

        });

    }

};


exports.forgotPassword = async (req, res) => {

    try {

        const { email, newPassword } = req.body;

        if (!email || !newPassword) {

            return res.status(400).json({

                success: false,
                message: "Email and Password Required"

            });

        }

        db.query(

            "SELECT * FROM users WHERE email=?",

            [email],

            async (err, result) => {

                if (err) {

                    return res.status(500).json({

                        success: false,
                        error: err.message

                    });

                }

                if (result.length == 0) {

                    return res.status(404).json({

                        success: false,
                        message: "Email Not Found"

                    });

                }

                const hashedPassword = await bcrypt.hash(

                    newPassword,

                    10

                );

                db.query(

                    "UPDATE users SET password=? WHERE email=?",

                    [

                        hashedPassword,

                        email

                    ],

                    (err) => {

                        if (err) {

                            return res.status(500).json({

                                success: false,
                                error: err.message

                            });

                        }

                        res.json({

                            success: true,
                            message: "Password Reset Successfully"

                        });

                    }

                );

            }

        );

    }

    catch (error) {

        res.status(500).json({

            success: false,
            error: error.message

        });

    }

};


exports.logout = (req, res) => {

    try {

        res.status(200).json({

            success: true,
            message: "Logout Successful. Please remove the token from client."

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,
            error: error.message

        });

    }

};

exports.deleteAccount = async (req, res) => {

    const userId = req.user.user_id;
    const connection = await db.promise().getConnection();

    try {

        await connection.beginTransaction();

        const dependentTables = [
            "notifications",
            "future_price_alert",
            "ai_size_recommendation",
            "wishlist",
            "reviews",
            "user_reward_tokens",
            "user_spin_history"
        ];

        for (const table of dependentTables) {
            await connection.query(`DELETE FROM ${table} WHERE user_id = ?`, [userId]);
        }

        const [cartRows] = await connection.query("SELECT cart_id FROM cart WHERE user_id = ?", [userId]);

        if (cartRows.length > 0) {
            const cartIds = cartRows.map((cart) => cart.cart_id);
            await connection.query("DELETE FROM cart_items WHERE cart_id IN (?)", [cartIds]);
        }

        await connection.query("DELETE FROM cart WHERE user_id = ?", [userId]);

        const [orderRows] = await connection.query("SELECT order_id FROM orders WHERE user_id = ?", [userId]);

        if (orderRows.length > 0) {
            const orderIds = orderRows.map((order) => order.order_id);
            await connection.query("DELETE FROM payments WHERE order_id IN (?)", [orderIds]);
            await connection.query("DELETE FROM returns WHERE order_id IN (?)", [orderIds]);
            await connection.query("DELETE FROM order_items WHERE order_id IN (?)", [orderIds]);
            await connection.query("DELETE FROM order_vendor WHERE order_id IN (?)", [orderIds]);
        }

        await connection.query("DELETE FROM orders WHERE user_id = ?", [userId]);
        await connection.query("DELETE FROM user_address WHERE user_id = ?", [userId]);

        const [result] = await connection.query("DELETE FROM users WHERE user_id = ?", [userId]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            connection.release();

            return res.status(404).json({
                success: false,
                message: "User Not Found"
            });
        }

        await connection.commit();
        connection.release();

        return res.status(200).json({
            success: true,
            message: "Account Deleted Successfully"
        });

    }

    catch (error) {

        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Delete rollback error:", rollbackError);
            }
            connection.release();
        }

        console.error("Delete account failed:", error);

        return res.status(500).json({
            success: false,
            message: "Delete account failed",
            error: error.message
        });

    }

};