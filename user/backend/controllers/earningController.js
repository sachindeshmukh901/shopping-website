const db = require("../config/db");


// ======================================================
// GET VENDOR EARNINGS
// ======================================================

exports.getVendorEarnings = async (req, res) => {

    try {

        // ==================================================
        // GET VENDOR ID FROM JWT
        // ==================================================

        let vendorId =
            req.user?.vendor_id ||
            req.vendor?.vendor_id ||
            req.user?.user_id;


        if (!vendorId) {

            return res.status(401).json({

                success: false,

                message:
                    "Vendor authentication data not found"

            });

        }


        // ==================================================
        // GET ALL VENDOR ORDERS
        // ==================================================

        const [orders] =
            await db.promise().query(

                `
                SELECT

                    ov.order_vendor_id,

                    ov.order_id,

                    ov.vendor_id,

                    ov.vendor_total,

                    ov.vendor_status,

                    ov.created_at AS earning_date,

                    o.payment_method,

                    o.order_status,

                    o.order_date,

                    p.payment_status,

                    p.transaction_id

                FROM order_vendor ov

                INNER JOIN orders o
                    ON ov.order_id = o.order_id

                LEFT JOIN payments p
                    ON ov.order_id = p.order_id

                WHERE ov.vendor_id = ?

                ORDER BY ov.order_id DESC
                `,

                [vendorId]

            );


        // ==================================================
        // COMMISSION RATE
        // ==================================================

        let commissionRate = 0.10;


        // ==================================================
        // CALCULATE EARNINGS
        // ==================================================

        let totalSales = 0;

        let totalCommission = 0;

        let totalNetEarnings = 0;

        let pendingEarnings = 0;

        let completedEarnings = 0;


        let earnings = [];


        for (
            let order of orders
        ) {

            let saleAmount =
                Number(
                    order.vendor_total || 0
                );


            let commission =
                saleAmount *
                commissionRate;


            let netEarning =
                saleAmount -
                commission;


            totalSales +=
                saleAmount;


            totalCommission +=
                commission;


            totalNetEarnings +=
                netEarning;


            // ==============================================
            // EARNING STATUS
            // ==============================================

            let status =
                order.vendor_status ||
                order.order_status ||
                "Confirmed";


            let earningStatus =
                "Pending";


            if (
                status === "Delivered"
            ) {

                earningStatus =
                    "Completed";

                completedEarnings +=
                    netEarning;

            }

            else if (
                status === "Cancelled"
            ) {

                earningStatus =
                    "Cancelled";

            }

            else {

                pendingEarnings +=
                    netEarning;

            }


            earnings.push({

                order_vendor_id:
                    order.order_vendor_id,

                order_id:
                    order.order_id,

                vendor_total:
                    Number(
                        saleAmount.toFixed(2)
                    ),

                commission:
                    Number(
                        commission.toFixed(2)
                    ),

                net_earning:
                    Number(
                        netEarning.toFixed(2)
                    ),

                vendor_status:
                    status,

                earning_status:
                    earningStatus,

                payment_method:
                    order.payment_method,

                payment_status:
                    order.payment_status,

                transaction_id:
                    order.transaction_id,

                earning_date:
                    order.earning_date ||
                    order.order_date

            });

        }


        // ==================================================
        // MONTHLY ANALYTICS
        // ==================================================

        let monthlyMap = {};


        for (
            let earning of earnings
        ) {

            if (!earning.earning_date) {
                continue;
            }


            let date =
                new Date(
                    earning.earning_date
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {
                continue;
            }


            let year =
                date.getFullYear();


            let month =
                String(
                    date.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );


            let key =
                `${year}-${month}`;


            if (!monthlyMap[key]) {

                monthlyMap[key] = {

                    month:
                        key,

                    sales:
                        0,

                    commission:
                        0,

                    net:
                        0

                };

            }


            monthlyMap[key].sales +=
                earning.vendor_total;


            monthlyMap[key].commission +=
                earning.commission;


            monthlyMap[key].net +=
                earning.net_earning;

        }


        let monthlyAnalytics =
            Object.values(
                monthlyMap
            )
                .sort(
                    (a, b) =>
                        a.month.localeCompare(
                            b.month
                        )
                )
                .slice(-6)
                .map(
                    (item) => ({

                        month:
                            item.month,

                        sales:
                            Number(
                                item.sales.toFixed(2)
                            ),

                        commission:
                            Number(
                                item.commission.toFixed(2)
                            ),

                        net:
                            Number(
                                item.net.toFixed(2)
                            )

                    })
                );


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            summary: {

                totalSales:
                    Number(
                        totalSales.toFixed(2)
                    ),

                totalCommission:
                    Number(
                        totalCommission.toFixed(2)
                    ),

                totalNetEarnings:
                    Number(
                        totalNetEarnings.toFixed(2)
                    ),

                pendingEarnings:
                    Number(
                        pendingEarnings.toFixed(2)
                    ),

                completedEarnings:
                    Number(
                        completedEarnings.toFixed(2)
                    ),

                totalOrders:
                    earnings.length,

                commissionRate:
                    commissionRate * 100

            },

            monthlyAnalytics:
                monthlyAnalytics,

            earnings:
                earnings

        });

    }

    catch (error) {

        console.error(
            "Get Vendor Earnings Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch vendor earnings",

            error:
                error.message

        });

    }

};