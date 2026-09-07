const express = require("express");
const path = require("path");
const setupSwagger = require("./swagger");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ======================================================
// DATABASE
// ======================================================

require("./config/db");
const { ensureSpinTables } = require("./config/spinInit");

ensureSpinTables();


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

// ======================================================
// STATIC FILES - SERVE UPLOADS
// ======================================================

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);


// ======================================================
// ROUTES
// ======================================================

const authRoutes =
    require("./routes/authRoutes");

const vendorRoutes =
    require("./routes/vendorRoutes");

const adminRoutes =
    require("./routes/adminRoutes");

const productRoutes =
    require("./routes/productRoutes");

const categoryRoutes =
    require("./routes/categoryRoutes");

const cartRoutes =
    require("./routes/cartRoutes");

const orderRoutes =
    require("./routes/orderRoutes");

const earningRoutes =
    require("./routes/earningRoutes");


const wishlistRoutes =
    require("./routes/wishlistRoutes");

const reviewRoutes =
    require("./routes/reviewRoutes");

const returnRoutes =
    require("./routes/returnRoutes");

const couponRoutes =
    require("./routes/couponRoutes");

const auxiliaryRoutes =
    require("./routes/auxiliaryRoutes");

const heatmapRoutes =
    require("./routes/heatmapRoutes");

const chatbotRoutes =
    require("./routes/chatbotRoutes");

const blogRoutes =
    require("./routes/blogRoutes");


// ======================================================
// API ROUTES
// ======================================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/vendor",
    vendorRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

app.use(
    "/api/products",
    productRoutes
);

app.use(
    "/api/categories",
    categoryRoutes
);

app.use(
    "/api/cart",
    cartRoutes
);

app.use(
    "/api/orders",
    orderRoutes
);
app.use(
    "/api/earnings",
    earningRoutes
);


app.use(
    "/api/returns",
    returnRoutes
);
app.use(
    "/api/wishlist",
    wishlistRoutes
);

app.use(
    "/api/reviews",
    reviewRoutes
);

app.use(
    "/api/coupons",
    couponRoutes
);

app.use(
    "/api/auxiliary",
    auxiliaryRoutes
);

app.use(
    "/api/admin/heatmap",
    heatmapRoutes
);

app.use(
    "/api/chatbot",
    chatbotRoutes
);

app.use(
    "/api/blogs",
    blogRoutes
);


// ======================================================
// SWAGGER
// ======================================================

setupSwagger(app);


// ======================================================
// ROOT
// ======================================================

app.get(
    "/",
    (req, res) => {

        res.send(
            "ORGOS Backend Running..."
        );

    }
);


// ======================================================
// SERVER
// ======================================================

app.listen(
    process.env.PORT || 5000,
    () => {

        console.log(
            `Server Running on Port ${process.env.PORT || 5000}`
        );

    }
);