const db = require("../config/db");

// ======================================================
// ADD REVIEW
// ======================================================

exports.addReview = async (req, res) => {
    try {
        let userId =
            req.user?.user_id ||
            req.user?.id;

        let productId =
            req.body.product_id;

        let rating =
            req.body.rating;

        let review =
            req.body.review;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });
        }

        if (!productId || !rating) {
            return res.status(400).json({
                success: false,
                message: "Product ID and rating are required"
            });
        }

        let numericRating =
            parseFloat(rating);

        if (
            Number.isNaN(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        // ---------------------------------------------
        // INSERT REVIEW
        // ---------------------------------------------

        await db.promise().query(
            `
            INSERT INTO reviews
            (
                user_id,
                product_id,
                rating,
                review
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                userId,
                productId,
                numericRating,
                review || null
            ]
        );

        // ---------------------------------------------
        // RECALCULATE PRODUCT RATING
        // ---------------------------------------------

        let [avgResult] =
            await db.promise().query(
                `
                SELECT
                    AVG(rating) AS avg_rating
                FROM reviews
                WHERE product_id = ?
                `,
                [productId]
            );

        let newRating =
            avgResult[0]?.avg_rating
                ? parseFloat(
                    avgResult[0].avg_rating
                ).toFixed(1)
                : numericRating;

        await db.promise().query(
            `
            UPDATE products
            SET rating = ?
            WHERE product_id = ?
            `,
            [
                newRating,
                productId
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            rating: newRating
        });

    } catch (error) {

        console.error(
            "Add Review Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to submit review",
            error: error.message
        });
    }
};


// ======================================================
// GET PRODUCT REVIEWS
// ======================================================

exports.getProductReviews = async (
    req,
    res
) => {

    try {

        let productId =
            req.params.product_id;

        if (!productId) {

            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });

        }

        let [reviews] =
            await db.promise().query(
                `
                SELECT
                    r.review_id,
                    r.user_id,
                    r.product_id,
                    r.rating,
                    r.review,
                    r.review_date,

                    u.full_name,
                    u.profile_image

                FROM reviews r

                LEFT JOIN users u
                    ON r.user_id = u.user_id

                WHERE r.product_id = ?

                ORDER BY
                    r.review_date DESC
                `,
                [productId]
            );

        return res.status(200).json({

            success: true,

            reviews: reviews

        });

    } catch (error) {

        console.error(
            "Get Product Reviews Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch reviews",

            error:
                error.message

        });
    }
};


// ======================================================
// GET VENDOR REVIEWS
// ======================================================

exports.getVendorReviews = async (
    req,
    res
) => {

    try {

        // ==================================================
        // IMPORTANT
        // ==================================================
        // Different vendor middleware implementations
        // can store authenticated vendor in different places.
        //
        // We support:
        //
        // req.vendor.vendor_id
        // req.user.vendor_id
        // req.user.user_id
        // req.user.id
        // ==================================================

        let vendorId =
            req.vendor?.vendor_id ||
            req.vendor?.id ||
            req.user?.vendor_id;

        // --------------------------------------------------
        // If middleware provides vendor_id directly
        // --------------------------------------------------

        if (!vendorId) {

            // Sometimes vendor login stores the vendor ID
            // inside req.user.user_id.
            //
            // We first try to use it as vendor_id only when
            // it is explicitly available.

            vendorId =
                req.user?.vendorId;
        }

        // --------------------------------------------------
        // Authentication check
        // --------------------------------------------------

        if (!vendorId) {

            console.error(
                "Vendor ID not found in authenticated request:",
                {
                    user: req.user,
                    vendor: req.vendor
                }
            );

            return res.status(401).json({

                success: false,

                message:
                    "Vendor authentication information not found"

            });
        }

        // ==================================================
        // GET REVIEWS
        // ==================================================

        let [reviews] =
            await db.promise().query(
                `
                SELECT

                    r.review_id,

                    r.user_id,

                    r.product_id,

                    r.rating,

                    r.review,

                    r.review_date,

                    p.product_name,

                    p.image AS product_image,

                    u.full_name,

                    u.profile_image

                FROM reviews r

                INNER JOIN products p
                    ON r.product_id = p.product_id

                LEFT JOIN users u
                    ON r.user_id = u.user_id

                WHERE p.vendor_id = ?

                ORDER BY
                    r.review_date DESC
                `,
                [vendorId]
            );

        // ==================================================
        // TOTAL REVIEWS
        // ==================================================

        let totalReviews =
            reviews.length;

        // ==================================================
        // AVERAGE RATING
        // ==================================================

        let averageRating = 0;

        if (totalReviews > 0) {

            let totalRating =
                reviews.reduce(
                    (
                        sum,
                        item
                    ) => {

                        return (
                            sum +
                            Number(
                                item.rating || 0
                            )
                        );

                    },
                    0
                );

            averageRating =
                totalRating /
                totalReviews;
        }

        // ==================================================
        // RATING COUNTS (BY STAR)
        // ==================================================

        let fiveStarReviews = 0;
        let fourStarReviews = 0;
        let threeStarReviews = 0;
        let twoStarReviews = 0;
        let oneStarReviews = 0;

        reviews.forEach(
            (item) => {

                let rating =
                    Math.round(
                        Number(item.rating)
                    );

                if (rating === 5) fiveStarReviews++;
                else if (rating === 4) fourStarReviews++;
                else if (rating === 3) threeStarReviews++;
                else if (rating === 2) twoStarReviews++;
                else if (rating === 1) oneStarReviews++;

            }
        );

        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            stats: {

                totalReviews:
                    totalReviews,

                averageRating:
                    Number(
                        averageRating.toFixed(1)
                    ),

                fiveStarReviews:
                    fiveStarReviews,

                fourStarReviews:
                    fourStarReviews,

                threeStarReviews:
                    threeStarReviews,

                twoStarReviews:
                    twoStarReviews,

                oneStarReviews:
                    oneStarReviews,

                lowRatingReviews:
                    oneStarReviews + twoStarReviews

            },

            reviews:
                reviews

        });

    } catch (error) {

        console.error(
            "Get Vendor Reviews Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch vendor reviews",

            error:
                error.message

        });

    }
};


// ======================================================
// GET VENDOR REVIEW STATS
// ======================================================

exports.getVendorReviewStats = async (
    req,
    res
) => {

    try {

        let vendorId =
            req.vendor?.vendor_id ||
            req.vendor?.id ||
            req.user?.vendor_id ||
            req.user?.vendorId;

        if (!vendorId) {

            return res.status(401).json({

                success: false,

                message:
                    "Vendor authentication information not found"

            });

        }

        // ==================================================
        // TOTAL + AVERAGE
        // ==================================================

        let [summary] =
            await db.promise().query(
                `
                SELECT

                    COUNT(r.review_id)
                        AS total_reviews,

                    COALESCE(
                        AVG(r.rating),
                        0
                    ) AS average_rating

                FROM reviews r

                INNER JOIN products p
                    ON r.product_id =
                       p.product_id

                WHERE p.vendor_id = ?
                `,
                [vendorId]
            );

        // ==================================================
        // RATING DISTRIBUTION
        // ==================================================

        let [distribution] =
            await db.promise().query(
                `
                SELECT

                    ROUND(r.rating)
                        AS rating,

                    COUNT(*)
                        AS total

                FROM reviews r

                INNER JOIN products p
                    ON r.product_id =
                       p.product_id

                WHERE p.vendor_id = ?

                GROUP BY
                    ROUND(r.rating)

                ORDER BY
                    rating DESC
                `,
                [vendorId]
            );

        let ratingCounts = {

            5: 0,

            4: 0,

            3: 0,

            2: 0,

            1: 0

        };

        distribution.forEach(
            (item) => {

                let rating =
                    Number(
                        item.rating
                    );

                if (
                    rating >= 1 &&
                    rating <= 5
                ) {

                    ratingCounts[
                        rating
                    ] =
                        Number(
                            item.total
                        );

                }

            }
        );

        return res.status(200).json({

            success: true,

            totalReviews:
                Number(
                    summary[0]
                        ?.total_reviews || 0
                ),

            averageRating:
                Number(
                    Number(
                        summary[0]
                            ?.average_rating || 0
                    ).toFixed(1)
                ),

            ratingCounts:
                ratingCounts

        });

    } catch (error) {

        console.error(
            "Get Vendor Review Stats Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch vendor review statistics",

            error:
                error.message

        });

    }
};