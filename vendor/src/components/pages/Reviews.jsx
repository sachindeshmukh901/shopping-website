import {
    useEffect,
    useState
} from "react";

import {
    MessageSquare,
    Star,
    AlertCircle,
    RefreshCw
} from "lucide-react";

import "./Reviews.css";


function Reviews() {

    let [reviews, setReviews] =
        useState([]);

    let [stats, setStats] =
        useState({

            totalReviews: 0,

            averageRating: 0,

            fiveStarReviews: 0,

            fourStarReviews: 0,

            threeStarReviews: 0,

            twoStarReviews: 0,

            oneStarReviews: 0,

            lowRatingReviews: 0

        });


    let [loading, setLoading] =
        useState(true);

    let [error, setError] =
        useState("");


    // ======================================================
    // API URL
    // ======================================================

    let API_URL =
        "https://orgos-backend-l7mx.onrender.com";


    // ======================================================
    // GET TOKEN
    // ======================================================

    let getToken = () => {

        return (
            localStorage.getItem("vendorToken") ||
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken")
        );

    };


    // ======================================================
    // FETCH REVIEWS
    // ======================================================

    let fetchReviews = async () => {

        try {

            setLoading(true);

            setError("");


            let token =
                getToken();


            if (!token) {

                throw new Error(
                    "Vendor authentication token not found."
                );

            }


            let response =
                await fetch(
                    `${API_URL}/api/reviews/vendor`,
                    {

                        method: "GET",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        }

                    }
                );


            /*
             IMPORTANT:
             JSON parse karne se pehle response check kar rahe hain.
            */

            let contentType =
                response.headers.get(
                    "content-type"
                );


            if (
                !contentType ||
                !contentType.includes(
                    "application/json"
                )
            ) {

                let text =
                    await response.text();


                console.error(
                    "Backend returned non JSON:",
                    text
                );


                throw new Error(
                    "Backend API URL is incorrect or server returned HTML."
                );

            }


            let data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to fetch reviews"
                );

            }


            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Failed to fetch reviews"
                );

            }


            setReviews(
                data.reviews || []
            );


            setStats(
                data.stats || {

                    totalReviews: 0,

                    averageRating: 0,

                    fiveStarReviews: 0,

                    fourStarReviews: 0,

                    threeStarReviews: 0,

                    twoStarReviews: 0,

                    oneStarReviews: 0,

                    lowRatingReviews: 0

                }
            );


        } catch (error) {

            console.error(
                "Reviews API Error:",
                error
            );


            setError(
                error.message
            );


        } finally {

            setLoading(false);

        }

    };


    // ======================================================
    // LOAD
    // ======================================================

    useEffect(() => {

        fetchReviews();

    }, []);


    // ======================================================
    // RATING PERCENTAGE
    // ======================================================

    let getPercentage = (count) => {

        if (
            stats.totalReviews === 0
        ) {

            return 0;

        }


        return (
            count /
            stats.totalReviews
        ) * 100;

    };


    // ======================================================
    // FORMAT DATE
    // ======================================================

    let formatDate = (date) => {

        if (!date) {

            return "N/A";

        }


        return new Date(date)
            .toLocaleDateString(
                "en-IN",
                {

                    day: "2-digit",

                    month: "short",

                    year: "numeric"

                }
            );

    };


    // ======================================================
    // STAR COMPONENT
    // ======================================================

    let renderStars = (rating) => {

        let stars = [];


        for (
            let i = 1;
            i <= 5;
            i++
        ) {

            stars.push(

                <Star
                    key={i}
                    size={18}
                    fill={
                        i <= rating
                            ? "#f5b301"
                            : "none"
                    }
                    color={
                        i <= rating
                            ? "#f5b301"
                            : "#cbd5e1"
                    }
                />

            );

        }


        return (

            <div className="review-stars">

                {stars}

            </div>

        );

    };


    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {

        return (

            <div className="reviews-page">

                <div className="reviews-loading">

                    <RefreshCw
                        size={30}
                        className="loading-spin"
                    />

                    <p>
                        Loading reviews...
                    </p>

                </div>

            </div>

        );

    }


    // ======================================================
    // MAIN UI
    // ======================================================

    return (

        <div className="reviews-page">

            {/* ============================================
                HEADER
            ============================================ */}

            <div className="reviews-header">

                <div>

                    <h1>
                        <MessageSquare
                            size={32}
                        />

                        Reviews
                    </h1>

                    <p>
                        Manage customer reviews
                        and ratings for your products.
                    </p>

                </div>


                <button
                    className="refresh-btn"
                    onClick={fetchReviews}
                >

                    <RefreshCw
                        size={18}
                    />

                    Refresh

                </button>

            </div>


            {/* ============================================
                ERROR
            ============================================ */}

            {error && (

                <div className="reviews-error">

                    <AlertCircle
                        size={21}
                    />

                    <span>
                        {error}
                    </span>

                    <button
                        onClick={fetchReviews}
                    >
                        Retry
                    </button>

                </div>

            )}


            {/* ============================================
                KPI CARDS
            ============================================ */}

            <div className="review-kpi-grid">


                {/* TOTAL */}

                <div className="review-kpi-card">

                    <div>

                        <p>
                            Total Reviews
                        </p>

                        <h2>
                            {stats.totalReviews}
                        </h2>

                        <span>
                            Customer reviews
                        </span>

                    </div>


                    <div className="kpi-icon">

                        <MessageSquare
                            size={24}
                        />

                    </div>

                </div>


                {/* AVERAGE */}

                <div className="review-kpi-card">

                    <div>

                        <p>
                            Average Rating
                        </p>

                        <h2>
                            {stats.averageRating}
                        </h2>

                        {renderStars(
                            Math.round(
                                stats.averageRating
                            )
                        )}

                    </div>


                    <div className="kpi-icon">

                        <Star
                            size={24}
                        />

                    </div>

                </div>


                {/* FIVE STAR */}

                <div className="review-kpi-card">

                    <div>

                        <p>
                            5 Star Reviews
                        </p>

                        <h2>
                            {stats.fiveStarReviews}
                        </h2>

                        <span>

                            {stats.totalReviews
                                ? (
                                    (
                                        stats.fiveStarReviews /
                                        stats.totalReviews
                                    ) * 100
                                ).toFixed(0)
                                : 0
                            }% of reviews

                        </span>

                    </div>


                    <div className="kpi-icon">

                        <Star
                            size={24}
                            fill="#176b39"
                        />

                    </div>

                </div>


                {/* LOW RATING */}

                <div className="review-kpi-card">

                    <div>

                        <p>
                            1–2 Star Reviews
                        </p>

                        <h2>
                            {stats.lowRatingReviews}
                        </h2>

                        <span>
                            Need attention
                        </span>

                    </div>


                    <div className="kpi-icon">

                        <AlertCircle
                            size={24}
                        />

                    </div>

                </div>


            </div>


            {/* ============================================
                RATING OVERVIEW
            ============================================ */}

            <div className="rating-overview">

                <h2>
                    Rating Overview
                </h2>

                <p>
                    Customer rating distribution
                </p>


                {/* 5 */}

                <div className="rating-row">

                    <span>
                        5 ⭐
                    </span>

                    <div className="rating-bar">

                        <div
                            className="rating-fill"
                            style={{
                                width:
                                    `${getPercentage(
                                        stats.fiveStarReviews
                                    )}%`
                            }}
                        />

                    </div>

                    <strong>
                        {stats.fiveStarReviews}
                    </strong>

                </div>


                {/* 4 */}

                <div className="rating-row">

                    <span>
                        4 ⭐
                    </span>

                    <div className="rating-bar">

                        <div
                            className="rating-fill"
                            style={{
                                width:
                                    `${getPercentage(
                                        stats.fourStarReviews
                                    )}%`
                            }}
                        />

                    </div>

                    <strong>
                        {stats.fourStarReviews}
                    </strong>

                </div>


                {/* 3 */}

                <div className="rating-row">

                    <span>
                        3 ⭐
                    </span>

                    <div className="rating-bar">

                        <div
                            className="rating-fill"
                            style={{
                                width:
                                    `${getPercentage(
                                        stats.threeStarReviews
                                    )}%`
                            }}
                        />

                    </div>

                    <strong>
                        {stats.threeStarReviews}
                    </strong>

                </div>


                {/* 2 */}

                <div className="rating-row">

                    <span>
                        2 ⭐
                    </span>

                    <div className="rating-bar">

                        <div
                            className="rating-fill"
                            style={{
                                width:
                                    `${getPercentage(
                                        stats.twoStarReviews
                                    )}%`
                            }}
                        />

                    </div>

                    <strong>
                        {stats.twoStarReviews}
                    </strong>

                </div>


                {/* 1 */}

                <div className="rating-row">

                    <span>
                        1 ⭐
                    </span>

                    <div className="rating-bar">

                        <div
                            className="rating-fill"
                            style={{
                                width:
                                    `${getPercentage(
                                        stats.oneStarReviews
                                    )}%`
                            }}
                        />

                    </div>

                    <strong>
                        {stats.oneStarReviews}
                    </strong>

                </div>

            </div>


            {/* ============================================
                CUSTOMER REVIEWS
            ============================================ */}

            <div className="customer-reviews">

                <div className="section-heading">

                    <div>

                        <h2>
                            Customer Reviews
                        </h2>

                        <p>
                            Reviews received on your products
                        </p>

                    </div>

                </div>


                {reviews.length === 0 ? (

                    <div className="no-reviews">

                        <MessageSquare
                            size={42}
                        />

                        <h3>
                            No reviews yet
                        </h3>

                        <p>
                            Customer reviews will
                            appear here when
                            customers review
                            your products.
                        </p>

                    </div>

                ) : (

                    <div className="reviews-list">

                        {reviews.map(
                            (item) => (

                                <div
                                    className="review-item"
                                    key={
                                        item.review_id
                                    }
                                >

                                    <div className="review-user">

                                        <div className="user-avatar">

                                            {item.profile_image ? (

                                                <img
                                                    src={
                                                        item.profile_image
                                                    }
                                                    alt={
                                                        item.full_name ||
                                                        "Customer"
                                                    }
                                                />

                                            ) : (

                                                <span>
                                                    {
                                                        (
                                                            item.full_name ||
                                                            "C"
                                                        )
                                                            .charAt(0)
                                                            .toUpperCase()
                                                    }
                                                </span>

                                            )}

                                        </div>


                                        <div>

                                            <h3>
                                                {
                                                    item.full_name ||
                                                    "Customer"
                                                }
                                            </h3>

                                            <small>
                                                {
                                                    formatDate(
                                                        item.review_date
                                                    )
                                                }
                                            </small>

                                        </div>

                                    </div>


                                    <div className="review-product">

                                        <strong>
                                            Product
                                        </strong>

                                        <span>
                                            {
                                                item.product_name ||
                                                "Product"
                                            }
                                        </span>

                                    </div>


                                    <div className="review-rating">

                                        {renderStars(
                                            Number(
                                                item.rating
                                            )
                                        )}

                                        <strong>
                                            {
                                                Number(
                                                    item.rating
                                                ).toFixed(1)
                                            }
                                        </strong>

                                    </div>


                                    <p className="review-text">

                                        {item.review ||
                                            "Customer did not leave a comment."
                                        }

                                    </p>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        </div>

    );

}


export default Reviews;