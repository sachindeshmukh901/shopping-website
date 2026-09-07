import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    RefreshCw,
    Loader2,
    AlertCircle,
    RotateCcw,
    Search,
    Package,
    Clock3,
    CheckCircle2,
    XCircle,
    IndianRupee,
    Truck
} from "lucide-react";

import API from "../../api/api";


// ======================================================
// RETURNS PAGE
// ======================================================

export default function Returns() {

    // ==================================================
    // STATES
    // ==================================================

    let [returns, setReturns] =
        useState([]);

    let [loading, setLoading] =
        useState(true);

    let [refreshing, setRefreshing] =
        useState(false);

    let [error, setError] =
        useState("");

    let [search, setSearch] =
        useState("");

    let [statusFilter, setStatusFilter] =
        useState("All");


    // ==================================================
    // FETCH RETURNS
    // ==================================================

    let fetchReturns = async (
        showRefresh = false
    ) => {

        try {

            if (showRefresh) {
                setRefreshing(true);
            }
            else {
                setLoading(true);
            }

            setError("");


            // ==================================================
            // REAL BACKEND API
            // ==================================================

            let response =
                await API.get(
                    "/returns/vendor"
                );


            console.log(
                "Returns API Response:",
                response.data
            );


            // ==================================================
            // SUCCESS
            // ==================================================

            if (
                response.data?.success
            ) {

                let vendorReturns =
                    Array.isArray(
                        response.data.returns
                    )
                        ? response.data.returns
                        : Array.isArray(
                            response.data.data
                        )
                            ? response.data.data
                            : [];


                setReturns(
                    vendorReturns
                );

            }

            // ==================================================
            // API RETURNED ERROR
            // ==================================================

            else {

                setReturns([]);

                setError(
                    response.data?.message ||
                    "Unable to load returns."
                );

            }

        }

        catch (error) {

            console.error(
                "Returns API Error:",
                error.response?.data ||
                error.message ||
                error
            );


            setReturns([]);


            // ==================================================
            // IMPORTANT
            // ==================================================

            let backendMessage =
                error.response?.data?.message;


            if (backendMessage) {

                setError(
                    backendMessage
                );

            }

            else if (
                error.response?.status === 401
            ) {

                setError(
                    "Vendor session expired. Please login again."
                );

            }

            else if (
                error.response?.status === 403
            ) {

                setError(
                    "You are not authorized to view returns."
                );

            }

            else {

                setError(
                    "Failed to connect with returns API."
                );

            }

        }

        finally {

            setLoading(false);

            setRefreshing(false);

        }

    };


    // ==================================================
    // UPDATE RETURN STATUS (REAL BACKEND CALL)
    // ==================================================

    let [updatingReturn, setUpdatingReturn] =
        useState(null);


    let updateStatus = async (
        returnId,
        newStatus
    ) => {

        try {

            setUpdatingReturn(
                returnId
            );

            let response =
                await API.patch(
                    `/returns/${returnId}/status`,
                    {
                        status: newStatus
                    }
                );

            if (
                response.data?.success
            ) {

                await fetchReturns(true);

            }

            else {

                alert(
                    response.data?.message ||
                    "Unable to update return status"
                );

            }

        }

        catch (error) {

            console.error(
                "Update Return Status Error:",
                error.response?.data ||
                error.message
            );

            alert(
                error.response?.data?.message ||
                "Server connection failed"
            );

        }

        finally {

            setUpdatingReturn(
                null
            );

        }

    };


    // ==================================================
    // INITIAL LOAD
    // ==================================================

    useEffect(() => {

        fetchReturns();

    }, []);


    // ==================================================
    // FORMAT CURRENCY
    // ==================================================

    let formatCurrency = (
        value
    ) => {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ).format(
            Number(value) || 0
        );

    };


    // ==================================================
    // FORMAT DATE
    // ==================================================

    let formatDate = (
        value
    ) => {

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
        ).format(
            date
        );

    };


    // ==================================================
    // GET STATUS
    // ==================================================

    let getStatus = (
        item
    ) => {

        return (
            item?.return_status ||
            item?.status ||
            "Pending"
        );

    };


    // ==================================================
    // GET RETURN AMOUNT
    // ==================================================

    let getAmount = (
        item
    ) => {

        return Number(
            item?.return_amount ??
            item?.refund_amount ??
            item?.vendor_total ??
            item?.amount ??
            item?.total_amount ??
            0
        );

    };


    // ==================================================
    // GET PRODUCT NAME
    // ==================================================

    let getProductName = (
        item
    ) => {

        if (
            Array.isArray(item?.items) &&
            item.items.length > 0
        ) {

            if (item.items.length === 1) {

                return (
                    item.items[0].product_name ||
                    "Product"
                );

            }

            return `${item.items.length} products`;

        }


        if (
            item?.product_name
        ) {

            return item.product_name;

        }


        if (
            item?.product?.name
        ) {

            return item.product.name;

        }


        if (
            item?.product?.product_name
        ) {

            return item.product.product_name;

        }


        if (
            item?.name
        ) {

            return item.name;

        }


        if (
            item?.title
        ) {

            return item.title;

        }


        return "Product";

    };


    // ==================================================
    // GET PRODUCT IMAGE
    // ==================================================

    let getProductImage = (
        item
    ) => {

        if (
            Array.isArray(item?.items) &&
            item.items.length === 1 &&
            item.items[0].image
        ) {

            let image =
                item.items[0].image;

            return image.startsWith("http")
                ? image
                : `https://orgos-backend-h7ad.onrender.com${image}`;

        }

        return null;

    };


    // ==================================================
    // GET RETURN ID
    // ==================================================

    let getReturnId = (
        item
    ) => {

        return (
            item?.return_id ||
            item?.id ||
            item?._id ||
            "-"
        );

    };


    // ==================================================
    // GET ORDER ID
    // ==================================================

    let getOrderId = (
        item
    ) => {

        return (
            item?.order_id ||
            item?.orderId ||
            item?.order?.order_id ||
            item?.order?.id ||
            "-"
        );

    };


    // ==================================================
    // GET REASON
    // ==================================================

    let getReason = (
        item
    ) => {

        return (
            item?.return_reason ||
            item?.reason ||
            item?.description ||
            "Not specified"
        );

    };


    // ==================================================
    // GET DATE
    // ==================================================

    let getReturnDate = (
        item
    ) => {

        return (
            item?.created_at ||
            item?.return_date ||
            item?.createdAt ||
            item?.updated_at ||
            item?.updatedAt
        );

    };


    // ==================================================
    // FILTER RETURNS
    // ==================================================

    let filteredReturns =
        useMemo(
            () => {

                let searchValue =
                    search
                        .toLowerCase()
                        .trim();


                return returns.filter(
                    (
                        item
                    ) => {

                        let status =
                            String(
                                getStatus(
                                    item
                                )
                            );


                        let orderId =
                            String(
                                getOrderId(
                                    item
                                )
                            );


                        let returnId =
                            String(
                                getReturnId(
                                    item
                                )
                            );


                        let productName =
                            String(
                                getProductName(
                                    item
                                )
                            );


                        let reason =
                            String(
                                getReason(
                                    item
                                )
                            );


                        let matchesSearch =
                            !searchValue ||
                            orderId
                                .toLowerCase()
                                .includes(
                                    searchValue
                                ) ||
                            returnId
                                .toLowerCase()
                                .includes(
                                    searchValue
                                ) ||
                            productName
                                .toLowerCase()
                                .includes(
                                    searchValue
                                ) ||
                            reason
                                .toLowerCase()
                                .includes(
                                    searchValue
                                );


                        let matchesStatus =
                            statusFilter ===
                            "All" ||
                            status
                                .toLowerCase()
                                .includes(
                                    statusFilter
                                        .toLowerCase()
                                );


                        return (
                            matchesSearch &&
                            matchesStatus
                        );

                    }
                );

            },
            [
                returns,
                search,
                statusFilter
            ]
        );


    // ==================================================
    // STATUS COUNTS
    // ==================================================

    let statusCounts =
        useMemo(
            () => {

                let result = {

                    pending: 0,

                    approved: 0,

                    inTransit: 0,

                    completed: 0,

                    rejected: 0

                };


                returns.forEach(
                    (
                        item
                    ) => {

                        let status =
                            String(
                                getStatus(
                                    item
                                )
                            )
                                .toLowerCase()
                                .trim();


                        if (
                            status.includes(
                                "reject"
                            ) ||
                            status.includes(
                                "cancel"
                            )
                        ) {

                            result.rejected++;

                        }

                        else if (
                            status.includes(
                                "complete"
                            ) ||
                            status.includes(
                                "refund"
                            ) ||
                            status.includes(
                                "delivered"
                            )
                        ) {

                            result.completed++;

                        }

                        else if (
                            status.includes(
                                "transit"
                            ) ||
                            status.includes(
                                "ship"
                            ) ||
                            status.includes(
                                "pick"
                            )
                        ) {

                            result.inTransit++;

                        }

                        else if (
                            status.includes(
                                "approve"
                            )
                        ) {

                            result.approved++;

                        }

                        else {

                            result.pending++;

                        }

                    }
                );


                return result;

            },
            [
                returns
            ]
        );


    // ==================================================
    // TOTAL RETURN AMOUNT
    // ==================================================

    let totalRefund =
        useMemo(
            () => {

                return returns.reduce(
                    (
                        total,
                        item
                    ) => {

                        return (
                            total +
                            getAmount(
                                item
                            )
                        );

                    },
                    0
                );

            },
            [
                returns
            ]
        );


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (

            <div
                className="
                    min-h-[calc(100vh-76px)]
                    flex
                    items-center
                    justify-center
                    bg-[#f8faf8]
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
                        Loading returns...
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
                min-h-[calc(100vh-76px)]
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

                        <RotateCcw
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
                            Returns
                        </h1>

                    </div>


                    <p
                        className="
                            text-sm
                            text-gray-500
                            mt-1
                        "
                    >
                        Manage customer return requests and refunds.
                    </p>

                </div>


                <button
                    type="button"
                    disabled={
                        refreshing
                    }
                    onClick={() =>
                        fetchReturns(true)
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
                        hover:border-[#175c2e]
                        hover:text-[#175c2e]
                        transition-all
                        disabled:opacity-60
                    "
                >

                    <RefreshCw
                        className={`
                            w-4
                            h-4

                            ${refreshing
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
                                shrink-0
                            "
                        />

                        <span>
                            {error}
                        </span>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            fetchReturns(true)
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
                    xl:grid-cols-5
                    gap-5
                    mb-6
                "
            >

                <ReturnKpi
                    icon={RotateCcw}
                    title="Total Returns"
                    value={
                        returns.length
                    }
                />


                <ReturnKpi
                    icon={Clock3}
                    title="Pending"
                    value={
                        statusCounts.pending
                    }
                />


                <ReturnKpi
                    icon={CheckCircle2}
                    title="Approved"
                    value={
                        statusCounts.approved
                    }
                />


                <ReturnKpi
                    icon={Truck}
                    title="In Transit"
                    value={
                        statusCounts.inTransit
                    }
                />


                <ReturnKpi
                    icon={IndianRupee}
                    title="Return Amount"
                    value={
                        formatCurrency(
                            totalRefund
                        )
                    }
                />

            </div>


            {/* ==================================================
                FILTER SECTION
            ================================================== */}

            <div
                className="
                    bg-white
                    border
                    border-gray-200
                    rounded-[20px]
                    p-4
                    sm:p-5
                    mb-6
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        lg:flex-row
                        lg:items-center
                        gap-3
                    "
                >

                    {/* SEARCH */}

                    <div
                        className="
                            relative
                            flex-1
                        "
                    >

                        <Search
                            className="
                                absolute
                                left-3
                                top-1/2
                                -translate-y-1/2
                                w-4
                                h-4
                                text-gray-400
                            "
                        />

                        <input
                            type="text"
                            value={
                                search
                            }
                            onChange={(
                                event
                            ) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="
                                Search by order ID,
                                return ID,
                                product or reason...
                            "
                            className="
                                w-full
                                h-11
                                pl-10
                                pr-4
                                rounded-xl
                                border
                                border-gray-200
                                bg-gray-50
                                text-sm
                                text-gray-700
                                outline-none
                                focus:border-[#175c2e]
                                focus:bg-white
                            "
                        />

                    </div>


                    {/* STATUS */}

                    <select
                        value={
                            statusFilter
                        }
                        onChange={(
                            event
                        ) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                        className="
                            h-11
                            px-4
                            rounded-xl
                            border
                            border-gray-200
                            bg-white
                            text-sm
                            font-semibold
                            text-gray-600
                            outline-none
                            focus:border-[#175c2e]
                        "
                    >

                        <option value="All">
                            All Status
                        </option>

                        <option value="Pending">
                            Pending
                        </option>

                        <option value="Approved">
                            Approved
                        </option>

                        <option value="In Transit">
                            In Transit
                        </option>

                        <option value="Completed">
                            Completed
                        </option>

                        <option value="Rejected">
                            Rejected
                        </option>

                    </select>

                </div>

            </div>


            {/* ==================================================
                RETURN REQUESTS
            ================================================== */}

            <div
                className="
                    bg-white
                    border
                    border-gray-200
                    rounded-[20px]
                    overflow-hidden
                "
            >

                <div
                    className="
                        p-5
                        sm:p-6
                        border-b
                        border-gray-100
                    "
                >

                    <h2
                        className="
                            text-lg
                            font-extrabold
                            text-gray-900
                        "
                    >
                        Return Requests
                    </h2>


                    <p
                        className="
                            text-xs
                            text-gray-400
                            mt-1
                        "
                    >
                        {filteredReturns.length}
                        {" "}
                        return
                        {
                            filteredReturns.length !== 1
                                ? "s"
                                : ""
                        }
                        {" "}
                        found
                    </p>

                </div>


                {/* ==================================================
                    EMPTY
                ================================================== */}

                {filteredReturns.length === 0 ? (

                    <div
                        className="
                            py-20
                            px-5
                            text-center
                        "
                    >

                        <div
                            className="
                                w-16
                                h-16
                                mx-auto
                                rounded-2xl
                                bg-[#175c2e]/10
                                flex
                                items-center
                                justify-center
                            "
                        >

                            <Package
                                className="
                                    w-7
                                    h-7
                                    text-[#175c2e]
                                "
                            />

                        </div>


                        <h3
                            className="
                                mt-5
                                text-base
                                font-extrabold
                                text-gray-800
                            "
                        >
                            No returns found
                        </h3>


                        <p
                            className="
                                text-sm
                                text-gray-400
                                mt-1
                            "
                        >
                            Return requests will appear here.
                        </p>

                    </div>

                ) : (

                    <div
                        className="
                            overflow-x-auto
                        "
                    >

                        <table
                            className="
                                w-full
                                min-w-[1000px]
                            "
                        >

                            <thead>

                                <tr
                                    className="
                                        bg-gray-50
                                        border-b
                                        border-gray-100
                                    "
                                >

                                    <th className="return-th">
                                        Return ID
                                    </th>

                                    <th className="return-th">
                                        Order
                                    </th>

                                    <th className="return-th">
                                        Product
                                    </th>

                                    <th className="return-th">
                                        Reason
                                    </th>

                                    <th className="return-th">
                                        Amount
                                    </th>

                                    <th className="return-th">
                                        Date
                                    </th>

                                    <th className="return-th">
                                        Status
                                    </th>

                                    <th className="return-th text-right">
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredReturns.map(
                                    (
                                        item,
                                        index
                                    ) => {

                                        let returnId =
                                            getReturnId(
                                                item
                                            );


                                        let orderId =
                                            getOrderId(
                                                item
                                            );


                                        let productName =
                                            getProductName(
                                                item
                                            );


                                        let productImage =
                                            getProductImage(
                                                item
                                            );


                                        let reason =
                                            getReason(
                                                item
                                            );


                                        let amount =
                                            getAmount(
                                                item
                                            );


                                        let status =
                                            getStatus(
                                                item
                                            );


                                        let date =
                                            getReturnDate(
                                                item
                                            );


                                        return (

                                            <tr
                                                key={
                                                    String(
                                                        returnId
                                                    ) +
                                                    "-" +
                                                    index
                                                }
                                                className="
                                                    border-b
                                                    border-gray-100
                                                    last:border-b-0
                                                    hover:bg-gray-50
                                                    transition-colors
                                                "
                                            >

                                                {/* RETURN ID */}

                                                <td className="return-td">

                                                    <span
                                                        className="
                                                            font-extrabold
                                                            text-gray-800
                                                        "
                                                    >
                                                        #{returnId}
                                                    </span>

                                                </td>


                                                {/* ORDER */}

                                                <td className="return-td">

                                                    <span
                                                        className="
                                                            font-bold
                                                            text-[#175c2e]
                                                        "
                                                    >
                                                        #{orderId}
                                                    </span>

                                                </td>


                                                {/* PRODUCT */}

                                                <td className="return-td">

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-3
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                w-9
                                                                h-9
                                                                rounded-lg
                                                                bg-gray-100
                                                                flex
                                                                items-center
                                                                justify-center
                                                                shrink-0
                                                                overflow-hidden
                                                            "
                                                        >

                                                            {productImage ? (

                                                                <img
                                                                    src={
                                                                        productImage
                                                                    }
                                                                    alt={
                                                                        productName
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
                                                                        w-4
                                                                        h-4
                                                                        text-gray-500
                                                                    "
                                                                />

                                                            )}

                                                        </div>


                                                        <span
                                                            className="
                                                                max-w-[180px]
                                                                truncate
                                                                font-semibold
                                                                text-gray-700
                                                            "
                                                            title={
                                                                productName
                                                            }
                                                        >
                                                            {productName}
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* REASON */}

                                                <td className="return-td">

                                                    <span
                                                        className="
                                                            max-w-[180px]
                                                            block
                                                            truncate
                                                            text-gray-500
                                                        "
                                                        title={
                                                            reason
                                                        }
                                                    >
                                                        {reason}
                                                    </span>

                                                </td>


                                                {/* AMOUNT */}

                                                <td className="return-td">

                                                    <span
                                                        className="
                                                            font-extrabold
                                                            text-gray-900
                                                        "
                                                    >
                                                        {
                                                            formatCurrency(
                                                                amount
                                                            )
                                                        }
                                                    </span>

                                                </td>


                                                {/* DATE */}

                                                <td className="return-td">

                                                    <span
                                                        className="
                                                            text-gray-500
                                                        "
                                                    >
                                                        {
                                                            formatDate(
                                                                date
                                                            )
                                                        }
                                                    </span>

                                                </td>


                                                {/* STATUS */}

                                                <td className="return-td">

                                                    <ReturnStatus
                                                        status={
                                                            status
                                                        }
                                                    />

                                                </td>


                                                {/* ACTION */}

                                                <td
                                                    className="
                                                        return-td
                                                        text-right
                                                    "
                                                >

                                                    <select
                                                        value={
                                                            status
                                                        }
                                                        disabled={
                                                            updatingReturn ===
                                                            returnId
                                                        }
                                                        onChange={
                                                            (event) =>
                                                                updateStatus(
                                                                    returnId,
                                                                    event.target.value
                                                                )
                                                        }
                                                        className="
                                                            border
                                                            border-gray-200
                                                            rounded-lg
                                                            px-2.5
                                                            py-2
                                                            text-xs
                                                            font-bold
                                                            text-gray-700
                                                            bg-white
                                                            focus:outline-none
                                                            focus:border-[#175c2e]
                                                            disabled:opacity-60
                                                        "
                                                    >

                                                        <option value="Pending">Pending</option>
                                                        <option value="Approved">Approved</option>
                                                        <option value="Rejected">Rejected</option>
                                                        <option value="Picked Up">Picked Up</option>
                                                        <option value="Received">Received</option>
                                                        <option value="Refunded">Refunded</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="Cancelled">Cancelled</option>

                                                    </select>

                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* ==================================================
                SUMMARY
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
                        RETURN SUMMARY
                    </p>


                    <h3
                        className="
                            text-lg
                            font-extrabold
                            mt-1
                        "
                    >

                        {returns.length > 0

                            ? `${returns.length} return request${returns.length > 1
                                ? "s"
                                : ""
                            } with ${formatCurrency(
                                totalRefund
                            )} total return value.`

                            : "No return requests have been received yet."

                        }

                    </h3>

                </div>


                <div
                    className="
                        flex
                        flex-wrap
                        items-center
                        gap-4
                        text-sm
                        font-bold
                    "
                >

                    <span>
                        Pending: {
                            statusCounts.pending
                        }
                    </span>

                    <span>
                        Approved: {
                            statusCounts.approved
                        }
                    </span>

                    <span>
                        Completed: {
                            statusCounts.completed
                        }
                    </span>

                    <span>
                        Rejected: {
                            statusCounts.rejected
                        }
                    </span>

                </div>

            </div>

        </div>

    );

}


// ======================================================
// RETURN KPI
// ======================================================

function ReturnKpi({
    icon: Icon,
    title,
    value
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
                    items-center
                    justify-between
                    gap-3
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
// RETURN STATUS
// ======================================================

function ReturnStatus({
    status
}) {

    let value =
        String(
            status ||
            "Pending"
        );


    let lower =
        value.toLowerCase();


    let className =
        `
            inline-flex
            items-center
            gap-1.5
            px-2.5
            py-1
            rounded-full
            text-[10px]
            font-extrabold
        `;


    let Icon =
        Clock3;


    // COMPLETED

    if (
        lower.includes(
            "complete"
        ) ||
        lower.includes(
            "refund"
        ) ||
        lower.includes(
            "delivered"
        )
    ) {

        className +=
            " bg-green-100 text-green-700";

        Icon =
            CheckCircle2;

    }


    // REJECTED

    else if (
        lower.includes(
            "reject"
        ) ||
        lower.includes(
            "cancel"
        )
    ) {

        className +=
            " bg-red-100 text-red-700";

        Icon =
            XCircle;

    }


    // IN TRANSIT

    else if (
        lower.includes(
            "transit"
        ) ||
        lower.includes(
            "pick"
        ) ||
        lower.includes(
            "ship"
        )
    ) {

        className +=
            " bg-blue-100 text-blue-700";

        Icon =
            Truck;

    }


    // APPROVED

    else if (
        lower.includes(
            "approve"
        )
    ) {

        className +=
            " bg-emerald-100 text-emerald-700";

        Icon =
            CheckCircle2;

    }


    // PENDING

    else {

        className +=
            " bg-yellow-100 text-yellow-700";

        Icon =
            Clock3;

    }


    return (

        <span
            className={
                className
            }
        >

            <Icon
                className="
                    w-3
                    h-3
                "
            />

            {value}

        </span>

    );

}