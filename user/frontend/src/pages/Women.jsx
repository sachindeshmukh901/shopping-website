import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroCarousel from "../components/HeroCarousel";

import "../styles/women.css";
import "../styles/wishlistButton.css";

import {
  getProducts,
  getProductImage,
  getCategories
} from "../api/productApi";

import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";


function Women() {

  // ========================================
  // HERO CAROUSEL SLIDES
  // ========================================

  const heroSlides = [

    {
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
      alt: "Woman shopping with paper bags",
      title: "New Season Arrivals",
      subtitle: "Fresh styles, everyday elegance"
    },

    {
      image:
        "https://images.unsplash.com/photo-1601762603339-fd61e28b698a?auto=format&fit=crop&w=1600&q=80",
      alt: "Woman in a grey trench coat",
      title: "Winter Edit",
      subtitle: "Coats & layers for every mood"
    },

    {
      image:
        "https://images.unsplash.com/photo-1513094735237-8f2714d57c13?auto=format&fit=crop&w=1600&q=80",
      alt: "Woman walking with a shopping bag",
      title: "Street Style Essentials",
      subtitle: "Curated looks, ready to wear"
    },

    {
      image:
        "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=1600&q=80",
      alt: "Woman in a black dress with a sunhat",
      title: "Evening Glam",
      subtitle: "Dresses made for the spotlight"
    }

  ];


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

  const { toggleWishlist, isInWishlist } =
    useContext(WishlistContext);


  // ========================================
  // LOAD CATEGORIES
  // ========================================

  const getPageCategories = (list = []) => {
    const normalize = (value = "") => value.toLowerCase().trim();

    return list.filter((category) => {
      if (category.status === "Inactive") return false;

      const targetPage = normalize(category.target_page || category.category_name || "");

      if (category.target_page) {
        return (
          targetPage.includes("women") ||
          targetPage.includes("ladies") ||
          targetPage.includes("female")
        );
      }

      const name = normalize(category.category_name);

      return (
        name.includes("women") ||
        name.includes("dress") ||
        name.includes("female") ||
        name.includes("girl")
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


  // ========================================
  // LOAD WOMEN PRODUCTS
  // ========================================

  const loadProducts = async () => {

    try {

      setLoading(true);

      setError("");

      let data =
        await getProducts("Women");

      console.log(
        "Women Products:",
        data
      );


      if (
        data &&
        data.success &&
        Array.isArray(data.products)
      ) {

        setProducts(data.products);

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
        "Women Products Error:",
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


  // ========================================
  // LOAD ON PAGE OPEN
  // ========================================

  useEffect(() => {

    loadCategories();
    loadProducts();

  }, []);


  // ========================================
  // CATEGORY FILTER
  // ========================================

  let filteredProducts = products;


  if (selectedCategory !== "all") {

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


  return (

    <>

      <Navbar />


      {/* ====================================
          HERO
      ==================================== */}

      <section className="women-hero">

        <HeroCarousel
          slides={heroSlides}
          interval={4000}
        />

      </section>


      {/* ====================================
          CATEGORY
      ==================================== */}

      <section className="category-section">

        <button
          className={
            selectedCategory === "all"
              ? "category active"
              : "category"
          }
          onClick={() => setSelectedCategory("all")}
        >
          All
        </button>

        {(categories.length > 0 ? categories : [
          { category_name: "Women Wear" },
          { category_name: "Ethnic Wear" },
          { category_name: "Winter Wear" },
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


      {/* ====================================
          PRODUCTS
      ==================================== */}

      <section className="women-products">

        <div className="products-grid">


          {/* LOADING */}

          {loading && (

            <div className="products-message">

              <h2>
                Loading Products...
              </h2>

            </div>

          )}


          {/* ERROR */}

          {!loading && error && (

            <div className="products-message error">

              <h2>
                Something went wrong
              </h2>

              <p>
                {error}
              </p>

              <button
                onClick={loadProducts}
              >
                Try Again
              </button>

            </div>

          )}


          {/* EMPTY */}

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


          {/* PRODUCTS */}

          {!loading &&
            !error &&
            filteredProducts.map((item) => (

              <div
                className="product-card"
                key={item.product_id}
                onClick={() =>
                  navigate(`/product/${item.product_id}`)
                }
                style={{ cursor: "pointer" }}
              >


                {/* IMAGE */}

                <div className="product-image">

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

                      toggleWishlist({

                        id: item.product_id,
                        product_id: item.product_id,
                        name: item.product_name,
                        image: getProductImage(item.image),
                        price: Number(item.price || 0),
                        discount: Number(item.discount || 0),
                        brand: item.brand || "ORGOS",
                        stock: Number(item.stock || 0)

                      });

                    }}
                  >

                    {isInWishlist(item.product_id) ? (
                      <AiFillHeart />
                    ) : (
                      <AiOutlineHeart />
                    )}

                  </button>

                  <img
                    src={getProductImage(
                      item.image
                    )}
                    alt={item.product_name}
                    onError={(event) => {

                      console.error(
                        "Image failed:",
                        event.target.src
                      );

                    }}
                  />

                </div>


                {/* DETAILS */}

                <div className="product-info">


                  <h3>
                    {item.product_name}
                  </h3>


                  <p className="brand">
                    {item.brand || "ORGOS"}
                  </p>


                  <p className="shop-name">
                    {item.shop_name}
                  </p>


                  {/* RATING */}

                  <div className="rating">

                    ⭐ {item.rating || "0.0"}

                  </div>


                  {/* PRICE */}

                  <div className="price-row">

                    <span className="new-price">

                      ₹
                      {Number(
                        item.price
                      ).toLocaleString("en-IN")}

                    </span>


                    {item.discount > 0 && (

                      <>

                        <del>

                          ₹
                          {Math.round(
                            Number(item.price) /
                            (1 -
                              Number(item.discount) /
                              100)
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </del>


                        <span className="discount">

                          -
                          {item.discount}%

                        </span>

                      </>

                    )}

                  </div>


                  {/* STOCK */}

                  <p className="stock">

                    Stock: {item.stock}

                  </p>


                  {/* CART */}

                  <button
                    className="cart-btn"
                    onClick={(e) => {

                      e.stopPropagation();

                      addToCart({

                        ...item,

                        id:
                          item.product_id,

                        name:
                          item.product_name,

                        image:
                          getProductImage(
                            item.image
                          )

                      });

                    }}
                  >

                    Add To Cart

                  </button>


                </div>


              </div>

            ))}


        </div>

      </section>


      <Footer />

    </>

  );

}


export default Women;