const db = require("../config/db");


// ======================================================
// GET HEATMAP DATA
// ======================================================

exports.getHeatMapData = async (req, res) => {

    try {

        // ==================================================
        // 1. TOTAL CUSTOMERS
        // ==================================================

        let [customerCount] =
            await db.promise().query(
                `
                SELECT COUNT(*) AS total
                FROM users
                WHERE status = 'Active'
                `
            );


        // ==================================================
        // 2. TOTAL VENDORS
        // ==================================================

        let [vendorCount] =
            await db.promise().query(
                `
                SELECT COUNT(*) AS total
                FROM vendors
                WHERE status = 'Approved'
                `
            );


        // ==================================================
        // 3. TOTAL ORDERS
        // ==================================================

        let [orderCount] =
            await db.promise().query(
                `
                SELECT COUNT(*) AS total
                FROM orders
                `
            );


        // ==================================================
        // 4. REAL HEATMAP LOCATIONS
        //
        // Data comes ONLY from heatmap_locations
        // No fake latitude / longitude
        // ==================================================

        let [locations] =
            await db.promise().query(
                `
                SELECT
                    hl.location_id,
                    hl.vendor_id,
                    hl.city,
                    hl.state,
                    hl.latitude,
                    hl.longitude,
                    hl.total_orders,

                    v.shop_name,
                    v.owner_name,
                    v.status AS vendor_status

                FROM heatmap_locations hl

                LEFT JOIN vendors v
                    ON hl.vendor_id = v.vendor_id

                WHERE
                    hl.latitude IS NOT NULL
                    AND hl.longitude IS NOT NULL

                ORDER BY
                    hl.total_orders DESC
                `
            );


        // ==================================================
        // 5. CUSTOMER ADDRESS COUNT
        //
        // IMPORTANT:
        // address_line is the correct column.
        // There is NO "address" column.
        // ==================================================

        let [customerLocations] =
            await db.promise().query(
                `
                SELECT
                    ua.address_id,
                    ua.user_id,
                    ua.full_name,
                    ua.phone,
                    ua.address_line,
                    ua.city,
                    ua.state,
                    ua.pincode,
                    ua.address_type

                FROM user_address ua

                WHERE
                    ua.city IS NOT NULL
                    AND TRIM(ua.city) != ''

                ORDER BY
                    ua.address_id DESC
                `
            );


        // ==================================================
        // 6. VENDOR LOCATIONS
        // ==================================================

        let [vendorLocations] =
            await db.promise().query(
                `
                SELECT
                    vendor_id,
                    shop_name,
                    owner_name,
                    email,
                    phone,
                    address,
                    city,
                    state,
                    pincode,
                    status

                FROM vendors

                WHERE
                    status = 'Approved'
                    AND city IS NOT NULL
                    AND TRIM(city) != ''

                ORDER BY
                    vendor_id DESC
                `
            );


        // ==================================================
        // 6b. ORDER LOCATIONS
        //
        // Orders joined with the shipping address, so each
        // order can be plotted on the map with its amount.
        // ==================================================

        let [orderLocations] =
            await db.promise().query(
                `
                SELECT
                    o.order_id,
                    o.total_amount,
                    o.order_status,
                    o.order_date,
                    u.full_name,
                    u.email,
                    ua.address_line,
                    ua.city,
                    ua.state,
                    ua.pincode

                FROM orders o

                LEFT JOIN users u
                    ON o.user_id = u.user_id

                LEFT JOIN user_address ua
                    ON o.address_id = ua.address_id

                WHERE
                    ua.city IS NOT NULL
                    AND TRIM(ua.city) != ''

                ORDER BY
                    o.order_id DESC

                LIMIT 200
                `
            );


        // ==================================================
        // 7. RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            message: "HeatMap data fetched successfully",

            stats: {

                customers:
                    Number(
                        customerCount[0]?.total || 0
                    ),

                vendors:
                    Number(
                        vendorCount[0]?.total || 0
                    ),

                orders:
                    Number(
                        orderCount[0]?.total || 0
                    ),

                mapLocations:
                    locations.length

            },

            locations: locations,

            customerLocations:
                customerLocations,

            vendorLocations:
                vendorLocations,

            orderLocations:
                orderLocations

        });

    } catch (error) {

        console.error(
            "HeatMap Controller Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch HeatMap data",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined

        });

    }

};