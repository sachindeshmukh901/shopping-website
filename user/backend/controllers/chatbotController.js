const db = require("../config/db");
const jwt = require("jsonwebtoken");


// ============================================================
// ORGOS CHATBOT CONTROLLER
// Gemini 3.6 Flash + Agentic Tool Calling + Live MySQL
// ============================================================


// ============================================================
// CONFIG
// ============================================================

const GEMINI_MODEL =
    process.env.GEMINI_MODEL || "gemini-3.6-flash";

const GEMINI_API_KEY =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    "";

const GEMINI_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_HISTORY =
    16;

const MAX_AGENT_ROUNDS =
    3;

const GEMINI_TIMEOUT =
    12000;


// ============================================================
// OPTIONAL AUTH
// ============================================================

function getUserIdFromRequest(req) {

    try {

        let authHeader =
            req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return null;

        }

        let token =
            authHeader.split(" ")[1];

        if (!token) {

            return null;

        }

        let decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        return (
            decoded.user_id ||
            decoded.userId ||
            decoded.id ||
            null
        );

    }

    catch (error) {

        return null;

    }

}


// ============================================================
// IMAGE URL HELPER
// ============================================================

function toImageUrl(req, image) {

    if (!image) {

        return "";

    }

    let imageString =
        String(image);

    if (
        imageString.startsWith("http://") ||
        imageString.startsWith("https://")
    ) {

        return imageString;

    }

    let serverURL =
        `${req.protocol}://${req.get("host")}`;

    if (
        imageString.startsWith("/")
    ) {

        return `${serverURL}${imageString}`;

    }

    return `${serverURL}/${imageString}`;

}


// ============================================================
// SAFE NUMBER
// ============================================================

function safeNumber(value, fallback = null) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return fallback;

    }

    let number =
        Number(value);

    if (
        Number.isNaN(number)
    ) {

        return fallback;

    }

    return number;

}


// ============================================================
// CLEAN TEXT
// ============================================================

function cleanText(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }

    return String(value)
        .trim();

}


// ============================================================
// TOOL 1
// SEARCH PRODUCTS
// ============================================================

async function toolSearchProducts(req, args = {}) {

    let query =
        cleanText(args.query);

    let category =
        cleanText(args.category);

    let minPrice =
        safeNumber(args.min_price);

    let maxPrice =
        safeNumber(args.max_price);

    let requestedLimit =
        safeNumber(args.limit, 6);

    let safeLimit =
        Math.max(
            1,
            Math.min(
                requestedLimit || 6,
                10
            )
        );


    let conditions = [
        "p.status = 'Active'"
    ];

    let params = [];


    // --------------------------------------------------------
    // KEYWORD
    // --------------------------------------------------------

    if (query) {

        conditions.push(
            `(
                p.product_name LIKE ?
                OR p.brand LIKE ?
                OR p.description LIKE ?
                OR p.gender LIKE ?
                OR c.category_name LIKE ?
            )`
        );

        let pattern =
            `%${query}%`;

        params.push(
            pattern,
            pattern,
            pattern,
            pattern,
            pattern
        );

    }


    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    if (category) {

        conditions.push(
            "c.category_name LIKE ?"
        );

        params.push(
            `%${category}%`
        );

    }


    // --------------------------------------------------------
    // MIN PRICE
    // --------------------------------------------------------

    if (
        minPrice !== null
    ) {

        conditions.push(
            "p.price >= ?"
        );

        params.push(
            minPrice
        );

    }


    // --------------------------------------------------------
    // MAX PRICE
    // --------------------------------------------------------

    if (
        maxPrice !== null
    ) {

        conditions.push(
            "p.price <= ?"
        );

        params.push(
            maxPrice
        );

    }


    // --------------------------------------------------------
    // SQL
    // --------------------------------------------------------

    let sql = `
        SELECT
            p.product_id,
            p.product_name,
            p.price,
            p.stock,
            p.image,
            p.brand,
            p.gender,
            p.description,
            c.category_name

        FROM products p

        LEFT JOIN categories c
            ON p.category_id = c.category_id

        WHERE ${conditions.join(" AND ")}

        ORDER BY p.created_at DESC

        LIMIT ?
    `;


    params.push(
        safeLimit
    );


    let [rows] =
        await db
            .promise()
            .query(
                sql,
                params
            );


    return rows.map(
        row => {

            return {

                id:
                    row.product_id,

                name:
                    row.product_name,

                price:
                    Number(row.price),

                stock:
                    Number(row.stock),

                brand:
                    row.brand || "",

                gender:
                    row.gender || "",

                category:
                    row.category_name || "",

                description:
                    row.description || "",

                image:
                    toImageUrl(
                        req,
                        row.image
                    ),

                url:
                    `/shop/${row.product_id}`

            };

        }
    );

}


// ============================================================
// TOOL 2
// GET PRODUCT DETAILS
// ============================================================

async function toolGetProductDetails(
    req,
    args = {}
) {

    let productId =
        safeNumber(
            args.product_id
        );


    if (!productId) {

        return {

            error:
                "product_id is required"

        };

    }


    let [rows] =
        await db
            .promise()
            .query(
                `
                SELECT
                    p.product_id,
                    p.product_name,
                    p.price,
                    p.stock,
                    p.image,
                    p.brand,
                    p.gender,
                    p.description,
                    c.category_name

                FROM products p

                LEFT JOIN categories c
                    ON p.category_id = c.category_id

                WHERE
                    p.product_id = ?
                    AND p.status = 'Active'

                LIMIT 1
                `,
                [
                    productId
                ]
            );


    if (
        rows.length === 0
    ) {

        return {

            error:
                "Product not found"

        };

    }


    let row =
        rows[0];


    return {

        id:
            row.product_id,

        name:
            row.product_name,

        price:
            Number(row.price),

        stock:
            Number(row.stock),

        brand:
            row.brand || "",

        gender:
            row.gender || "",

        category:
            row.category_name || "",

        description:
            row.description || "",

        image:
            toImageUrl(
                req,
                row.image
            ),

        url:
            `/shop/${row.product_id}`

    };

}


// ============================================================
// TOOL 3
// GET CATEGORIES
// ============================================================

async function toolGetCategories() {

    let [rows] =
        await db
            .promise()
            .query(
                `
                SELECT
                    category_name

                FROM categories

                WHERE status = 'Active'

                ORDER BY category_name ASC
                `
            );


    return rows.map(
        row =>
            row.category_name
    );

}


// ============================================================
// TOOL 4
// GET ORDERS
// ============================================================

async function toolGetOrders(
    req,
    userId
) {

    if (!userId) {

        return {

            needs_login:
                true

        };

    }


    let [orders] =
        await db
            .promise()
            .query(
                `
                SELECT
                    o.order_id,
                    o.order_status,
                    o.total_amount,
                    o.created_at

                FROM orders o

                WHERE
                    o.user_id = ?

                ORDER BY
                    o.order_id DESC

                LIMIT 5
                `,
                [
                    userId
                ]
            );


    return {

        orders:
            orders.map(
                order => ({

                    order_id:
                        order.order_id,

                    order_status:
                        order.order_status,

                    total_amount:
                        Number(
                            order.total_amount
                        ),

                    created_at:
                        order.created_at

                })
            )

    };

}


// ============================================================
// TOOL 5
// TRACK ORDER
// ============================================================

async function toolTrackOrder(
    req,
    userId,
    args = {}
) {

    if (!userId) {

        return {

            needs_login:
                true

        };

    }


    let orderId =
        safeNumber(
            args.order_id
        );


    if (!orderId) {

        return {

            error:
                "order_id is required"

        };

    }


    let [orders] =
        await db
            .promise()
            .query(
                `
                SELECT
                    o.order_id,
                    o.order_status,
                    o.total_amount,
                    o.created_at

                FROM orders o

                WHERE
                    o.order_id = ?
                    AND o.user_id = ?

                LIMIT 1
                `,
                [
                    orderId,
                    userId
                ]
            );


    if (
        orders.length === 0
    ) {

        return {

            error:
                "Order not found on your account"

        };

    }


    let order =
        orders[0];


    let [items] =
        await db
            .promise()
            .query(
                `
                SELECT
                    oi.quantity,
                    pr.product_name

                FROM order_items oi

                JOIN products pr
                    ON oi.product_id = pr.product_id

                WHERE
                    oi.order_id = ?
                `,
                [
                    order.order_id
                ]
            );


    return {

        order: {

            order_id:
                order.order_id,

            order_status:
                order.order_status,

            total_amount:
                Number(
                    order.total_amount
                ),

            created_at:
                order.created_at,

            items:
                items.map(
                    item => ({

                        product_name:
                            item.product_name,

                        quantity:
                            Number(
                                item.quantity
                            )

                    })
                )

        }

    };

}


// ============================================================
// GEMINI TOOLS
// ============================================================

const TOOL_DECLARATIONS = [

    {

        name:
            "search_products",

        description:
            `
            Search live ORGOS products in the MySQL database.

            Use this whenever the customer asks for:
            products,
            shirts,
            t-shirts,
            jeans,
            shoes,
            sneakers,
            dresses,
            clothing,
            recommendations,
            product availability,
            price ranges,
            categories,
            brands,
            or similar products.

            Never invent products, prices or stock.
            `,

        parameters: {

            type:
                "object",

            properties: {

                query: {

                    type:
                        "string",

                    description:
                        "Product keyword such as shirt, jeans, sneakers, Nike, dress."

                },

                category: {

                    type:
                        "string",

                    description:
                        "Optional category name."

                },

                min_price: {

                    type:
                        "number",

                    description:
                        "Optional minimum price."

                },

                max_price: {

                    type:
                        "number",

                    description:
                        "Optional maximum price."

                },

                limit: {

                    type:
                        "number",

                    description:
                        "Number of products, maximum 10."

                }

            }

        }

    },


    {

        name:
            "get_product_details",

        description:
            `
            Get exact live information for one product.
            Use this when the customer asks about the exact
            price, stock, description or details of a known product.
            `,

        parameters: {

            type:
                "object",

            properties: {

                product_id: {

                    type:
                        "number",

                    description:
                        "Numeric product ID."

                }

            },

            required: [
                "product_id"
            ]

        }

    },


    {

        name:
            "get_categories",

        description:
            `
            Get the currently active ORGOS product categories.
            `,

        parameters: {

            type:
                "object",

            properties: {}

        }

    },


    {

        name:
            "get_orders",

        description:
            `
            Get the logged-in customer's recent orders.
            If the customer is not logged in, return needs_login.
            `,

        parameters: {

            type:
                "object",

            properties: {}

        }

    },


    {

        name:
            "track_order",

        description:
            `
            Track one specific order belonging to the logged-in
            customer. Never expose another customer's order.
            `,

        parameters: {

            type:
                "object",

            properties: {

                order_id: {

                    type:
                        "number",

                    description:
                        "The numeric order ID."

                }

            },

            required: [
                "order_id"
            ]

        }

    }

];


// ============================================================
// SYSTEM PROMPT
// ============================================================

const SYSTEM_PROMPT = `

You are ORGOS Assistant, the conversational shopping assistant
for the ORGOS fashion e-commerce website.

Your job is to talk naturally with customers and help them shop.

IMPORTANT RULES:

1. Always behave like a real friendly shopping assistant.

2. Understand follow-up questions using the conversation history.

Example:

User:
"Show me shirts."

Assistant:
"Here are some shirts."

User:
"Which one is cheapest?"

You must understand that "which one" refers to the shirts
from the previous conversation.

3. Product facts must come from tools.

Never invent:
- product names
- prices
- stock
- categories
- order status
- order information

4. If a user asks for products, recommendations, price,
availability or stock, call search_products or
get_product_details.

5. If the user asks about an order:
- use get_orders for recent orders
- use track_order for a specific order

6. If the user is not logged in and asks about orders,
tell them politely that they need to log in.

7. If a search returns no results:
say that you couldn't find matching products.
Suggest another keyword.

8. Understand natural language.

Examples:
"best shirt"
"good shirt"
"show me shirts"
"shirts under 2000"
"cheap sneakers"
"men's shoes"
"red t-shirt"
"I want something for a party"

Do not treat words like "best", "good", "show me",
"please", "want", "give me" as product names.

9. Keep replies short.

Normally reply in 1-4 sentences.

10. Do not create long markdown lists.
Products will be displayed as UI cards by the frontend.

11. If the customer asks something unrelated to ORGOS,
politely bring the conversation back to shopping.

12. If tool data is empty, do not make something up.

13. You can use multiple tools when needed.

14. For product recommendations, first search the live
database and then recommend from returned products.

15. If a customer asks:
"Is this available?"
and the conversation identifies a previous product,
use get_product_details with its product ID when available.

16. Never claim you completed an action unless a tool actually
performed that action.

17. Speak naturally and conversationally.

`.trim();


// ============================================================
// TOOL EXECUTOR
// ============================================================

async function executeTool(
    req,
    userId,
    toolName,
    toolInput,
    collected
) {

    console.log(
        "CHATBOT TOOL:",
        toolName,
        toolInput
    );


    if (
        toolName ===
        "search_products"
    ) {

        let products =
            await toolSearchProducts(
                req,
                toolInput
            );


        collected.products.push(
            ...products
        );


        return {

            products

        };

    }


    if (
        toolName ===
        "get_product_details"
    ) {

        let product =
            await toolGetProductDetails(
                req,
                toolInput
            );


        if (
            product &&
            !product.error
        ) {

            collected.products.push(
                product
            );

        }


        return product;

    }


    if (
        toolName ===
        "get_categories"
    ) {

        let categories =
            await toolGetCategories();


        return {

            categories

        };

    }


    if (
        toolName ===
        "get_orders"
    ) {

        let result =
            await toolGetOrders(
                req,
                userId
            );


        if (
            result.orders
        ) {

            collected.orders.push(
                ...result.orders
            );

        }


        return result;

    }


    if (
        toolName ===
        "track_order"
    ) {

        let result =
            await toolTrackOrder(
                req,
                userId,
                toolInput
            );


        if (
            result.order
        ) {

            collected.orders.push(
                result.order
            );

        }


        return result;

    }


    return {

        error:
            "Unknown tool"

    };

}


// ============================================================
// GEMINI REQUEST WITH TIMEOUT
// ============================================================

async function callGemini(
    body
) {

    if (!GEMINI_API_KEY) {

        return null;

    }


    let controller =
        new AbortController();


    let timeout =
        setTimeout(
            () => {

                controller.abort();

            },
            GEMINI_TIMEOUT
        );


    try {

        let response =
            await fetch(
                `${GEMINI_URL}?key=${encodeURIComponent(GEMINI_API_KEY)}`,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(body),

                    signal:
                        controller.signal

                }
            );


        let text =
            await response.text();


        let data = null;


        try {

            data =
                JSON.parse(text);

        }

        catch {

            data = {

                error:
                {

                    message:
                        text

                }

            };

        }


        if (!response.ok) {

            let error =
                new Error(
                    data &&
                        data.error &&
                        data.error.message
                        ?
                        data.error.message
                        :
                        `Gemini HTTP ${response.status}`
                );


            error.status =
                response.status;


            throw error;

        }


        return data;

    }

    finally {

        clearTimeout(
            timeout
        );

    }

}


// ============================================================
// RETRY GEMINI
// ============================================================

async function callGeminiWithRetry(
    body
) {

    let maxAttempts =
        2;


    let lastError =
        null;


    for (
        let attempt = 1;
        attempt <= maxAttempts;
        attempt++
    ) {

        try {

            console.log(
                `GEMINI ROUND REQUEST ${attempt}`
            );


            let result =
                await callGemini(
                    body
                );


            if (result) {

                return result;

            }

        }

        catch (error) {

            lastError =
                error;


            console.error(
                `Gemini request failed (${attempt}/${maxAttempts}):`,
                error.message
            );


            let status =
                Number(
                    error.status
                );


            let retryable =
                (
                    status === 429 ||
                    status === 500 ||
                    status === 502 ||
                    status === 503 ||
                    status === 504 ||
                    error.name ===
                    "AbortError" ||
                    error.code ===
                    "UND_ERR_CONNECT_TIMEOUT"
                );


            if (!retryable) {

                break;

            }


            if (
                attempt <
                maxAttempts
            ) {

                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            700 * attempt
                        )
                );

            }

        }

    }


    return null;

}


// ============================================================
// EXTRACT GEMINI PARTS
// ============================================================

function getCandidateParts(
    payload
) {

    if (
        !payload ||
        !payload.candidates ||
        !payload.candidates[0]
    ) {

        return [];

    }


    let candidate =
        payload.candidates[0];


    if (
        !candidate.content ||
        !Array.isArray(
            candidate.content.parts
        )
    ) {

        return [];

    }


    return candidate
        .content
        .parts;

}


// ============================================================
// EXTRACT TEXT
// ============================================================

function extractText(
    parts
) {

    let textParts =
        parts.filter(
            part =>
                typeof part.text ===
                "string"
        );


    return textParts
        .map(
            part =>
                part.text
        )
        .join(" ")
        .trim();

}


// ============================================================
// SMART QUERY EXTRACTION
// FOR FALLBACK
// ============================================================

function extractProductQuery(
    message
) {

    let text =
        cleanText(
            message
        )
            .toLowerCase();


    let ignoredWords = [

        "best",
        "good",
        "better",
        "show",
        "me",
        "please",
        "give",
        "want",
        "need",
        "find",
        "looking",
        "for",
        "some",
        "the",
        "a",
        "an",
        "of",
        "to",
        "with",
        "available",
        "available?",
        "product",
        "products",
        "item",
        "items",
        "cheap",
        "cheapest",
        "nice",
        "latest",
        "new",
        "popular",
        "please",
        "can",
        "you",
        "could",
        "i",
        "would",
        "like",
        "do",
        "there",
        "is",
        "are",
        "any",
        "have",
        "your",
        "on",
        "in",
        "under",
        "below",
        "less",
        "than",
        "rupees",
        "rs",
        "₹"

    ];


    let words =
        text
            .replace(
                /[?!.,]/g,
                " "
            )
            .split(/\s+/)
            .filter(
                word =>
                    word &&
                    !ignoredWords.includes(
                        word
                    )
            );


    let result =
        words.join(" ").trim();


    if (!result) {

        result =
            text
                .replace(
                    /[?!.,]/g,
                    " "
                )
                .trim();

    }


    return result;

}


// ============================================================
// PRICE EXTRACTION FOR FALLBACK
// ============================================================

function extractPriceRange(
    message
) {

    let text =
        cleanText(
            message
        )
            .toLowerCase();


    let maxPrice = null;


    let underMatch =
        text.match(
            /(?:under|below|less than|max|upto|up to)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)/i
        );


    if (
        underMatch
    ) {

        maxPrice =
            Number(
                underMatch[1]
            );

    }


    return {

        maxPrice

    };

}


// ============================================================
// DETECT ORDER INTENT
// ============================================================

function isOrderIntent(
    message
) {

    let text =
        cleanText(
            message
        )
            .toLowerCase();


    let words = [

        "order",
        "track",
        "tracking",
        "delivery",
        "delivered",
        "shipment",
        "shipping",
        "where is my order",
        "my order",
        "order status"

    ];


    return words.some(
        word =>
            text.includes(
                word
            )
    );

}


// ============================================================
// DETECT CATEGORY INTENT
// ============================================================

function isCategoryIntent(
    message
) {

    let text =
        cleanText(
            message
        )
            .toLowerCase();


    return (

        text.includes(
            "categories"
        ) ||

        text.includes(
            "category"
        ) ||

        text.includes(
            "what do you sell"
        ) ||

        text.includes(
            "what products do you have"
        )

    );

}


// ============================================================
// FALLBACK SEARCH
// ============================================================

async function fallbackProductSearch(
    req,
    message,
    history
) {

    let query =
        extractProductQuery(
            message
        );


    let price =
        extractPriceRange(
            message
        );


    let products =
        await toolSearchProducts(
            req,
            {

                query,
                max_price:
                    price.maxPrice,

                limit:
                    8

            }
        );


    // --------------------------------------------------------
    // IF NOTHING FOUND, TRY PRODUCT WORDS
    // --------------------------------------------------------

    if (
        products.length === 0
    ) {

        let productWords = [

            "shirt",
            "shirts",
            "tshirt",
            "t-shirt",
            "jeans",
            "jean",
            "shoes",
            "shoe",
            "sneakers",
            "sneaker",
            "dress",
            "dresses",
            "jacket",
            "jackets",
            "hoodie",
            "hoodies",
            "trouser",
            "trousers",
            "pants",
            "top",
            "tops",
            "kurti",
            "kurtis",
            "saree",
            "sarees",
            "footwear"

        ];


        let matched =
            productWords.find(
                word =>
                    message
                        .toLowerCase()
                        .includes(
                            word
                        )
            );


        if (matched) {

            products =
                await toolSearchProducts(
                    req,
                    {

                        query:
                            matched,

                        max_price:
                            price.maxPrice,

                        limit:
                            8

                    }
                );

        }

    }


    // --------------------------------------------------------
    // FOLLOW-UP FALLBACK
    // --------------------------------------------------------

    if (
        products.length === 0 &&
        Array.isArray(history) &&
        history.length > 0
    ) {

        let previousUserMessages =
            history
                .filter(
                    item =>
                        item &&
                        item.role ===
                        "user"
                )
                .map(
                    item =>
                        item.content
                )
                .slice(-4);


        for (
            let previousMessage
            of previousUserMessages
        ) {

            let previousQuery =
                extractProductQuery(
                    previousMessage
                );


            if (
                !previousQuery
            ) {

                continue;

            }


            let previousProducts =
                await toolSearchProducts(
                    req,
                    {

                        query:
                            previousQuery,

                        limit:
                            8

                    }
                );


            if (
                previousProducts.length
            ) {

                products =
                    previousProducts;

                break;

            }

        }

    }


    return products;

}


// ============================================================
// FALLBACK CHAT
// THIS MAKES CHATBOT WORK EVEN IF GEMINI IS DOWN
// ============================================================

async function runFallbackChat(
    req,
    userId,
    message,
    history
) {

    let text =
        cleanText(
            message
        )
            .toLowerCase();


    // --------------------------------------------------------
    // ORDER
    // --------------------------------------------------------

    if (
        isOrderIntent(
            text
        )
    ) {

        let result =
            await toolGetOrders(
                req,
                userId
            );


        if (
            result.needs_login
        ) {

            return {

                reply:
                    "Please log in to your ORGOS account so I can check your order status. 🙏",

                products:
                    [],

                orders:
                    []

            };

        }


        if (
            !result.orders ||
            result.orders.length === 0
        ) {

            return {

                reply:
                    "I couldn't find any recent orders on your account.",

                products:
                    [],

                orders:
                    []

            };

        }


        return {

            reply:
                `I found ${result.orders.length} recent order(s) for you. Here is the latest order information.`,

            products:
                [],

            orders:
                result.orders

        };

    }


    // --------------------------------------------------------
    // CATEGORIES
    // --------------------------------------------------------

    if (
        isCategoryIntent(
            text
        )
    ) {

        let categories =
            await toolGetCategories();


        if (
            categories.length === 0
        ) {

            return {

                reply:
                    "I couldn't find any active categories right now.",

                products:
                    [],

                orders:
                    []

            };

        }


        return {

            reply:
                `We currently have ${categories.join(", ")}.`,

            products:
                [],

            orders:
                []

        };

    }


    // --------------------------------------------------------
    // GREETING
    // --------------------------------------------------------

    let greetings = [

        "hi",
        "hello",
        "hey",
        "hii",
        "helo",
        "good morning",
        "good afternoon",
        "good evening"

    ];


    if (
        greetings.some(
            word =>
                text === word ||
                text.startsWith(
                    `${word} `
                )
        )
    ) {

        return {

            reply:
                "Hi! 👋 I'm ORGOS Assistant. I can help you find products, check prices and stock, or track your orders.",

            products:
                [],

            orders:
                []

        };

    }


    // --------------------------------------------------------
    // CONVERSATION
    // --------------------------------------------------------

    if (
        /^(how are you|how r u|how are u|kaise ho|kaisi ho)\??$/.test(
            text
        )
    ) {

        return {

            reply:
                "I'm doing great, thank you! 👋 I'm ready to help you find something stylish.",

            products:
                [],

            orders:
                []

        };

    }


    if (
        /^(thanks|thank you|thx|shukriya)\b/.test(
            text
        )
    ) {

        return {

            reply:
                "You're welcome! Let me know if you need anything else.",

            products:
                [],

            orders:
                []

        };

    }


    if (
        /^(what can you do|help|help me|kya kar sakte ho)\??$/.test(
            text
        )
    ) {

        return {

            reply:
                "I can help you find products, check prices and stock, and track your orders.",

            products:
                [],

            orders:
                []

        };

    }


    if (
        /\b(i love orgos|love orgos|orgos is great|orgos acha hai)\b/.test(
            text
        )
    ) {

        return {

            reply:
                "That means a lot! ❤️ I'm happy to help you find your next favorite look.",

            products:
                [],

            orders:
                []

        };

    }


    // --------------------------------------------------------
    // PRODUCT SEARCH
    // --------------------------------------------------------

    let products =
        await fallbackProductSearch(
            req,
            message,
            history
        );


    if (
        products.length === 0
    ) {

        return null;

    }


    return {

        reply:
            `I found ${products.length} product${products.length === 1 ? "" : "s"} for you. Have a look below. 👕`,

        products,

        orders:
            []

    };

}


// ============================================================
// AGENTIC CHAT
// ============================================================

async function runAgenticChat(
    req,
    userId,
    conversation
) {

    if (!GEMINI_API_KEY) {

        return null;

    }


    let collected = {

        products:
            [],

        orders:
            []

    };


    // --------------------------------------------------------
    // GEMINI CONTENT FORMAT
    // --------------------------------------------------------

    let contents =
        conversation.map(
            turn => {

                return {

                    role:
                        turn.role ===
                            "assistant"
                            ?
                            "model"
                            :
                            "user",

                    parts: [

                        {

                            text:
                                turn.content

                        }

                    ]

                };

            }
        );


    // --------------------------------------------------------
    // AGENT LOOP
    // --------------------------------------------------------

    for (
        let round = 1;
        round <= MAX_AGENT_ROUNDS;
        round++
    ) {

        console.log(
            `GEMINI ROUND ${round}`
        );


        let requestBody = {

            systemInstruction: {

                parts: [

                    {

                        text:
                            SYSTEM_PROMPT

                    }

                ]

            },

            contents,

            tools: [

                {

                    functionDeclarations:
                        TOOL_DECLARATIONS

                }

            ]

        };


        let payload =
            await callGeminiWithRetry(
                requestBody
            );


        if (!payload) {

            console.log(
                "Gemini unavailable. Using database fallback."
            );

            return null;

        }


        let parts =
            getCandidateParts(
                payload
            );


        if (
            parts.length === 0
        ) {

            return null;

        }


        // ----------------------------------------------------
        // FIND TOOL CALLS
        // ----------------------------------------------------

        let functionCallParts =
            parts.filter(
                part =>
                    part &&
                    part.functionCall
            );


        // ----------------------------------------------------
        // NO TOOL CALL = FINAL RESPONSE
        // ----------------------------------------------------

        if (
            functionCallParts.length === 0
        ) {

            let reply =
                extractText(
                    parts
                );


            if (!reply) {

                reply =
                    "I'm here to help. What would you like to shop for?";

            }


            return {

                reply,

                products:
                    collected.products,

                orders:
                    collected.orders

            };

        }


        // ----------------------------------------------------
        // IMPORTANT:
        // ADD GEMINI MODEL MESSAGE EXACTLY AS RECEIVED
        // ----------------------------------------------------

        contents.push({

            role:
                "model",

            parts

        });


        // ----------------------------------------------------
        // EXECUTE ALL TOOL CALLS
        // ----------------------------------------------------

        let functionResponseParts =
            [];


        for (
            let part
            of functionCallParts
        ) {

            let functionCall =
                part.functionCall;


            let toolName =
                functionCall.name;


            let toolInput =
                functionCall.args ||
                {};


            let result;


            try {

                result =
                    await executeTool(
                        req,
                        userId,
                        toolName,
                        toolInput,
                        collected
                    );

            }

            catch (error) {

                console.error(
                    `Tool ${toolName} failed:`,
                    error
                );


                result = {

                    error:
                        "The store database could not complete this request."

                };

            }


            functionResponseParts.push({

                functionResponse: {

                    name:
                        toolName,

                    response:
                        result

                }

            });

        }


        // ----------------------------------------------------
        // SEND TOOL RESULTS BACK TO GEMINI
        // ----------------------------------------------------

        contents.push({

            role:
                "user",

            parts:
                functionResponseParts

        });

    }


    // --------------------------------------------------------
    // MAX ROUNDS REACHED
    // --------------------------------------------------------

    return {

        reply:
            "I found the information, but I need a moment to complete the response. Please try your question again.",

        products:
            collected.products,

        orders:
            collected.orders

    };

}


// ============================================================
// CLEAN HISTORY
// ============================================================

function buildSafeHistory(
    history
) {

    if (
        !Array.isArray(history)
    ) {

        return [];

    }


    return history

        .filter(
            turn => {

                return (

                    turn &&

                    (
                        turn.role ===
                        "user" ||

                        turn.role ===
                        "assistant"
                    ) &&

                    typeof turn.content ===
                    "string" &&

                    turn.content.trim()

                );

            }
        )

        .slice(-MAX_HISTORY)

        .map(
            turn => ({

                role:
                    turn.role,

                content:
                    turn.content
                        .trim()
                        .slice(
                            0,
                            4000
                        )

            })
        );

}


// ============================================================
// MAIN HANDLER
// ============================================================

exports.handleMessage =
    async function (
        req,
        res
    ) {

        try {

            let message =
                req.body &&
                req.body.message;


            let history =
                req.body &&
                req.body.history;


            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (
                !message ||
                !String(message).trim()
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Message is required"

                    });

            }


            message =
                String(message)
                    .trim();


            // ------------------------------------------------
            // AUTH
            // ------------------------------------------------

            let userId =
                getUserIdFromRequest(
                    req
                );


            // ------------------------------------------------
            // HISTORY
            // ------------------------------------------------

            let safeHistory =
                buildSafeHistory(
                    history
                );


            // ------------------------------------------------
            // CURRENT MESSAGE
            // ------------------------------------------------

            let conversation = [

                ...safeHistory,

                {

                    role:
                        "user",

                    content:
                        message

                }

            ];


            let result =
                null;


            // ------------------------------------------------
            // FAST DATABASE RESPONSE
            // ------------------------------------------------

            try {

                console.log(
                    "Using fast database chatbot response"
                );


                result =
                    await runFallbackChat(
                        req,
                        userId,
                        message,
                        safeHistory
                    );

            }

            catch (error) {

                console.error(
                    "Fast chatbot response error:",
                    error
                );

                result =
                    null;

            }


            // ------------------------------------------------
            // GEMINI FALLBACK
            // ------------------------------------------------

            if (
                !result &&
                GEMINI_API_KEY
            ) {

                try {

                    result =
                        await runAgenticChat(
                            req,
                            userId,
                            conversation
                        );

                }

                catch (error) {

                    console.error(
                        "Agentic Gemini error:",
                        error
                    );

                    result =
                        null;

                }

            }


            // ------------------------------------------------
            // RESPONSE
            // ------------------------------------------------

            result = result || {

                reply:
                    "I'm here to help with products, prices, stock, and orders. Could you tell me a little more?",

                products:
                    [],

                orders:
                    []

            };

            return res
                .status(200)
                .json({

                    success:
                        true,

                    reply:
                        result.reply ||
                        "I'm here to help.",

                    products:
                        Array.isArray(
                            result.products
                        )
                            ?
                            result.products
                            :
                            [],

                    orders:
                        Array.isArray(
                            result.orders
                        )
                            ?
                            result.orders
                            :
                            []

                });

        }

        catch (error) {

            console.error(
                "CHATBOT ERROR:",
                error
            );


            // ------------------------------------------------
            // LAST RESORT
            // ------------------------------------------------

            return res
                .status(200)
                .json({

                    success:
                        true,

                    reply:
                        "I'm having trouble connecting right now. Please try your message again.",

                    products:
                        [],

                    orders:
                        []

                });

        }

    };


// ============================================================
// EXPORTS FOR OPTIONAL TESTING
// ============================================================

exports.toolSearchProducts =
    toolSearchProducts;

exports.toolGetProductDetails =
    toolGetProductDetails;

exports.toolGetCategories =
    toolGetCategories;

exports.toolGetOrders =
    toolGetOrders;

exports.toolTrackOrder =
    toolTrackOrder;