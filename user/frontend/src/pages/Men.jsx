import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroCarousel from "../components/HeroCarousel";

import "../styles/men.css";
import "../styles/wishlistButton.css";

import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

import { getCategories } from "../api/productApi";

import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";


import { toast } from "react-toastify";


function Men() {

  // ========================================
  // HERO CAROUSEL SLIDES
  // ========================================

  const heroSlides = [

    {
      image:
        "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1600&q=80",
      alt: "Man in a blue suit on the sidewalk",
      title: "Sharp & Tailored",
      subtitle: "Suits built for every occasion"
    },

    {
      image:
        "https://images.unsplash.com/photo-1622519407650-3df9883f76a5?auto=format&fit=crop&w=1600&q=80",
      alt: "Man in a black t-shirt and denim jeans",
      title: "Everyday Casual",
      subtitle: "Comfort meets street style"
    },

    {
      image:
        "https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?auto=format&fit=crop&w=1600&q=80",
      alt: "Man standing against a concrete wall",
      title: "Minimal Edit",
      subtitle: "Clean lines, timeless basics"
    },

    {
      image:
        "https://images.unsplash.com/photo-1559582798-678dfc71ccd8?auto=format&fit=crop&w=1600&q=80",
      alt: "Man walking with a shopping bag",
      title: "New Season Drops",
      subtitle: "Fresh arrivals, weekly"
    }

  ];


  let navigate = useNavigate();


  // =========================================
  // STATES
  // =========================================

  let [selectedCategory, setSelectedCategory] =
    useState("all");

  let [products, setProducts] =
    useState([]);

  let [categories, setCategories] =
    useState([]);

  let [loading, setLoading] =
    useState(true);

  let [error, setError] =
    useState("");


  // =========================================
  // CART CONTEXT
  // =========================================

  let { addToCart } =
    useContext(CartContext);

  let { toggleWishlist, isInWishlist } =
    useContext(WishlistContext);



  // =========================================
  // FETCH CATEGORIES
  // =========================================

  let isMenCategory = (categoryName = "") => {
    let name = String(categoryName || "").toLowerCase().trim();

    if (!name) return false;

    if (
      name.includes("women") ||
      name.includes("female") ||
      name.includes("girl") ||
      name.includes("dress") ||
      name.includes("kurti") ||
      name.includes("saree") ||
      name.includes("lehenga")
    ) {
      return false;
    }

    return (
      name.includes("men") ||
      name.includes("mens") ||
      name.includes("male") ||
      name.includes("shirt") ||
      name.includes("suit") ||
      name.includes("formal") ||
      name.includes("casual") ||
      name.includes("jeans") ||
      name.includes("trouser") ||
      name.includes("hoodie")
    );
  };

  let getPageCategories = (list = []) => {
    return list.filter((category) => {
      if (category.status === "Inactive") return false;

      let targetPage = String(category.target_page || category.category_name || "").toLowerCase();

      if (category.target_page) {
        return targetPage.includes("men") || targetPage.includes("mens") || targetPage.includes("male");
      }

      return isMenCategory(category.category_name);
    });
  };

  let fetchCategories = async () => {

    try {
      let data = await getCategories();

      if (data && data.success && Array.isArray(data.categories)) {
        setCategories(getPageCategories(data.categories));
      }
    }
    catch (error) {
      console.error("Fetch Categories Error:", error);
    }

  };


  // =========================================
  // FETCH MEN PRODUCTS
  // =========================================

  let fetchMenProducts = async () => {

    try {

      setLoading(true);

      setError("");


      let response =
        await fetch(
          "https://orgos-backend-l7mx.onrender.com/api/products?gender=Men"
        );


      let data =
        await response.json();


      if (
        response.ok &&
        data.success
      ) {

        setProducts(
          data.products || []
        );

      }

      else {

        setError(
          data.message ||
          "Unable to load men's products"
        );

      }

    }

    catch (error) {

      console.error(
        "Fetch Men Products Error:",
        error
      );


      setError(
        "Unable to connect with server"
      );

    }

    finally {

      setLoading(false);

    }

  };



  // =========================================
  // LOAD PRODUCTS
  // =========================================

  useEffect(() => {

    fetchCategories();
    fetchMenProducts();

  }, []);



  // =========================================
  // CATEGORY FILTER
  // =========================================

  let filteredProducts =
    products;


  if (
    selectedCategory !== "all"
  ) {

    filteredProducts =
      products.filter(
        (product) => {

          let categoryName =
            product.category_name
              ?.toLowerCase() || "";


          return categoryName.includes(
            selectedCategory.toLowerCase()
          );

        }
      );

  }



  // =========================================
  // PRODUCT IMAGE URL
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


    return `https://orgos-backend-l7mx.onrender.com${image}`;

  };



  // =========================================
  // ADD PRODUCT TO CART
  // =========================================

  let handleAddToCart = (product) => {

    let productForCart = {

      id:
        product.product_id,

      product_id:
        product.product_id,

      name:
        product.product_name,

      title:
        product.product_name,

      image:
        getImageUrl(
          product.image
        ),

      brand:
        product.brand ||
        "ORGOS",

      price:
        Number(
          product.discount_price ||
          product.price ||
          0
        ),

      oldPrice:
        Number(
          product.price ||
          0
        ),

      discount_price:
        product.discount_price,

      quantity: 1,

      stock:
        Number(
          product.stock ||
          0
        ),

      vendor_id:
        product.vendor_id,

      shop_name:
        product.shop_name,

      owner_name:
        product.owner_name,

      category_id:
        product.category_id,

      category_name:
        product.category_name,

      gender:
        product.gender

    };


    addToCart(
      productForCart
    );


    toast.success(
      "Product Added Successfully"
    );

  };



  // =========================================
  // TOGGLE WISHLIST
  // =========================================

  let handleToggleWishlist = (product) => {

    toggleWishlist({

      id:
        product.product_id,

      product_id:
        product.product_id,

      name:
        product.product_name,

      image:
        getImageUrl(
          product.image
        ),

      price:
        Number(
          product.discount_price ||
          product.price ||
          0
        ),

      oldPrice:
        Number(
          product.price ||
          0
        ),

      brand:
        product.brand ||
        "ORGOS",

      stock:
        Number(
          product.stock ||
          0
        )

    });

  };



  // =========================================
  // FORMAT PRICE
  // =========================================

  let formatPrice = (price) => {

    return Number(
      price || 0
    ).toLocaleString(
      "en-IN"
    );

  };



  // =========================================
  // RENDER
  // =========================================

  return (

    <>

      <Navbar />



      {/* =====================================
          HERO
      ===================================== */}

      <section className="men-hero">

        <HeroCarousel
          slides={heroSlides}
          interval={4000}
        />

      </section>



      {/* =====================================
          CATEGORIES
      ===================================== */}

      <section className="men-categories">

        <div
          className={
            selectedCategory === "all"
              ? "cat active"
              : "cat"
          }
          onClick={() => setSelectedCategory("all")}
        >
          All
        </div>

        {(categories.length > 0 ? categories : [
          { category_name: "Men Wear" }
        ]).map((category) => (
          <div
            key={category.category_id || category.category_name}
            className={
              selectedCategory === category.category_name
                ? "cat active"
                : "cat"
            }
            onClick={() => setSelectedCategory(category.category_name)}
          >
            {category.category_name}
          </div>
        ))}

      </section>



      {/* =====================================
          PRODUCTS
      ===================================== */}

      <section className="men-products">


        {/* ===================================
            LOADING
        =================================== */}

        {loading && (

          <div className="products-message">

            Loading men's products...

          </div>

        )}



        {/* ===================================
            ERROR
        =================================== */}

        {!loading &&
          error && (

            <div className="products-message error">

              {error}

            </div>

          )}



        {/* ===================================
            NO PRODUCTS
        =================================== */}

        {!loading &&
          !error &&
          filteredProducts.length === 0 && (

            <div className="products-message">

              No men's products available.

            </div>

          )}



        {/* ===================================
            PRODUCT GRID
        =================================== */}

        {!loading &&
          !error &&
          filteredProducts.length > 0 && (

            <div className="products-grid">


              {filteredProducts.map(
                (item) => {


                  let stock =
                    Number(
                      item.stock || 0
                    );


                  let originalPrice =
                    Number(
                      item.price || 0
                    );


                  let sellingPrice =
                    Number(
                      item.discount_price ||
                      item.price ||
                      0
                    );


                  let hasDiscount =
                    item.discount_price &&
                    originalPrice >
                    sellingPrice;


                  let discountPercentage =
                    hasDiscount
                      ? Math.round(
                        (
                          (
                            originalPrice -
                            sellingPrice
                          ) /
                          originalPrice
                        ) *
                        100
                      )
                      : 0;


                  return (

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


                      {/* ====================
                          PRODUCT IMAGE
                      ==================== */}

                      <div className="product-image-wrapper">

                        <button
                          type="button"
                          className={
                            isInWishlist(item.product_id)
                              ? "wishlist-btn active"
                              : "wishlist-btn"
                          }
                          aria-label="Toggle Wishlist"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleWishlist(item);
                          }}
                        >

                          {isInWishlist(item.product_id) ? (
                            <AiFillHeart />
                          ) : (
                            <AiOutlineHeart />
                          )}

                        </button>

                        {item.image ? (

                          <img
                            src={
                              getImageUrl(
                                item.image
                              )
                            }
                            alt={
                              item.product_name
                            }
                          />

                        ) : (

                          <div className="no-product-image">

                            No Image

                          </div>

                        )}

                      </div>



                      {/* ====================
                          PRODUCT NAME
                      ==================== */}

                      <h3>

                        {
                          item.product_name ||
                          "Unnamed Product"
                        }

                      </h3>



                      {/* ====================
                          BRAND
                      ==================== */}

                      <p className="product-brand">

                        {
                          item.brand ||
                          "ORGOS"
                        }

                      </p>



                      {/* ====================
                          VENDOR SHOP
                      ==================== */}

                      <p className="product-shop">

                        {
                          item.shop_name ||
                          "ORGOS Seller"
                        }

                      </p>



                      {/* ====================
                          PRICE
                      ==================== */}

                      <div className="price-row">


                        <span className="new-price">

                          ₹
                          {
                            formatPrice(
                              sellingPrice
                            )
                          }

                        </span>



                        {hasDiscount && (

                          <del>

                            ₹
                            {
                              formatPrice(
                                originalPrice
                              )
                            }

                          </del>

                        )}



                        {hasDiscount && (

                          <span className="discount">

                            -
                            {
                              discountPercentage
                            }%

                          </span>

                        )}


                      </div>



                      {/* ====================
                          STOCK
                      ==================== */}

                      <p className="product-stock">

                        {stock > 0

                          ? `Stock: ${stock}`

                          : "Out of Stock"

                        }

                      </p>



                      {/* ====================
                          ADD TO CART
                      ==================== */}

                      <button
                        className="cart-btn"
                        disabled={
                          stock <= 0
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(
                            item
                          );
                        }}
                      >

                        {stock > 0

                          ? "Add To Cart"

                          : "Out of Stock"

                        }

                      </button>


                    </div>

                  );

                }
              )}


            </div>

          )}


      </section>



      {/* =====================================
          FOOTER
      ===================================== */}

      <Footer />


    </>

  );

}


export default Men;