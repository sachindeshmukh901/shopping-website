

import {
    Package,
    Plus,
    Search,
    RefreshCw,
    Edit,
    Trash2,
    CheckCircle2,
    XCircle,
    X,
    Image as ImageIcon
} from "lucide-react";

import {
    useEffect,
    useState
} from "react";

import { useNavigate } from "react-router-dom";


function Products() {

    let navigate = useNavigate();


    // =========================================
    // STATES
    // =========================================

    let [products, setProducts] = useState([]);

    let [loading, setLoading] = useState(true);

    let [error, setError] = useState("");

    let [search, setSearch] = useState("");

    let [filter, setFilter] = useState("All");

    let [showModal, setShowModal] = useState(false);

    let [editingProduct, setEditingProduct] = useState(null);

    let [actionLoading, setActionLoading] = useState(null);

    let [formLoading, setFormLoading] = useState(false);


    let [form, setForm] = useState({
        product_name: "",
        description: "",
        brand: "",
        category_id: "",
        gender: "",
        price: "",
        discount_price: "",
        stock: "",
        status: "Active"
    });


    let [image, setImage] = useState(null);

    let [imagePreview, setImagePreview] = useState("");



    // =========================================
    // FETCH PRODUCTS
    // =========================================

    let fetchProducts = async () => {

        try {

            setLoading(true);

            setError("");


            let token =
                localStorage.getItem("adminToken");


            if (!token) {

                navigate("/", {
                    replace: true
                });

                return;

            }


            let response =
                await fetch(
                    "https://orgos-backend-h7ad.onrender.com/api/admin/products",
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            let data =
                await response.json();


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem(
                    "adminToken"
                );

                localStorage.removeItem(
                    "admin"
                );

                navigate("/", {
                    replace: true
                });

                return;

            }


            if (
                response.ok &&
                data.success
            ) {

                setProducts(
                    data.products || []
                );

            } else {

                setError(
                    data.message ||
                    "Failed to fetch products"
                );

            }

        } catch (error) {

            console.error(
                "Fetch Products Error:",
                error
            );

            setError(
                "Unable to connect with server"
            );

        } finally {

            setLoading(false);

        }

    };



    useEffect(() => {

        fetchProducts();

    }, []);



    // =========================================
    // COUNTS
    // =========================================

    let totalProducts =
        products.length;


    let activeProducts =
        products.filter(
            (product) =>
                product.status === "Active"
        ).length;


    let inactiveProducts =
        products.filter(
            (product) =>
                product.status === "Inactive"
        ).length;


    let totalStock =
        products.reduce(
            (total, product) =>
                total +
                Number(product.stock || 0),
            0
        );



    // =========================================
    // SEARCH + FILTER
    // =========================================

    let filteredProducts =
        products.filter((product) => {

            let searchText =
                search
                    .toLowerCase()
                    .trim();


            let matchesSearch =

                !searchText ||

                product.product_name
                    ?.toLowerCase()
                    .includes(searchText) ||

                product.brand
                    ?.toLowerCase()
                    .includes(searchText) ||

                product.shop_name
                    ?.toLowerCase()
                    .includes(searchText) ||

                product.category_name
                    ?.toLowerCase()
                    .includes(searchText);


            let matchesFilter =

                filter === "All" ||
                product.status === filter;


            return (
                matchesSearch &&
                matchesFilter
            );

        });



    // =========================================
    // RESET FORM
    // =========================================

    let resetForm = () => {

        setForm({
            product_name: "",
            description: "",
            brand: "",
            category_id: "",
            gender: "",
            price: "",
            discount_price: "",
            stock: "",
            status: "Active"
        });

        setImage(null);

        setImagePreview("");

        setEditingProduct(null);

    };



    // =========================================
    // OPEN ADD MODAL
    // =========================================

    let openAddModal = () => {

        resetForm();

        setShowModal(true);

    };



    // =========================================
    // OPEN EDIT MODAL
    // =========================================

    let openEditModal = (product) => {

        setEditingProduct(product);


        setForm({
            product_name:
                product.product_name || "",

            description:
                product.description || "",

            brand:
                product.brand || "",

            category_id:
                product.category_id || "",

            gender:
                product.gender || "",

            price:
                product.price || "",

            discount_price:
                product.discount_price || "",

            stock:
                product.stock || "",

            status:
                product.status || "Active"
        });


        if (product.image) {

            setImagePreview(
                product.image.startsWith("http")
                    ? product.image
                    : `https://orgos-backend-h7ad.onrender.com${product.image}`
            );

        } else {

            setImagePreview("");

        }


        setImage(null);

        setShowModal(true);

    };



    // =========================================
    // INPUT CHANGE
    // =========================================

    let handleChange = (event) => {

        let {
            name,
            value
        } = event.target;


        setForm(
            (previous) => ({
                ...previous,
                [name]: value
            })
        );

    };



    // =========================================
    // IMAGE CHANGE
    // =========================================

    let handleImageChange = (event) => {

        let selectedImage =
            event.target.files[0];


        if (!selectedImage) {
            return;
        }


        setImage(selectedImage);


        setImagePreview(
            URL.createObjectURL(
                selectedImage
            )
        );

    };



    // =========================================
    // ADD / UPDATE PRODUCT
    // =========================================

    let handleSubmit = async (event) => {

        event.preventDefault();


        try {

            setFormLoading(true);


            let token =
                localStorage.getItem(
                    "adminToken"
                );


            let formData =
                new FormData();


            formData.append(
                "product_name",
                form.product_name
            );


            formData.append(
                "description",
                form.description
            );


            formData.append(
                "brand",
                form.brand
            );


            formData.append(
                "category_id",
                form.category_id
            );


            formData.append(
                "gender",
                form.gender
            );


            formData.append(
                "price",
                form.price
            );


            formData.append(
                "discount_price",
                form.discount_price
            );


            formData.append(
                "stock",
                form.stock
            );


            formData.append(
                "status",
                form.status
            );


            if (image) {

                formData.append(
                    "image",
                    image
                );

            }


            let url =
                editingProduct

                    ? `https://orgos-backend-h7ad.onrender.com/api/admin/products/${editingProduct.product_id}`

                    : "https://orgos-backend-h7ad.onrender.com/api/admin/products";


            let method =
                editingProduct
                    ? "PUT"
                    : "POST";


            let response =
                await fetch(
                    url,
                    {
                        method: method,

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        },

                        body: formData
                    }
                );


            let data =
                await response.json();


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem(
                    "adminToken"
                );

                localStorage.removeItem(
                    "admin"
                );

                navigate("/", {
                    replace: true
                });

                return;

            }


            if (
                response.ok &&
                data.success
            ) {

                setShowModal(false);

                resetForm();

                await fetchProducts();

                alert(
                    editingProduct
                        ? "Product updated successfully"
                        : "Product added successfully"
                );

            } else {

                alert(
                    data.message ||
                    "Unable to save product"
                );

            }

        } catch (error) {

            console.error(
                "Save Product Error:",
                error
            );

            alert(
                "Server connection failed"
            );

        } finally {

            setFormLoading(false);

        }

    };



    // =========================================
    // DELETE PRODUCT
    // =========================================

    let deleteProduct = async (
        productId
    ) => {

        let confirmed =
            window.confirm(
                "Are you sure you want to delete this product?"
            );


        if (!confirmed) {
            return;
        }


        try {

            let token =
                localStorage.getItem(
                    "adminToken"
                );


            setActionLoading(productId);


            let response =
                await fetch(
                    `https://orgos-backend-h7ad.onrender.com/api/admin/products/${productId}`,
                    {
                        method: "DELETE",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            let data =
                await response.json();


            if (
                response.ok &&
                data.success
            ) {

                setProducts(
                    (previous) =>
                        previous.filter(
                            (product) =>
                                product.product_id !==
                                productId
                        )
                );

            } else {

                alert(
                    data.message ||
                    "Unable to delete product"
                );

            }

        } catch (error) {

            console.error(
                "Delete Product Error:",
                error
            );

            alert(
                "Server connection failed"
            );

        } finally {

            setActionLoading(null);

        }

    };



    // =========================================
    // UPDATE PRODUCT STATUS
    // =========================================

    let updateProductStatus = async (
        productId,
        status
    ) => {

        try {

            let token =
                localStorage.getItem(
                    "adminToken"
                );


            setActionLoading(productId);


            let response =
                await fetch(
                    `https://orgos-backend-h7ad.onrender.com/api/admin/products/${productId}/status`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            status: status
                        })
                    }
                );


            let data =
                await response.json();


            if (
                response.ok &&
                data.success
            ) {

                setProducts(
                    (previous) =>
                        previous.map(
                            (product) =>

                                product.product_id ===
                                    productId

                                    ? {
                                        ...product,
                                        status:
                                            status
                                    }

                                    : product
                        )
                );

            } else {

                alert(
                    data.message ||
                    "Unable to update product status"
                );

            }

        } catch (error) {

            console.error(
                "Status Update Error:",
                error
            );

            alert(
                "Server connection failed"
            );

        } finally {

            setActionLoading(null);

        }

    };



    // =========================================
    // FORMAT PRICE
    // =========================================

    let formatPrice = (price) => {

        return Number(
            price || 0
        ).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );

    };



    // =========================================
    // PRODUCT IMAGE
    // =========================================

    let getImageUrl = (image) => {

        if (!image) {
            return "";
        }


        if (
            image.startsWith("http")
        ) {

            return image;

        }


        return `https://orgos-backend-h7ad.onrender.com${image}`;

    };



    // =========================================
    // RENDER
    // =========================================

    return (

        <div className="page-container">


            {/* =================================
                HEADER
            ================================= */}

            <div className="page-heading-row">

                <div>

                    <h1>
                        Product Management
                    </h1>

                    <p>
                        Manage products added by
                        vendors and administrators.
                    </p>

                </div>


                <div className="heading-actions">

                    <button
                        type="button"
                        className="outline-button"
                        onClick={fetchProducts}
                        disabled={loading}
                    >

                        <RefreshCw
                            size={17}
                        />

                        {loading
                            ? "Refreshing..."
                            : "Refresh"}

                    </button>


                    <button
                        type="button"
                        className="primary-button"
                        onClick={openAddModal}
                    >

                        <Plus
                            size={18}
                        />

                        Add Product

                    </button>

                </div>

            </div>



            {/* =================================
                KPI CARDS
            ================================= */}

            <div className="stats-grid four">


                <div
                    className="kpi-card"
                    onClick={() =>
                        setFilter("All")
                    }
                    style={{
                        cursor: "pointer"
                    }}
                >

                    <div className="kpi-content">

                        <span className="kpi-title">
                            TOTAL PRODUCTS
                        </span>

                        <span className="kpi-value">
                            {loading
                                ? "—"
                                : totalProducts}
                        </span>

                        <span className="kpi-subtitle">
                            All vendor products
                        </span>

                    </div>


                    <div className="kpi-icon purple">

                        <Package
                            size={22}
                        />

                    </div>

                </div>



                <div
                    className="kpi-card"
                    onClick={() =>
                        setFilter("Active")
                    }
                    style={{
                        cursor: "pointer"
                    }}
                >

                    <div className="kpi-content">

                        <span className="kpi-title">
                            ACTIVE
                        </span>

                        <span className="kpi-value">
                            {loading
                                ? "—"
                                : activeProducts}
                        </span>

                        <span className="kpi-subtitle">
                            Visible products
                        </span>

                    </div>


                    <div className="kpi-icon success">

                        <CheckCircle2
                            size={22}
                        />

                    </div>

                </div>



                <div
                    className="kpi-card"
                    onClick={() =>
                        setFilter("Inactive")
                    }
                    style={{
                        cursor: "pointer"
                    }}
                >

                    <div className="kpi-content">

                        <span className="kpi-title">
                            INACTIVE
                        </span>

                        <span className="kpi-value">
                            {loading
                                ? "—"
                                : inactiveProducts}
                        </span>

                        <span className="kpi-subtitle">
                            Hidden products
                        </span>

                    </div>


                    <div className="kpi-icon red">

                        <XCircle
                            size={22}
                        />

                    </div>

                </div>



                <div className="kpi-card">

                    <div className="kpi-content">

                        <span className="kpi-title">
                            TOTAL STOCK
                        </span>

                        <span className="kpi-value">
                            {loading
                                ? "—"
                                : totalStock.toLocaleString(
                                    "en-IN"
                                )}
                        </span>

                        <span className="kpi-subtitle">
                            Units currently listed
                        </span>

                    </div>


                    <div className="kpi-icon orange">

                        <Package
                            size={22}
                        />

                    </div>

                </div>

            </div>



            {/* =================================
                ERROR
            ================================= */}

            {error && (

                <div className="page-error">

                    {error}

                </div>

            )}



            {/* =================================
                PRODUCTS TABLE
            ================================= */}

            <div className="table-card">


                <div className="table-card-header">

                    <div>

                        <h2>
                            Products
                            {" "}
                            ({filteredProducts.length})
                        </h2>

                        <p>
                            All products available in
                            the ORGOS marketplace.
                        </p>

                    </div>


                    <div className="vendor-table-controls">


                        <div className="table-search">

                            <Search
                                size={18}
                            />

                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={
                                    (event) =>
                                        setSearch(
                                            event.target.value
                                        )
                                }
                            />

                        </div>


                        <select
                            className="vendor-filter"
                            value={filter}
                            onChange={
                                (event) =>
                                    setFilter(
                                        event.target.value
                                    )
                            }
                        >

                            <option value="All">
                                All
                            </option>

                            <option value="Active">
                                Active
                            </option>

                            <option value="Inactive">
                                Inactive
                            </option>

                        </select>

                    </div>

                </div>



                {loading ? (

                    <div className="table-empty">

                        Loading products...

                    </div>

                ) : filteredProducts.length === 0 ? (

                    <div className="table-empty">

                        <Package
                            size={38}
                        />

                        <p>
                            No products found
                        </p>

                    </div>

                ) : (

                    <div className="table-scroll">

                        <table className="admin-table">


                            <thead>

                                <tr>

                                    <th>
                                        PRODUCT
                                    </th>

                                    <th>
                                        VENDOR
                                    </th>

                                    <th>
                                        CATEGORY
                                    </th>

                                    <th>
                                        PRICE
                                    </th>

                                    <th>
                                        STOCK
                                    </th>

                                    <th>
                                        STATUS
                                    </th>

                                    <th>
                                        ACTION
                                    </th>

                                </tr>

                            </thead>



                            <tbody>

                                {filteredProducts.map(
                                    (product) => {

                                        let isActive =
                                            product.status ===
                                            "Active";


                                        return (

                                            <tr
                                                key={
                                                    product.product_id
                                                }
                                            >


                                                {/* PRODUCT */}

                                                <td>

                                                    <div className="product-table-cell">


                                                        <div className="product-table-image">

                                                            {
                                                                product.image
                                                                    ? (
                                                                        <img
                                                                            src={
                                                                                getImageUrl(
                                                                                    product.image
                                                                                )
                                                                            }
                                                                            alt={
                                                                                product.product_name
                                                                            }
                                                                        />
                                                                    )
                                                                    : (
                                                                        <ImageIcon
                                                                            size={22}
                                                                        />
                                                                    )
                                                            }

                                                        </div>


                                                        <div>

                                                            <strong>
                                                                {
                                                                    product.product_name ||
                                                                    "Unnamed Product"
                                                                }
                                                            </strong>

                                                            <span>

                                                                {
                                                                    product.brand ||
                                                                    "No brand"
                                                                }

                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>



                                                {/* VENDOR */}

                                                <td>

                                                    <div className="table-primary">

                                                        {
                                                            product.shop_name ||
                                                            "Admin Product"
                                                        }

                                                    </div>

                                                    <div className="table-secondary">

                                                        {
                                                            product.owner_name ||
                                                            `Vendor #${product.vendor_id || "N/A"}`
                                                        }

                                                    </div>

                                                </td>



                                                {/* CATEGORY */}

                                                <td>

                                                    {
                                                        product.category_name ||
                                                        "N/A"
                                                    }

                                                </td>



                                                {/* PRICE */}

                                                <td>

                                                    <strong>

                                                        ₹
                                                        {
                                                            formatPrice(
                                                                product.discount_price ||
                                                                product.price
                                                            )
                                                        }

                                                    </strong>


                                                    {
                                                        product.discount_price &&
                                                            Number(
                                                                product.price
                                                            ) >
                                                            Number(
                                                                product.discount_price
                                                            )
                                                            ? (
                                                                <div className="table-secondary">

                                                                    ₹
                                                                    {
                                                                        formatPrice(
                                                                            product.price
                                                                        )
                                                                    }

                                                                </div>
                                                            )
                                                            : null
                                                    }

                                                </td>



                                                {/* STOCK */}

                                                <td>

                                                    <strong>

                                                        {
                                                            Number(
                                                                product.stock ||
                                                                0
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )
                                                        }

                                                    </strong>

                                                </td>



                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={
                                                            `status-badge ${isActive
                                                                ? "active"
                                                                : "inactive"
                                                            }`
                                                        }
                                                    >

                                                        {
                                                            product.status ||
                                                            "Unknown"
                                                        }

                                                    </span>

                                                </td>



                                                {/* ACTIONS */}

                                                <td>

                                                    <div className="vendor-actions">


                                                        {/* EDIT */}

                                                        <button
                                                            type="button"
                                                            className="table-action"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    product
                                                                )
                                                            }
                                                        >

                                                            <Edit
                                                                size={15}
                                                            />

                                                            Edit

                                                        </button>



                                                        {/* STATUS */}

                                                        <button
                                                            type="button"
                                                            className={
                                                                `table-action ${isActive
                                                                    ? "danger"
                                                                    : "success"
                                                                }`
                                                            }
                                                            disabled={
                                                                actionLoading ===
                                                                product.product_id
                                                            }
                                                            onClick={() =>
                                                                updateProductStatus(
                                                                    product.product_id,
                                                                    isActive
                                                                        ? "Inactive"
                                                                        : "Active"
                                                                )
                                                            }
                                                        >

                                                            {
                                                                isActive
                                                                    ? (
                                                                        <XCircle
                                                                            size={15}
                                                                        />
                                                                    )
                                                                    : (
                                                                        <CheckCircle2
                                                                            size={15}
                                                                        />
                                                                    )
                                                            }


                                                            {
                                                                actionLoading ===
                                                                    product.product_id
                                                                    ? "Updating..."
                                                                    : isActive
                                                                        ? "Disable"
                                                                        : "Activate"
                                                            }

                                                        </button>



                                                        {/* DELETE */}

                                                        <button
                                                            type="button"
                                                            className="table-action danger"
                                                            disabled={
                                                                actionLoading ===
                                                                product.product_id
                                                            }
                                                            onClick={() =>
                                                                deleteProduct(
                                                                    product.product_id
                                                                )
                                                            }
                                                        >

                                                            <Trash2
                                                                size={15}
                                                            />

                                                            Delete

                                                        </button>

                                                    </div>

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



            {/* =================================
                ADD / EDIT MODAL
            ================================= */}

            {showModal && (

                <div className="modal-overlay">

                    <div className="product-modal">


                        {/* MODAL HEADER */}

                        <div className="product-modal-header">

                            <div>

                                <h2>

                                    {
                                        editingProduct
                                            ? "Edit Product"
                                            : "Add Product"
                                    }

                                </h2>

                                <p>

                                    {
                                        editingProduct
                                            ? "Update product information."
                                            : "Add a new product to ORGOS."
                                    }

                                </p>

                            </div>


                            <button
                                type="button"
                                className="modal-close"
                                onClick={() => {

                                    setShowModal(false);

                                    resetForm();

                                }}
                            >

                                <X
                                    size={21}
                                />

                            </button>

                        </div>



                        {/* FORM */}

                        <form
                            className="product-form"
                            onSubmit={handleSubmit}
                        >


                            {/* IMAGE */}

                            <div className="product-image-upload">

                                <div className="product-image-preview">

                                    {
                                        imagePreview

                                            ? (
                                                <img
                                                    src={
                                                        imagePreview
                                                    }
                                                    alt="Product preview"
                                                />
                                            )

                                            : (
                                                <ImageIcon
                                                    size={35}
                                                />
                                            )
                                    }

                                </div>


                                <div>

                                    <label>
                                        Product Image
                                    </label>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            handleImageChange
                                        }
                                    />

                                    <small>
                                        JPG, PNG or WEBP
                                    </small>

                                </div>

                            </div>



                            {/* PRODUCT NAME */}

                            <div className="form-group">

                                <label>
                                    Product Name *
                                </label>

                                <input
                                    type="text"
                                    name="product_name"
                                    value={
                                        form.product_name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter product name"
                                    required
                                />

                            </div>



                            {/* BRAND */}

                            <div className="form-group">

                                <label>
                                    Brand
                                </label>

                                <input
                                    type="text"
                                    name="brand"
                                    value={
                                        form.brand
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter brand"
                                />

                            </div>



                            {/* CATEGORY */}

                            <div className="form-group">

                                <label>
                                    Category ID
                                </label>

                                <input
                                    type="number"
                                    name="category_id"
                                    value={
                                        form.category_id
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter category ID"
                                />

                            </div>



                            {/* GENDER */}

                            <div className="form-group">

                                <label>
                                    Gender
                                </label>

                                <select
                                    name="gender"
                                    value={
                                        form.gender
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="">
                                        Select Gender
                                    </option>

                                    <option value="Men">
                                        Men
                                    </option>

                                    <option value="Women">
                                        Women
                                    </option>

                                    <option value="Unisex">
                                        Unisex
                                    </option>

                                    <option value="Kids">
                                        Kids
                                    </option>

                                </select>

                            </div>



                            {/* PRICE ROW */}

                            <div className="form-row">


                                <div className="form-group">

                                    <label>
                                        Price *
                                    </label>

                                    <input
                                        type="number"
                                        name="price"
                                        value={
                                            form.price
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Discount Price
                                    </label>

                                    <input
                                        type="number"
                                        name="discount_price"
                                        value={
                                            form.discount_price
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                    />

                                </div>


                            </div>



                            {/* STOCK */}

                            <div className="form-group">

                                <label>
                                    Stock *
                                </label>

                                <input
                                    type="number"
                                    name="stock"
                                    value={
                                        form.stock
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="0"
                                    min="0"
                                    required
                                />

                            </div>



                            {/* STATUS */}

                            <div className="form-group">

                                <label>
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={
                                        form.status
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="Active">
                                        Active
                                    </option>

                                    <option value="Inactive">
                                        Inactive
                                    </option>

                                </select>

                            </div>



                            {/* DESCRIPTION */}

                            <div className="form-group">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter product description"
                                    rows="4"
                                />

                            </div>



                            {/* BUTTONS */}

                            <div className="product-form-actions">

                                <button
                                    type="button"
                                    className="outline-button"
                                    onClick={() => {

                                        setShowModal(false);

                                        resetForm();

                                    }}
                                    disabled={
                                        formLoading
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={
                                        formLoading
                                    }
                                >

                                    {
                                        formLoading
                                            ? "Saving..."
                                            : editingProduct
                                                ? "Update Product"
                                                : "Add Product"
                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}


export default Products;