import React from "react";

import API from "../../api/api";

import {
    Search,
    Plus,
    Pencil,
    Trash2,
    Package,
    X,
    Loader2,
    Upload,
    Download,
    FileSpreadsheet,
    CheckCircle,
    AlertCircle
} from "lucide-react";


// ========================================
// IMAGE URL
// ========================================

let getImageUrl = (image) => {

    if (!image) {

        return "";

    }


    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {

        return image;

    }


    let cleanImage =
        image.replace(/^\/+/, "");


    if (
        cleanImage.startsWith("uploads/")
    ) {

        return `https://orgos-backend-h7ad.onrender.com/${cleanImage}`;

    }


    return `https://orgos-backend-h7ad.onrender.com/uploads/products/${cleanImage}`;

};


// ========================================
// EMPTY FORM
// ========================================

let emptyForm = {

    category_id: "",

    product_name: "",

    description: "",

    brand: "",

    fabric: "",

    color: "",

    gender: "Men",

    price: "",

    discount: 0,

    stock: 0,

    image: "",

    status: "Active",

    sizes: []

};


// ========================================
// AVAILABLE SIZE OPTIONS
// ========================================

let SIZE_OPTIONS = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "XXXL",
    "Free Size"
];


// ========================================
// COMPONENT
// ========================================

export default function Products() {


    // ========================================
    // PRODUCTS
    // ========================================

    let [products, setProducts] =
        React.useState([]);


    let [loading, setLoading] =
        React.useState(true);


    let [error, setError] =
        React.useState("");


    let [search, setSearch] =
        React.useState("");


    // ========================================
    // ADD / EDIT
    // ========================================

    let [showAddModal, setShowAddModal] =
        React.useState(false);


    let [editingProduct, setEditingProduct] =
        React.useState(null);


    let [formData, setFormData] =
        React.useState(emptyForm);


    let [imageFile, setImageFile] =
        React.useState(null);


    let [imagePreview, setImagePreview] =
        React.useState("");


    let [saving, setSaving] =
        React.useState(false);


    let [deletingId, setDeletingId] =
        React.useState(null);


    // ========================================
    // BULK IMPORT
    // ========================================

    let [showImportModal, setShowImportModal] =
        React.useState(false);


    let [importFile, setImportFile] =
        React.useState(null);


    let [importLoading, setImportLoading] =
        React.useState(false);


    let [importing, setImporting] =
        React.useState(false);


    let [importPreview, setImportPreview] =
        React.useState(null);


    // ========================================
    // CATEGORIES
    // ========================================

    let [categories, setCategories] =
        React.useState([]);

    let [categoriesLoading, setCategoriesLoading] =
        React.useState(true);


    let fetchCategories = async () => {

        try {

            setCategoriesLoading(true);

            let response =
                await API.get(
                    "/vendor/categories"
                );

            if (response.data.success) {

                let categoryList =
                    response.data.categories || [];

                setCategories(categoryList);

                setFormData((previous) => ({
                    ...previous,
                    category_id:
                        previous.category_id &&
                            categoryList.some(
                                (category) =>
                                    Number(category.category_id) ===
                                    Number(previous.category_id)
                            )
                            ? previous.category_id
                            : (categoryList[0]?.category_id ?? "")
                }));

            }

        }

        catch (error) {

            console.error(
                "Category fetch error:",
                error
            );

            setCategories([]);

        }

        finally {

            setCategoriesLoading(false);

        }

    };


    // ========================================
    // CATEGORY NAME
    // ========================================

    let getCategoryName = (id) => {

        let category =
            categories.find(
                (item) =>
                    Number(item.category_id) ===
                    Number(id)
            );


        return category
            ? category.category_name
            : "Unknown";

    };


    // ========================================
    // FETCH PRODUCTS
    // ========================================

    let fetchProducts = async () => {

        try {

            setLoading(true);

            setError("");


            let response =
                await API.get(
                    "/vendor/products"
                );


            if (
                response.data.success
            ) {

                setProducts(
                    response.data.products || []
                );

            }

        }

        catch (error) {

            console.error(
                "Products Error:",
                error
            );


            setError(

                error.response?.data?.message ||

                "Unable to load products"

            );

        }

        finally {

            setLoading(false);

        }

    };


    React.useEffect(() => {

        fetchProducts();
        fetchCategories();

    }, []);


    // ========================================
    // FORM CHANGE
    // ========================================

    let handleChange = (event) => {

        let {
            name,
            value
        } = event.target;

        setFormData(
            (previous) => ({

                ...previous,

                [name]: value

            })
        );

    };


    // ========================================
    // SIZE TOGGLE (check / uncheck a size)
    // ========================================

    let toggleSize = (size) => {

        setFormData((previous) => {

            let exists =
                previous.sizes.some(
                    (s) => s.size === size
                );

            if (exists) {

                return {
                    ...previous,
                    sizes: previous.sizes.filter(
                        (s) => s.size !== size
                    )
                };

            }

            return {
                ...previous,
                sizes: [
                    ...previous.sizes,
                    { size, stock: 0 }
                ]
            };

        });

    };


    // ========================================
    // SIZE STOCK CHANGE
    // ========================================

    let updateSizeStock = (size, stock) => {

        setFormData((previous) => ({

            ...previous,

            sizes: previous.sizes.map((s) =>
                s.size === size
                    ? { ...s, stock: Number(stock) || 0 }
                    : s
            )

        }));

    };


    // ========================================
    // IMAGE CHANGE
    // ========================================

    let handleImageChange = (event) => {

        let file =
            event.target.files?.[0];


        if (!file) {

            return;

        }


        if (
            file.size >
            5 * 1024 * 1024
        ) {

            alert(
                "Image size must be less than 5 MB"
            );

            event.target.value = "";

            return;

        }


        setImageFile(file);


        setImagePreview(
            URL.createObjectURL(file)
        );

    };


    // ========================================
    // OPEN ADD
    // ========================================

    let openAddProduct = () => {

        setEditingProduct(null);

        setFormData({
            ...emptyForm,
            category_id: categories[0]?.category_id ?? ""
        });

        setImageFile(null);

        setImagePreview("");

        setShowAddModal(true);

    };


    // ========================================
    // OPEN EDIT
    // ========================================

    let openEditProduct = (product) => {

        setEditingProduct(product);


        setFormData({

            category_id:
                product.category_id || categories[0]?.category_id || "",

            product_name:
                product.product_name || "",

            description:
                product.description || "",

            brand:
                product.brand || "",

            fabric:
                product.fabric || "",

            color:
                product.color || "",

            gender:
                product.gender || "Men",

            price:
                product.price || "",

            discount:
                product.discount || 0,

            stock:
                product.stock || 0,

            image:
                product.image || "",

            status:
                product.status || "Active",

            sizes:
                Array.isArray(product.sizes)
                    ? product.sizes.map((s) => ({
                        size: s.size,
                        stock: Number(s.stock) || 0
                    }))
                    : []

        });


        setImageFile(null);


        setImagePreview(
            product.image
                ? getImageUrl(product.image)
                : ""
        );


        setShowAddModal(true);

    };


    // ========================================
    // CLOSE ADD MODAL
    // ========================================

    let closeAddModal = () => {

        setShowAddModal(false);

        setEditingProduct(null);

        setImageFile(null);

        setImagePreview("");

    };


    // ========================================
    // SAVE PRODUCT
    // ========================================

    let handleSubmit = async (event) => {

        event.preventDefault();


        try {

            setSaving(true);


            let data =
                new FormData();


            Object.keys(formData)
                .forEach((key) => {

                    if (key === "sizes") {
                        return;
                    }

                    data.append(
                        key,
                        formData[key] ?? ""
                    );

                });


            data.append(
                "sizes",
                JSON.stringify(formData.sizes || [])
            );


            if (imageFile) {

                data.append(
                    "image",
                    imageFile
                );

            }


            let response;


            if (editingProduct) {

                response =
                    await API.put(

                        `/vendor/products/${editingProduct.product_id}`,

                        data,

                        {

                            headers: {

                                "Content-Type":
                                    "multipart/form-data"

                            }

                        }

                    );

            }

            else {

                response =
                    await API.post(

                        "/vendor/products",

                        data,

                        {

                            headers: {

                                "Content-Type":
                                    "multipart/form-data"

                            }

                        }

                    );

            }


            if (
                response.data.success
            ) {

                closeAddModal();

                await fetchProducts();

                alert(
                    editingProduct
                        ? "Product updated successfully"
                        : "Product added successfully"
                );

            }

        }

        catch (error) {

            console.error(
                "Save Product Error:",
                error
            );


            alert(

                error.response?.data?.message ||

                "Failed to save product"

            );

        }

        finally {

            setSaving(false);

        }

    };


    // ========================================
    // DELETE
    // ========================================

    let handleDelete = async (product) => {

        let confirmed =
            window.confirm(

                `Delete "${product.product_name}"?`

            );


        if (!confirmed) {

            return;

        }


        try {

            setDeletingId(
                product.product_id
            );


            let response =
                await API.delete(

                    `/vendor/products/${product.product_id}`

                );


            if (
                response.data.success
            ) {

                setProducts(

                    (previous) =>

                        previous.filter(

                            (item) =>

                                item.product_id !==
                                product.product_id

                        )

                );

            }

        }

        catch (error) {

            console.error(
                "Delete Product Error:",
                error
            );


            alert(

                error.response?.data?.message ||

                "Failed to delete product"

            );

        }

        finally {

            setDeletingId(null);

        }

    };


    // ========================================
    // DOWNLOAD TEMPLATE
    // ========================================

    let downloadTemplate = async () => {

        try {

            let response =
                await API.get(

                    "/vendor/products/import/template",

                    {

                        responseType: "blob"

                    }

                );


            let blob =
                new Blob(

                    [response.data],

                    {

                        type:
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

                    }

                );


            let url =
                window.URL.createObjectURL(
                    blob
                );


            let link =
                document.createElement("a");


            link.href = url;

            link.download =
                "orgos-product-import-template.xlsx";


            document.body.appendChild(link);

            link.click();

            link.remove();


            window.URL.revokeObjectURL(url);

        }

        catch (error) {

            console.error(
                "Template Error:",
                error
            );


            alert(
                "Unable to download template"
            );

        }

    };


    // ========================================
    // EXPORT PRODUCTS
    // ========================================

    let exportProducts = async () => {

        try {

            let response =
                await API.get(

                    "/vendor/products/export",

                    {

                        responseType: "blob"

                    }

                );


            let blob =
                new Blob(

                    [response.data],

                    {

                        type:
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

                    }

                );


            let url =
                window.URL.createObjectURL(
                    blob
                );


            let link =
                document.createElement("a");


            link.href = url;

            link.download =
                "orgos-products.xlsx";


            document.body.appendChild(link);

            link.click();

            link.remove();


            window.URL.revokeObjectURL(url);

        }

        catch (error) {

            console.error(
                "Export Error:",
                error
            );


            alert(
                "Unable to export products"
            );

        }

    };


    // ========================================
    // IMPORT FILE CHANGE
    // ========================================

    let handleImportFile = (event) => {

        let file =
            event.target.files?.[0];


        if (!file) {

            return;

        }


        let allowed =
            [

                "xlsx",
                "xls",
                "csv"

            ];


        let extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        if (
            !allowed.includes(extension)
        ) {

            alert(
                "Please select XLSX, XLS or CSV file"
            );

            event.target.value = "";

            return;

        }


        if (
            file.size >
            10 * 1024 * 1024
        ) {

            alert(
                "File size must be less than 10 MB"
            );

            event.target.value = "";

            return;

        }


        setImportFile(file);

        setImportPreview(null);

    };


    // ========================================
    // PREVIEW IMPORT
    // ========================================

    let previewImport = async () => {

        if (!importFile) {

            alert(
                "Please select an Excel file first"
            );

            return;

        }


        try {

            setImportLoading(true);


            let data =
                new FormData();


            data.append(
                "file",
                importFile
            );


            data.append(
                "preview",
                "true"
            );


            let response =
                await API.post(

                    "/vendor/products/import",

                    data,

                    {

                        headers: {

                            "Content-Type":
                                "multipart/form-data"

                        }

                    }

                );


            if (
                response.data.success
            ) {

                setImportPreview(
                    response.data
                );

            }

        }

        catch (error) {

            console.error(
                "Import Preview Error:",
                error
            );


            alert(

                error.response?.data?.message ||

                "Unable to validate Excel file"

            );

        }

        finally {

            setImportLoading(false);

        }

    };


    // ========================================
    // CONFIRM IMPORT
    // ========================================

    let confirmImport = async () => {

        if (!importFile) {

            return;

        }


        if (
            !importPreview ||
            importPreview.validCount === 0
        ) {

            alert(
                "There are no valid products to import"
            );

            return;

        }


        let confirmed =
            window.confirm(

                `Import ${importPreview.validCount} valid products?`

            );


        if (!confirmed) {

            return;

        }


        try {

            setImporting(true);


            let data =
                new FormData();


            data.append(
                "file",
                importFile
            );


            data.append(
                "preview",
                "false"
            );


            let response =
                await API.post(

                    "/vendor/products/import",

                    data,

                    {

                        headers: {

                            "Content-Type":
                                "multipart/form-data"

                        }

                    }

                );


            if (
                response.data.success
            ) {

                alert(

                    `${response.data.insertedCount} products imported successfully`

                );


                if (
                    response.data.skippedCount > 0
                ) {

                    alert(

                        `${response.data.skippedCount} invalid rows were skipped`

                    );

                }


                setShowImportModal(false);

                setImportFile(null);

                setImportPreview(null);


                await fetchProducts();

            }

        }

        catch (error) {

            console.error(
                "Bulk Import Error:",
                error
            );


            alert(

                error.response?.data?.message ||

                "Failed to import products"

            );

        }

        finally {

            setImporting(false);

        }

    };


    // ========================================
    // CLOSE IMPORT
    // ========================================

    let closeImportModal = () => {

        if (importLoading || importing) {

            return;

        }


        setShowImportModal(false);

        setImportFile(null);

        setImportPreview(null);

    };


    // ========================================
    // SEARCH
    // ========================================

    let filteredProducts =
        products.filter(

            (product) => {

                let text =
                    search
                        .toLowerCase()
                        .trim();


                return (

                    product.product_name
                        ?.toLowerCase()
                        .includes(text)

                    ||

                    product.brand
                        ?.toLowerCase()
                        .includes(text)

                    ||

                    product.color
                        ?.toLowerCase()
                        .includes(text)

                    ||

                    product.category_name
                        ?.toLowerCase()
                        .includes(text)

                    ||

                    getCategoryName(
                        product.category_id
                    )
                        .toLowerCase()
                        .includes(text)

                );

            }

        );


    // ========================================
    // PRICE
    // ========================================

    let formatPrice = (price) => {

        return new Intl.NumberFormat(

            "en-IN",

            {

                style: "currency",

                currency: "INR",

                maximumFractionDigits: 2

            }

        ).format(
            Number(price) || 0
        );

    };


    // ========================================
    // RETURN
    // ========================================

    return (

        <div className="
            min-h-screen
            bg-[#f7f8fc]
            p-4
            sm:p-6
            lg:p-8
        ">


            {/* ========================================
                HEADER
            ======================================== */}

            <div className="
                flex
                flex-col
                xl:flex-row
                xl:items-center
                xl:justify-between
                gap-4
                mb-7
            ">

                <div>

                    <h1 className="
                        text-2xl
                        font-extrabold
                        text-gray-900
                    ">
                        Products
                    </h1>


                    <p className="
                        text-sm
                        text-gray-500
                        mt-1
                    ">
                        Manage your store products and inventory
                    </p>

                </div>


                <div className="
                    flex
                    flex-wrap
                    gap-2
                ">


                    {/* TEMPLATE */}

                    <button

                        onClick={
                            downloadTemplate
                        }

                        className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            bg-white
                            border
                            border-gray-200
                            text-gray-700
                            hover:bg-gray-50
                            px-4
                            py-3
                            rounded-xl
                            text-sm
                            font-bold
                            transition
                        "

                    >

                        <FileSpreadsheet
                            className="w-4 h-4"
                        />

                        Template

                    </button>


                    {/* IMPORT */}

                    <button

                        onClick={() =>
                            setShowImportModal(true)
                        }

                        className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            bg-blue-600
                            hover:bg-blue-700
                            text-white
                            px-4
                            py-3
                            rounded-xl
                            text-sm
                            font-bold
                            transition
                        "

                    >

                        <Upload
                            className="w-4 h-4"
                        />

                        Import

                    </button>


                    {/* EXPORT */}

                    <button

                        onClick={
                            exportProducts
                        }

                        className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            bg-purple-600
                            hover:bg-purple-700
                            text-white
                            px-4
                            py-3
                            rounded-xl
                            text-sm
                            font-bold
                            transition
                        "

                    >

                        <Download
                            className="w-4 h-4"
                        />

                        Export

                    </button>


                    {/* ADD */}

                    <button

                        onClick={
                            openAddProduct
                        }

                        className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            bg-[#175c2e]
                            hover:bg-[#114521]
                            text-white
                            px-5
                            py-3
                            rounded-xl
                            text-sm
                            font-bold
                            transition
                        "

                    >

                        <Plus
                            className="w-4 h-4"
                        />

                        Add Product

                    </button>

                </div>

            </div>


            {/* ========================================
                SUMMARY
            ======================================== */}

            <div className="
                grid
                grid-cols-1
                sm:grid-cols-3
                gap-4
                mb-6
            ">


                <StatCard
                    title="Total Products"
                    value={
                        products.length
                    }
                />


                <StatCard
                    title="Active Products"
                    value={
                        products.filter(
                            (product) =>
                                product.status ===
                                "Active"
                        ).length
                    }
                />


                <StatCard
                    title="Low Stock"
                    value={
                        products.filter(
                            (product) =>
                                Number(
                                    product.stock
                                ) <= 10
                        ).length
                    }
                />

            </div>


            {/* ========================================
                PRODUCT TABLE
            ======================================== */}

            <div className="
                bg-white
                border
                border-gray-200
                rounded-[20px]
                overflow-hidden
            ">


                {/* SEARCH */}

                <div className="
                    p-5
                    border-b
                    border-gray-100
                ">

                    <div className="
                        relative
                        max-w-md
                    ">

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

                            value={search}

                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }

                            placeholder="
                                Search products...
                            "

                            className="
                                w-full
                                pl-10
                                pr-4
                                py-3
                                bg-gray-50
                                border
                                border-gray-200
                                rounded-xl
                                outline-none
                                focus:border-green-600
                                text-sm
                            "

                        />

                    </div>

                </div>


                {/* ERROR */}

                {error && (

                    <div className="
                        m-5
                        bg-red-50
                        border
                        border-red-200
                        text-red-700
                        px-4
                        py-3
                        rounded-xl
                        text-sm
                    ">

                        {error}

                    </div>

                )}


                {/* LOADING */}

                {loading ? (

                    <div className="
                        py-20
                        flex
                        items-center
                        justify-center
                        gap-3
                        text-gray-500
                    ">

                        <Loader2
                            className="
                                w-5
                                h-5
                                animate-spin
                            "
                        />

                        Loading products...

                    </div>

                ) : filteredProducts.length === 0 ? (

                    <div className="
                        py-20
                        flex
                        flex-col
                        items-center
                        text-center
                    ">

                        <Package
                            className="
                                w-12
                                h-12
                                text-gray-300
                                mb-3
                            "
                        />

                        <h3 className="
                            font-bold
                            text-gray-700
                        ">
                            No products found
                        </h3>

                        <p className="
                            text-sm
                            text-gray-400
                            mt-1
                        ">
                            Add your first product to get started.
                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="
                            w-full
                            min-w-[1050px]
                            text-left
                        ">

                            <thead className="
                                bg-gray-50
                                text-xs
                                text-gray-500
                            ">

                                <tr>

                                    <th className="px-5 py-4">
                                        ID
                                    </th>

                                    <th className="px-5 py-4">
                                        Product
                                    </th>

                                    <th className="px-5 py-4">
                                        Category
                                    </th>

                                    <th className="px-5 py-4">
                                        Brand
                                    </th>

                                    <th className="px-5 py-4">
                                        Price
                                    </th>

                                    <th className="px-5 py-4">
                                        Discount
                                    </th>

                                    <th className="px-5 py-4">
                                        Stock
                                    </th>

                                    <th className="px-5 py-4">
                                        Rating
                                    </th>

                                    <th className="px-5 py-4">
                                        Status
                                    </th>

                                    <th className="px-5 py-4">
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredProducts.map(
                                    (product) => (

                                        <tr

                                            key={
                                                product.product_id
                                            }

                                            className="
                                                border-t
                                                border-gray-100
                                                hover:bg-gray-50
                                            "

                                        >

                                            <td className="
                                                px-5
                                                py-4
                                                text-sm
                                                text-gray-500
                                            ">

                                                #
                                                {
                                                    product.product_id
                                                }

                                            </td>


                                            {/* PRODUCT */}

                                            <td className="px-5 py-4">

                                                <div className="
                                                    flex
                                                    items-center
                                                    gap-3
                                                ">

                                                    <div className="
                                                        w-11
                                                        h-11
                                                        bg-green-50
                                                        rounded-xl
                                                        overflow-hidden
                                                        flex
                                                        items-center
                                                        justify-center
                                                        shrink-0
                                                    ">

                                                        {product.image ? (

                                                            <img

                                                                src={
                                                                    getImageUrl(
                                                                        product.image
                                                                    )
                                                                }

                                                                alt={
                                                                    product.product_name
                                                                }

                                                                className="
                                                                    w-full
                                                                    h-full
                                                                    object-cover
                                                                "

                                                                onError={
                                                                    (
                                                                        event
                                                                    ) => {

                                                                        event.currentTarget.style.display =
                                                                            "none";

                                                                    }
                                                                }

                                                            />

                                                        ) : (

                                                            <Package
                                                                className="
                                                                    w-5
                                                                    h-5
                                                                    text-green-700
                                                                "
                                                            />

                                                        )}

                                                    </div>


                                                    <div>

                                                        <div className="
                                                            text-sm
                                                            font-bold
                                                            text-gray-900
                                                        ">

                                                            {
                                                                product.product_name
                                                            }

                                                        </div>


                                                        <div className="
                                                            text-xs
                                                            text-gray-400
                                                            mt-1
                                                        ">

                                                            {
                                                                product.color ||
                                                                "No colour"
                                                            }

                                                            {" • "}

                                                            {
                                                                product.gender ||
                                                                "Unisex"
                                                            }

                                                        </div>


                                                        {Array.isArray(product.sizes) &&
                                                            product.sizes.length > 0 && (

                                                                <div className="
                                                                flex
                                                                flex-wrap
                                                                gap-1
                                                                mt-1.5
                                                            ">

                                                                    {product.sizes.map((s) => (

                                                                        <span
                                                                            key={s.size}
                                                                            className={
                                                                                Number(s.stock) > 0
                                                                                    ? "text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700"
                                                                                    : "text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 line-through"
                                                                            }
                                                                            title={`Stock: ${s.stock}`}
                                                                        >
                                                                            {s.size}
                                                                        </span>

                                                                    ))}

                                                                </div>

                                                            )}

                                                    </div>

                                                </div>

                                            </td>


                                            <td className="
                                                px-5
                                                py-4
                                                text-sm
                                                font-semibold
                                            ">

                                                {
                                                    product.category_name ||
                                                    getCategoryName(
                                                        product.category_id
                                                    )
                                                }

                                            </td>


                                            <td className="
                                                px-5
                                                py-4
                                                text-sm
                                            ">

                                                {
                                                    product.brand ||
                                                    "—"
                                                }

                                            </td>


                                            <td className="
                                                px-5
                                                py-4
                                                text-sm
                                                font-bold
                                            ">

                                                {
                                                    formatPrice(
                                                        product.price
                                                    )
                                                }

                                            </td>


                                            <td className="
                                                px-5
                                                py-4
                                                text-sm
                                            ">

                                                {
                                                    product.discount ||
                                                    0
                                                }%

                                            </td>


                                            <td className="px-5 py-4">

                                                <span

                                                    className={
                                                        Number(
                                                            product.stock
                                                        ) <= 10

                                                            ? "text-red-600 font-bold text-sm"

                                                            : "text-gray-700 font-semibold text-sm"
                                                    }

                                                >

                                                    {
                                                        product.stock
                                                    }

                                                </span>

                                            </td>


                                            <td className="
                                                px-5
                                                py-4
                                                text-sm
                                            ">

                                                ⭐ {
                                                    product.rating ||
                                                    0
                                                }

                                            </td>


                                            <td className="px-5 py-4">

                                                <span

                                                    className={`
                                                        px-3
                                                        py-1
                                                        rounded-full
                                                        text-xs
                                                        font-bold

                                                        ${product.status ===
                                                            "Active"

                                                            ? "bg-green-50 text-green-700"

                                                            : "bg-gray-100 text-gray-600"
                                                        }
                                                    `}

                                                >

                                                    {
                                                        product.status
                                                    }

                                                </span>

                                            </td>


                                            {/* ACTIONS */}

                                            <td className="
                                                px-5
                                                py-4
                                            ">

                                                <div className="
                                                    flex
                                                    gap-2
                                                ">

                                                    <button

                                                        onClick={() =>
                                                            openEditProduct(
                                                                product
                                                            )
                                                        }

                                                        className="
                                                            p-2
                                                            rounded-lg
                                                            bg-blue-50
                                                            text-blue-600
                                                            hover:bg-blue-100
                                                        "

                                                    >

                                                        <Pencil
                                                            className="
                                                                w-4
                                                                h-4
                                                            "
                                                        />

                                                    </button>


                                                    <button

                                                        disabled={
                                                            deletingId ===
                                                            product.product_id
                                                        }

                                                        onClick={() =>
                                                            handleDelete(
                                                                product
                                                            )
                                                        }

                                                        className="
                                                            p-2
                                                            rounded-lg
                                                            bg-red-50
                                                            text-red-600
                                                            hover:bg-red-100
                                                            disabled:opacity-50
                                                        "

                                                    >

                                                        {
                                                            deletingId ===
                                                                product.product_id

                                                                ? (

                                                                    <Loader2
                                                                        className="
                                                                            w-4
                                                                            h-4
                                                                            animate-spin
                                                                        "
                                                                    />

                                                                )

                                                                : (

                                                                    <Trash2
                                                                        className="
                                                                            w-4
                                                                            h-4
                                                                        "
                                                                    />

                                                                )
                                                        }

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* ========================================
                ADD / EDIT MODAL
            ======================================== */}

            {showAddModal && (

                <div className="
                    fixed
                    inset-0
                    z-[100]
                    bg-black/50
                    flex
                    items-center
                    justify-center
                    p-4
                ">

                    <div className="
                        bg-white
                        rounded-[24px]
                        w-full
                        max-w-3xl
                        max-h-[90vh]
                        overflow-y-auto
                        shadow-2xl
                    ">


                        <div className="
                            flex
                            items-center
                            justify-between
                            p-6
                            border-b
                        ">

                            <div>

                                <h2 className="
                                    text-xl
                                    font-extrabold
                                ">

                                    {
                                        editingProduct
                                            ? "Edit Product"
                                            : "Add Product"
                                    }

                                </h2>

                            </div>


                            <button
                                onClick={
                                    closeAddModal
                                }
                            >

                                <X
                                    className="
                                        w-5
                                        h-5
                                    "
                                />

                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleSubmit
                            }

                            className="p-6"
                        >

                            <div className="
                                grid
                                grid-cols-1
                                md:grid-cols-2
                                gap-5
                            ">


                                <Input
                                    label="Product Name"
                                    name="product_name"
                                    value={
                                        formData.product_name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />


                                <SelectInput
                                    label="Product Category"
                                    name="category_id"
                                    value={
                                        formData.category_id
                                    }
                                    onChange={
                                        handleChange
                                    }

                                    options={
                                        categories.map((category) => ({
                                            value: category.category_id,
                                            label: category.category_name
                                        }))
                                    }

                                />


                                <Input
                                    label="Brand"
                                    name="brand"
                                    value={
                                        formData.brand
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />


                                <Input
                                    label="Fabric"
                                    name="fabric"
                                    value={
                                        formData.fabric
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />


                                <Input
                                    label="Color"
                                    name="color"
                                    value={
                                        formData.color
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />


                                <SelectInput
                                    label="Gender"
                                    name="gender"
                                    value={
                                        formData.gender
                                    }
                                    onChange={
                                        handleChange
                                    }

                                    options={[

                                        {
                                            value: "Men",
                                            label: "Men"
                                        },

                                        {
                                            value: "Women",
                                            label: "Women"
                                        },

                                        {
                                            value: "Kids",
                                            label: "Kids"
                                        },

                                        {
                                            value: "Unisex",
                                            label: "Unisex"
                                        }

                                    ]}

                                />


                                <Input
                                    label="Price"
                                    name="price"
                                    type="number"
                                    value={
                                        formData.price
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />


                                <Input
                                    label="Discount (%)"
                                    name="discount"
                                    type="number"
                                    value={
                                        formData.discount
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />


                                <Input
                                    label="Stock"
                                    name="stock"
                                    type="number"
                                    value={
                                        formData.stock
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />


                                {/* ========================================
                                    SIZES & PER-SIZE STOCK
                                ======================================== */}

                                <div className="md:col-span-2">

                                    <label className="
                                        block
                                        text-xs
                                        font-bold
                                        text-gray-600
                                        mb-2
                                    ">
                                        Sizes & Available Stock
                                    </label>

                                    <p className="
                                        text-xs
                                        text-gray-400
                                        mb-3
                                    ">
                                        Select the sizes this product comes in and set
                                        stock for each. If no size is selected, the
                                        product will be treated as one single size and
                                        the "Stock" field above will be used.
                                    </p>

                                    <div className="
                                        grid
                                        grid-cols-2
                                        sm:grid-cols-4
                                        gap-3
                                    ">

                                        {SIZE_OPTIONS.map((size) => {

                                            let sizeEntry =
                                                formData.sizes.find(
                                                    (s) => s.size === size
                                                );

                                            let isChecked =
                                                !!sizeEntry;

                                            return (

                                                <div
                                                    key={size}
                                                    className={
                                                        isChecked
                                                            ? "border-2 border-green-600 rounded-xl p-3 bg-green-50"
                                                            : "border border-gray-200 rounded-xl p-3"
                                                    }
                                                >

                                                    <label className="
                                                        flex
                                                        items-center
                                                        gap-2
                                                        text-sm
                                                        font-semibold
                                                        cursor-pointer
                                                    ">

                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() =>
                                                                toggleSize(size)
                                                            }
                                                        />

                                                        {size}

                                                    </label>


                                                    {isChecked && (

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            placeholder="Stock"
                                                            value={
                                                                sizeEntry.stock
                                                            }
                                                            onChange={(e) =>
                                                                updateSizeStock(
                                                                    size,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="
                                                                mt-2
                                                                w-full
                                                                border
                                                                border-gray-200
                                                                rounded-lg
                                                                px-2
                                                                py-1
                                                                text-sm
                                                                outline-none
                                                                focus:border-green-600
                                                            "
                                                        />

                                                    )}

                                                </div>

                                            );

                                        })}

                                    </div>

                                    {formData.sizes.length > 0 && (

                                        <p className="
                                            text-xs
                                            text-gray-500
                                            mt-2
                                        ">
                                            Total stock across sizes: {
                                                formData.sizes.reduce(
                                                    (sum, s) => sum + (Number(s.stock) || 0),
                                                    0
                                                )
                                            }
                                        </p>

                                    )}

                                </div>


                                <SelectInput
                                    label="Status"
                                    name="status"
                                    value={
                                        formData.status
                                    }
                                    onChange={
                                        handleChange
                                    }

                                    options={[

                                        {
                                            value: "Active",
                                            label: "Active"
                                        },

                                        {
                                            value: "Inactive",
                                            label: "Inactive"
                                        }

                                    ]}

                                />


                                <div className="
                                    md:col-span-2
                                ">

                                    <label className="
                                        block
                                        text-xs
                                        font-bold
                                        text-gray-600
                                        mb-2
                                    ">
                                        Description
                                    </label>


                                    <textarea

                                        name="description"

                                        value={
                                            formData.description
                                        }

                                        onChange={
                                            handleChange
                                        }

                                        rows="4"

                                        className="
                                            w-full
                                            border
                                            border-gray-200
                                            rounded-xl
                                            px-4
                                            py-3
                                            outline-none
                                            focus:border-green-600
                                            text-sm
                                        "

                                    />

                                </div>


                                <div className="
                                    md:col-span-2
                                ">

                                    <label className="
                                        block
                                        text-xs
                                        font-bold
                                        text-gray-600
                                        mb-2
                                    ">
                                        Product Image
                                    </label>


                                    <input

                                        type="file"

                                        accept="image/*"

                                        onChange={
                                            handleImageChange
                                        }

                                        className="
                                            w-full
                                            border
                                            border-gray-200
                                            rounded-xl
                                            px-4
                                            py-3
                                            text-sm
                                        "

                                    />


                                    {imagePreview && (

                                        <img

                                            src={
                                                imagePreview
                                            }

                                            alt="Preview"

                                            className="
                                                mt-4
                                                w-24
                                                h-24
                                                rounded-xl
                                                object-cover
                                                border
                                            "

                                        />

                                    )}

                                </div>

                            </div>


                            <div className="
                                flex
                                justify-end
                                gap-3
                                mt-7
                            ">

                                <button

                                    type="button"

                                    onClick={
                                        closeAddModal
                                    }

                                    className="
                                        px-5
                                        py-3
                                        rounded-xl
                                        border
                                        border-gray-200
                                        text-sm
                                        font-bold
                                    "

                                >

                                    Cancel

                                </button>


                                <button

                                    type="submit"

                                    disabled={saving}

                                    className="
                                        px-5
                                        py-3
                                        rounded-xl
                                        bg-[#175c2e]
                                        hover:bg-[#114521]
                                        text-white
                                        text-sm
                                        font-bold
                                        disabled:opacity-50
                                        flex
                                        items-center
                                        gap-2
                                    "

                                >

                                    {saving && (

                                        <Loader2
                                            className="
                                                w-4
                                                h-4
                                                animate-spin
                                            "
                                        />

                                    )}

                                    {
                                        editingProduct
                                            ? "Update Product"
                                            : "Add Product"
                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* ========================================
                IMPORT MODAL
            ======================================== */}

            {showImportModal && (

                <div className="
                    fixed
                    inset-0
                    z-[110]
                    bg-black/60
                    flex
                    items-center
                    justify-center
                    p-4
                ">

                    <div className="
                        bg-white
                        rounded-[24px]
                        w-full
                        max-w-5xl
                        max-h-[92vh]
                        overflow-y-auto
                        shadow-2xl
                    ">


                        {/* HEADER */}

                        <div className="
                            flex
                            items-center
                            justify-between
                            p-6
                            border-b
                        ">

                            <div>

                                <h2 className="
                                    text-xl
                                    font-extrabold
                                    text-gray-900
                                ">

                                    Bulk Product Import

                                </h2>


                                <p className="
                                    text-sm
                                    text-gray-500
                                    mt-1
                                ">

                                    Upload your Excel file and validate products before importing.

                                </p>

                            </div>


                            <button
                                onClick={
                                    closeImportModal
                                }
                            >

                                <X
                                    className="
                                        w-5
                                        h-5
                                    "
                                />

                            </button>

                        </div>


                        <div className="p-6">


                            {/* STEP 1 */}

                            <div className="
                                border
                                border-gray-200
                                rounded-2xl
                                p-5
                                bg-gray-50
                            ">

                                <div className="
                                    flex
                                    flex-col
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                    gap-4
                                ">

                                    <div>

                                        <h3 className="
                                            font-bold
                                            text-gray-800
                                        ">
                                            Step 1: Download Template
                                        </h3>

                                        <p className="
                                            text-sm
                                            text-gray-500
                                            mt-1
                                        ">
                                            Use the official Orgos Excel template.
                                        </p>

                                    </div>


                                    <button

                                        onClick={
                                            downloadTemplate
                                        }

                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            bg-white
                                            border
                                            border-gray-200
                                            px-4
                                            py-2.5
                                            rounded-xl
                                            text-sm
                                            font-bold
                                            hover:bg-gray-100
                                        "

                                    >

                                        <Download
                                            className="w-4 h-4"
                                        />

                                        Download Template

                                    </button>

                                </div>

                            </div>


                            {/* STEP 2 */}

                            <div className="
                                mt-5
                                border
                                border-gray-200
                                rounded-2xl
                                p-5
                            ">

                                <h3 className="
                                    font-bold
                                    text-gray-800
                                ">
                                    Step 2: Upload Excel
                                </h3>


                                <div className="
                                    mt-4
                                    border-2
                                    border-dashed
                                    border-gray-300
                                    rounded-2xl
                                    p-8
                                    text-center
                                    hover:border-blue-400
                                ">

                                    <Upload
                                        className="
                                            w-10
                                            h-10
                                            mx-auto
                                            text-blue-500
                                            mb-3
                                        "
                                    />


                                    <input

                                        type="file"

                                        accept=".xlsx,.xls,.csv"

                                        onChange={
                                            handleImportFile
                                        }

                                        className="
                                            block
                                            w-full
                                            max-w-md
                                            mx-auto
                                            text-sm
                                        "

                                    />


                                    {importFile && (

                                        <p className="
                                            mt-3
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                        ">

                                            Selected:
                                            {" "}
                                            {
                                                importFile.name
                                            }

                                        </p>

                                    )}

                                </div>


                                <div className="
                                    flex
                                    justify-end
                                    mt-4
                                ">

                                    <button

                                        onClick={
                                            previewImport
                                        }

                                        disabled={
                                            !importFile ||
                                            importLoading
                                        }

                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            bg-blue-600
                                            hover:bg-blue-700
                                            text-white
                                            px-5
                                            py-3
                                            rounded-xl
                                            text-sm
                                            font-bold
                                            disabled:opacity-50
                                        "

                                    >

                                        {importLoading ? (

                                            <Loader2
                                                className="
                                                    w-4
                                                    h-4
                                                    animate-spin
                                                "
                                            />

                                        ) : (

                                            <CheckCircle
                                                className="
                                                    w-4
                                                    h-4
                                                "
                                            />

                                        )}

                                        Validate & Preview

                                    </button>

                                </div>

                            </div>


                            {/* PREVIEW */}

                            {importPreview && (

                                <div className="
                                    mt-5
                                ">


                                    {/* STATS */}

                                    <div className="
                                        grid
                                        grid-cols-1
                                        sm:grid-cols-3
                                        gap-4
                                    ">


                                        <ImportStat

                                            title="Total Rows"

                                            value={
                                                importPreview.totalRows
                                            }

                                        />


                                        <ImportStat

                                            title="Valid Products"

                                            value={
                                                importPreview.validCount
                                            }

                                            success

                                        />


                                        <ImportStat

                                            title="Errors"

                                            value={
                                                importPreview.errorCount
                                            }

                                            danger

                                        />

                                    </div>


                                    {/* ERRORS */}

                                    {importPreview.errors?.length > 0 && (

                                        <div className="
                                            mt-5
                                            border
                                            border-red-200
                                            rounded-2xl
                                            overflow-hidden
                                        ">

                                            <div className="
                                                bg-red-50
                                                p-4
                                                flex
                                                items-center
                                                gap-2
                                                text-red-700
                                                font-bold
                                            ">

                                                <AlertCircle
                                                    className="
                                                        w-5
                                                        h-5
                                                    "
                                                />

                                                Validation Errors

                                            </div>


                                            <div className="
                                                max-h-64
                                                overflow-y-auto
                                            ">

                                                <table className="
                                                    w-full
                                                    text-sm
                                                ">

                                                    <thead className="
                                                        bg-gray-50
                                                    ">

                                                        <tr>

                                                            <th className="
                                                                px-4
                                                                py-3
                                                                text-left
                                                            ">
                                                                Row
                                                            </th>

                                                            <th className="
                                                                px-4
                                                                py-3
                                                                text-left
                                                            ">
                                                                Product
                                                            </th>

                                                            <th className="
                                                                px-4
                                                                py-3
                                                                text-left
                                                            ">
                                                                Errors
                                                            </th>

                                                        </tr>

                                                    </thead>


                                                    <tbody>

                                                        {
                                                            importPreview.errors.map(

                                                                (
                                                                    item,
                                                                    index
                                                                ) => (

                                                                    <tr
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="
                                                                            border-t
                                                                            border-gray-100
                                                                        "
                                                                    >

                                                                        <td className="
                                                                            px-4
                                                                            py-3
                                                                            font-bold
                                                                        ">

                                                                            {
                                                                                item.row
                                                                            }

                                                                        </td>


                                                                        <td className="
                                                                            px-4
                                                                            py-3
                                                                        ">

                                                                            {
                                                                                item.product_name
                                                                            }

                                                                        </td>


                                                                        <td className="
                                                                            px-4
                                                                            py-3
                                                                            text-red-600
                                                                        ">

                                                                            {
                                                                                item.errors?.join(
                                                                                    ", "
                                                                                )
                                                                            }

                                                                        </td>

                                                                    </tr>

                                                                )

                                                            )
                                                        }

                                                    </tbody>

                                                </table>

                                            </div>

                                        </div>

                                    )}


                                    {/* VALID PRODUCTS */}

                                    {importPreview.validCount > 0 && (

                                        <div className="
                                            mt-5
                                            border
                                            border-green-200
                                            rounded-2xl
                                            overflow-hidden
                                        ">

                                            <div className="
                                                bg-green-50
                                                p-4
                                                text-green-700
                                                font-bold
                                            ">

                                                Valid Products Preview

                                            </div>


                                            <div className="
                                                max-h-64
                                                overflow-y-auto
                                            ">

                                                <table className="
                                                    w-full
                                                    text-sm
                                                ">

                                                    <thead className="
                                                        bg-gray-50
                                                    ">

                                                        <tr>

                                                            <th className="px-4 py-3 text-left">
                                                                Product
                                                            </th>

                                                            <th className="px-4 py-3 text-left">
                                                                Category
                                                            </th>

                                                            <th className="px-4 py-3 text-left">
                                                                Gender
                                                            </th>

                                                            <th className="px-4 py-3 text-left">
                                                                Price
                                                            </th>

                                                            <th className="px-4 py-3 text-left">
                                                                Stock
                                                            </th>

                                                        </tr>

                                                    </thead>


                                                    <tbody>

                                                        {
                                                            (
                                                                importPreview.validProducts ||
                                                                []
                                                            ).map(

                                                                (
                                                                    product,
                                                                    index
                                                                ) => (

                                                                    <tr

                                                                        key={
                                                                            index
                                                                        }

                                                                        className="
                                                                            border-t
                                                                            border-gray-100
                                                                        "

                                                                    >

                                                                        <td className="px-4 py-3 font-semibold">

                                                                            {
                                                                                product.product_name
                                                                            }

                                                                        </td>


                                                                        <td className="px-4 py-3">

                                                                            {
                                                                                getCategoryName(
                                                                                    product.category_id
                                                                                )
                                                                            }

                                                                        </td>


                                                                        <td className="px-4 py-3">

                                                                            {
                                                                                product.gender ||
                                                                                "-"
                                                                            }

                                                                        </td>


                                                                        <td className="px-4 py-3">

                                                                            ₹
                                                                            {
                                                                                product.price
                                                                            }

                                                                        </td>


                                                                        <td className="px-4 py-3">

                                                                            {
                                                                                product.stock
                                                                            }

                                                                        </td>

                                                                    </tr>

                                                                )

                                                            )
                                                        }

                                                    </tbody>

                                                </table>

                                            </div>

                                        </div>

                                    )}


                                    {/* IMPORT BUTTON */}

                                    <div className="
                                        flex
                                        justify-end
                                        gap-3
                                        mt-6
                                    ">


                                        <button

                                            onClick={
                                                closeImportModal
                                            }

                                            className="
                                                px-5
                                                py-3
                                                rounded-xl
                                                border
                                                border-gray-200
                                                text-sm
                                                font-bold
                                            "

                                        >

                                            Cancel

                                        </button>


                                        <button

                                            onClick={
                                                confirmImport
                                            }

                                            disabled={
                                                importing ||
                                                importPreview.validCount ===
                                                0
                                            }

                                            className="
                                                flex
                                                items-center
                                                gap-2
                                                px-5
                                                py-3
                                                rounded-xl
                                                bg-[#175c2e]
                                                hover:bg-[#114521]
                                                text-white
                                                text-sm
                                                font-bold
                                                disabled:opacity-50
                                            "

                                        >

                                            {importing && (

                                                <Loader2
                                                    className="
                                                        w-4
                                                        h-4
                                                        animate-spin
                                                    "
                                                />

                                            )}

                                            Import
                                            {" "}
                                            {
                                                importPreview.validCount
                                            }
                                            {" "}
                                            Products

                                        </button>

                                    </div>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}


// ========================================
// INPUT
// ========================================

function Input({
    label,
    name,
    value,
    onChange,
    type = "text",
    required = false
}) {

    return (

        <div>

            <label className="
                block
                text-xs
                font-bold
                text-gray-600
                mb-2
            ">

                {label}

            </label>


            <input

                type={type}

                name={name}

                value={value}

                onChange={onChange}

                required={required}

                className="
                    w-full
                    border
                    border-gray-200
                    rounded-xl
                    px-4
                    py-3
                    outline-none
                    focus:border-green-600
                    text-sm
                "

            />

        </div>

    );

}


// ========================================
// SELECT
// ========================================

function SelectInput({
    label,
    name,
    value,
    onChange,
    options
}) {

    return (

        <div>

            <label className="
                block
                text-xs
                font-bold
                text-gray-600
                mb-2
            ">

                {label}

            </label>


            <select

                name={name}

                value={value}

                onChange={onChange}

                className="
                    w-full
                    border
                    border-gray-200
                    rounded-xl
                    px-4
                    py-3
                    outline-none
                    bg-white
                    text-sm
                    focus:border-green-600
                "

            >

                {options.map(
                    (option) => (

                        <option

                            key={
                                option.value
                            }

                            value={
                                option.value
                            }

                        >

                            {
                                option.label
                            }

                        </option>

                    )
                )}

            </select>

        </div>

    );

}


// ========================================
// STAT CARD
// ========================================

function StatCard({
    title,
    value
}) {

    return (

        <div className="
            bg-white
            border
            border-gray-200
            rounded-2xl
            p-5
        ">

            <p className="
                text-xs
                font-bold
                text-gray-400
                uppercase
            ">

                {title}

            </p>


            <p className="
                text-2xl
                font-extrabold
                text-gray-900
                mt-2
            ">

                {value}

            </p>

        </div>

    );

}


// ========================================
// IMPORT STAT
// ========================================

function ImportStat({
    title,
    value,
    success,
    danger
}) {

    let className =

        success

            ? "border-green-200 bg-green-50 text-green-700"

            : danger

                ? "border-red-200 bg-red-50 text-red-700"

                : "border-gray-200 bg-gray-50 text-gray-700";


    return (

        <div className={`
            border
            rounded-2xl
            p-5
            ${className}
        `}>

            <p className="
                text-xs
                font-bold
                uppercase
            ">

                {title}

            </p>


            <p className="
                text-2xl
                font-extrabold
                mt-2
            ">

                {value}

            </p>

        </div>

    );

}