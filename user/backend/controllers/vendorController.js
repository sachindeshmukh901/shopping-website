const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const XLSX = require("xlsx");

// ========================================
// ALLOWED PRODUCT SIZES
// ========================================

const ALLOWED_SIZES = [
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
// PARSE + VALIDATE SIZES PAYLOAD
// Accepts either a JSON string (from multipart
// form-data) or an already-parsed array.
// Returns { error } or { sizes: [{size, stock}] }
// ========================================

function parseSizesInput(rawSizes) {

    if (
        rawSizes === undefined ||
        rawSizes === null ||
        rawSizes === ""
    ) {

        return { sizes: [] };

    }

    let sizesArray = rawSizes;

    if (typeof rawSizes === "string") {

        try {

            sizesArray = JSON.parse(rawSizes);

        }

        catch (e) {

            return {
                error: "Sizes must be valid JSON, e.g. [{\"size\":\"M\",\"stock\":10}]"
            };

        }

    }

    if (!Array.isArray(sizesArray)) {

        return {
            error: "Sizes must be an array"
        };

    }

    let cleanSizes = [];
    let seen = new Set();

    for (let entry of sizesArray) {

        let size =
            (entry?.size || "").toString().trim();

        let stock =
            Number(entry?.stock);

        if (!size) {
            continue;
        }

        if (!ALLOWED_SIZES.includes(size)) {

            return {
                error: `Invalid size "${size}". Allowed sizes: ${ALLOWED_SIZES.join(", ")}`
            };

        }

        if (
            isNaN(stock) ||
            !Number.isInteger(stock) ||
            stock < 0
        ) {

            return {
                error: `Stock for size "${size}" must be a non-negative integer`
            };

        }

        if (seen.has(size)) {
            continue;
        }

        seen.add(size);

        cleanSizes.push({ size, stock });

    }

    return { sizes: cleanSizes };

}


// ========================================
// SAVE (REPLACE) SIZES FOR A PRODUCT
// ========================================

async function saveProductSizes(productId, sizes) {

    await db.promise().query(
        `DELETE FROM product_sizes WHERE product_id = ?`,
        [productId]
    );

    if (!sizes || sizes.length === 0) {
        return;
    }

    let values = sizes.map((s) => [
        productId,
        s.size,
        s.stock
    ]);

    await db.promise().query(
        `INSERT INTO product_sizes (product_id, size, stock) VALUES ?`,
        [values]
    );

}


// ========================================
// FETCH SIZES FOR A LIST OF PRODUCT IDS
// Returns { [product_id]: [{size, stock}] }
// ========================================

async function fetchSizesForProducts(productIds) {

    if (!productIds || productIds.length === 0) {
        return {};
    }

    let [rows] = await db.promise().query(
        `SELECT product_id, size, stock
         FROM product_sizes
         WHERE product_id IN (?)
         ORDER BY size`,
        [productIds]
    );

    let map = {};

    for (let row of rows) {

        if (!map[row.product_id]) {
            map[row.product_id] = [];
        }

        map[row.product_id].push({
            size: row.size,
            stock: row.stock
        });

    }

    return map;

}
// ========================================
// VENDOR REGISTER
// ========================================

exports.registerVendor = async (req, res) => {

    try {

        let {
            shop_name,
            owner_name,
            email,
            phone,
            password,
            gst_number,
            address,
            city,
            state,
            pincode
        } = req.body;

        // ========================================
        // VALIDATION
        // ========================================

        if (
            !shop_name ||
            !owner_name ||
            !email ||
            !phone ||
            !password
        ) {

            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });

        }

        // ========================================
        // CHECK EMAIL
        // ========================================

        let [emailResult] = await db.promise().query(

            "SELECT vendor_id FROM vendors WHERE email = ?",

            [email]

        );

        if (emailResult.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Vendor email already registered"
            });

        }

        // ========================================
        // CHECK PHONE
        // ========================================

        let [phoneResult] = await db.promise().query(

            "SELECT vendor_id FROM vendors WHERE phone = ?",

            [phone]

        );

        if (phoneResult.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Phone number already registered"
            });

        }

        // ========================================
        // CHECK GST
        // ========================================

        if (gst_number) {

            let [gstResult] = await db.promise().query(

                "SELECT vendor_id FROM vendors WHERE gst_number = ?",

                [gst_number]

            );

            if (gstResult.length > 0) {

                return res.status(409).json({
                    success: false,
                    message: "GST number already registered"
                });

            }

        }

        // ========================================
        // HASH PASSWORD
        // ========================================

        let hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // ========================================
        // INSERT VENDOR
        // ========================================

        let [result] = await db.promise().query(

            `INSERT INTO vendors
            (
                shop_name,
                owner_name,
                email,
                phone,
                password,
                gst_number,
                address,
                city,
                state,
                pincode,
                joined_date,
                status
            )
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'Pending')`,

            [
                shop_name,
                owner_name,
                email,
                phone,
                hashedPassword,
                gst_number || null,
                address || null,
                city || null,
                state || null,
                pincode || null
            ]

        );

        // ========================================
        // SUCCESS RESPONSE
        // ========================================

        return res.status(201).json({

            success: true,

            message:
                "Vendor registered successfully. Waiting for admin approval.",

            vendor: {

                vendor_id: result.insertId,

                shop_name: shop_name,

                owner_name: owner_name,

                email: email,

                status: "Pending"

            }

        });

    }

    catch (error) {

        console.error(
            "Vendor Registration Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Vendor registration failed",

            error: error.message

        });

    }

};

// ===============================
// VENDOR LOGIN
// ===============================

exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });

        }

        // Find vendor
        const [vendors] = await db.promise().query(
            "SELECT * FROM vendors WHERE email = ?",
            [email]
        );

        if (vendors.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });

        }

        const vendor = vendors[0];


        // ===============================
        // CHECK PASSWORD
        // ===============================

        const passwordMatch = await bcrypt.compare(
            password,
            vendor.password
        );

        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });

        }


        // ===============================
        // CHECK ADMIN APPROVAL
        // ===============================

        if (vendor.status === "Pending") {

            return res.status(403).json({
                success: false,
                message: "Your account is waiting for admin approval"
            });

        }


        if (vendor.status === "Rejected") {

            return res.status(403).json({
                success: false,
                message: "Your vendor account has been rejected"
            });

        }


        if (vendor.status !== "Approved") {

            return res.status(403).json({
                success: false,
                message: "Vendor account is not active"
            });

        }


        // ===============================
        // CREATE JWT
        // ===============================

        const token = jwt.sign(
            {
                vendor_id: vendor.vendor_id,
                email: vendor.email,
                role: "vendor"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );


        // ===============================
        // SUCCESS
        // ===============================

        return res.status(200).json({

            success: true,

            message: "Vendor login successful",

            token: token,

            vendor: {

                vendor_id: vendor.vendor_id,

                shop_name: vendor.shop_name,

                owner_name: vendor.owner_name,

                email: vendor.email,

                phone: vendor.phone,

                status: vendor.status

            }

        });

    }

    catch (error) {

        console.log("Vendor Login Error:", error);

        return res.status(500).json({

            success: false,

            message: "Vendor login failed",

            error: error.message

        });

    }

};


// ===============================
// GET VENDOR PROFILE
// ===============================

exports.getProfile = async (req, res) => {

    try {

        const vendorId = req.vendor.vendor_id;

        const [vendors] = await db.promise().query(
            `SELECT
                vendor_id,
                shop_name,
                owner_name,
                email,
                phone,
                gst_number,
                address,
                city,
                state,
                pincode,
                profile_image,
                rating,
                total_products,
                total_sales,
                joined_date,
                status
             FROM vendors
             WHERE vendor_id = ?`,
            [vendorId]
        );

        if (vendors.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });

        }

        const vendor = vendors[0];

        // Important:
        // Admin may suspend/reject vendor after login
        if (vendor.status !== "Approved") {

            return res.status(403).json({
                success: false,
                message: "Vendor account is not approved"
            });

        }

        return res.status(200).json({
            success: true,
            vendor: vendor
        });

    }

    catch (error) {

        console.log("Vendor Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch vendor profile",
            error: error.message
        });

    }

};

// ========================================
// GET VENDOR DASHBOARD STATS
// ========================================

exports.getDashboardStats = async (req, res) => {

    try {

        // Logged-in vendor id comes from JWT
        let vendorId = req.vendor.vendor_id;

        // ========================================
        // GET VENDOR DATA
        // ========================================

        let [vendors] = await db.promise().query(
            `SELECT
                vendor_id,
                shop_name,
                owner_name,
                rating,
                total_products,
                total_sales,
                status
             FROM vendors
             WHERE vendor_id = ?`,
            [vendorId]
        );

        if (vendors.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });

        }

        let vendor = vendors[0];

        // ========================================
        // CHECK VENDOR STATUS
        // ========================================

        if (vendor.status !== "Approved") {

            return res.status(403).json({
                success: false,
                message: "Vendor account is not approved"
            });

        }

        // ========================================
        // DASHBOARD RESPONSE
        // ========================================

        return res.status(200).json({

            success: true,

            stats: {

                total_products:
                    Number(vendor.total_products) || 0,

                total_sales:
                    Number(vendor.total_sales) || 0,

                rating:
                    Number(vendor.rating) || 0

            },

            vendor: {

                vendor_id:
                    vendor.vendor_id,

                shop_name:
                    vendor.shop_name,

                owner_name:
                    vendor.owner_name

            }

        });

    }

    catch (error) {

        console.log(
            "Vendor Dashboard Stats Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch vendor dashboard stats",

            error:
                error.message

        });

    }

};


// ========================================
// GET LOGGED-IN VENDOR PRODUCTS
// ========================================

exports.getMyProducts = async (req, res) => {

    try {

        // Vendor ID comes from verified JWT
        let vendorId = req.vendor.vendor_id;


        // ========================================
        // CHECK VENDOR
        // ========================================

        let [vendors] = await db.promise().query(
            `SELECT vendor_id, status
             FROM vendors
             WHERE vendor_id = ?`,
            [vendorId]
        );


        if (vendors.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });

        }


        if (vendors[0].status !== "Approved") {

            return res.status(403).json({
                success: false,
                message: "Vendor account is not approved"
            });

        }


        // ========================================
        // GET ONLY THIS VENDOR'S PRODUCTS
        // ========================================

        let [products] = await db.promise().query(
            `SELECT
                p.product_id,
                p.vendor_id,
                p.category_id,
                p.product_name,
                p.description,
                p.brand,
                p.fabric,
                p.color,
                p.gender,
                p.price,
                p.discount,
                p.stock,
                p.image,
                p.rating,
                p.created_at,
                p.status
             FROM products p
             WHERE p.vendor_id = ?
             ORDER BY p.product_id DESC`,
            [vendorId]
        );


        // ========================================
        // ATTACH SIZES
        // ========================================

        let sizesMap =
            await fetchSizesForProducts(
                products.map((p) => p.product_id)
            );

        let productsWithSizes =
            products.map((p) => ({
                ...p,
                sizes: sizesMap[p.product_id] || []
            }));


        // ========================================
        // RESPONSE
        // ========================================

        return res.status(200).json({

            success: true,

            total: productsWithSizes.length,

            products: productsWithSizes

        });

    }

    catch (error) {

        console.log(
            "Get Vendor Products Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch vendor products",

            error:
                error.message

        });

    }

};


// ========================================
// ADD NEW VENDOR PRODUCT
// ========================================

exports.addProduct = async (req, res) => {

    try {

        // Logged-in vendor ID from JWT
        let vendorId = req.vendor.vendor_id;

        let {
            category_id,
            product_name,
            description,
            brand,
            fabric,
            color,
            gender,
            price,
            discount,
            stock,
            image,
            sizes
        } = req.body;


        // ========================================
        // VALIDATE SIZES
        // ========================================

        let parsedSizes =
            parseSizesInput(sizes);

        if (parsedSizes.error) {

            return res.status(400).json({
                success: false,
                message: parsedSizes.error
            });

        }


        // ========================================
        // REQUIRED FIELD VALIDATION
        // ========================================

        if (
            !category_id ||
            !product_name ||
            price === undefined ||
            price === null
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Category, product name and price are required"
            });

        }


        // ========================================
        // VALIDATE PRICE
        // ========================================

        if (
            isNaN(price) ||
            Number(price) < 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Price must be a valid positive number"
            });

        }


        // ========================================
        // VALIDATE DISCOUNT
        // ========================================

        let productDiscount =
            discount === undefined ||
                discount === null ||
                discount === ""
                ? 0
                : Number(discount);


        if (
            isNaN(productDiscount) ||
            productDiscount < 0 ||
            productDiscount > 100
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Discount must be between 0 and 100"
            });

        }


        // ========================================
        // VALIDATE STOCK
        // ========================================

        let productStock =
            stock === undefined ||
                stock === null ||
                stock === ""
                ? 0
                : Number(stock);


        if (
            !Number.isInteger(productStock) ||
            productStock < 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Stock must be a valid non-negative integer"
            });

        }


        // If sizes were provided, the total product stock is
        // derived from the sum of each size's stock, so the two
        // never go out of sync.

        if (parsedSizes.sizes.length > 0) {

            productStock =
                parsedSizes.sizes.reduce(
                    (sum, s) => sum + s.stock,
                    0
                );

        }


        // ========================================
        // VALIDATE GENDER
        // ========================================

        let allowedGenders = [
            "Men",
            "Women",
            "Kids",
            "Unisex"
        ];


        if (
            gender &&
            !allowedGenders.includes(gender)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Gender must be Men, Women, Kids or Unisex"
            });

        }


        // ========================================
        // CHECK VENDOR
        // ========================================

        let [vendors] =
            await db.promise().query(
                `SELECT vendor_id, status
                 FROM vendors
                 WHERE vendor_id = ?`,
                [vendorId]
            );


        if (vendors.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });

        }


        if (
            vendors[0].status !== "Approved"
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Only approved vendors can add products"
            });

        }


        // ========================================
        // CHECK CATEGORY EXISTS
        // ========================================

        let [categories] =
            await db.promise().query(
                `SELECT category_id
                 FROM categories
                 WHERE category_id = ?`,
                [category_id]
            );


        if (categories.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Category not found"
            });

        }


        // ========================================
        // INSERT PRODUCT
        // ========================================

        let imagePath = req.file ? `/uploads/products/${req.file.filename}` : (image || null);

        let [result] = await db.promise().query(
            `INSERT INTO products
                        (
                            vendor_id,
                            category_id,
                            product_name,
                            description,
                            brand,
                            fabric,
                            color,
                            gender,
                            price,
                            discount,
                            stock,
                            image,
                            rating,
                            status
                        )
                        VALUES
                        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.0, 'Active')`,
            [
                vendorId,
                category_id,
                product_name.trim(),
                description || null,
                brand || null,
                fabric || null,
                color || null,
                gender || null,
                Number(price),
                productDiscount,
                productStock,
                imagePath
            ]
        );


        // ========================================
        // SAVE SIZES
        // ========================================

        await saveProductSizes(
            result.insertId,
            parsedSizes.sizes
        );


        // ========================================
        // UPDATE VENDOR PRODUCT COUNT
        // ========================================

        let [countResult] =
            await db.promise().query(
                `SELECT COUNT(*) AS total
                 FROM products
                 WHERE vendor_id = ?`,
                [vendorId]
            );


        await db.promise().query(
            `UPDATE vendors
             SET total_products = ?
             WHERE vendor_id = ?`,
            [
                countResult[0].total,
                vendorId
            ]
        );


        // ========================================
        // GET CREATED PRODUCT
        // ========================================

        let [products] =
            await db.promise().query(
                `SELECT *
                 FROM products
                 WHERE product_id = ?
                 AND vendor_id = ?`,
                [
                    result.insertId,
                    vendorId
                ]
            );


        // ========================================
        // SUCCESS RESPONSE
        // ========================================

        return res.status(201).json({

            success: true,

            message:
                "Product added successfully",

            product: {
                ...products[0],
                sizes: parsedSizes.sizes
            }

        });

    }

    catch (error) {

        console.log(
            "Add Vendor Product Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to add product",

            error:
                error.message

        });

    }

};


// ========================================
// UPDATE VENDOR PRODUCT
// ========================================

exports.updateProduct = async (req, res) => {

    try {

        let vendorId = req.vendor.vendor_id;
        let productId = req.params.product_id;

        let {
            category_id,
            product_name,
            description,
            brand,
            fabric,
            color,
            gender,
            price,
            discount,
            stock,
            image,
            status,
            sizes
        } = req.body;


        // ========================================
        // VALIDATE SIZES
        // ========================================

        let parsedSizes =
            parseSizesInput(sizes);

        if (parsedSizes.error) {

            return res.status(400).json({
                success: false,
                message: parsedSizes.error
            });

        }

        let sizesProvided =
            sizes !== undefined &&
            sizes !== null &&
            sizes !== "";


        // ========================================
        // CHECK PRODUCT OWNERSHIP
        // ========================================

        let [products] = await db.promise().query(
            `SELECT *
             FROM products
             WHERE product_id = ?
             AND vendor_id = ?`,
            [
                productId,
                vendorId
            ]
        );


        if (products.length === 0) {

            return res.status(404).json({
                success: false,
                message:
                    "Product not found or you do not have permission to edit it"
            });

        }


        let currentProduct = products[0];


        // ========================================
        // CHECK CATEGORY
        // ========================================

        let finalCategoryId =
            category_id !== undefined
                ? category_id
                : currentProduct.category_id;


        let [categories] = await db.promise().query(
            `SELECT category_id
             FROM categories
             WHERE category_id = ?`,
            [finalCategoryId]
        );


        if (categories.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Category not found"
            });

        }


        // ========================================
        // FINAL VALUES
        // ========================================

        let finalProductName =
            product_name !== undefined
                ? product_name.trim()
                : currentProduct.product_name;


        let finalDescription =
            description !== undefined
                ? description
                : currentProduct.description;


        let finalBrand =
            brand !== undefined
                ? brand
                : currentProduct.brand;


        let finalFabric =
            fabric !== undefined
                ? fabric
                : currentProduct.fabric;


        let finalColor =
            color !== undefined
                ? color
                : currentProduct.color;


        let finalGender =
            gender !== undefined
                ? gender
                : currentProduct.gender;


        let finalPrice =
            price !== undefined
                ? Number(price)
                : Number(currentProduct.price);


        let finalDiscount =
            discount !== undefined
                ? Number(discount)
                : Number(currentProduct.discount);


        let finalStock =
            stock !== undefined
                ? Number(stock)
                : Number(currentProduct.stock);


        // If sizes are being updated, total stock is always
        // derived from the sum of each size's stock.

        if (sizesProvided && parsedSizes.sizes.length > 0) {

            finalStock =
                parsedSizes.sizes.reduce(
                    (sum, s) => sum + s.stock,
                    0
                );

        }


        let finalImage =
            req.file
                ? `/uploads/products/${req.file.filename}`
                : (
                    image !== undefined
                        ? image
                        : currentProduct.image
                );


        let finalStatus =
            status !== undefined
                ? status
                : currentProduct.status;


        // ========================================
        // VALIDATION
        // ========================================

        if (!finalProductName) {

            return res.status(400).json({
                success: false,
                message: "Product name is required"
            });

        }


        if (
            isNaN(finalPrice) ||
            finalPrice < 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid product price"
            });

        }


        if (
            isNaN(finalDiscount) ||
            finalDiscount < 0 ||
            finalDiscount > 100
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Discount must be between 0 and 100"
            });

        }


        if (
            !Number.isInteger(finalStock) ||
            finalStock < 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Stock must be a non-negative integer"
            });

        }


        let allowedGenders = [
            "Men",
            "Women",
            "Kids",
            "Unisex"
        ];


        if (
            finalGender &&
            !allowedGenders.includes(finalGender)
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid gender"
            });

        }


        let allowedStatuses = [
            "Active",
            "Inactive"
        ];


        if (
            !allowedStatuses.includes(finalStatus)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Status must be Active or Inactive"
            });

        }


        // ========================================
        // UPDATE PRODUCT
        // ========================================

        await db.promise().query(

            `UPDATE products
             SET
                category_id = ?,
                product_name = ?,
                description = ?,
                brand = ?,
                fabric = ?,
                color = ?,
                gender = ?,
                price = ?,
                discount = ?,
                stock = ?,
                image = ?,
                status = ?
             WHERE product_id = ?
             AND vendor_id = ?`,

            [
                finalCategoryId,
                finalProductName,
                finalDescription,
                finalBrand,
                finalFabric,
                finalColor,
                finalGender,
                finalPrice,
                finalDiscount,
                finalStock,
                finalImage,
                finalStatus,
                productId,
                vendorId
            ]

        );


        // ========================================
        // SAVE SIZES (only if sizes key was sent)
        // ========================================

        if (sizesProvided) {

            await saveProductSizes(
                productId,
                parsedSizes.sizes
            );

        }


        // ========================================
        // GET UPDATED PRODUCT
        // ========================================

        let [updatedProducts] =
            await db.promise().query(
                `SELECT *
                 FROM products
                 WHERE product_id = ?
                 AND vendor_id = ?`,
                [
                    productId,
                    vendorId
                ]
            );


        let [currentSizes] =
            await db.promise().query(
                `SELECT size, stock
                 FROM product_sizes
                 WHERE product_id = ?
                 ORDER BY size`,
                [productId]
            );


        return res.status(200).json({

            success: true,

            message:
                "Product updated successfully",

            product: {
                ...updatedProducts[0],
                sizes: currentSizes
            }

        });

    }

    catch (error) {

        console.log(
            "Update Product Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update product",

            error:
                error.message

        });

    }

};

// ========================================
// DELETE VENDOR PRODUCT
// ========================================

exports.deleteProduct = async (req, res) => {

    try {

        let vendorId =
            req.vendor.vendor_id;

        let productId =
            req.params.product_id;


        // ========================================
        // CHECK PRODUCT + OWNERSHIP
        // ========================================

        let [products] =
            await db.promise().query(
                `SELECT
                    product_id,
                    product_name
                 FROM products
                 WHERE product_id = ?
                 AND vendor_id = ?`,
                [
                    productId,
                    vendorId
                ]
            );


        if (products.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Product not found or you do not have permission to delete it"

            });

        }


        // ========================================
        // DELETE PRODUCT
        // ========================================
        //
        // A product can't always be hard-deleted —
        // if it has ever been ordered or reviewed,
        // MySQL blocks the delete with a foreign key
        // constraint error (since that history must
        // be preserved). In that case we fall back to
        // clearing only the SAFE references (cart /
        // wishlist — just user selections, not
        // historical data) and deactivating the
        // product instead of destroying order history.
        // ========================================

        try {

            await db.promise().query(
                `DELETE FROM products
                 WHERE product_id = ?
                 AND vendor_id = ?`,
                [
                    productId,
                    vendorId
                ]
            );

        }

        catch (deleteError) {

            let isForeignKeyError =
                deleteError.code === "ER_ROW_IS_REFERENCED_2" ||
                deleteError.code === "ER_ROW_IS_REFERENCED" ||
                deleteError.errno === 1451;


            if (!isForeignKeyError) {

                throw deleteError;

            }


            // ==================================================
            // SAFE CLEANUP (cart / wishlist only)
            // ==================================================

            await db.promise().query(
                `DELETE FROM cart_items
                 WHERE product_id = ?`,
                [productId]
            );

            await db.promise().query(
                `DELETE FROM wishlist
                 WHERE product_id = ?`,
                [productId]
            );


            // ==================================================
            // SOFT DELETE (keep order/review history intact)
            // ==================================================

            await db.promise().query(
                `UPDATE products
                 SET status = 'Inactive'
                 WHERE product_id = ?
                 AND vendor_id = ?`,
                [
                    productId,
                    vendorId
                ]
            );


            // ==================================================
            // RECALCULATE PRODUCT COUNT (active only)
            // ==================================================

            let [countResult] =
                await db.promise().query(
                    `SELECT COUNT(*) AS total
                     FROM products
                     WHERE vendor_id = ?
                     AND status = 'Active'`,
                    [vendorId]
                );

            await db.promise().query(
                `UPDATE vendors
                 SET total_products = ?
                 WHERE vendor_id = ?`,
                [
                    countResult[0].total,
                    vendorId
                ]
            );


            return res.status(200).json({

                success: true,

                soft_deleted: true,

                message:
                    "This product has past orders or reviews, " +
                    "so it can't be permanently deleted. It has " +
                    "been deactivated and removed from your store instead.",

                deleted_product: {

                    product_id:
                        products[0].product_id,

                    product_name:
                        products[0].product_name

                }

            });

        }


        // ========================================
        // RECALCULATE PRODUCT COUNT
        // ========================================

        let [countResult] =
            await db.promise().query(
                `SELECT COUNT(*) AS total
                 FROM products
                 WHERE vendor_id = ?`,
                [vendorId]
            );


        await db.promise().query(
            `UPDATE vendors
             SET total_products = ?
             WHERE vendor_id = ?`,
            [
                countResult[0].total,
                vendorId
            ]
        );


        // ========================================
        // SUCCESS
        // ========================================

        return res.status(200).json({

            success: true,

            message:
                "Product deleted successfully",

            deleted_product: {

                product_id:
                    products[0].product_id,

                product_name:
                    products[0].product_name

            }

        });

    }

    catch (error) {

        console.log(
            "Delete Product Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to delete product",

            error:
                error.message

        });

    }

};

exports.logout = async (req, res) => {

    try {

        let token = req.token;

        let vendorId =
            req.vendor.vendor_id;

        let expiresAt =
            new Date(
                req.vendor.exp * 1000
            );


        let [existingToken] =
            await db.promise().query(

                `SELECT blacklist_id
                 FROM vendor_token_blacklist
                 WHERE token = ?`,

                [token]

            );


        if (existingToken.length === 0) {

            await db.promise().query(

                `INSERT INTO vendor_token_blacklist
                (
                    vendor_id,
                    token,
                    expires_at
                )
                VALUES (?, ?, ?)`,

                [
                    vendorId,
                    token,
                    expiresAt
                ]

            );

        }


        return res.status(200).json({

            success: true,

            message:
                "Vendor logged out successfully"

        });

    }

    catch (error) {

        console.error(
            "Vendor Logout Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Vendor logout failed",

            error: error.message

        });

    }

};

// ========================================
// DELETE VENDOR ACCOUNT
// ========================================

exports.deleteAccount = async (req, res) => {

    try {

        let vendorId =
            req.vendor.vendor_id;

        // Check Vendor

        let [vendors] =
            await db.promise().query(

                `SELECT
                    vendor_id,
                    shop_name,
                    email
                 FROM vendors
                 WHERE vendor_id = ?`,

                [vendorId]

            );


        if (vendors.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Vendor not found"

            });

        }


        // Delete Products First

        await db.promise().query(

            `DELETE FROM products
             WHERE vendor_id = ?`,

            [vendorId]

        );


        // Delete Vendor

        await db.promise().query(

            `DELETE FROM vendors
             WHERE vendor_id = ?`,

            [vendorId]

        );


        return res.status(200).json({

            success: true,

            message:
                "Vendor account deleted successfully",

            vendor: {

                vendor_id:
                    vendors[0].vendor_id,

                shop_name:
                    vendors[0].shop_name,

                email:
                    vendors[0].email

            }

        });

    }

    catch (error) {

        console.log(
            "Delete Vendor Account Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to delete vendor account",

            error:
                error.message

        });

    }

};

// ========================================
// GET VENDOR ORDERS (ONLY VENDOR'S PRODUCTS)
// ========================================
exports.getVendorOrders = async (req, res) => {
    try {
        let vendorId = req.vendor.vendor_id;

        let [orders] = await db.promise().query(
            `SELECT 
                o.order_id,
                o.order_date,
                o.order_status,
                o.payment_method,
                oi.order_item_id,
                oi.quantity,
                oi.price,
                oi.subtotal,
                p.product_id,
                p.product_name,
                p.image,
                u.full_name as customer_name,
                u.email as customer_email,
                ua.address_line, ua.city, ua.state, ua.pincode
             FROM order_items oi
             JOIN products p ON oi.product_id = p.product_id
             JOIN orders o ON oi.order_id = o.order_id
             JOIN users u ON o.user_id = u.user_id
             LEFT JOIN user_address ua ON o.address_id = ua.address_id
             WHERE p.vendor_id = ?
             ORDER BY o.order_id DESC`,
            [vendorId]
        );

        return res.status(200).json({
            success: true,
            orders: orders
        });
    } catch (error) {
        console.error("Get Vendor Orders Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch vendor orders",
            error: error.message
        });
    }
};

// ========================================
// UPDATE ORDER STATUS (VENDOR)
// ========================================
exports.updateOrderStatus = async (req, res) => {
    try {
        let vendorId = req.vendor.vendor_id;
        let { order_id } = req.params;
        let { order_status } = req.body;

        if (!order_status) {
            return res.status(400).json({ success: false, message: "order_status is required" });
        }

        // Check if vendor has products in this order
        let [items] = await db.promise().query(
            `SELECT oi.order_item_id FROM order_items oi
             JOIN products p ON oi.product_id = p.product_id
             WHERE oi.order_id = ? AND p.vendor_id = ?`,
            [order_id, vendorId]
        );

        if (items.length === 0) {
            return res.status(403).json({ success: false, message: "Unauthorized to update this order" });
        }

        await db.promise().query(
            "UPDATE orders SET order_status = ? WHERE order_id = ?",
            [order_status, order_id]
        );

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully"
        });
    } catch (error) {
        console.error("Update Vendor Order Status Error:", error);
        return res.status(500).json({ success: false, message: "Failed to update order status" });
    }
};

// ========================================
// GET VENDOR EARNINGS & PAYOUTS
// ========================================
exports.getVendorEarnings = async (req, res) => {
    try {
        let vendorId = req.vendor.vendor_id;

        let [earnings] = await db.promise().query(
            "SELECT * FROM vendor_earnings WHERE vendor_id = ?",
            [vendorId]
        );

        let [payouts] = await db.promise().query(
            "SELECT * FROM vendor_payouts WHERE vendor_id = ? ORDER BY payout_id DESC",
            [vendorId]
        );

        return res.status(200).json({
            success: true,
            earnings: earnings[0] || { total_sales: 0, commission: 0, net_earning: 0 },
            payouts: payouts
        });
    } catch (error) {
        console.error("Get Vendor Earnings Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch vendor earnings" });
    }
};

// ========================================
// SUBMIT PAYOUT REQUEST
// ========================================
exports.requestPayout = async (req, res) => {
    try {
        let vendorId = req.vendor.vendor_id;
        let { amount } = req.body;

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({ success: false, message: "Valid payout amount is required" });
        }

        const [result] = await db.promise().query(
            "INSERT INTO vendor_payouts (vendor_id, amount, payout_date, payout_status) VALUES (?, ?, CURDATE(), 'Pending')",
            [vendorId, Number(amount)]
        );

        return res.status(201).json({
            success: true,
            message: "Payout request submitted successfully",
            payout_id: result.insertId
        });
    } catch (error) {
        console.error("Vendor Request Payout Error:", error);
        return res.status(500).json({ success: false, message: "Failed to submit payout request" });
    }
};

// ========================================
// GET VENDOR REVIEWS
// ========================================
exports.getVendorReviews = async (req, res) => {
    try {
        let vendorId = req.vendor.vendor_id;

        let [reviews] = await db.promise().query(
            `SELECT r.*, p.product_name, p.image, u.full_name as reviewer_name
             FROM reviews r
             JOIN products p ON r.product_id = p.product_id
             LEFT JOIN users u ON r.user_id = u.user_id
             WHERE p.vendor_id = ?
             ORDER BY r.review_date DESC`,
            [vendorId]
        );

        return res.status(200).json({
            success: true,
            reviews: reviews
        });
    } catch (error) {
        console.error("Get Vendor Reviews Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch vendor reviews" });
    }
};

// ========================================
// GET VENDOR HEATMAP
// ========================================
//
// Shows where THIS vendor's orders and customers
// are coming from, using each order's shipping
// address (city/state/pincode) so it can be
// geocoded and plotted on a map by the frontend.
// ========================================
exports.getVendorHeatMap = async (req, res) => {
    try {

        let vendorId =
            req.vendor.vendor_id;


        // ==================================================
        // ORDER LOCATIONS (real orders + shipping address)
        // ==================================================

        let [orderLocations] =
            await db.promise().query(
                `SELECT

                    ov.order_vendor_id,

                    ov.order_id,

                    ov.vendor_total,

                    ov.vendor_status,

                    o.order_date,

                    o.payment_method,

                    u.user_id,

                    u.full_name,

                    u.email,

                    ua.address_line,

                    ua.city,

                    ua.state,

                    ua.pincode

                FROM order_vendor ov

                INNER JOIN orders o
                    ON ov.order_id = o.order_id

                LEFT JOIN users u
                    ON o.user_id = u.user_id

                LEFT JOIN user_address ua
                    ON o.address_id = ua.address_id

                WHERE
                    ov.vendor_id = ?
                    AND ua.city IS NOT NULL
                    AND TRIM(ua.city) != ''

                ORDER BY ov.order_id DESC

                LIMIT 300`,
                [vendorId]
            );


        // ==================================================
        // STATS
        // ==================================================

        let totalOrders =
            orderLocations.length;

        let uniqueCustomers =
            new Set(
                orderLocations
                    .filter((item) => item.user_id)
                    .map((item) => item.user_id)
            ).size;

        let uniqueCities =
            new Set(
                orderLocations
                    .map((item) =>
                        `${item.city || ""}-${item.state || ""}`
                            .toLowerCase()
                    )
            ).size;

        let totalRevenue =
            orderLocations.reduce(
                (sum, item) =>
                    sum + Number(item.vendor_total || 0),
                0
            );


        return res.status(200).json({

            success: true,

            stats: {

                totalOrders:
                    totalOrders,

                uniqueCustomers:
                    uniqueCustomers,

                uniqueCities:
                    uniqueCities,

                totalRevenue:
                    totalRevenue

            },

            orderLocations:
                orderLocations

        });

    } catch (error) {
        console.error("Get Vendor HeatMap Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch vendor heatmap data",
            error: error.message
        });
    }
};


// ======================================================
// BULK PRODUCT IMPORT - VALIDATE + INSERT
// ======================================================

exports.bulkImportProducts = async (req, res) => {

    try {

        // ========================================
        // CHECK FILE
        // ========================================

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message:
                    "Please upload an Excel or CSV file"

            });

        }


        // ========================================
        // GET VENDOR FROM JWT
        // ========================================

        let vendorId =
            req.vendor.vendor_id;


        // ========================================
        // CHECK VENDOR
        // ========================================

        let [vendors] =
            await db.promise().query(

                `SELECT
                    vendor_id,
                    status
                 FROM vendors
                 WHERE vendor_id = ?`,

                [vendorId]

            );


        if (vendors.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Vendor not found"

            });

        }


        if (vendors[0].status !== "Approved") {

            return res.status(403).json({

                success: false,

                message:
                    "Only approved vendors can import products"

            });

        }


        // ========================================
        // READ EXCEL
        // ========================================

        let workbook =
            XLSX.read(
                req.file.buffer,
                {
                    type: "buffer"
                }
            );


        // ========================================
        // GET FIRST SHEET
        // ========================================

        let sheetName =
            workbook.SheetNames[0];


        if (!sheetName) {

            return res.status(400).json({

                success: false,

                message:
                    "Excel file does not contain a worksheet"

            });

        }


        let worksheet =
            workbook.Sheets[sheetName];


        // ========================================
        // CONVERT TO JSON
        // ========================================

        let rows =
            XLSX.utils.sheet_to_json(
                worksheet,
                {
                    defval: ""
                }
            );


        // ========================================
        // EMPTY FILE
        // ========================================

        if (!rows.length) {

            return res.status(400).json({

                success: false,

                message:
                    "Excel file is empty"

            });

        }


        // ========================================
        // MAX ROW LIMIT
        // ========================================

        if (rows.length > 5000) {

            return res.status(400).json({

                success: false,

                message:
                    "Maximum 5000 products can be imported at once"

            });

        }


        // ========================================
        // ALLOWED GENDERS
        // ========================================

        let allowedGenders = [

            "Men",
            "Women",
            "Kids",
            "Unisex"

        ];


        // ========================================
        // ALLOWED STATUS
        // ========================================

        let allowedStatus = [

            "Active",
            "Inactive"

        ];


        // ========================================
        // VALIDATION RESULT
        // ========================================

        let validProducts = [];

        let errors = [];


        // ========================================
        // VALIDATE EACH ROW
        // ========================================

        for (
            let index = 0;
            index < rows.length;
            index++
        ) {

            let row = rows[index];

            let excelRow =
                index + 2;


            // ========================================
            // NORMALIZE VALUES
            // ========================================

            let productName =
                String(
                    row["Product Name"] ??
                    row["product_name"] ??
                    ""
                ).trim();


            let categoryId =
                String(
                    row["Category ID"] ??
                    row["category_id"] ??
                    ""
                ).trim();


            let description =
                String(
                    row["Description"] ??
                    row["description"] ??
                    ""
                ).trim();


            let brand =
                String(
                    row["Brand"] ??
                    row["brand"] ??
                    ""
                ).trim();


            let fabric =
                String(
                    row["Fabric"] ??
                    row["fabric"] ??
                    ""
                ).trim();


            let color =
                String(
                    row["Color"] ??
                    row["Colour"] ??
                    row["color"] ??
                    ""
                ).trim();


            let gender =
                String(
                    row["Gender"] ??
                    row["gender"] ??
                    ""
                ).trim();


            let price =
                row["Price"] ??
                row["price"];


            let discount =
                row["Discount"] ??
                row["discount"];


            let stock =
                row["Stock"] ??
                row["stock"];


            let image =
                String(
                    row["Image"] ??
                    row["image"] ??
                    ""
                ).trim();


            let status =
                String(
                    row["Status"] ??
                    row["status"] ??
                    "Active"
                ).trim();


            // ========================================
            // EMPTY ROW
            // ========================================

            let isEmptyRow =

                !productName &&
                !categoryId &&
                !description &&
                !brand &&
                !fabric &&
                !color &&
                !gender &&
                (price === "" ||
                    price === undefined ||
                    price === null) &&
                (stock === "" ||
                    stock === undefined ||
                    stock === null) &&
                !image;


            if (isEmptyRow) {

                continue;

            }


            let rowErrors = [];


            // ========================================
            // PRODUCT NAME
            // ========================================

            if (!productName) {

                rowErrors.push(
                    "Product Name is required"
                );

            }


            if (productName.length > 150) {

                rowErrors.push(
                    "Product Name cannot exceed 150 characters"
                );

            }


            // ========================================
            // CATEGORY
            // ========================================

            if (!categoryId) {

                rowErrors.push(
                    "Category ID is required"
                );

            }


            let categoryNumber =
                Number(categoryId);


            if (
                categoryId &&
                (
                    !Number.isInteger(categoryNumber) ||
                    categoryNumber <= 0
                )
            ) {

                rowErrors.push(
                    "Category ID must be a valid integer"
                );

            }


            // ========================================
            // PRICE
            // ========================================

            let numericPrice =
                Number(price);


            if (
                price === "" ||
                price === undefined ||
                price === null
            ) {

                rowErrors.push(
                    "Price is required"
                );

            }

            else if (
                !Number.isFinite(numericPrice) ||
                numericPrice < 0
            ) {

                rowErrors.push(
                    "Price must be a valid non-negative number"
                );

            }


            // ========================================
            // DISCOUNT
            // ========================================

            let numericDiscount =

                discount === "" ||
                    discount === undefined ||
                    discount === null

                    ? 0

                    : Number(discount);


            if (
                !Number.isFinite(numericDiscount) ||
                numericDiscount < 0 ||
                numericDiscount > 100
            ) {

                rowErrors.push(
                    "Discount must be between 0 and 100"
                );

            }


            // ========================================
            // STOCK
            // ========================================

            let numericStock =

                stock === "" ||
                    stock === undefined ||
                    stock === null

                    ? 0

                    : Number(stock);


            if (
                !Number.isInteger(numericStock) ||
                numericStock < 0
            ) {

                rowErrors.push(
                    "Stock must be a non-negative integer"
                );

            }


            // ========================================
            // GENDER
            // ========================================

            if (
                gender &&
                !allowedGenders.includes(gender)
            ) {

                rowErrors.push(
                    "Gender must be Men, Women, Kids or Unisex"
                );

            }


            // ========================================
            // STATUS
            // ========================================

            if (
                status &&
                !allowedStatus.includes(status)
            ) {

                rowErrors.push(
                    "Status must be Active or Inactive"
                );

            }


            // ========================================
            // TEXT LENGTH VALIDATION
            // ========================================

            if (brand.length > 100) {

                rowErrors.push(
                    "Brand cannot exceed 100 characters"
                );

            }


            if (fabric.length > 100) {

                rowErrors.push(
                    "Fabric cannot exceed 100 characters"
                );

            }


            if (color.length > 50) {

                rowErrors.push(
                    "Color cannot exceed 50 characters"
                );

            }


            if (image.length > 255) {

                rowErrors.push(
                    "Image path/URL cannot exceed 255 characters"
                );

            }


            // ========================================
            // CHECK CATEGORY
            // ========================================

            if (
                Number.isInteger(categoryNumber) &&
                categoryNumber > 0
            ) {

                let [categories] =
                    await db.promise().query(

                        `SELECT category_id
                         FROM categories
                         WHERE category_id = ?`,

                        [categoryNumber]

                    );


                if (categories.length === 0) {

                    rowErrors.push(
                        `Category ID ${categoryNumber} does not exist`
                    );

                }

            }


            // ========================================
            // STORE ERROR
            // ========================================

            if (rowErrors.length > 0) {

                errors.push({

                    row: excelRow,

                    product_name:
                        productName || "-",

                    errors: rowErrors

                });

                continue;

            }


            // ========================================
            // VALID PRODUCT
            // ========================================

            validProducts.push({

                category_id:
                    categoryNumber,

                product_name:
                    productName,

                description:
                    description || null,

                brand:
                    brand || null,

                fabric:
                    fabric || null,

                color:
                    color || null,

                gender:
                    gender || null,

                price:
                    numericPrice,

                discount:
                    numericDiscount,

                stock:
                    numericStock,

                image:
                    image || null,

                status:
                    status || "Active"

            });

        }


        // ========================================
        // PREVIEW MODE
        // ========================================

        let preview =
            String(req.body.preview) === "true";


        if (preview) {

            return res.status(200).json({

                success: true,

                preview: true,

                totalRows:
                    rows.length,

                validCount:
                    validProducts.length,

                errorCount:
                    errors.length,

                validProducts:
                    validProducts.slice(0, 100),

                errors:
                    errors.slice(0, 500)

            });

        }


        // ========================================
        // NOTHING VALID
        // ========================================

        if (!validProducts.length) {

            return res.status(400).json({

                success: false,

                message:
                    "No valid products found to import",

                totalRows:
                    rows.length,

                validCount: 0,

                errorCount:
                    errors.length,

                errors:
                    errors.slice(0, 500)

            });

        }


        // ========================================
        // INSERT VALID PRODUCTS
        // ========================================

        let connection =
            await db.promise().getConnection();


        let insertedCount = 0;


        try {

            await connection.beginTransaction();


            for (
                let product of validProducts
            ) {

                await connection.query(

                    `INSERT INTO products
                    (
                        vendor_id,
                        category_id,
                        product_name,
                        description,
                        brand,
                        fabric,
                        color,
                        gender,
                        price,
                        discount,
                        stock,
                        image,
                        rating,
                        status
                    )
                    VALUES
                    (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        0.0,
                        ?
                    )`,

                    [

                        vendorId,

                        product.category_id,

                        product.product_name,

                        product.description,

                        product.brand,

                        product.fabric,

                        product.color,

                        product.gender,

                        product.price,

                        product.discount,

                        product.stock,

                        product.image,

                        product.status

                    ]

                );


                insertedCount++;

            }


            // ========================================
            // UPDATE VENDOR PRODUCT COUNT
            // ========================================

            let [countResult] =
                await connection.query(

                    `SELECT COUNT(*) AS total
                     FROM products
                     WHERE vendor_id = ?`,

                    [vendorId]

                );


            await connection.query(

                `UPDATE vendors
                 SET total_products = ?
                 WHERE vendor_id = ?`,

                [

                    countResult[0].total,

                    vendorId

                ]

            );


            await connection.commit();

        }

        catch (error) {

            await connection.rollback();

            throw error;

        }

        finally {

            connection.release();

        }


        // ========================================
        // SUCCESS
        // ========================================

        return res.status(201).json({

            success: true,

            message:
                "Products imported successfully",

            totalRows:
                rows.length,

            insertedCount:
                insertedCount,

            skippedCount:
                errors.length,

            errors:
                errors.slice(0, 500)

        });

    }

    catch (error) {

        console.log(
            "Bulk Product Import Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to import products"

        });

    }

};



// ======================================================
// DOWNLOAD PRODUCT TEMPLATE
// ======================================================

exports.downloadProductTemplate = async (
    req,
    res
) => {

    try {

        let vendorId =
            req.vendor.vendor_id;


        // ========================================
        // CHECK VENDOR
        // ========================================

        let [vendors] =
            await db.promise().query(

                `SELECT vendor_id, status
                 FROM vendors
                 WHERE vendor_id = ?`,

                [vendorId]

            );


        if (vendors.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Vendor not found"

            });

        }


        if (vendors[0].status !== "Approved") {

            return res.status(403).json({

                success: false,

                message:
                    "Only approved vendors can download the template"

            });

        }


        // ========================================
        // PRODUCT TEMPLATE
        // ========================================

        let productRows = [

            {

                "Product Name":
                    "Cotton Casual Shirt",

                "Category ID":
                    1,

                "Description":
                    "Premium cotton casual shirt",

                "Brand":
                    "Orgos",

                "Fabric":
                    "Cotton",

                "Color":
                    "Blue",

                "Gender":
                    "Men",

                "Price":
                    1299,

                "Discount":
                    10,

                "Stock":
                    50,

                "Image":
                    "",

                "Status":
                    "Active"

            }

        ];


        // ========================================
        // CATEGORY SHEET
        // ========================================

        let [categories] =
            await db.promise().query(

                `SELECT
                    category_id,
                    category_name
                 FROM categories
                 ORDER BY category_id ASC`

            );


        let categoryRows =
            categories.map(
                (category) => ({

                    "Category ID":
                        category.category_id,

                    "Category Name":
                        category.category_name

                })
            );


        // ========================================
        // INSTRUCTIONS SHEET
        // ========================================

        let instructionRows = [

            {

                Field:
                    "Product Name",

                Required:
                    "YES",

                Description:
                    "Product name. Maximum 150 characters."

            },

            {

                Field:
                    "Category ID",

                Required:
                    "YES",

                Description:
                    "Use a Category ID from the Categories sheet."

            },

            {

                Field:
                    "Description",

                Required:
                    "NO",

                Description:
                    "Product description."

            },

            {

                Field:
                    "Brand",

                Required:
                    "NO",

                Description:
                    "Maximum 100 characters."

            },

            {

                Field:
                    "Fabric",

                Required:
                    "NO",

                Description:
                    "Example: Cotton, Linen, Denim."

            },

            {

                Field:
                    "Color",

                Required:
                    "NO",

                Description:
                    "Product colour."

            },

            {

                Field:
                    "Gender",

                Required:
                    "NO",

                Description:
                    "Men, Women, Kids or Unisex."

            },

            {

                Field:
                    "Price",

                Required:
                    "YES",

                Description:
                    "Non-negative number."

            },

            {

                Field:
                    "Discount",

                Required:
                    "NO",

                Description:
                    "0 to 100. Default is 0."

            },

            {

                Field:
                    "Stock",

                Required:
                    "NO",

                Description:
                    "Non-negative whole number. Default is 0."

            },

            {

                Field:
                    "Image",

                Required:
                    "NO",

                Description:
                    "Image URL or existing image path."

            },

            {

                Field:
                    "Status",

                Required:
                    "NO",

                Description:
                    "Active or Inactive. Default is Active."

            }

        ];


        // ========================================
        // CREATE WORKBOOK
        // ========================================

        let workbook =
            XLSX.utils.book_new();


        let productSheet =
            XLSX.utils.json_to_sheet(
                productRows
            );


        let categorySheet =
            XLSX.utils.json_to_sheet(
                categoryRows
            );


        let instructionSheet =
            XLSX.utils.json_to_sheet(
                instructionRows
            );


        XLSX.utils.book_append_sheet(

            workbook,

            productSheet,

            "Products"

        );


        XLSX.utils.book_append_sheet(

            workbook,

            categorySheet,

            "Categories"

        );


        XLSX.utils.book_append_sheet(

            workbook,

            instructionSheet,

            "Instructions"

        );


        // ========================================
        // COLUMN WIDTHS
        // ========================================

        productSheet["!cols"] = [

            { wch: 25 },
            { wch: 14 },
            { wch: 35 },
            { wch: 18 },
            { wch: 18 },
            { wch: 15 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 },
            { wch: 10 },
            { wch: 40 },
            { wch: 12 }

        ];


        categorySheet["!cols"] = [

            { wch: 15 },
            { wch: 30 }

        ];


        instructionSheet["!cols"] = [

            { wch: 20 },
            { wch: 12 },
            { wch: 70 }

        ];


        // ========================================
        // GENERATE BUFFER
        // ========================================

        let buffer =
            XLSX.write(

                workbook,

                {

                    type: "buffer",

                    bookType: "xlsx"

                }

            );


        // ========================================
        // RESPONSE
        // ========================================

        res.setHeader(

            "Content-Type",

            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

        );


        res.setHeader(

            "Content-Disposition",

            'attachment; filename="orgos-product-import-template.xlsx"'

        );


        return res.send(buffer);

    }

    catch (error) {

        console.log(
            "Product Template Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to generate product template",

            error:
                error.message

        });

    }

};



// ======================================================
// EXPORT VENDOR PRODUCTS
// ======================================================

exports.exportProducts = async (
    req,
    res
) => {

    try {

        let vendorId =
            req.vendor.vendor_id;


        // ========================================
        // CHECK VENDOR
        // ========================================

        let [vendors] =
            await db.promise().query(

                `SELECT vendor_id, status
                 FROM vendors
                 WHERE vendor_id = ?`,

                [vendorId]

            );


        if (vendors.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Vendor not found"

            });

        }


        if (vendors[0].status !== "Approved") {

            return res.status(403).json({

                success: false,

                message:
                    "Only approved vendors can export products"

            });

        }


        // ========================================
        // GET PRODUCTS
        // ========================================

        let [products] =
            await db.promise().query(

                `SELECT

                    p.product_id,
                    p.category_id,
                    c.category_name,
                    p.product_name,
                    p.description,
                    p.brand,
                    p.fabric,
                    p.color,
                    p.gender,
                    p.price,
                    p.discount,
                    p.stock,
                    p.image,
                    p.rating,
                    p.status,
                    p.created_at

                 FROM products p

                 LEFT JOIN categories c
                    ON p.category_id = c.category_id

                 WHERE p.vendor_id = ?

                 ORDER BY p.product_id DESC`,

                [vendorId]

            );


        // ========================================
        // CONVERT FOR EXCEL
        // ========================================

        let excelRows =

            products.map(
                (product) => ({

                    "Product ID":
                        product.product_id,

                    "Category ID":
                        product.category_id,

                    "Category Name":
                        product.category_name || "",

                    "Product Name":
                        product.product_name,

                    "Description":
                        product.description || "",

                    "Brand":
                        product.brand || "",

                    "Fabric":
                        product.fabric || "",

                    "Color":
                        product.color || "",

                    "Gender":
                        product.gender || "",

                    "Price":
                        Number(product.price) || 0,

                    "Discount":
                        Number(product.discount) || 0,

                    "Stock":
                        Number(product.stock) || 0,

                    "Image":
                        product.image || "",

                    "Rating":
                        Number(product.rating) || 0,

                    "Status":
                        product.status,

                    "Created At":
                        product.created_at

                })

            );


        // ========================================
        // CREATE WORKBOOK
        // ========================================

        let workbook =
            XLSX.utils.book_new();


        let worksheet =
            XLSX.utils.json_to_sheet(
                excelRows
            );


        worksheet["!cols"] = [

            { wch: 12 },
            { wch: 14 },
            { wch: 25 },
            { wch: 28 },
            { wch: 40 },
            { wch: 18 },
            { wch: 18 },
            { wch: 15 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 },
            { wch: 10 },
            { wch: 40 },
            { wch: 10 },
            { wch: 12 },
            { wch: 22 }

        ];


        XLSX.utils.book_append_sheet(

            workbook,

            worksheet,

            "Products"

        );


        // ========================================
        // CREATE SUMMARY SHEET
        // ========================================

        let summaryRows = [

            {

                "Total Products":
                    products.length,

                "Active Products":
                    products.filter(
                        (product) =>
                            product.status === "Active"
                    ).length,

                "Inactive Products":
                    products.filter(
                        (product) =>
                            product.status === "Inactive"
                    ).length,

                "Total Stock":
                    products.reduce(

                        (
                            total,
                            product
                        ) =>

                            total +
                            (
                                Number(
                                    product.stock
                                ) || 0
                            ),

                        0

                    )

            }

        ];


        let summarySheet =
            XLSX.utils.json_to_sheet(
                summaryRows
            );


        XLSX.utils.book_append_sheet(

            workbook,

            summarySheet,

            "Summary"

        );


        // ========================================
        // BUFFER
        // ========================================

        let buffer =
            XLSX.write(

                workbook,

                {

                    type: "buffer",

                    bookType: "xlsx"

                }

            );


        // ========================================
        // RESPONSE
        // ========================================

        res.setHeader(

            "Content-Type",

            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

        );


        res.setHeader(

            "Content-Disposition",

            'attachment; filename="orgos-products.xlsx"'

        );


        return res.send(buffer);

    }

    catch (error) {

        console.log(
            "Export Products Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to export products",

            error:
                error.message

        });

    }

};