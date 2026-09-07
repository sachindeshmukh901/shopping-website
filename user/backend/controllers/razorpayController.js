const crypto = require("crypto");
const Razorpay = require("razorpay");

function isConfigured() {
    return Boolean(
        process.env.RAZORPAY_KEY_ID &&
        process.env.RAZORPAY_KEY_SECRET
    );
}

function getRazorpay() {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
}

exports.createPaymentOrder = async (req, res) => {
    try {
        if (!isConfigured()) {
            return res.status(503).json({
                success: false,
                message: "Razorpay is not configured on the server."
            });
        }

        const amount = Number(req.body.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "A valid payment amount is required."
            });
        }

        const order = await getRazorpay().orders.create({
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: `orgos_${req.user.user_id}_${Date.now()}`,
            notes: {
                user_id: String(req.user.user_id)
            }
        });

        return res.json({
            success: true,
            key_id: process.env.RAZORPAY_KEY_ID,
            order
        });
    } catch (error) {
        console.error("Razorpay order creation error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to start secure payment."
        });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        if (!isConfigured()) {
            return res.status(503).json({
                success: false,
                message: "Razorpay is not configured on the server."
            });
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Incomplete Razorpay payment details."
            });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const valid = crypto.timingSafeEqual(
            Buffer.from(expectedSignature),
            Buffer.from(razorpay_signature)
        );

        if (!valid) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed."
            });
        }

        return res.json({
            success: true,
            message: "Payment verified successfully.",
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id
        });
    } catch (error) {
        console.error("Razorpay verification error:", error);
        return res.status(400).json({
            success: false,
            message: "Payment verification failed."
        });
    }
};
