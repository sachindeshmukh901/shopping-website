import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/kids.css";
import "../styles/wishlistButton.css";

import {
  getProducts,
  getProductImage,
  getCategories
} from "../api/productApi";

import {
  AiOutlineHeart,
  AiFillHeart
} from "react-icons/ai";

import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";


function Kids() {

  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [products, setProducts] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const { addToCart } =
    useContext(CartContext);

  const {
    toggleWishlist,
    isInWishlist
  } = useContext(WishlistContext);


  // ==========================================================
  // LOAD CATEGORIES
  // ==========================================================

  const getPageCategories = (list = []) => {
    const normalize = (value = "") => value.toLowerCase().trim();

    return list.filter((category) => {
      if (category.status === "Inactive") return false;

      const targetPage = normalize(category.target_page || category.category_name || "");

      if (category.target_page) {
        return (
          targetPage.includes("kids") ||
          targetPage.includes("kid") ||
          targetPage.includes("children") ||
          targetPage.includes("boy") ||
          targetPage.includes("girl")
        );
      }

      const name = normalize(category.category_name);

      return (
        name.includes("kids") ||
        name.includes("kid") ||
        name.includes("boy") ||
        name.includes("girl") ||
        name.includes("children")
      );
    });
  };

  const loadCategories = async () => {

    try {
      let data = await getCategories();

      if (data && data.success && Array.isArray(data.categories)) {
        setCategories(getPageCategories(data.categories));
      }
    }
    catch (error) {
      console.error("Categories fetch error:", error);
    }

  };


  // ==========================================================
  // LOAD KIDS PRODUCTS
  // ==========================================================

  const loadProducts = async () => {

    try {

      setLoading(true);

      setError("");

      let data =
        await getProducts("Kids");

      console.log(
        "Kids Products:",
        data
      );


      if (
        data &&
        data.success &&
        Array.isArray(data.products)
      ) {

        setProducts(
          data.products
        );

      }

      else {

        setProducts([]);

        setError(
          "No products found"
        );

      }

    }

    catch (error) {

      console.error(
        "Kids Products Error:",
        error
      );

      setError(
        "Unable to load products"
      );

    }

    finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // LOAD PRODUCTS ON PAGE OPEN
  // ==========================================================

  useEffect(() => {

    loadCategories();
    loadProducts();

  }, []);


  // ==========================================================
  // CATEGORY FILTER
  // ==========================================================

  let filteredProducts =
    products;


  if (
    selectedCategory !== "all"
  ) {

    filteredProducts =
      products.filter((item) => {

        let categoryName =
          item.category_name
            ?.toLowerCase()
            .trim() || "";


        return categoryName.includes(
          selectedCategory.toLowerCase()
        );

      });

  }


  // ==========================================================
  // TOGGLE WISHLIST
  // ==========================================================

  const handleWishlist = (
    event,
    item
  ) => {

    event.preventDefault();

    event.stopPropagation();


    toggleWishlist({

      id:
        item.product_id,

      product_id:
        item.product_id,

      name:
        item.product_name,

      image:
        getProductImage(
          item.image
        ),

      price:
        Number(
          item.price || 0
        ),

      discount:
        Number(
          item.discount || 0
        ),

      brand:
        item.brand ||
        "ORGOS",

      stock:
        Number(
          item.stock || 0
        )

    });

  };


  // ==========================================================
  // ADD TO CART
  // ==========================================================

  const handleAddToCart = (
    item
  ) => {

    addToCart({

      ...item,

      id:
        item.product_id,

      product_id:
        item.product_id,

      name:
        item.product_name,

      image:
        getProductImage(
          item.image
        )

    });

  };


  return (

    <>

      <Navbar />


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="kids-hero">

        <div className="kids-banner">

          <h1>
            Kids Collection
          </h1>

          <p>
            Comfortable & trendy wear
            for your little ones
          </p>

        </div>

      </section>


      {/* =====================================================
          CATEGORY
      ===================================================== */}

      <section className="category-section">

        <button
          className={
            selectedCategory === "all" ? "category active" : "category"
          }
          onClick={() => setSelectedCategory("all")}
        >
          All
        </button>

        {(categories.length > 0 ? categories : [
          { category_name: "Kids Wear" },
          { category_name: "Winter Wear" },
          { category_name: "Ethnic Wear" },
          { category_name: "Sports Wear" }
        ]).map((category) => (
          <button
            key={category.category_id || category.category_name}
            className={
              selectedCategory === category.category_name
                ? "category active"
                : "category"
            }
            onClick={() => setSelectedCategory(category.category_name)}
          >
            {category.category_name}
          </button>
        ))}




      </section>


      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      <section className="kids-products">

        <div className="products-grid">


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (

            <div className="products-message">

              <h2>
                Loading Products...
              </h2>

            </div>

          )}


          {/* =================================================
              ERROR
          ================================================= */}

          {!loading &&
            error && (

              <div className="products-message error">

                <h2>
                  Something went wrong
                </h2>

                <p>
                  {error}
                </p>

                <button
                  onClick={
                    loadProducts
                  }
                >
                  Try Again
                </button>

              </div>

            )}


          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading &&
            !error &&
            filteredProducts.length === 0 && (

              <div className="products-message">

                <h2>
                  No Products Found
                </h2>

                <p>
                  No products are available
                  in this category.
                </p>

              </div>

            )}


          {/* =================================================
              PRODUCT CARDS
          ================================================= */}

          {!loading &&
            !error &&
            filteredProducts.map(
              (item) => (

                <div
                  className="product-card"
                  key={
                    item.product_id
                  }
                  onClick={() =>
                    navigate(
                      `/product/${item.product_id}`
                    )
                  }
                  style={{ cursor: "pointer" }}
                >


                  {/* ==========================================
                      PRODUCT IMAGE
                  ========================================== */}

                  <div className="product-image">


                    {/* ========================================
                        WISHLIST ICON
                    ======================================== */}

                    <button
                      type="button"

                      className={
                        isInWishlist(
                          item.product_id
                        )
                          ? "wishlist-btn active"
                          : "wishlist-btn"
                      }

                      aria-label={
                        isInWishlist(
                          item.product_id
                        )
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }

                      onClick={(event) =>
                        handleWishlist(
                          event,
                          item
                        )
                      }

                    >

                      {isInWishlist(
                        item.product_id
                      ) ? (

                        <AiFillHeart />

                      ) : (

                        <AiOutlineHeart />

                      )}

                    </button>


                    {/* ========================================
                        PRODUCT IMAGE
                    ======================================== */}

                    <img
                      src={
                        getProductImage(
                          item.image
                        )
                      }

                      alt={
                        item.product_name
                      }

                      onError={(
                        event
                      ) => {

                        console.error(
                          "Image failed:",
                          event.target.src
                        );

                      }}

                    />

                  </div>


                  {/* ==========================================
                      PRODUCT DETAILS
                  ========================================== */}

                  <div className="product-info">


                    <h3>
                      {
                        item.product_name
                      }
                    </h3>


                    <p className="brand">

                      {
                        item.brand ||
                        "ORGOS"
                      }

                    </p>


                    <p className="shop-name">

                      {
                        item.shop_name
                      }

                    </p>


                    {/* ========================================
                        RATING
                    ======================================== */}

                    <div className="rating">

                      ⭐{" "}
                      {
                        item.rating ||
                        "0.0"
                      }

                    </div>


                    {/* ========================================
                        PRICE
                    ======================================== */}

                    <div className="price-row">


                      <span className="new-price">

                        ₹
                        {
                          Number(
                            item.price
                          ).toLocaleString(
                            "en-IN"
                          )
                        }

                      </span>


                      {item.discount > 0 && (

                        <>

                          <del>

                            ₹
                            {
                              Math.round(

                                Number(
                                  item.price
                                ) /

                                (
                                  1 -

                                  Number(
                                    item.discount
                                  ) /

                                  100

                                )

                              ).toLocaleString(
                                "en-IN"
                              )
                            }

                          </del>


                          <span className="discount">

                            -
                            {
                              item.discount
                            }%

                          </span>

                        </>

                      )}

                    </div>


                    {/* ========================================
                        STOCK
                    ======================================== */}

                    <p className="stock">

                      Stock:{" "}
                      {
                        item.stock
                      }

                    </p>


                    {/* ========================================
                        ADD TO CART
                    ======================================== */}

                    <button
                      className="cart-btn"

                      onClick={(event) => {
                        event.stopPropagation();
                        handleAddToCart(
                          item
                        );
                      }}

                    >

                      Add To Cart

                    </button>


                  </div>


                </div>

              )
            )}


        </div>

      </section>


      <Footer />

    </>

  );

}


export default Kids;