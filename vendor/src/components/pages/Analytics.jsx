import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    RefreshCw,
    Loader2,
    AlertCircle,
    TrendingUp,
    ShoppingCart,
    IndianRupee,
    Package,
    CheckCircle2,
    Clock3,
    Truck,
    XCircle,
    BarChart3,
    ArrowUpRight
} from "lucide-react";

import {
    useNavigate
} from "react-router-dom";

import API from "../../api/api";


// ======================================================
// ANALYTICS PAGE
// ======================================================

export default function Analytics() {

    let navigate = useNavigate();


    // ==================================================
    // STATES
    // ==================================================

    let [orders, setOrders] = useState([]);

    let [loading, setLoading] = useState(true);

    let [refreshing, setRefreshing] = useState(false);

    let [error, setError] = useState("");

    let [period, setPeriod] = useState("6");


    // ==================================================
    // FETCH VENDOR ORDERS
    // ==================================================

    let fetchAnalytics = async (
        showLoader = false
    ) => {

        try {

            if (showLoader) {
                setRefreshing(true);
            }
            else {
                setLoading(true);
            }

            setError("");


            let response = await API.get(
                "/orders/vendor"
            );


            console.log(
                "Analytics Orders API:",
                response.data
            );


            if (response.data?.success) {

                let vendorOrders =
                    Array.isArray(
                        response.data.orders
                    )
                        ? response.data.orders
                        : [];


                setOrders(
                    vendorOrders
                );

            }

            else {

                setOrders([]);

                setError(
                    response.data?.message ||
                    "Unable to load analytics."
                );

            }

        }

        catch (error) {

            console.error(
                "Analytics Error:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Failed to load analytics data."
            );

            setOrders([]);

        }

        finally {

            setLoading(false);

            setRefreshing(false);

        }

    };


    // ==================================================
    // INITIAL LOAD
    // ==================================================

    useEffect(() => {

        fetchAnalytics();

    }, []);


    // ==================================================
    // GET AMOUNT
    // ==================================================

    let getAmount = (order) => {

        let amount =
            Number(
                order?.vendor_total
            );


        if (
            Number.isFinite(amount) &&
            amount > 0
        ) {

            return amount;

        }


        let items =
            Array.isArray(order?.items)
                ? order.items
                : [];


        return items.reduce(
            (
                total,
                item
            ) => {

                let subtotal =
                    Number(
                        item?.subtotal
                    );


                if (
                    Number.isFinite(subtotal)
                ) {

                    return (
                        total +
                        subtotal
                    );

                }


                let price =
                    Number(
                        item?.price ||
                        item?.selling_price ||
                        0
                    );


                let quantity =
                    Number(
                        item?.quantity ||
                        1
                    );


                return (
                    total +
                    price * quantity
                );

            },
            0
        );

    };


    // ==================================================
    // GET ORDER DATE
    // ==================================================

    let getOrderDate = (order) => {

        return (
            order?.created_at ||
            order?.order_date ||
            order?.earning_date ||
            null
        );

    };


    // ==================================================
    // GET STATUS
    // ==================================================

    let getStatus = (order) => {

        return (
            order?.vendor_status ||
            order?.order_status ||
            "Pending"
        );

    };


    // ==================================================
    // FORMAT CURRENCY
    // ==================================================

    let formatCurrency = (amount) => {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }
        ).format(
            Number(amount) || 0
        );

    };


    // ==================================================
    // FORMAT NUMBER
    // ==================================================

    let formatNumber = (value) => {

        return new Intl.NumberFormat(
            "en-IN"
        ).format(
            Number(value) || 0
        );

    };


    // ==================================================
    // MONTH NAME
    // ==================================================

    let getMonthName = (date) => {

        return new Intl.DateTimeFormat(
            "en-IN",
            {
                month: "short"
            }
        ).format(date);

    };


    // ==================================================
    // MONTHLY DATA
    // ==================================================

    let monthlyData = useMemo(
        () => {

            let monthMap = new Map();

            let now = new Date();

            let months = Number(period);


            for (
                let i = months - 1;
                i >= 0;
                i--
            ) {

                let date =
                    new Date(
                        now.getFullYear(),
                        now.getMonth() - i,
                        1
                    );


                let key =
                    `${date.getFullYear()}-${String(
                        date.getMonth() + 1
                    ).padStart(2, "0")}`;


                monthMap.set(
                    key,
                    {
                        key,
                        month:
                            getMonthName(date),
                        sales: 0,
                        orders: 0
                    }
                );

            }


            orders.forEach(
                (order) => {

                    let rawDate =
                        getOrderDate(order);


                    if (!rawDate) {
                        return;
                    }


                    let date =
                        new Date(rawDate);


                    if (
                        Number.isNaN(
                            date.getTime()
                        )
                    ) {
                        return;
                    }


                    let key =
                        `${date.getFullYear()}-${String(
                            date.getMonth() + 1
                        ).padStart(2, "0")}`;


                    if (
                        !monthMap.has(key)
                    ) {
                        return;
                    }


                    let item =
                        monthMap.get(key);


                    item.orders += 1;

                    item.sales +=
                        getAmount(order);

                }
            );


            return Array.from(
                monthMap.values()
            );

        },
        [
            orders,
            period
        ]
    );


    // ==================================================
    // TOTAL SALES
    // ==================================================

    let totalSales = useMemo(
        () => {

            return orders.reduce(
                (
                    total,
                    order
                ) => {

                    return (
                        total +
                        getAmount(order)
                    );

                },
                0
            );

        },
        [orders]
    );


    // ==================================================
    // TOTAL ORDERS
    // ==================================================

    let totalOrders =
        orders.length;


    // ==================================================
    // AVERAGE ORDER VALUE
    // ==================================================

    let averageOrderValue =
        totalOrders > 0
            ? totalSales / totalOrders
            : 0;


    // ==================================================
    // STATUS COUNTS
    // ==================================================

    let statusCounts = useMemo(
        () => {

            let result = {

                pending: 0,

                processing: 0,

                shipped: 0,

                delivered: 0,

                cancelled: 0

            };


            orders.forEach(
                (order) => {

                    let status =
                        String(
                            getStatus(order)
                        )
                            .toLowerCase()
                            .trim();


                    if (
                        status.includes("cancel")
                    ) {

                        result.cancelled++;

                    }

                    else if (
                        status.includes("deliver")
                    ) {

                        result.delivered++;

                    }

                    else if (
                        status.includes("ship")
                    ) {

                        result.shipped++;

                    }

                    else if (
                        status.includes("process")
                    ) {

                        result.processing++;

                    }

                    else {

                        result.pending++;

                    }

                }
            );


            return result;

        },
        [orders]
    );


    // ==================================================
    // COMPLETED ORDERS
    // ==================================================

    let completedOrders =
        statusCounts.delivered;


    // ==================================================
    // COMPLETED SALES
    // ==================================================

    let completedSales = useMemo(
        () => {

            return orders.reduce(
                (
                    total,
                    order
                ) => {

                    let status =
                        String(
                            getStatus(order)
                        ).toLowerCase();


                    if (
                        status.includes("deliver")
                    ) {

                        return (
                            total +
                            getAmount(order)
                        );

                    }


                    return total;

                },
                0
            );

        },
        [orders]
    );


    // ==================================================
    // PENDING SALES
    // ==================================================

    let pendingSales = useMemo(
        () => {

            return orders.reduce(
                (
                    total,
                    order
                ) => {

                    let status =
                        String(
                            getStatus(order)
                        ).toLowerCase();


                    if (
                        !status.includes("deliver") &&
                        !status.includes("cancel")
                    ) {

                        return (
                            total +
                            getAmount(order)
                        );

                    }


                    return total;

                },
                0
            );

        },
        [orders]
    );


    // ==================================================
    // CANCELLED SALES
    // ==================================================

    let cancelledSales = useMemo(
        () => {

            return orders.reduce(
                (
                    total,
                    order
                ) => {

                    let status =
                        String(
                            getStatus(order)
                        ).toLowerCase();


                    if (
                        status.includes("cancel")
                    ) {

                        return (
                            total +
                            getAmount(order)
                        );

                    }


                    return total;

                },
                0
            );

        },
        [orders]
    );


    // ==================================================
    // TOP PRODUCTS
    // ==================================================

    let topProducts = useMemo(
        () => {

            let productMap =
                new Map();


            orders.forEach(
                (order) => {

                    let items =
                        Array.isArray(
                            order?.items
                        )
                            ? order.items
                            : [];


                    items.forEach(
                        (item) => {

                            let name =
                                item?.product_name ||
                                item?.name ||
                                item?.title ||
                                "Product";


                            let quantity =
                                Number(
                                    item?.quantity ||
                                    1
                                );


                            let subtotal =
                                Number(
                                    item?.subtotal
                                );


                            let price =
                                Number(
                                    item?.price ||
                                    item?.selling_price ||
                                    0
                                );


                            let sales =
                                Number.isFinite(
                                    subtotal
                                )
                                    ? subtotal
                                    : price * quantity;


                            if (
                                !productMap.has(name)
                            ) {

                                productMap.set(
                                    name,
                                    {
                                        name,
                                        quantity: 0,
                                        sales: 0
                                    }
                                );

                            }


                            let product =
                                productMap.get(name);


                            product.quantity +=
                                quantity;


                            product.sales +=
                                sales;

                        }
                    );

                }
            );


            return Array.from(
                productMap.values()
            )
                .sort(
                    (a, b) =>
                        b.sales -
                        a.sales
                )
                .slice(0, 5);

        },
        [orders]
    );


    // ==================================================
    // MAX MONTHLY SALES
    // ==================================================

    let maxMonthlySales =
        Math.max(
            ...monthlyData.map(
                (item) =>
                    item.sales
            ),
            1
        );


    // ==================================================
    // RECENT ORDERS
    // ==================================================

    let recentOrders =
        [...orders]
            .sort(
                (a, b) => {

                    let dateA =
                        new Date(
                            getOrderDate(a) || 0
                        );


                    let dateB =
                        new Date(
                            getOrderDate(b) || 0
                        );


                    return dateB - dateA;

                }
            )
            .slice(0, 5);


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (

            <div
                className="
                    min-h-full
                    flex
                    items-center
                    justify-center
                    bg-[#f8faf8]
                    p-8
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        items-center
                        gap-4
                    "
                >

                    <Loader2
                        className="
                            w-9
                            h-9
                            animate-spin
                            text-[#175c2e]
                        "
                    />

                    <p
                        className="
                            text-sm
                            font-semibold
                            text-gray-500
                        "
                    >
                        Loading analytics...
                    </p>

                </div>

            </div>

        );

    }


    // ==================================================
    // MAIN UI
    // ==================================================

    return (

        <div
            className="
                min-h-full
                bg-[#f8faf8]
                p-4
                sm:p-6
                lg:p-8
            "
        >

            {/* ==================================================
                HEADER
            ================================================== */}

            <div
                className="
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-4
                    mb-7
                "
            >

                <div>

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >

                        <BarChart3
                            className="
                                w-6
                                h-6
                                text-[#175c2e]
                            "
                        />

                        <h1
                            className="
                                text-2xl
                                sm:text-3xl
                                font-extrabold
                                text-gray-900
                            "
                        >
                            Analytics
                        </h1>

                    </div>


                    <p
                        className="
                            text-sm
                            text-gray-500
                            mt-1
                        "
                    >
                        Track your store sales, orders and performance.
                    </p>

                </div>


                <button
                    type="button"
                    disabled={refreshing}
                    onClick={() =>
                        fetchAnalytics(true)
                    }
                    className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        px-4
                        py-2.5
                        rounded-xl
                        bg-white
                        border
                        border-gray-200
                        text-sm
                        font-bold
                        text-gray-700
                        hover:border-[#175c2e]/30
                        hover:text-[#175c2e]
                        transition-all
                        disabled:opacity-60
                    "
                >

                    <RefreshCw
                        className={`
                            w-4
                            h-4
                            ${
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        `}
                    />

                    Refresh

                </button>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <div
                    className="
                        mb-6
                        flex
                        items-center
                        justify-between
                        gap-3
                        rounded-xl
                        border
                        border-red-200
                        bg-red-50
                        px-4
                        py-3
                        text-red-700
                        text-sm
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <AlertCircle
                            className="
                                w-5
                                h-5
                            "
                        />

                        {error}

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            fetchAnalytics(true)
                        }
                        className="
                            text-xs
                            font-bold
                            underline
                        "
                    >
                        Retry
                    </button>

                </div>

            )}


            {/* ==================================================
                KPI CARDS
            ================================================== */}

            <div
                className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    xl:grid-cols-4
                    gap-5
                    mb-6
                "
            >

                <AnalyticsCard
                    icon={IndianRupee}
                    title="Total Sales"
                    value={formatCurrency(totalSales)}
                    description="Total vendor sales"
                />

                <AnalyticsCard
                    icon={ShoppingCart}
                    title="Total Orders"
                    value={formatNumber(totalOrders)}
                    description="Orders received"
                />

                <AnalyticsCard
                    icon={TrendingUp}
                    title="Average Order Value"
                    value={formatCurrency(averageOrderValue)}
                    description="Average sales per order"
                />

                <AnalyticsCard
                    icon={CheckCircle2}
                    title="Completed Orders"
                    value={formatNumber(completedOrders)}
                    description="Delivered orders"
                />

            </div>


            {/* ==================================================
                SALES OVERVIEW + STATUS
            ================================================== */}

            <div
                className="
                    grid
                    grid-cols-1
                    xl:grid-cols-3
                    gap-6
                    mb-6
                "
            >

                {/* SALES OVERVIEW */}

                <div
                    className="
                        xl:col-span-2
                        bg-white
                        border
                        border-gray-200
                        rounded-[20px]
                        p-5
                        sm:p-6
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                            gap-3
                            mb-7
                        "
                    >

                        <div>

                            <h2
                                className="
                                    text-lg
                                    font-extrabold
                                    text-gray-900
                                "
                            >
                                Sales Overview
                            </h2>

                            <p
                                className="
                                    text-xs
                                    text-gray-400
                                    mt-1
                                "
                            >
                                Monthly sales performance
                            </p>

                        </div>


                        <select
                            value={period}
                            onChange={(event) =>
                                setPeriod(
                                    event.target.value
                                )
                            }
                            className="
                                bg-white
                                border
                                border-gray-200
                                rounded-lg
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-gray-600
                                outline-none
                                focus:border-[#175c2e]
                            "
                        >

                            <option value="3">
                                Last 3 months
                            </option>

                            <option value="6">
                                Last 6 months
                            </option>

                            <option value="12">
                                Last 12 months
                            </option>

                        </select>

                    </div>


                    <div
                        className="
                            h-[280px]
                            flex
                            items-end
                            gap-3
                            sm:gap-5
                            border-b
                            border-gray-100
                            px-2
                        "
                    >

                        {monthlyData.map(
                            (item) => {

                                let height =
                                    (
                                        item.sales /
                                        maxMonthlySales
                                    ) * 100;


                                return (

                                    <div
                                        key={item.key}
                                        className="
                                            flex-1
                                            h-full
                                            flex
                                            flex-col
                                            justify-end
                                            items-center
                                            gap-2
                                        "
                                    >

                                        <div
                                            className="
                                                text-[10px]
                                                font-bold
                                                text-gray-500
                                                whitespace-nowrap
                                            "
                                        >
                                            {item.sales > 0
                                                ? formatCurrency(
                                                    item.sales
                                                )
                                                : "₹0"}
                                        </div>


                                        <div
                                            className="
                                                w-full
                                                max-w-[55px]
                                                flex
                                                items-end
                                                h-[210px]
                                            "
                                        >

                                            <div
                                                className="
                                                    w-full
                                                    rounded-t-xl
                                                    bg-[#175c2e]
                                                    transition-all
                                                    duration-500
                                                    hover:bg-[#0f4722]
                                                "
                                                style={{
                                                    height:
                                                        item.sales > 0
                                                            ? `${Math.max(
                                                                height,
                                                                5
                                                            )}%`
                                                            : "4%"
                                                }}
                                            />

                                        </div>


                                        <span
                                            className="
                                                text-[11px]
                                                font-semibold
                                                text-gray-400
                                            "
                                        >
                                            {item.month}
                                        </span>

                                    </div>

                                );

                            }
                        )}

                    </div>

                </div>


                {/* ORDER STATUS */}

                <div
                    className="
                        bg-white
                        border
                        border-gray-200
                        rounded-[20px]
                        p-5
                        sm:p-6
                    "
                >

                    <h2
                        className="
                            text-lg
                            font-extrabold
                            text-gray-900
                        "
                    >
                        Order Status
                    </h2>

                    <p
                        className="
                            text-xs
                            text-gray-400
                            mt-1
                            mb-6
                        "
                    >
                        Current order distribution
                    </p>


                    <div className="space-y-4">

                        <StatusRow
                            icon={Clock3}
                            title="Pending"
                            value={statusCounts.pending}
                            total={totalOrders}
                        />

                        <StatusRow
                            icon={Loader2}
                            title="Processing"
                            value={statusCounts.processing}
                            total={totalOrders}
                        />

                        <StatusRow
                            icon={Truck}
                            title="Shipped"
                            value={statusCounts.shipped}
                            total={totalOrders}
                        />

                        <StatusRow
                            icon={CheckCircle2}
                            title="Delivered"
                            value={statusCounts.delivered}
                            total={totalOrders}
                        />

                        <StatusRow
                            icon={XCircle}
                            title="Cancelled"
                            value={statusCounts.cancelled}
                            total={totalOrders}
                        />

                    </div>

                </div>

            </div>


            {/* ==================================================
                SALES BREAKDOWN
            ================================================== */}

            <div
                className="
                    grid
                    grid-cols-1
                    md:grid-cols-3
                    gap-5
                    mb-6
                "
            >

                <SmallMetric
                    icon={CheckCircle2}
                    title="Completed Sales"
                    value={formatCurrency(completedSales)}
                    description="Sales from delivered orders"
                />

                <SmallMetric
                    icon={Clock3}
                    title="Pending Sales"
                    value={formatCurrency(pendingSales)}
                    description="Sales from active orders"
                />

                <SmallMetric
                    icon={XCircle}
                    title="Cancelled Sales"
                    value={formatCurrency(cancelledSales)}
                    description="Sales from cancelled orders"
                />

            </div>


            {/* ==================================================
                TOP PRODUCTS + RECENT ORDERS
            ================================================== */}

            <div
                className="
                    grid
                    grid-cols-1
                    xl:grid-cols-2
                    gap-6
                "
            >

                {/* TOP PRODUCTS */}

                <div
                    className="
                        bg-white
                        border
                        border-gray-200
                        rounded-[20px]
                        p-5
                        sm:p-6
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            mb-5
                        "
                    >

                        <div>

                            <h2
                                className="
                                    text-lg
                                    font-extrabold
                                    text-gray-900
                                "
                            >
                                Top Products
                            </h2>

                            <p
                                className="
                                    text-xs
                                    text-gray-400
                                    mt-1
                                "
                            >
                                Best performing products
                            </p>

                        </div>


                        <Package
                            className="
                                w-5
                                h-5
                                text-[#175c2e]
                            "
                        />

                    </div>


                    {topProducts.length === 0 ? (

                        <EmptyState
                            text="No product sales data available yet."
                        />

                    ) : (

                        <div className="space-y-3">

                            {topProducts.map(
                                (
                                    product,
                                    index
                                ) => (

                                    <div
                                        key={`${product.name}-${index}`}
                                        className="
                                            flex
                                            items-center
                                            gap-3
                                            p-3
                                            rounded-xl
                                            bg-gray-50
                                        "
                                    >

                                        <div
                                            className="
                                                w-8
                                                h-8
                                                rounded-lg
                                                bg-[#175c2e]/10
                                                flex
                                                items-center
                                                justify-center
                                                text-xs
                                                font-extrabold
                                                text-[#175c2e]
                                            "
                                        >
                                            {index + 1}
                                        </div>


                                        <div
                                            className="
                                                min-w-0
                                                flex-1
                                            "
                                        >

                                            <p
                                                className="
                                                    text-sm
                                                    font-bold
                                                    text-gray-800
                                                    truncate
                                                "
                                            >
                                                {product.name}
                                            </p>


                                            <p
                                                className="
                                                    text-[11px]
                                                    text-gray-400
                                                    mt-0.5
                                                "
                                            >
                                                {product.quantity} sold
                                            </p>

                                        </div>


                                        <p
                                            className="
                                                text-sm
                                                font-extrabold
                                                text-[#175c2e]
                                            "
                                        >
                                            {formatCurrency(
                                                product.sales
                                            )}
                                        </p>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </div>


                {/* RECENT ORDERS */}

                <div
                    className="
                        bg-white
                        border
                        border-gray-200
                        rounded-[20px]
                        p-5
                        sm:p-6
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            mb-5
                        "
                    >

                        <div>

                            <h2
                                className="
                                    text-lg
                                    font-extrabold
                                    text-gray-900
                                "
                            >
                                Recent Orders
                            </h2>

                            <p
                                className="
                                    text-xs
                                    text-gray-400
                                    mt-1
                                "
                            >
                                Latest vendor orders
                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                navigate("/orders")
                            }
                            className="
                                text-xs
                                font-bold
                                text-[#175c2e]
                                hover:underline
                            "
                        >
                            View all
                        </button>

                    </div>


                    {recentOrders.length === 0 ? (

                        <EmptyState
                            text="No orders available yet."
                        />

                    ) : (

                        <div className="space-y-3">

                            {recentOrders.map(
                                (
                                    order,
                                    index
                                ) => {

                                    let status =
                                        getStatus(order);

                                    let amount =
                                        getAmount(order);

                                    let orderId =
                                        order?.order_id ||
                                        order?.id ||
                                        "-";


                                    return (

                                        <div
                                            key={
                                                order?.order_vendor_id ||
                                                orderId ||
                                                index
                                            }
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                                p-3
                                                rounded-xl
                                                border
                                                border-gray-100
                                            "
                                        >

                                            <div
                                                className="
                                                    w-9
                                                    h-9
                                                    rounded-lg
                                                    bg-[#175c2e]/10
                                                    flex
                                                    items-center
                                                    justify-center
                                                    shrink-0
                                                "
                                            >

                                                <ShoppingCart
                                                    className="
                                                        w-4
                                                        h-4
                                                        text-[#175c2e]
                                                    "
                                                />

                                            </div>


                                            <div
                                                className="
                                                    min-w-0
                                                    flex-1
                                                "
                                            >

                                                <p
                                                    className="
                                                        text-sm
                                                        font-bold
                                                        text-gray-800
                                                    "
                                                >
                                                    Order #{orderId}
                                                </p>


                                                <p
                                                    className="
                                                        text-[11px]
                                                        text-gray-400
                                                        mt-0.5
                                                    "
                                                >
                                                    {formatDate(
                                                        getOrderDate(order)
                                                    )}
                                                </p>

                                            </div>


                                            <div className="text-right">

                                                <p
                                                    className="
                                                        text-sm
                                                        font-extrabold
                                                        text-gray-900
                                                    "
                                                >
                                                    {formatCurrency(
                                                        amount
                                                    )}
                                                </p>


                                                <StatusBadge
                                                    status={status}
                                                />

                                            </div>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    )}

                </div>

            </div>


            {/* ==================================================
                FOOTER INSIGHT
            ================================================== */}

            <div
                className="
                    mt-6
                    bg-[#175c2e]
                    rounded-[20px]
                    p-5
                    sm:p-6
                    text-white
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-4
                "
            >

                <div>

                    <p
                        className="
                            text-xs
                            font-semibold
                            text-white/70
                        "
                    >
                        PERFORMANCE SUMMARY
                    </p>


                    <h3
                        className="
                            text-lg
                            font-extrabold
                            mt-1
                        "
                    >
                        {totalOrders > 0
                            ? `You have ${totalOrders} order${totalOrders > 1 ? "s" : ""} generating ${formatCurrency(totalSales)} in sales.`
                            : "Your analytics will appear here once you receive orders."
                        }
                    </h3>

                </div>


                <button
                    type="button"
                    onClick={() =>
                        navigate("/orders")
                    }
                    className="
                        inline-flex
                        items-center
                        gap-2
                        px-4
                        py-2.5
                        rounded-xl
                        bg-white
                        text-[#175c2e]
                        text-sm
                        font-bold
                        hover:bg-gray-100
                        transition-all
                        shrink-0
                    "
                >

                    View Orders

                    <ArrowUpRight
                        className="
                            w-4
                            h-4
                        "
                    />

                </button>

            </div>

        </div>

    );

}


// ======================================================
// ANALYTICS CARD
// ======================================================

function AnalyticsCard({
    icon: Icon,
    title,
    value,
    description
}) {

    return (

        <div
            className="
                bg-white
                border
                border-gray-200
                rounded-[20px]
                p-5
                transition-all
                hover:-translate-y-0.5
                hover:shadow-md
            "
        >

            <div
                className="
                    flex
                    items-start
                    justify-between
                    gap-4
                "
            >

                <div>

                    <p
                        className="
                            text-xs
                            font-semibold
                            text-gray-400
                        "
                    >
                        {title}
                    </p>


                    <h3
                        className="
                            text-2xl
                            font-extrabold
                            text-gray-900
                            mt-2
                        "
                    >
                        {value}
                    </h3>


                    <p
                        className="
                            text-xs
                            text-gray-400
                            mt-2
                        "
                    >
                        {description}
                    </p>

                </div>


                <div
                    className="
                        w-11
                        h-11
                        rounded-xl
                        bg-[#175c2e]/10
                        flex
                        items-center
                        justify-center
                        shrink-0
                    "
                >

                    <Icon
                        className="
                            w-5
                            h-5
                            text-[#175c2e]
                        "
                    />

                </div>

            </div>

        </div>

    );

}


// ======================================================
// STATUS ROW
// ======================================================

function StatusRow({
    icon: Icon,
    title,
    value,
    total
}) {

    let percentage =
        total > 0
            ? (value / total) * 100
            : 0;


    return (

        <div>

            <div
                className="
                    flex
                    items-center
                    justify-between
                    mb-2
                "
            >

                <div
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >

                    <Icon
                        className="
                            w-4
                            h-4
                            text-[#175c2e]
                        "
                    />

                    <span
                        className="
                            text-xs
                            font-semibold
                            text-gray-600
                        "
                    >
                        {title}
                    </span>

                </div>


                <span
                    className="
                        text-xs
                        font-extrabold
                        text-gray-800
                    "
                >
                    {value}
                </span>

            </div>


            <div
                className="
                    h-2
                    rounded-full
                    bg-gray-100
                    overflow-hidden
                "
            >

                <div
                    className="
                        h-full
                        rounded-full
                        bg-[#175c2e]
                        transition-all
                        duration-500
                    "
                    style={{
                        width:
                            `${percentage}%`
                    }}
                />

            </div>

        </div>

    );

}


// ======================================================
// SMALL METRIC
// ======================================================

function SmallMetric({
    icon: Icon,
    title,
    value,
    description
}) {

    return (

        <div
            className="
                bg-white
                border
                border-gray-200
                rounded-[20px]
                p-5
                flex
                items-center
                gap-4
            "
        >

            <div
                className="
                    w-11
                    h-11
                    rounded-xl
                    bg-[#175c2e]/10
                    flex
                    items-center
                    justify-center
                    shrink-0
                "
            >

                <Icon
                    className="
                        w-5
                        h-5
                        text-[#175c2e]
                    "
                />

            </div>


            <div className="min-w-0">

                <p
                    className="
                        text-xs
                        font-semibold
                        text-gray-400
                    "
                >
                    {title}
                </p>


                <p
                    className="
                        text-xl
                        font-extrabold
                        text-gray-900
                        mt-1
                    "
                >
                    {value}
                </p>


                <p
                    className="
                        text-[10px]
                        text-gray-400
                        mt-1
                    "
                >
                    {description}
                </p>

            </div>

        </div>

    );

}


// ======================================================
// STATUS BADGE
// ======================================================

function StatusBadge({
    status
}) {

    let value =
        String(
            status ||
            "Pending"
        );


    let lower =
        value.toLowerCase();


    let className = `
        inline-flex
        px-2
        py-0.5
        rounded-full
        text-[9px]
        font-bold
        mt-1
    `;


    if (
        lower.includes("deliver")
    ) {

        className +=
            " bg-green-100 text-green-700";

    }

    else if (
        lower.includes("cancel")
    ) {

        className +=
            " bg-red-100 text-red-700";

    }

    else if (
        lower.includes("ship")
    ) {

        className +=
            " bg-blue-100 text-blue-700";

    }

    else if (
        lower.includes("process")
    ) {

        className +=
            " bg-yellow-100 text-yellow-700";

    }

    else {

        className +=
            " bg-gray-100 text-gray-600";

    }


    return (

        <span className={className}>
            {value}
        </span>

    );

}


// ======================================================
// EMPTY STATE
// ======================================================

function EmptyState({
    text
}) {

    return (

        <div
            className="
                py-12
                text-center
                text-sm
                text-gray-400
            "
        >
            {text}
        </div>

    );

}


// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(value) {

    if (!value) {
        return "Date unavailable";
    }


    let date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Date unavailable";

    }


    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(date);

}