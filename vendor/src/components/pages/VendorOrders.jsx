import React, {
    useEffect,
    useState
} from "react";

import {
    Package,
    User,
    Phone,
    MapPin,
    CreditCard,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    AlertCircle,
    RefreshCw
} from "lucide-react";

import API from "../../api/api";


export default function VendorOrders() {

    // ==========================================
    // STATES
    // ==========================================

    let [orders, setOrders] = useState([]);

    let [loading, setLoading] =
        useState(true);

    let [error, setError] =
        useState("");

    let [selectedOrder, setSelectedOrder] =
        useState(null);


    // ==========================================
    // FETCH VENDOR ORDERS
    // ==========================================

    let fetchVendorOrders = async () => {

        try {

            setLoading(true);

            setError("");


            let response =
                await API.get(
                    "/orders/vendor-orders"
                );


            console.log(
                "Vendor Orders:",
                response.data
            );


            if (
                response.data.success
            ) {

                setOrders(
                    response.data.orders || []
                );

            }

            else {

                setError(
                    response.data.message ||
                    "Unable to load vendor orders."
                );

            }

        }

        catch (error) {

            console.error(
                "Vendor Orders Error:",
                error
            );


            setError(

                error.response?.data?.message ||

                "Unable to load vendor orders."

            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==========================================
    // LOAD ORDERS
    // ==========================================

    useEffect(() => {

        fetchVendorOrders();

    }, []);


    // ==========================================
    // CURRENCY FORMAT
    // ==========================================

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


    // ==========================================
    // DATE FORMAT
    // ==========================================

    let formatDate = (date) => {

        if (!date) {

            return "N/A";

        }


        return new Date(
            date
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    // ==========================================
    // STATUS CLASS
    // ==========================================

    let getStatusClass = (status) => {

        if (
            status === "Delivered" ||
            status === "Completed" ||
            status === "Confirmed"
        ) {

            return `
                bg-green-100
                text-green-700
            `;

        }


        if (
            status === "Cancelled" ||
            status === "Rejected"
        ) {

            return `
                bg-red-100
                text-red-700
            `;

        }


        if (
            status === "Shipped"
        ) {

            return `
                bg-blue-100
                text-blue-700
            `;

        }


        return `
            bg-yellow-100
            text-yellow-700
        `;

    };


    // ==========================================
    // PAYMENT STATUS
    // ==========================================

    let getPaymentStatusClass = (
        status
    ) => {

        if (
            status === "Success" ||
            status === "Paid"
        ) {

            return `
                bg-green-100
                text-green-700
            `;

        }


        return `
            bg-yellow-100
            text-yellow-700
        `;

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div
                className="
                    min-h-[calc(100vh-76px)]

                    flex
                    items-center
                    justify-center

                    p-6
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
                            w-8
                            h-8

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

                        Loading vendor orders...

                    </p>

                </div>

            </div>

        );

    }


    return (

        <div
            className="
                p-4
                sm:p-6
                lg:p-8
            "
        >

            {/* ======================================
                PAGE HEADER
            ====================================== */}

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

                    <h1
                        className="
                            text-2xl
                            font-extrabold
                            text-gray-900
                        "
                    >

                        Customer Orders

                    </h1>


                    <p
                        className="
                            text-sm
                            text-gray-500
                            mt-1
                        "
                    >

                        Manage orders containing your products.

                    </p>

                </div>


                <button

                    type="button"

                    onClick={
                        fetchVendorOrders
                    }

                    className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2

                        px-4
                        py-2.5

                        rounded-xl

                        border
                        border-gray-200

                        bg-white

                        text-sm
                        font-bold
                        text-gray-700

                        hover:bg-gray-50

                        transition-all
                    "
                >

                    <RefreshCw
                        className="
                            w-4
                            h-4
                        "
                    />

                    Refresh

                </button>

            </div>


            {/* ======================================
                ERROR
            ====================================== */}

            {error && (

                <div
                    className="
                        mb-6

                        flex
                        items-center
                        gap-3

                        bg-red-50

                        border
                        border-red-200

                        text-red-700

                        rounded-xl

                        px-4
                        py-3

                        text-sm
                    "
                >

                    <AlertCircle
                        className="
                            w-5
                            h-5
                            shrink-0
                        "
                    />

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {/* ======================================
                EMPTY ORDERS
            ====================================== */}

            {!error &&
                orders.length === 0 && (

                    <div
                        className="
                            bg-white

                            border
                            border-gray-200

                            rounded-[20px]

                            p-10

                            flex
                            flex-col
                            items-center
                            justify-center

                            text-center
                        "
                    >

                        <div
                            className="
                                w-16
                                h-16

                                rounded-2xl

                                bg-[#175c2e]/10

                                flex
                                items-center
                                justify-center

                                mb-4
                            "
                        >

                            <Package
                                className="
                                    w-8
                                    h-8

                                    text-[#175c2e]
                                "
                            />

                        </div>


                        <h2
                            className="
                                text-lg
                                font-extrabold
                                text-gray-900
                            "
                        >

                            No Orders Yet

                        </h2>


                        <p
                            className="
                                text-sm
                                text-gray-500

                                mt-2
                            "
                        >

                            Orders containing your products
                            will appear here.

                        </p>

                    </div>

                )}


            {/* ======================================
                ORDERS
            ====================================== */}

            <div
                className="
                    space-y-5
                "
            >

                {orders.map(
                    (order) => (

                        <div
                            key={
                                order.order_vendor_id ||
                                order.order_id
                            }

                            className="
                                bg-white

                                border
                                border-gray-200

                                rounded-[20px]

                                overflow-hidden
                            "
                        >

                            {/* ==================================
                                ORDER HEADER
                            ================================== */}

                            <div
                                className="
                                    p-5

                                    border-b
                                    border-gray-100

                                    flex
                                    flex-col
                                    lg:flex-row

                                    lg:items-center
                                    lg:justify-between

                                    gap-4
                                "
                            >

                                <div>

                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-3
                                            flex-wrap
                                        "
                                    >

                                        <h2
                                            className="
                                                text-base
                                                font-extrabold
                                                text-gray-900
                                            "
                                        >

                                            Order #
                                            {order.order_id}

                                        </h2>


                                        <span
                                            className={`
                                                px-3
                                                py-1

                                                rounded-full

                                                text-xs
                                                font-bold

                                                ${getStatusClass(
                                                order.vendor_status ||
                                                order.order_status
                                            )}
                                            `}
                                        >

                                            {
                                                order.vendor_status ||
                                                order.order_status ||
                                                "Processing"
                                            }

                                        </span>

                                    </div>


                                    <p
                                        className="
                                            text-xs
                                            text-gray-400

                                            mt-1
                                        "
                                    >

                                        Placed on{" "}

                                        {
                                            formatDate(
                                                order.created_at
                                            )
                                        }

                                    </p>

                                </div>


                                <div
                                    className="
                                        text-left
                                        lg:text-right
                                    "
                                >

                                    <p
                                        className="
                                            text-xs
                                            text-gray-400
                                        "
                                    >

                                        Your Order Total

                                    </p>


                                    <p
                                        className="
                                            text-lg
                                            font-extrabold
                                            text-[#175c2e]
                                        "
                                    >

                                        {
                                            formatCurrency(
                                                order.vendor_total
                                            )
                                        }

                                    </p>

                                </div>

                            </div>


                            {/* ==================================
                                CUSTOMER + ADDRESS
                            ================================== */}

                            <div
                                className="
                                    grid

                                    grid-cols-1
                                    lg:grid-cols-2

                                    gap-4

                                    p-5

                                    border-b
                                    border-gray-100
                                "
                            >

                                {/* CUSTOMER */}

                                <div
                                    className="
                                        bg-gray-50

                                        rounded-xl

                                        p-4
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-2

                                            mb-3
                                        "
                                    >

                                        <User
                                            className="
                                                w-4
                                                h-4

                                                text-[#175c2e]
                                            "
                                        />


                                        <h3
                                            className="
                                                text-sm
                                                font-extrabold
                                                text-gray-800
                                            "
                                        >

                                            Customer

                                        </h3>

                                    </div>


                                    <p
                                        className="
                                            text-sm
                                            font-bold
                                            text-gray-800
                                        "
                                    >

                                        {
                                            order.full_name ||
                                            "Customer"
                                        }

                                    </p>


                                    <p
                                        className="
                                            flex
                                            items-center
                                            gap-2

                                            text-xs
                                            text-gray-500

                                            mt-2
                                        "
                                    >

                                        <Phone
                                            className="
                                                w-3.5
                                                h-3.5
                                            "
                                        />

                                        {
                                            order.phone ||
                                            "Not available"
                                        }

                                    </p>

                                </div>


                                {/* ADDRESS */}

                                <div
                                    className="
                                        bg-gray-50

                                        rounded-xl

                                        p-4
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-2

                                            mb-3
                                        "
                                    >

                                        <MapPin
                                            className="
                                                w-4
                                                h-4

                                                text-[#175c2e]
                                            "
                                        />


                                        <h3
                                            className="
                                                text-sm
                                                font-extrabold
                                                text-gray-800
                                            "
                                        >

                                            Delivery Address

                                        </h3>

                                    </div>


                                    <p
                                        className="
                                            text-xs
                                            leading-5
                                            text-gray-600
                                        "
                                    >

                                        {
                                            order.address_line ||
                                            "Address not available"
                                        }

                                        <br />

                                        {
                                            order.city
                                        }

                                        {order.city &&
                                            order.state
                                            ? ", "
                                            : ""
                                        }

                                        {
                                            order.state
                                        }

                                        {
                                            order.pincode
                                                ? ` - ${order.pincode}`
                                                : ""
                                        }

                                    </p>

                                </div>

                            </div>


                            {/* ==================================
                                PRODUCTS
                            ================================== */}

                            <div
                                className="
                                    p-5

                                    border-b
                                    border-gray-100
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2

                                        mb-4
                                    "
                                >

                                    <Package
                                        className="
                                            w-4
                                            h-4

                                            text-[#175c2e]
                                        "
                                    />


                                    <h3
                                        className="
                                            text-sm
                                            font-extrabold
                                            text-gray-800
                                        "
                                    >

                                        Your Products

                                    </h3>

                                </div>


                                <div
                                    className="
                                        space-y-3
                                    "
                                >

                                    {
                                        (
                                            order.items ||
                                            []
                                        ).map(
                                            (item) => (

                                                <div
                                                    key={
                                                        item.order_item_id ||
                                                        item.product_id
                                                    }

                                                    className="
                                                        flex
                                                        items-center
                                                        gap-4

                                                        p-3

                                                        bg-gray-50

                                                        rounded-xl
                                                    "
                                                >

                                                    {/* IMAGE */}

                                                    <div
                                                        className="
                                                            w-16
                                                            h-16

                                                            rounded-xl

                                                            bg-white

                                                            border
                                                            border-gray-200

                                                            overflow-hidden

                                                            shrink-0

                                                            flex
                                                            items-center
                                                            justify-center
                                                        "
                                                    >

                                                        {

                                                            item.image ? (

                                                                <img
                                                                    src={
                                                                        item.image
                                                                    }

                                                                    alt={
                                                                        item.product_name
                                                                    }

                                                                    className="
                                                                        w-full
                                                                        h-full

                                                                        object-cover
                                                                    "
                                                                />

                                                            ) : (

                                                                <Package
                                                                    className="
                                                                        w-6
                                                                        h-6

                                                                        text-gray-300
                                                                    "
                                                                />

                                                            )

                                                        }

                                                    </div>


                                                    {/* PRODUCT INFO */}

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

                                                            {
                                                                item.product_name
                                                            }

                                                        </p>


                                                        {
                                                            item.brand && (

                                                                <p
                                                                    className="
                                                                        text-xs
                                                                        text-gray-400

                                                                        mt-1
                                                                    "
                                                                >

                                                                    {
                                                                        item.brand
                                                                    }

                                                                </p>

                                                            )
                                                        }


                                                        <p
                                                            className="
                                                                text-xs
                                                                text-gray-500

                                                                mt-1
                                                            "
                                                        >

                                                            Qty:{" "}

                                                            <b>
                                                                {
                                                                    item.quantity
                                                                }
                                                            </b>

                                                            {
                                                                item.size && (

                                                                    <>
                                                                        {"  •  Size: "}
                                                                        <b>
                                                                            {
                                                                                item.size
                                                                            }
                                                                        </b>
                                                                    </>

                                                                )
                                                            }

                                                        </p>

                                                    </div>


                                                    {/* PRICE */}

                                                    <div
                                                        className="
                                                            text-right
                                                            shrink-0
                                                        "
                                                    >

                                                        <p
                                                            className="
                                                                text-sm
                                                                font-extrabold
                                                                text-gray-800
                                                            "
                                                        >

                                                            {
                                                                formatCurrency(
                                                                    item.subtotal
                                                                )
                                                            }

                                                        </p>


                                                        <p
                                                            className="
                                                                text-[11px]
                                                                text-gray-400

                                                                mt-1
                                                            "
                                                        >

                                                            {
                                                                formatCurrency(
                                                                    item.price
                                                                )
                                                            }

                                                            {" "}each

                                                        </p>

                                                    </div>

                                                </div>

                                            )
                                        )
                                    }

                                </div>

                            </div>


                            {/* ==================================
                                PAYMENT
                            ================================== */}

                            <div
                                className="
                                    p-5

                                    flex
                                    flex-col
                                    sm:flex-row

                                    sm:items-center
                                    sm:justify-between

                                    gap-4
                                "
                            >

                                <div
                                    className="
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-3
                                    "
                                >

                                    {/* PAYMENT METHOD */}

                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-2

                                            text-xs
                                            text-gray-600
                                        "
                                    >

                                        <CreditCard
                                            className="
                                                w-4
                                                h-4
                                            "
                                        />

                                        <span>
                                            Payment:
                                        </span>

                                        <b
                                            className="
                                                text-gray-800
                                            "
                                        >

                                            {
                                                (
                                                    order.payment_method ||
                                                    "COD"
                                                ).toUpperCase()
                                            }

                                        </b>

                                    </div>


                                    {/* PAYMENT STATUS */}

                                    <span
                                        className={`
                                            px-3
                                            py-1

                                            rounded-full

                                            text-xs
                                            font-bold

                                            ${getPaymentStatusClass(
                                            order.payment_status
                                        )}
                                        `}
                                    >

                                        {
                                            order.payment_status ||
                                            "Pending"
                                        }

                                    </span>

                                </div>


                                {/* VIEW DETAILS */}

                                <button

                                    type="button"

                                    onClick={() =>
                                        setSelectedOrder(
                                            order
                                        )
                                    }

                                    className="
                                        inline-flex
                                        items-center
                                        justify-center

                                        px-4
                                        py-2.5

                                        rounded-xl

                                        bg-[#175c2e]

                                        text-white

                                        text-xs
                                        font-bold

                                        hover:bg-[#124923]

                                        transition-all
                                    "
                                >

                                    View Details

                                </button>

                            </div>

                        </div>

                    )
                )}

            </div>


            {/* ======================================
                ORDER DETAILS MODAL
            ====================================== */}

            {selectedOrder && (

                <div
                    className="
                        fixed
                        inset-0

                        z-50

                        bg-black/40

                        flex
                        items-center
                        justify-center

                        p-4
                    "

                    onClick={() =>
                        setSelectedOrder(null)
                    }
                >

                    <div
                        className="
                            w-full
                            max-w-2xl

                            max-h-[90vh]

                            overflow-y-auto

                            bg-white

                            rounded-[24px]

                            shadow-2xl

                            p-6
                        "

                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between

                                gap-4

                                mb-6
                            "
                        >

                            <div>

                                <h2
                                    className="
                                        text-xl
                                        font-extrabold
                                        text-gray-900
                                    "
                                >

                                    Order #
                                    {
                                        selectedOrder.order_id
                                    }

                                </h2>


                                <p
                                    className="
                                        text-xs
                                        text-gray-400

                                        mt-1
                                    "
                                >

                                    {
                                        formatDate(
                                            selectedOrder.created_at
                                        )
                                    }

                                </p>

                            </div>


                            <button

                                type="button"

                                onClick={() =>
                                    setSelectedOrder(null)
                                }

                                className="
                                    w-9
                                    h-9

                                    rounded-full

                                    bg-gray-100

                                    flex
                                    items-center
                                    justify-center

                                    text-gray-500

                                    hover:bg-gray-200
                                "
                            >

                                <XCircle
                                    className="
                                        w-5
                                        h-5
                                    "
                                />

                            </button>

                        </div>


                        {/* STATUS */}

                        <div
                            className="
                                grid
                                grid-cols-1
                                sm:grid-cols-3

                                gap-3

                                mb-6
                            "
                        >

                            <ModalInfo
                                icon={Clock}
                                label="Order Status"
                                value={
                                    selectedOrder.vendor_status ||
                                    selectedOrder.order_status ||
                                    "Processing"
                                }
                            />


                            <ModalInfo
                                icon={CreditCard}
                                label="Payment"
                                value={
                                    (
                                        selectedOrder.payment_method ||
                                        "COD"
                                    ).toUpperCase()
                                }
                            />


                            <ModalInfo
                                icon={CheckCircle}
                                label="Payment Status"
                                value={
                                    selectedOrder.payment_status ||
                                    "Pending"
                                }
                            />

                        </div>


                        {/* CUSTOMER */}

                        <div
                            className="
                                mb-5

                                p-4

                                bg-gray-50

                                rounded-xl
                            "
                        >

                            <h3
                                className="
                                    text-sm
                                    font-extrabold
                                    text-gray-800

                                    mb-3
                                "
                            >

                                Customer Details

                            </h3>


                            <p
                                className="
                                    text-sm
                                    font-bold
                                    text-gray-800
                                "
                            >

                                {
                                    selectedOrder.full_name ||
                                    "Customer"
                                }

                            </p>


                            <p
                                className="
                                    text-xs
                                    text-gray-500

                                    mt-1
                                "
                            >

                                {
                                    selectedOrder.phone ||
                                    "Phone not available"
                                }

                            </p>


                            <p
                                className="
                                    text-xs
                                    text-gray-500

                                    mt-2
                                    leading-5
                                "
                            >

                                {
                                    selectedOrder.address_line
                                }

                                <br />

                                {
                                    selectedOrder.city
                                }

                                {selectedOrder.city &&
                                    selectedOrder.state
                                    ? ", "
                                    : ""
                                }

                                {
                                    selectedOrder.state
                                }

                                {
                                    selectedOrder.pincode
                                        ? ` - ${selectedOrder.pincode}`
                                        : ""
                                }

                            </p>

                        </div>


                        {/* TOTAL */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between

                                p-4

                                rounded-xl

                                bg-[#175c2e]/10
                            "
                        >

                            <span
                                className="
                                    text-sm
                                    font-bold
                                    text-gray-700
                                "
                            >

                                Your Total

                            </span>


                            <span
                                className="
                                    text-lg
                                    font-extrabold
                                    text-[#175c2e]
                                "
                            >

                                {
                                    formatCurrency(
                                        selectedOrder.vendor_total
                                    )
                                }

                            </span>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}


// ======================================================
// MODAL INFO
// ======================================================

function ModalInfo({
    icon: Icon,
    label,
    value
}) {

    return (

        <div
            className="
                p-3

                bg-gray-50

                rounded-xl
            "
        >

            <div
                className="
                    flex
                    items-center
                    gap-2

                    mb-1
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
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-gray-400
                    "
                >

                    {label}

                </span>

            </div>


            <p
                className="
                    text-xs
                    font-bold
                    text-gray-800
                "
            >

                {value}

            </p>

        </div>

    );

}