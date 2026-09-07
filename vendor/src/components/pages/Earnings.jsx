import { useEffect, useState } from "react";
import API from "../../api/api";
import "./earnings.css";

function Earnings() {

    // ======================================================
    // STATE
    // ======================================================

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [earnings, setEarnings] = useState({

        totalSales: 0,

        commission: 0,

        netEarning: 0,

        pending: 0

    });

    const [recentEarnings, setRecentEarnings] =
        useState([]);


    // ======================================================
    // FETCH EARNINGS
    // ======================================================

    const fetchEarnings = async () => {

        try {

            setLoading(true);

            setError("");


            console.log(
                "Fetching vendor earnings..."
            );


            // ==================================================
            // API CALL
            // ==================================================

            const response =
                await API.get(
                    "/earnings/vendor"
                );


            console.log(
                "Earnings API Response:",
                response.data
            );


            // ==================================================
            // SUCCESS RESPONSE
            // ==================================================

            if (
                response.data &&
                response.data.success
            ) {

                // ==================================================
                // IMPORTANT:
                // KPI DATA COMES FROM response.data.summary
                // ==================================================

                let summary =
                    response.data.summary ||
                    {};


                // ==================================================
                // SET KPI DATA
                // ==================================================

                setEarnings({

                    totalSales:
                        Number(
                            summary.totalSales || 0
                        ),

                    commission:
                        Number(
                            summary.totalCommission || 0
                        ),

                    netEarning:
                        Number(
                            summary.totalNetEarnings || 0
                        ),

                    pending:
                        Number(
                            summary.pendingEarnings || 0
                        )

                });


                // ==================================================
                // RECENT EARNINGS
                // ==================================================

                let transactions =
                    Array.isArray(
                        response.data.earnings
                    )
                        ? response.data.earnings
                        : [];


                setRecentEarnings(
                    transactions
                );


                // ==================================================
                // DEBUG
                // ==================================================

                console.log(
                    "Earnings Summary:",
                    summary
                );


                console.log(
                    "Recent Earnings:",
                    transactions
                );

            }

            else {

                setError(
                    response.data?.message ||
                    "Unable to fetch earnings"
                );


                setEarnings({

                    totalSales: 0,

                    commission: 0,

                    netEarning: 0,

                    pending: 0

                });


                setRecentEarnings([]);

            }

        }

        catch (error) {

            console.error(
                "Earnings API Error:",
                error.response?.data ||
                error.message
            );


            setError(
                error.response?.data?.message ||
                "Failed to load earnings"
            );


            setEarnings({

                totalSales: 0,

                commission: 0,

                netEarning: 0,

                pending: 0

            });


            setRecentEarnings([]);

        }

        finally {

            setLoading(false);

        }

    };


    // ======================================================
    // FETCH ON PAGE LOAD
    // ======================================================

    useEffect(() => {

        fetchEarnings();

    }, []);


    // ======================================================
    // FORMAT CURRENCY
    // ======================================================

    const formatCurrency = (value) => {

        return Number(
            value || 0
        ).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );

    };


    // ======================================================
    // FORMAT DATE
    // ======================================================

    const formatDate = (date) => {

        if (!date) {

            return "-";

        }


        let parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "-";

        }


        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    // ======================================================
    // STATUS CLASS
    // ======================================================

    const getStatusClass = (status) => {

        if (!status) {

            return "pending";

        }


        let value =
            status.toLowerCase();


        if (
            value === "completed" ||
            value === "delivered"
        ) {

            return "completed";

        }


        if (
            value === "cancelled" ||
            value === "canceled"
        ) {

            return "cancelled";

        }


        return "pending";

    };


    // ======================================================
    // PAGE
    // ======================================================

    return (

        <div className="earnings-page">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="earnings-header">

                <div>

                    <h1>
                        Earnings
                    </h1>

                    <p>
                        Track your store sales and earnings.
                    </p>

                </div>


                <button
                    className="earnings-refresh-btn"
                    onClick={fetchEarnings}
                    disabled={loading}
                >

                    {loading
                        ? "Loading..."
                        : "↻ Refresh"
                    }

                </button>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {

                error && (

                    <div className="earnings-error">

                        {error}

                    </div>

                )

            }


            {/* ==================================================
                LOADING
            ================================================== */}

            {

                loading && (

                    <div className="earnings-loading">

                        Loading earnings...

                    </div>

                )

            }


            {/* ==================================================
                CONTENT
            ================================================== */}

            {

                !loading && (

                    <>


                        {/* ==================================================
                            KPI CARDS
                        ================================================== */}

                        <div className="earnings-cards">


                            {/* ==================================================
                                TOTAL SALES
                            ================================================== */}

                            <div className="earnings-card">

                                <div className="earnings-card-header">

                                    <span>
                                        Total Sales
                                    </span>


                                    <div className="earnings-icon">

                                        ₹

                                    </div>

                                </div>


                                <h2>

                                    ₹
                                    {
                                        formatCurrency(
                                            earnings.totalSales
                                        )
                                    }

                                </h2>


                                <p>
                                    Total recorded sales
                                </p>

                            </div>


                            {/* ==================================================
                                COMMISSION
                            ================================================== */}

                            <div className="earnings-card">

                                <div className="earnings-card-header">

                                    <span>
                                        Commission
                                    </span>


                                    <div className="earnings-icon">

                                        %

                                    </div>

                                </div>


                                <h2>

                                    ₹
                                    {
                                        formatCurrency(
                                            earnings.commission
                                        )
                                    }

                                </h2>


                                <p>
                                    Platform commission
                                </p>

                            </div>


                            {/* ==================================================
                                NET EARNINGS
                            ================================================== */}

                            <div className="earnings-card">

                                <div className="earnings-card-header">

                                    <span>
                                        Net Earnings
                                    </span>


                                    <div className="earnings-icon">

                                        ₹

                                    </div>

                                </div>


                                <h2>

                                    ₹
                                    {
                                        formatCurrency(
                                            earnings.netEarning
                                        )
                                    }

                                </h2>


                                <p>
                                    Your actual earnings
                                </p>

                            </div>


                            {/* ==================================================
                                PENDING
                            ================================================== */}

                            <div className="earnings-card">

                                <div className="earnings-card-header">

                                    <span>
                                        Pending
                                    </span>


                                    <div className="earnings-icon">

                                        ⏳

                                    </div>

                                </div>


                                <h2>

                                    ₹
                                    {
                                        formatCurrency(
                                            earnings.pending
                                        )
                                    }

                                </h2>


                                <p>
                                    Pending earnings
                                </p>

                            </div>


                        </div>


                        {/* ==================================================
                            EARNINGS OVERVIEW
                        ================================================== */}

                        <div className="earnings-overview">


                            <div>

                                <h2>
                                    Earnings Overview
                                </h2>


                                <p>
                                    View your store earning
                                    performance and sales summary.
                                </p>

                            </div>


                            <div className="overview-total">

                                <span>
                                    Net Earnings
                                </span>


                                <strong>

                                    ₹
                                    {
                                        formatCurrency(
                                            earnings.netEarning
                                        )
                                    }

                                </strong>

                            </div>


                        </div>


                        {/* ==================================================
                            RECENT EARNINGS
                        ================================================== */}

                        <div className="earnings-transactions">


                            <div className="transactions-header">

                                <div>

                                    <h2>
                                        Recent Earnings
                                    </h2>


                                    <p>
                                        Latest earnings from your orders
                                    </p>

                                </div>

                            </div>


                            {/* ==================================================
                                NO DATA
                            ================================================== */}

                            {

                                recentEarnings.length === 0 && (

                                    <div className="empty-transactions">

                                        <div className="empty-icon">

                                            ₹

                                        </div>


                                        <h3>
                                            No Earnings Data
                                        </h3>


                                        <p>
                                            Your recent earnings transactions
                                            will appear here.
                                        </p>

                                    </div>

                                )

                            }


                            {/* ==================================================
                                EARNINGS LIST
                            ================================================== */}

                            {

                                recentEarnings.length > 0 && (

                                    <div className="earnings-table-wrapper">

                                        <table className="earnings-table">

                                            <thead>

                                                <tr>

                                                    <th>
                                                        Order
                                                    </th>

                                                    <th>
                                                        Date
                                                    </th>

                                                    <th>
                                                        Sales
                                                    </th>

                                                    <th>
                                                        Commission
                                                    </th>

                                                    <th>
                                                        Net Earnings
                                                    </th>

                                                    <th>
                                                        Status
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {

                                                    recentEarnings
                                                        .map(
                                                            (
                                                                earning,
                                                                index
                                                            ) => (

                                                                <tr
                                                                    key={
                                                                        earning.order_vendor_id ||
                                                                        earning.order_id ||
                                                                        index
                                                                    }
                                                                >

                                                                    <td>

                                                                        #
                                                                        {
                                                                            earning.order_id ||
                                                                            "-"
                                                                        }

                                                                    </td>


                                                                    <td>

                                                                        {
                                                                            formatDate(
                                                                                earning.earning_date
                                                                            )
                                                                        }

                                                                    </td>


                                                                    <td>

                                                                        ₹
                                                                        {
                                                                            formatCurrency(
                                                                                earning.vendor_total
                                                                            )
                                                                        }

                                                                    </td>


                                                                    <td>

                                                                        ₹
                                                                        {
                                                                            formatCurrency(
                                                                                earning.commission
                                                                            )
                                                                        }

                                                                    </td>


                                                                    <td>

                                                                        <strong>

                                                                            ₹
                                                                            {
                                                                                formatCurrency(
                                                                                    earning.net_earning
                                                                                )
                                                                            }

                                                                        </strong>

                                                                    </td>


                                                                    <td>

                                                                        <span
                                                                            className={
                                                                                `earning-status ${getStatusClass(
                                                                                    earning.earning_status
                                                                                )}`
                                                                            }
                                                                        >

                                                                            {
                                                                                earning.earning_status ||
                                                                                "Pending"
                                                                            }

                                                                        </span>

                                                                    </td>

                                                                </tr>

                                                            )
                                                        )

                                                }

                                            </tbody>

                                        </table>

                                    </div>

                                )

                            }


                        </div>


                    </>

                )

            }


        </div>

    );

}


export default Earnings;