import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroCarousel from "../components/HeroCarousel";

import "../styles/accessories.css";
import "../styles/wishlistButton.css";

import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

import { getCategories } from "../api/productApi";

import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";


function Accessories() {

  // ========================================
  // HERO CAROUSEL SLIDES
  // ========================================

  const heroSlides = [

    {
      image:
        "https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=1600&q=80",
      alt: "Bag, sneakers and sunglasses styled together",
      title: "Complete The Look",
      subtitle: "Bags, shoes & sunglasses"
    },

    {
      image:
        "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1600&q=80",
      alt: "Gold and silver jewelry collection",
      title: "Fine Jewelry Edit",
      subtitle: "Necklaces, earrings & rings"
    },

    {
      image:
        "https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?auto=format&fit=crop&w=1600&q=80",
      alt: "Gold analog watch",
      title: "Timeless Watches",
      subtitle: "Classic styles, everyday wear"
    },

    {
      image:
        "https://images.unsplash.com/photo-1612902457652-33aff0a641fa?auto=format&fit=crop&w=1600&q=80",
      alt: "Black framed sunglasses",
      title: "Sunglasses Collection",
      subtitle: "Shade in style"
    }

  ];


  const navigate = useNavigate();

  const [category, setCategory] =
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
  // IMAGE URL
  // ========================================

  let getImageUrl = (image) => {

    if (!image) {
      return "";
    }

    if (image.startsWith("http")) {
      return image;
    }

    return `https://orgos-backend-l7mx.onrender.com${image}`;

  };


  // ========================================
  // FETCH CATEGORIES
  // ========================================

  let getPageCategories = (list = []) => {
    let normalize = (value = "") => value.toLowerCase().trim();

    return list.filter((category) => {
      if (category.status === "Inactive") return false;

      let targetPage = normalize(category.target_page || category.category_name || "");

      if (category.target_page) {
        return (
          targetPage.includes("accessory") ||
          targetPage.includes("bag") ||
          targetPage.includes("watch") ||
          targetPage.includes("wallet") ||
          targetPage.includes("sunglass") ||
          targetPage.includes("jewellery") ||
          targetPage.includes("jewelry") ||
          targetPage.includes("perfume") ||
          targetPage.includes("belt") ||
          targetPage.includes("shoe")
        );
      }

      let name = normalize(category.category_name);

      return (
        name.includes("accessory") ||
        name.includes("bag") ||
        name.includes("watch") ||
        name.includes("sunglass") ||
        name.includes("jewellery") ||
        name.includes("jewelry") ||
        name.includes("wallet") ||
        name.includes("cap") ||
        name.includes("perfume") ||
        name.includes("shoe") ||
        name.includes("belt")
      );
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
      console.error("Categories fetch error:", error);
    }

  };


  // ========================================
  // FETCH PRODUCTS
  // ========================================

  let fetchProducts = async () => {

    try {

      setError("");

      let response =
        await fetch(
          "https://orgos-backend-l7mx.onrender.com/api/products"
        );


      let data =
        await response.json();


      if (
        response.ok &&
        data.success
      ) {

        let formattedProducts =
          (data.products || []).map(
            (product) => {

              return {

                ...product,

                id:
                  product.product_id,

                name:
                  product.product_name ||
                  "Unnamed Product",

                image:
                  getImageUrl(
                    product.image
                  ),

                price:
                  product.discount_price ||
                  product.price,

                oldPrice:
                  product.price,

                brand:
                  product.brand ||
                  "ORGOS",

                category:
                  product.category_name ||
                  "",

                stock:
                  Number(
                    product.stock || 0
                  )

              };

            }
          );


        setProducts(
          formattedProducts
        );

      }

      else {

        setError(
          data.message ||
          "Unable to load products"
        );

      }

    }

    catch (error) {

      console.error(
        "Accessories Products Error:",
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


  // ========================================
  // LOAD + AUTO REFRESH
  // ========================================

  useEffect(() => {

    fetchCategories();
    fetchProducts();


    let interval =
      setInterval(
        fetchProducts,
        10000
      );


    return () => {

      clearInterval(interval);

    };

  }, []);


  // ========================================
  // ACCESSORY CATEGORY FILTER
  // ========================================

  let filteredProducts =
    products.filter((product) => {

      let categoryName =
        (product.category_name || product.category || "")
          ?.toLowerCase() || "";


      let isAccessory =
        categoryName.includes("bag") ||
        categoryName.includes("watch") ||
        categoryName.includes("sunglass") ||
        categoryName.includes("jewellery") ||
        categoryName.includes("jewelry") ||
        categoryName.includes("wallet") ||
        categoryName.includes("cap") ||
        categoryName.includes("perfume") ||
        categoryName.includes("accessor") ||
        categoryName.includes("shoe") ||
        categoryName.includes("belt");


      if (!isAccessory) {
        return false;
      }


      if (category === "all") {
        return true;
      }


      return categoryName.includes(
        category.toLowerCase()
      );

    });


  return (

    <>

      <Navbar />


      {/* HERO */}

      <section className="accessories-hero">

        <HeroCarousel
          slides={heroSlides}
          interval={4000}
        />

      </section>


      {/* CATEGORY */}

      <section className="accessories-categories">

        <div
          className={
            category === "all"
              ? "acc-cat active"
              : "acc-cat"
          }
          onClick={() => setCategory("all")}
        >
          All Accessories
        </div>

        {(categories.length > 0 ? categories : [
          { category_name: "Accessories" },
          { category_name: "Footwear" },
          { category_name: "Winter Wear" },
          { category_name: "Ethnic Wear" }
        ]).map((categoryItem) => (
          <div
            key={categoryItem.category_id || categoryItem.category_name}
            className={
              category === categoryItem.category_name
                ? "acc-cat active"
                : "acc-cat"
            }
            onClick={() => setCategory(categoryItem.category_name)}
          >
            {categoryItem.category_name}
          </div>
        ))}

      </section>


      {/* PRODUCTS */}

      <section className="accessories-products">

        <div className="products-grid">


          {loading ? (

            <div className="product-message">

              Loading products...

            </div>

          ) : error ? (

            <div className="product-message">

              {error}

            </div>

          ) : filteredProducts.length === 0 ? (

            <div className="product-message">

              No accessories available.

            </div>

          ) : (

            filteredProducts.map(
              (item) => (

                <div
                  className="product-card"
                  key={item.id}
                  onClick={() =>
                    navigate(`/product/${item.id}`)
                  }
                  style={{ cursor: "pointer" }}
                >

                  <button
                    type="button"
                    className={
                      isInWishlist(item.id)
                        ? "wishlist-btn active"
                        : "wishlist-btn"
                    }
                    aria-label="Toggle Wishlist"
                    onClick={(e) => {

                      e.stopPropagation();

                      toggleWishlist(item);

                    }}
                  >

                    {isInWishlist(item.id) ? (
                      <AiFillHeart />
                    ) : (
                      <AiOutlineHeart />
                    )}

                  </button>

                  <img
                    src={item.image}
                    alt={item.name}
                  />


                  <h3>
                    {item.name}
                  </h3>


                  <p>
                    {item.brand}
                  </p>


                  <div className="price-row">

                    <span className="new-price">

                      ₹
                      {Number(
                        item.price || 0
                      ).toLocaleString(
                        "en-IN"
                      )}

                    </span>


                    {item.discount_price &&
                      Number(item.discount_price) <
                      Number(item.price) && (

                        <del>

                          ₹
                          {Number(
                            item.price
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </del>

                      )}


                  </div>


                  <button
                    disabled={
                      item.stock <= 0
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                  >

                    {item.stock <= 0
                      ? "Out of Stock"
                      : "Add To Cart"}

                  </button>


                </div>

              )
            )

          )}


        </div>

      </section>


      <Footer />

    </>

  );

}


export default Accessories;