import "../styles/navbar.css";

import logo from "../assets/images/logo.png";

import {
  useState,
  useContext,
  useEffect,
  useRef
} from "react";

import {
  useNavigate,
  useLocation
} from "react-router-dom";

import { FiSearch, FiX } from "react-icons/fi";
import { AiOutlineHeart } from "react-icons/ai";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { FiUser } from "react-icons/fi";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { FaTshirt } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";

import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";


function Navbar() {

  // =====================================================
  // NAVIGATION
  // =====================================================

  let navigate = useNavigate();

  let location = useLocation();


  // =====================================================
  // MENU
  // =====================================================

  let [menuOpen, setMenuOpen] =
    useState(false);


  // =====================================================
  // SEARCH
  // =====================================================

  let [searchOpen, setSearchOpen] =
    useState(false);

  let [searchText, setSearchText] =
    useState("");

  let [searchProducts, setSearchProducts] =
    useState([]);

  let [loadingSearch, setLoadingSearch] =
    useState(false);


  let searchRef =
    useRef(null);


  // =====================================================
  // CONTEXT
  // =====================================================

  let { cartItems } =
    useContext(CartContext);

  let { wishlistItems } =
    useContext(WishlistContext);


  // =====================================================
  // USER
  // =====================================================

  let [user, setUser] =
    useState(
      JSON.parse(
        localStorage.getItem("user")
      )
    );


  useEffect(() => {

    let checkUser = () => {

      setUser(
        JSON.parse(
          localStorage.getItem("user")
        )
      );

    };


    window.addEventListener(
      "storage",
      checkUser
    );


    checkUser();


    return () => {

      window.removeEventListener(
        "storage",
        checkUser
      );

    };

  }, []);


  // =====================================================
  // API
  // =====================================================

  let API_URL =
    import.meta.env.VITE_API_URL ||
    "https://orgos-backend-l7mx.onrender.com/api";


  // =====================================================
  // FETCH PRODUCTS FOR SEARCH
  // =====================================================

  useEffect(() => {

    fetchSearchProducts();

  }, []);


  async function fetchSearchProducts() {

    try {

      setLoadingSearch(true);


      let response =
        await fetch(
          `${API_URL}/products?limit=100&page=1`
        );


      if (!response.ok) {

        throw new Error(
          "Unable to load products"
        );

      }


      let data =
        await response.json();


      let products =
        Array.isArray(data.products)
          ? data.products
          : [];


      setSearchProducts(products);

    }

    catch (error) {

      console.error(
        "Navbar Search Error:",
        error
      );

      setSearchProducts([]);

    }

    finally {

      setLoadingSearch(false);

    }

  }


  // =====================================================
  // SEARCH FILTER
  // =====================================================

  let filteredProducts =
    searchProducts.filter(product => {

      let search =
        searchText
          .trim()
          .toLowerCase();


      if (!search) {

        return false;

      }


      let productName =
        String(
          product.product_name ||
          product.name ||
          ""
        ).toLowerCase();


      let category =
        String(
          product.category_name ||
          product.category ||
          ""
        ).toLowerCase();


      let description =
        String(
          product.description ||
          ""
        ).toLowerCase();


      let color =
        String(
          product.color ||
          product.colour ||
          ""
        ).toLowerCase();


      return (

        productName.includes(search) ||

        category.includes(search) ||

        description.includes(search) ||

        color.includes(search)

      );

    });


  // =====================================================
  // SHOW ONLY FIRST 6 RESULTS
  // =====================================================

  let displayedProducts =
    filteredProducts.slice(0, 6);


  // =====================================================
  // PRODUCT IMAGE
  // =====================================================

  function getProductImage(product) {

    let image =
      product.image ||
      product.image_url ||
      product.product_image ||
      product.image_path ||
      product.thumbnail ||
      product.product_image_url;


    if (
      typeof image === "string" &&
      image.startsWith("[")
    ) {

      try {

        let images =
          JSON.parse(image);


        if (
          Array.isArray(images) &&
          images.length > 0
        ) {

          image = images[0];

        }

      }

      catch {

        image = "";

      }

    }


    if (Array.isArray(image)) {

      image =
        image.length > 0
          ? image[0]
          : "";

    }


    if (!image) {

      return "";

    }


    let normalizedImage =
      String(image)
        .trim()
        .toLowerCase();


    if (

      normalizedImage === "" ||

      normalizedImage === "null" ||

      normalizedImage === "undefined" ||

      normalizedImage === "n/a" ||

      normalizedImage === "na" ||

      normalizedImage === "-" ||

      normalizedImage === "[]"

    ) {

      return "";

    }


    if (

      image.startsWith("http://") ||

      image.startsWith("https://")

    ) {

      return image;

    }


    let serverURL =
      API_URL.replace("/api", "");


    if (image.startsWith("/")) {

      return `${serverURL}${image}`;

    }


    return `${serverURL}/${image}`;

  }


  // =====================================================
  // PRODUCT URL
  // =====================================================

  function getProductId(product) {

    return (
      product.product_id ||
      product.id
    );

  }


  // =====================================================
  // OPEN PRODUCT
  // =====================================================

  function openProduct(product) {

    let id =
      getProductId(product);


    setSearchOpen(false);

    setSearchText("");

    setMenuOpen(false);


    if (id) {

      navigate(
        `/product/${id}`
      );

    }

  }


  // =====================================================
  // SEARCH TOGGLE
  // =====================================================

  function toggleSearch() {

    setSearchOpen(
      previous => !previous
    );

    setMenuOpen(false);

  }


  // =====================================================
  // CLOSE SEARCH
  // =====================================================

  function closeSearch() {

    setSearchOpen(false);

    setSearchText("");

  }


  // =====================================================
  // CLOSE SEARCH ON OUTSIDE CLICK
  // =====================================================

  useEffect(() => {

    function handleOutsideClick(event) {

      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target
        )
      ) {

        setSearchOpen(false);

      }

    }


    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

    };

  }, []);


  // =====================================================
  // CLOSE SEARCH / MENU ON ROUTE CHANGE
  // =====================================================

  useEffect(() => {

    setSearchOpen(false);

    setSearchText("");

    setMenuOpen(false);

  }, [location.pathname]);


  // =====================================================
  // LOCK BODY SCROLL WHEN MOBILE MENU IS OPEN
  // =====================================================

  useEffect(() => {

    if (menuOpen) {

      document.body.style.overflow = "hidden";

    }

    else {

      document.body.style.overflow = "";

    }


    return () => {

      document.body.style.overflow = "";

    };

  }, [menuOpen]);


  // =====================================================
  // NAVIGATION
  // =====================================================

  function goTo(path) {

    navigate(path);

    setMenuOpen(false);

  }


  // =====================================================
  // ACTIVE PAGE
  // =====================================================

  function isActive(path) {

    if (path === "/") {

      return location.pathname === "/";

    }


    return (
      location.pathname === path ||
      location.pathname.startsWith(
        `${path}/`
      )
    );

  }


  // =====================================================
  // NAV LINKS
  // =====================================================

  let navItems = [

    {
      name: "Home",
      path: "/"
    },

    {
      name: "Shop",
      path: "/shop"
    },

    {
      name: "Women",
      path: "/women"
    },

    {
      name: "Men",
      path: "/men"
    },

    {
      name: "Kids",
      path: "/kids"
    },

    {
      name: "Accessories",
      path: "/accessories"
    },

    {
      name: "About Us",
      path: "/about"
    },

    {
      name: "Contact Us",
      path: "/contact"
    },

    {
      name: "Blog",
      path: "/blog"
    },

    {
      name: "Smart Features",
      path: "/smart-feature"
    }

  ];


  // =====================================================
  // UI
  // =====================================================

  return (

    <>

      <nav className="navbar">


        {/* =================================================
          LOGO
      ================================================= */}

        <div
          className="navbar-logo"
          onClick={() => goTo("/")}
        >

          <img
            src={logo}
            alt="ORGOS Logo"
          />

        </div>


        {/* =================================================
          LINKS
      ================================================= */}

        <ul
          className={
            menuOpen
              ? "nav-links active"
              : "nav-links"
          }
        >

          {navItems.map(item => (

            <li
              key={item.path}
              className={
                isActive(item.path)
                  ? "active"
                  : ""
              }
              onClick={() =>
                goTo(item.path)
              }
            >

              {item.name}

            </li>

          ))}


          {/* =============================================
            MOBILE-ONLY QUICK LINKS
            (Wishlist / Account, shown only when the
            dropdown menu is open on small screens)
        ============================================= */}

          <li
            className="mobile-only-link"
            onClick={() =>
              goTo("/dashboard?tab=wishlist")
            }
          >

            <AiOutlineHeart />
            Wishlist
            {wishlistItems.length > 0 && (
              <span className="mobile-link-badge">
                {wishlistItems.length}
              </span>
            )}

          </li>

          <li
            className="mobile-only-link"
            onClick={() =>
              goTo(
                user ? "/dashboard" : "/account"
              )
            }
          >

            <FiUser />
            {user ? `Hi, ${user.full_name}` : "Login / Sign Up"}

          </li>

        </ul>


        {/* =================================================
          ICONS
      ================================================= */}

        <div className="nav-icons">


          {/* SEARCH */}

          <div
            className="navbar-search-wrapper"
            ref={searchRef}
          >

            <FiSearch
              className="nav-icon search-icon"
              onClick={toggleSearch}
            />


            {/* SEARCH BOX */}

            {searchOpen && (

              <div className="navbar-search-box">


                {/* INPUT */}

                <div className="search-input-wrapper">

                  <FiSearch />

                  <input
                    type="text"
                    autoFocus
                    value={searchText}
                    onChange={(e) =>
                      setSearchText(
                        e.target.value
                      )
                    }
                    placeholder="Search products..."
                  />


                  <FiX
                    className="search-close"
                    onClick={closeSearch}
                  />

                </div>


                {/* RESULTS */}

                <div className="search-results">


                  {!searchText.trim() && (

                    <div className="search-message">

                      Search for products,
                      categories or colors.

                    </div>

                  )}


                  {searchText.trim() &&
                    loadingSearch && (

                      <div className="search-message">

                        Searching products...

                      </div>

                    )}


                  {searchText.trim() &&
                    !loadingSearch &&
                    displayedProducts.length === 0 && (

                      <div className="search-message">

                        No products found for
                        <strong>
                          {" "}
                          "{searchText}"
                        </strong>

                      </div>

                    )}


                  {displayedProducts.length > 0 && (

                    <>

                      <div className="search-result-title">

                        Products

                      </div>


                      {displayedProducts.map(
                        product => {

                          let image =
                            getProductImage(
                              product
                            );


                          let productName =
                            product.product_name ||
                            product.name ||
                            "Product";


                          let productPrice =
                            Number(
                              product.price ||
                              product.sale_price ||
                              0
                            );


                          return (

                            <div
                              className="search-product"
                              key={
                                getProductId(
                                  product
                                )
                              }
                              onClick={() =>
                                openProduct(
                                  product
                                )
                              }
                            >


                              {/* IMAGE */}

                              <div className="search-product-image">

                                {image ? (

                                  <img
                                    src={image}
                                    alt={productName}
                                  />

                                ) : (

                                  <FaTshirt />

                                )}

                              </div>


                              {/* INFO */}

                              <div className="search-product-info">

                                <h4>
                                  {productName}
                                </h4>

                                <p>
                                  {product.category_name ||
                                    product.category ||
                                    "Fashion"}
                                </p>

                                <strong>
                                  ₹
                                  {productPrice.toLocaleString(
                                    "en-IN"
                                  )}
                                </strong>

                              </div>


                              <FaArrowRight
                                className="search-arrow"
                              />

                            </div>

                          );

                        }
                      )}


                      {filteredProducts.length > 6 && (

                        <button
                          className="view-all-search"
                          onClick={() =>
                            goTo(
                              `/shop?search=${encodeURIComponent(
                                searchText
                              )}`
                            )
                          }
                        >

                          View All Results

                        </button>

                      )}

                    </>

                  )}

                </div>

              </div>

            )}

          </div>


          {/* =================================================
            WISHLIST
        ================================================= */}

          <div
            className="cart-icon"
            onClick={() =>
              navigate(
                "/dashboard?tab=wishlist"
              )
            }
          >

            <AiOutlineHeart
              className="nav-icon"
            />

            <span className="cart-count">

              {wishlistItems.length}

            </span>

          </div>


          {/* =================================================
            CART
        ================================================= */}

          <div
            className="cart-icon"
            onClick={() =>
              navigate("/cart")
            }
          >

            <HiOutlineShoppingBag
              className="nav-icon"
            />

            <span className="cart-count">

              {cartItems.length}

            </span>

          </div>


          {/* =================================================
            USER
        ================================================= */}

          {user ? (

            <div
              className="user-name"
              onClick={() =>
                navigate("/dashboard")
              }
            >

              Welcome {user.full_name}

            </div>

          ) : (

            <FiUser
              className="nav-icon user-icon"
              onClick={() =>
                navigate("/account")
              }
            />

          )}

        </div>


        {/* =================================================
          MOBILE MENU TOGGLE
      ================================================= */}

        <div
          className="menu-icon"
          role="button"
          aria-label={
            menuOpen ? "Close menu" : "Open menu"
          }
          aria-expanded={menuOpen}
          onClick={() =>
            setMenuOpen(
              previous => !previous
            )
          }
        >

          {menuOpen ? <HiX /> : <HiMenuAlt3 />}

        </div>

      </nav>


      {/* =================================================
        MOBILE MENU BACKDROP
    ================================================= */}

      {menuOpen && (

        <div
          className="mobile-nav-backdrop"
          onClick={() =>
            setMenuOpen(false)
          }
        />

      )}

    </>

  );

}


export default Navbar;