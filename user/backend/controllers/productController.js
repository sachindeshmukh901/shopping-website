const db = require("../config/db");


// ========================================
// GET ALL ACTIVE PRODUCTS
// PUBLIC STOREFRONT
// ========================================

exports.getAllProducts = async (req, res) => {

  try {

    let {
      category_id,
      gender,
      search,
      sort,
      limit,
      page
    } = req.query;


    let query = `
            SELECT
                p.*,
                c.category_name,
                v.shop_name,
                v.owner_name
            FROM products p

            LEFT JOIN categories c
                ON p.category_id = c.category_id

            LEFT JOIN vendors v
                ON p.vendor_id = v.vendor_id

            WHERE p.status = 'Active'
        `;


    let params = [];


    // ========================================
    // CATEGORY FILTER
    // ========================================

    if (category_id) {

      query += ` AND p.category_id = ?`;

      params.push(category_id);

    }


    // ========================================
    // GENDER FILTER
    // ========================================

    if (gender) {

      query += ` AND p.gender = ?`;

      params.push(gender);

    }


    // ========================================
    // SEARCH
    // ========================================

    if (search) {

      query += `
                AND (
                    p.product_name LIKE ?
                    OR p.description LIKE ?
                    OR p.brand LIKE ?
                )
            `;

      let searchPattern = `%${search}%`;

      params.push(
        searchPattern,
        searchPattern,
        searchPattern
      );

    }


    // ========================================
    // SORT
    // ========================================

    if (sort === "price_low") {

      query += ` ORDER BY p.price ASC`;

    }

    else if (sort === "price_high") {

      query += ` ORDER BY p.price DESC`;

    }

    else if (sort === "rating") {

      query += ` ORDER BY p.rating DESC`;

    }

    else {

      query += ` ORDER BY p.created_at DESC`;

    }


    // ========================================
    // PAGINATION
    // ========================================

    if (limit) {

      let pageNum = parseInt(page) || 1;

      let limitNum = parseInt(limit) || 12;

      // Prevent invalid values
      if (pageNum < 1) {
        pageNum = 1;
      }

      if (limitNum < 1) {
        limitNum = 12;
      }

      if (limitNum > 100) {
        limitNum = 100;
      }

      let offset = (pageNum - 1) * limitNum;

      query += ` LIMIT ${limitNum} OFFSET ${offset}`;

    }


    // ========================================
    // EXECUTE QUERY
    // ========================================

    let [products] = await db.promise().query(
      query,
      params
    );


    // ========================================
    // ATTACH SIZES
    // ========================================

    let productIds =
      products.map((p) => p.product_id);

    let sizesMap = {};

    if (productIds.length > 0) {

      let [sizeRows] = await db.promise().query(
        `SELECT product_id, size, stock
         FROM product_sizes
         WHERE product_id IN (?)
         ORDER BY size`,
        [productIds]
      );

      for (let row of sizeRows) {

        if (!sizesMap[row.product_id]) {
          sizesMap[row.product_id] = [];
        }

        sizesMap[row.product_id].push({
          size: row.size,
          stock: row.stock
        });

      }

    }

    let productsWithSizes =
      products.map((p) => ({
        ...p,
        sizes: sizesMap[p.product_id] || [],
        available_sizes:
          (sizesMap[p.product_id] || [])
            .filter((s) => s.stock > 0)
            .map((s) => s.size)
      }));


    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({

      success: true,

      count: productsWithSizes.length,

      products: productsWithSizes

    });

  }

  catch (error) {

    console.error(
      "Get All Products Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message: "Failed to fetch products",

      error: error.message

    });

  }

};


// ========================================
// GET TOP SELLER PRODUCTS
// Ranked by actual units sold (from order_items).
// Falls back to highest-rated / newest products
// if there isn't enough order history yet.
// PUBLIC STOREFRONT
// ========================================

exports.getTopSellers = async (req, res) => {

  try {

    let limit =
      parseInt(req.query.limit) || 8;

    if (limit < 1) {
      limit = 8;
    }

    if (limit > 24) {
      limit = 24;
    }


    // ========================================
    // RANK BY REAL SALES (units sold)
    // ========================================

    let [bestSellers] = await db.promise().query(

      `
      SELECT
          p.*,
          c.category_name,
          v.shop_name,
          v.owner_name,
          COALESCE(SUM(oi.quantity), 0) AS units_sold
      FROM products p

      LEFT JOIN categories c
          ON p.category_id = c.category_id

      LEFT JOIN vendors v
          ON p.vendor_id = v.vendor_id

      INNER JOIN order_items oi
          ON oi.product_id = p.product_id

      WHERE p.status = 'Active'

      GROUP BY p.product_id

      ORDER BY units_sold DESC, p.rating DESC

      LIMIT ?
      `,

      [limit]

    );


    let products = bestSellers;


    // ========================================
    // FALLBACK — not enough sales history yet,
    // top up with highest-rated / newest active
    // products so the section is never empty.
    // ========================================

    if (products.length < limit) {

      let excludeIds =
        products.map((p) => p.product_id);

      let fallbackQuery = `
        SELECT
            p.*,
            c.category_name,
            v.shop_name,
            v.owner_name,
            0 AS units_sold
        FROM products p

        LEFT JOIN categories c
            ON p.category_id = c.category_id

        LEFT JOIN vendors v
            ON p.vendor_id = v.vendor_id

        WHERE p.status = 'Active'
      `;

      let fallbackParams = [];

      if (excludeIds.length > 0) {

        fallbackQuery += ` AND p.product_id NOT IN (?)`;

        fallbackParams.push(excludeIds);

      }

      fallbackQuery += `
        ORDER BY p.rating DESC, p.created_at DESC
        LIMIT ?
      `;

      fallbackParams.push(limit - products.length);

      let [fallbackProducts] = await db.promise().query(
        fallbackQuery,
        fallbackParams
      );

      products = [...products, ...fallbackProducts];

    }


    // ========================================
    // ATTACH SIZES
    // ========================================

    let productIds =
      products.map((p) => p.product_id);

    let sizesMap = {};

    if (productIds.length > 0) {

      let [sizeRows] = await db.promise().query(
        `SELECT product_id, size, stock
         FROM product_sizes
         WHERE product_id IN (?)
         ORDER BY size`,
        [productIds]
      );

      for (let row of sizeRows) {

        if (!sizesMap[row.product_id]) {
          sizesMap[row.product_id] = [];
        }

        sizesMap[row.product_id].push({
          size: row.size,
          stock: row.stock
        });

      }

    }

    let productsWithSizes =
      products.map((p) => ({
        ...p,
        sizes: sizesMap[p.product_id] || [],
        available_sizes:
          (sizesMap[p.product_id] || [])
            .filter((s) => s.stock > 0)
            .map((s) => s.size)
      }));


    return res.status(200).json({

      success: true,

      count: productsWithSizes.length,

      products: productsWithSizes

    });

  }

  catch (error) {

    console.error(
      "Get Top Sellers Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message: "Failed to fetch top seller products",

      error: error.message

    });

  }

};


// ========================================
// GET SINGLE ACTIVE PRODUCT
// PUBLIC
// ========================================

exports.getProductById = async (req, res) => {

  try {

    let { id } = req.params;


    let [products] = await db.promise().query(

      `
            SELECT
                p.*,
                c.category_name,
                v.shop_name,
                v.owner_name

            FROM products p

            LEFT JOIN categories c
                ON p.category_id = c.category_id

            LEFT JOIN vendors v
                ON p.vendor_id = v.vendor_id

            WHERE
                p.product_id = ?
                AND p.status = 'Active'
            `,

      [id]

    );


    if (products.length === 0) {

      return res.status(404).json({

        success: false,

        message: "Product not found"

      });

    }


    // ========================================
    // ATTACH SIZES
    // ========================================

    let [sizeRows] = await db.promise().query(

      `SELECT size, stock
       FROM product_sizes
       WHERE product_id = ?
       ORDER BY size`,

      [id]

    );

    let product = {
      ...products[0],
      sizes: sizeRows,
      available_sizes:
        sizeRows
          .filter((s) => s.stock > 0)
          .map((s) => s.size)
    };


    return res.status(200).json({

      success: true,

      product: product

    });

  }

  catch (error) {

    console.error(
      "Get Product By ID Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message: "Failed to fetch product details",

      error: error.message

    });

  }

};