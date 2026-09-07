import { useEffect, useMemo, useState } from "react";

import {
  FaTshirt,
  FaMagic,
  FaShoppingBag,
  FaRedo,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaArrowRight,
  FaHeart
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/outfitGenerator.css";


// =====================================================
// HOW MANY RECENTLY ADDED PRODUCTS TO CONSIDER
// (keeps old / legacy products with broken or
// missing images out of the outfit generator)
// =====================================================

const RECENT_PRODUCTS_LIMIT = 100;


function OutfitGenerator() {


  // =====================================================
  // API
  // =====================================================

  let API_URL =
    import.meta.env.VITE_API_URL ||
    "https://orgos-backend-h7ad.onrender.com/api";


  // import { toast } from "react-toastify";


  // =====================================================
  // FORM STATE
  // =====================================================

  let [gender, setGender] =
    useState("Men");

  let [occasion, setOccasion] =
    useState("Casual");

  let [style, setStyle] =
    useState("Smart Casual");

  let [color, setColor] =
    useState("Black");

  let [budget, setBudget] =
    useState("3000");


  // =====================================================
  // PRODUCTS
  // =====================================================

  let [products, setProducts] =
    useState([]);


  let [loadingProducts, setLoadingProducts] =
    useState(true);


  let [productError, setProductError] =
    useState("");


  // =====================================================
  // RESULT
  // =====================================================

  let [result, setResult] =
    useState(null);


  let [error, setError] =
    useState("");


  let [saving, setSaving] =
    useState(false);


  // Tracks product ids whose image URL failed to
  // load in the browser, so we can gracefully fall
  // back to the placeholder icon instead of showing
  // a broken image.
  let [brokenImages, setBrokenImages] =
    useState(() => new Set());


  function markImageBroken(productId) {

    setBrokenImages(previous => {

      let updated = new Set(previous);

      updated.add(productId);

      return updated;

    });

  }


  // =====================================================
  // FETCH REAL PRODUCTS
  // =====================================================

  useEffect(() => {

    fetchProducts();

  }, []);


  async function fetchProducts() {

    try {

      setLoadingProducts(true);

      setProductError("");


      // Only fetch the most recently added products
      // (backend returns products ordered by
      // created_at DESC by default). This keeps old /
      // legacy products, which may no longer have a
      // valid image file on the server, out of the
      // outfit generator.
      let response =
        await fetch(
          `${API_URL}/products?limit=${RECENT_PRODUCTS_LIMIT}&page=1`
        );


      if (!response.ok) {

        throw new Error(
          "Failed to fetch products."
        );

      }


      let data =
        await response.json();


      if (!data.success) {

        throw new Error(
          data.message ||
          "Unable to load products."
        );

      }


      let actualProducts =
        Array.isArray(data.products)
          ? data.products
          : [];


      setProducts(actualProducts);

    }

    catch (error) {

      console.error(
        "Outfit Products Error:",
        error
      );


      setProductError(
        "Unable to load products from the store."
      );

    }

    finally {

      setLoadingProducts(false);

    }

  }


  // =====================================================
  // NORMALIZE VALUE
  // =====================================================

  function normalize(value) {

    if (!value) {

      return "";

    }


    return String(value)
      .trim()
      .toLowerCase();

  }


  // =====================================================
  // GET PRODUCT IMAGE
  // =====================================================

  function getProductImage(product) {

    let image =
      product.image ||
      product.image_url ||
      product.product_image ||
      product.image_path ||
      product.thumbnail ||
      product.product_image_url;


    // -----------------------------------------
    // JSON IMAGE ARRAY
    // -----------------------------------------

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

        // Ignore invalid JSON

      }

    }


    if (
      Array.isArray(image)
    ) {

      image =
        image.length > 0
          ? image[0]
          : "";

    }


    if (!image) {

      return "";

    }


    // -----------------------------------------
    // TREAT COMMON PLACEHOLDER / DUMMY VALUES
    // AS "NO IMAGE"
    // -----------------------------------------

    let normalizedImage =
      String(image).trim().toLowerCase();

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


    // -----------------------------------------
    // FULL URL
    // -----------------------------------------

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {

      return image;

    }


    // -----------------------------------------
    // RELATIVE URL
    // -----------------------------------------

    let serverURL =
      API_URL.replace("/api", "");


    if (image.startsWith("/")) {

      return `${serverURL}${image}`;

    }


    return `${serverURL}/${image}`;

  }


  // =====================================================
  // GET CATEGORY
  // =====================================================

  function getCategory(product) {

    return (
      product.category_name ||
      product.category ||
      ""
    );

  }


  // =====================================================
  // CATEGORY TYPE
  // =====================================================

  function getCategoryType(product) {

    let category =
      normalize(
        getCategory(product)
      );


    let name =
      normalize(
        `${product.product_name || ""} ${product.name || ""}`
      );


    let combined =
      `${category} ${name}`;


    // TOP

    if (
      combined.includes("shirt") ||
      combined.includes("t-shirt") ||
      combined.includes("tshirt") ||
      combined.includes("top") ||
      combined.includes("kurti") ||
      combined.includes("blouse") ||
      combined.includes("polo") ||
      combined.includes("sweatshirt")
    ) {

      return "Top Wear";

    }


    // BOTTOM

    if (
      combined.includes("jean") ||
      combined.includes("trouser") ||
      combined.includes("pant") ||
      combined.includes("short") ||
      combined.includes("jogger") ||
      combined.includes("skirt")
    ) {

      return "Bottom Wear";

    }


    // FOOTWEAR

    if (
      combined.includes("shoe") ||
      combined.includes("sneaker") ||
      combined.includes("boot") ||
      combined.includes("loafer") ||
      combined.includes("sandal") ||
      combined.includes("heel") ||
      combined.includes("footwear")
    ) {

      return "Footwear";

    }


    // ACCESSORIES

    if (
      combined.includes("watch") ||
      combined.includes("belt") ||
      combined.includes("wallet") ||
      combined.includes("bag") ||
      combined.includes("cap") ||
      combined.includes("hat") ||
      combined.includes("sunglass") ||
      combined.includes("accessor")
    ) {

      return "Accessories";

    }


    // OUTERWEAR

    if (
      combined.includes("jacket") ||
      combined.includes("blazer") ||
      combined.includes("coat") ||
      combined.includes("hoodie")
    ) {

      return "Outerwear";

    }


    return "Other";

  }


  // =====================================================
  // GET GENDER
  // =====================================================

  function getProductGender(product) {

    return (
      product.gender ||
      product.product_gender ||
      "Unisex"
    );

  }


  // =====================================================
  // GET COLOR
  // =====================================================

  function getProductColor(product) {

    if (product.color) {

      return product.color;

    }


    if (product.colour) {

      return product.colour;

    }


    let text =
      normalize(
        `${product.product_name || ""} ${product.name || ""} ${product.description || ""}`
      );


    let colors = [

      "black",
      "white",
      "blue",
      "red",
      "green",
      "yellow",
      "pink",
      "brown",
      "grey",
      "gray",
      "beige",
      "navy",
      "purple"

    ];


    let foundColor =
      colors.find(
        item =>
          text.includes(item)
      );


    if (foundColor) {

      if (
        foundColor === "gray"
      ) {

        return "Grey";

      }


      return (
        foundColor.charAt(0)
          .toUpperCase() +
        foundColor.slice(1)
      );

    }


    return "Any";

  }


  // =====================================================
  // GET STYLE
  // =====================================================

  function getProductStyle(product) {

    if (product.style) {

      return product.style;

    }


    let text =
      normalize(
        `${product.product_name || ""} ${product.name || ""} ${product.description || ""}`
      );


    if (
      text.includes("formal") ||
      text.includes("blazer") ||
      text.includes("trouser")
    ) {

      return "Formal";

    }


    if (
      text.includes("casual")
    ) {

      return "Casual";

    }


    return "Smart Casual";

  }


  // =====================================================
  // GET OCCASION
  // =====================================================

  function getProductOccasion(product) {

    if (product.occasion) {

      return product.occasion;

    }


    let text =
      normalize(
        `${product.product_name || ""} ${product.name || ""} ${product.description || ""}`
      );


    if (
      text.includes("formal") ||
      text.includes("office") ||
      text.includes("business")
    ) {

      return "Formal";

    }


    return "Casual";

  }


  // =====================================================
  // PREPARE PRODUCTS
  // =====================================================

  let preparedProducts =
    useMemo(() => {

      return products
        .map(product => {

          let price =
            Number(
              product.price ||
              product.sale_price ||
              0
            );


          return {

            ...product,

            id:
              product.product_id ||
              product.id,

            name:
              product.product_name ||
              product.name ||
              "Product",

            price,

            category:
              getCategory(product),

            categoryType:
              getCategoryType(product),

            gender:
              getProductGender(product),

            color:
              getProductColor(product),

            style:
              getProductStyle(product),

            occasion:
              getProductOccasion(product),

            image:
              getProductImage(product)

          };

        })
        .filter(
          product =>
            product.price > 0 &&
            // Skip old / dummy products that don't
            // have a real product image — these should
            // never be suggested in the outfit.
            Boolean(product.image) &&
            !brokenImages.has(product.id)
        );

    }, [products, brokenImages]);


  // =====================================================
  // AVAILABLE COLORS
  // =====================================================

  let availableColors =
    useMemo(() => {

      let values =
        preparedProducts
          .map(
            product =>
              product.color
          )
          .filter(
            value =>
              value &&
              value !== "Any"
          );


      let unique =
        [...new Set(values)];


      if (
        unique.length === 0
      ) {

        return [
          "Black",
          "White",
          "Blue"
        ];

      }


      return unique;

    }, [preparedProducts]);


  // =====================================================
  // SCORE PRODUCT
  // =====================================================

  function calculateScore(product) {

    let score = 0;


    // Gender

    let productGender =
      normalize(
        product.gender
      );


    let selectedGender =
      normalize(
        gender
      );


    if (
      productGender ===
      selectedGender
    ) {

      score += 6;

    }

    else if (
      productGender ===
      "unisex" ||
      productGender ===
      "all"
    ) {

      score += 4;

    }

    else {

      return -100;

    }


    // Color

    if (
      normalize(
        product.color
      ) ===
      normalize(color)
    ) {

      score += 5;

    }

    else if (
      normalize(
        product.color
      ) === "any"
    ) {

      score += 2;

    }


    // Style

    if (
      normalize(
        product.style
      ) ===
      normalize(style)
    ) {

      score += 4;

    }


    // Occasion

    if (
      normalize(
        product.occasion
      ) ===
      normalize(occasion)
    ) {

      score += 4;

    }


    // Category

    if (
      product.categoryType ===
      "Top Wear"
    ) {

      score += 3;

    }


    if (
      product.categoryType ===
      "Bottom Wear"
    ) {

      score += 3;

    }


    if (
      product.categoryType ===
      "Footwear"
    ) {

      score += 2;

    }


    if (
      product.categoryType ===
      "Accessories"
    ) {

      score += 1;

    }


    return score;

  }


  // =====================================================
  // SELECT BEST OUTFIT
  // =====================================================

  function selectOutfit() {

    let budgetValue =
      Number(budget);


    let eligible =
      preparedProducts
        .filter(
          product =>
            calculateScore(product) >= 0 &&
            product.price <= budgetValue
        )
        .map(product => ({

          ...product,

          score:
            calculateScore(product)

        }))
        .sort(
          (a, b) =>
            b.score - a.score
        );


    if (
      eligible.length === 0
    ) {

      return [];

    }


    let categoryOrder = [

      "Top Wear",
      "Bottom Wear",
      "Footwear",
      "Outerwear",
      "Accessories"

    ];


    let selected = [];

    let remaining =
      budgetValue;


    // =================================================
    // FIRST PICK ONE PRODUCT FROM EACH IMPORTANT CATEGORY
    // =================================================

    categoryOrder.forEach(
      category => {

        let categoryProducts =
          eligible.filter(
            product =>
              product.categoryType ===
              category &&
              product.price <=
              remaining
          );


        if (
          categoryProducts.length === 0
        ) {

          return;

        }


        // Highest score first
        categoryProducts.sort(
          (a, b) => {

            if (
              b.score !==
              a.score
            ) {

              return (
                b.score -
                a.score
              );

            }


            return (
              a.price -
              b.price
            );

          }
        );


        let selectedProduct =
          categoryProducts[0];


        selected.push(
          selectedProduct
        );


        remaining -=
          selectedProduct.price;

      }
    );


    // =================================================
    // IF ONLY ONE PRODUCT SELECTED,
    // TRY TO ADD ANOTHER AFFORDABLE PRODUCT
    // =================================================

    if (
      selected.length < 2
    ) {

      let selectedIds =
        selected.map(
          product =>
            product.id
        );


      let extra =
        eligible.find(
          product =>
            !selectedIds.includes(
              product.id
            ) &&
            product.price <=
            remaining
        );


      if (extra) {

        selected.push(extra);

      }

    }


    return selected;

  }


  // =====================================================
  // GENERATE
  // =====================================================

  function generateOutfit() {

    setError("");

    setResult(null);


    let budgetValue =
      Number(budget);


    if (
      !budget ||
      budgetValue <= 0
    ) {

      setError(
        "Please enter a valid budget."
      );

      return;

    }


    if (
      preparedProducts.length === 0
    ) {

      setError(
        "No products are available in the store."
      );

      return;

    }


    let selectedProducts =
      selectOutfit();


    if (
      selectedProducts.length === 0
    ) {

      setError(
        "We couldn't find suitable products within your budget."
      );

      return;

    }


    let total =
      selectedProducts.reduce(
        (
          sum,
          product
        ) =>
          sum + product.price,
        0
      );


    setResult({

      products:
        selectedProducts,

      total,

      budget:
        budgetValue,

      remaining:
        budgetValue - total,

      customerSelection: {

        gender,

        occasion,

        style,

        color,

        budget:
          budgetValue

      }

    });

  }


  // =====================================================
  // SAVE OUTFIT
  // =====================================================

  function saveOutfit() {

    if (!result) {

      return;

    }


    try {

      setSaving(true);


      localStorage.setItem(
        "orgos_saved_outfit",
        JSON.stringify(result)
      );


      setTimeout(() => {

        setSaving(false);

        toast.success(
          "Your selected outfit has been saved!"
        );

      }, 400);

    }

    catch {

      setSaving(false);

      toast.error(
        "Unable to save outfit."
      );

    }

  }


  // =====================================================
  // RESET
  // =====================================================

  function resetResult() {

    setResult(null);

    setError("");

  }


  // =====================================================
  // PRICE
  // =====================================================

  function formatPrice(price) {

    return `₹${Number(price || 0).toLocaleString("en-IN")}`;

  }


  // =====================================================
  // PRODUCT URL
  // =====================================================

  function getProductUrl(product) {

    return `/product/${product.id}`;

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <>

      <Navbar />


      <main className="outfit-page">


        {/* ============================================
            HEADER
        ============================================ */}

        <div className="outfit-header">

          <div className="outfit-header-icon">

            <FaMagic />

          </div>


          <div>

            <span className="outfit-header-label">
              SMART SHOPPING
            </span>

            <h1>
              Outfit Generator
            </h1>

            <p>
              Build a complete outfit using
              products currently available in ORGOS.
            </p>

          </div>

        </div>



        <div className="outfit-container">


          {/* ============================================
              FORM
          ============================================ */}

          <section className="outfit-form-card">


            <div className="form-title-row">

              <div className="form-title-icon">

                <FaTshirt />

              </div>


              <div>

                <h2>
                  Create Your Look
                </h2>

                <p>
                  Tell us what you are looking for.
                </p>

              </div>

            </div>



            {/* LOADING */}

            {loadingProducts && (

              <div className="outfit-loading">

                <FaSpinner />

                <span>
                  Loading products from ORGOS...
                </span>

              </div>

            )}



            {/* API ERROR */}

            {!loadingProducts &&
              productError && (

                <div className="outfit-error">

                  <FaExclamationCircle />

                  <span>
                    {productError}
                  </span>

                  <button
                    onClick={fetchProducts}
                  >
                    Retry
                  </button>

                </div>

              )}



            {!loadingProducts &&
              !productError && (

                <>


                  <div className="outfit-form-grid">


                    {/* GENDER */}

                    <div className="outfit-form-group">

                      <label>
                        Gender
                      </label>

                      <select
                        value={gender}
                        onChange={(e) => {

                          setGender(
                            e.target.value
                          );

                          setResult(null);

                        }}
                      >

                        <option value="Men">
                          Men
                        </option>

                        <option value="Women">
                          Women
                        </option>

                        <option value="Unisex">
                          Unisex
                        </option>

                      </select>

                    </div>



                    {/* OCCASION */}

                    <div className="outfit-form-group">

                      <label>
                        Occasion
                      </label>

                      <select
                        value={occasion}
                        onChange={(e) => {

                          setOccasion(
                            e.target.value
                          );

                          setResult(null);

                        }}
                      >

                        <option value="Casual">
                          Casual
                        </option>

                        <option value="Formal">
                          Formal
                        </option>

                        <option value="Party">
                          Party
                        </option>

                        <option value="Office">
                          Office
                        </option>

                      </select>

                    </div>



                    {/* STYLE */}

                    <div className="outfit-form-group">

                      <label>
                        Style
                      </label>

                      <select
                        value={style}
                        onChange={(e) => {

                          setStyle(
                            e.target.value
                          );

                          setResult(null);

                        }}
                      >

                        <option value="Casual">
                          Casual
                        </option>

                        <option value="Smart Casual">
                          Smart Casual
                        </option>

                        <option value="Formal">
                          Formal
                        </option>

                      </select>

                    </div>



                    {/* COLOR */}

                    <div className="outfit-form-group">

                      <label>
                        Preferred Color
                      </label>

                      <select
                        value={color}
                        onChange={(e) => {

                          setColor(
                            e.target.value
                          );

                          setResult(null);

                        }}
                      >

                        {availableColors.map(
                          item => (

                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>

                          )
                        )}

                      </select>

                    </div>



                    {/* BUDGET */}

                    <div className="outfit-form-group budget-group">

                      <label>
                        Maximum Budget
                      </label>

                      <div className="budget-input">

                        <span>
                          ₹
                        </span>

                        <input
                          type="number"
                          min="1"
                          value={budget}
                          onChange={(e) => {

                            setBudget(
                              e.target.value
                            );

                            setResult(null);

                          }}
                        />

                      </div>

                    </div>


                  </div>



                  {/* SUMMARY */}

                  <div className="form-summary">

                    <div className="form-summary-title">

                      <FaCheckCircle />

                      <span>
                        Your Preferences
                      </span>

                    </div>


                    <div className="form-summary-grid">

                      <div>

                        <small>
                          Gender
                        </small>

                        <strong>
                          {gender}
                        </strong>

                      </div>


                      <div>

                        <small>
                          Occasion
                        </small>

                        <strong>
                          {occasion}
                        </strong>

                      </div>


                      <div>

                        <small>
                          Style
                        </small>

                        <strong>
                          {style}
                        </strong>

                      </div>


                      <div>

                        <small>
                          Color
                        </small>

                        <strong>
                          {color}
                        </strong>

                      </div>


                      <div>

                        <small>
                          Budget
                        </small>

                        <strong>
                          {formatPrice(
                            Number(budget)
                          )}
                        </strong>

                      </div>

                    </div>

                  </div>



                  {/* ERROR */}

                  {error && (

                    <div className="outfit-error">

                      <FaExclamationCircle />

                      <span>
                        {error}
                      </span>

                    </div>

                  )}



                  {/* BUTTON */}

                  <button
                    className="generate-outfit-button"
                    onClick={generateOutfit}
                    disabled={
                      loadingProducts ||
                      preparedProducts.length === 0
                    }
                  >

                    <FaMagic />

                    Find My Outfit

                    <FaArrowRight />

                  </button>


                </>

              )}

          </section>



          {/* ============================================
              RESULT
          ============================================ */}

          <section className="outfit-result-card">


            {!result && !error && (

              <div className="outfit-empty">

                <div className="empty-icon">

                  <FaShoppingBag />

                </div>

                <h2>
                  Your Outfit Will Appear Here
                </h2>

                <p>
                  Select your preferences and we'll
                  find matching products from the
                  current ORGOS inventory.
                </p>

              </div>

            )}



            {!result && error && (

              <div className="outfit-no-result">

                <div className="empty-icon error-icon">

                  <FaExclamationCircle />

                </div>

                <h2>
                  No Suitable Outfit
                </h2>

                <p>
                  Try increasing your budget or
                  changing your preferences.
                </p>

                <button
                  onClick={resetResult}
                >
                  Change Preferences
                </button>

              </div>

            )}



            {result && (

              <div className="outfit-result">


                {/* RESULT HEADER */}

                <div className="result-top">

                  <div>

                    <span>
                      PERSONALIZED FOR YOU
                    </span>

                    <h2>
                      Your Recommended Outfit
                    </h2>

                    <p>
                      Selected from currently
                      available ORGOS products.
                    </p>

                  </div>


                  <button
                    className="regenerate-button"
                    onClick={generateOutfit}
                    title="Generate again"
                  >

                    <FaRedo />

                  </button>

                </div>



                {/* PREFERENCE CHIPS */}

                <div className="result-selection">

                  <div className="selection-chip">

                    <small>
                      Gender
                    </small>

                    <strong>
                      {result.customerSelection.gender}
                    </strong>

                  </div>


                  <div className="selection-chip">

                    <small>
                      Occasion
                    </small>

                    <strong>
                      {result.customerSelection.occasion}
                    </strong>

                  </div>


                  <div className="selection-chip">

                    <small>
                      Style
                    </small>

                    <strong>
                      {result.customerSelection.style}
                    </strong>

                  </div>


                  <div className="selection-chip">

                    <small>
                      Color
                    </small>

                    <strong>
                      {result.customerSelection.color}
                    </strong>

                  </div>

                </div>



                {/* PRODUCTS HEADER */}

                <div className="matching-products-header">

                  <div>

                    <h3>
                      Recommended Products
                    </h3>

                    <p>
                      {result.products.length}
                      {" "}
                      products selected within
                      your budget
                    </p>

                  </div>


                  <div className="inventory-badge">

                    <FaCheckCircle />

                    In Stock

                  </div>

                </div>



                {/* PRODUCTS */}

                <div className="outfit-products">

                  {result.products.map(
                    product => (

                      <div
                        className="outfit-product"
                        key={product.id}
                      >


                        {/* IMAGE */}

                        <div className="outfit-product-image">

                          {product.image &&
                            !brokenImages.has(
                              product.id
                            ) ? (

                            <img
                              src={
                                product.image
                              }
                              alt={
                                product.name
                              }
                              loading="lazy"
                              onError={() =>
                                markImageBroken(
                                  product.id
                                )
                              }
                            />

                          ) : (

                            <FaTshirt />

                          )}

                        </div>



                        {/* INFO */}

                        <div className="outfit-product-info">

                          <span className="product-category">

                            {product.category ||
                              product.categoryType}

                          </span>


                          <h3>
                            {product.name}
                          </h3>


                          <div className="product-details">

                            <span>
                              {product.color}
                            </span>

                            <span>
                              {product.style}
                            </span>

                          </div>


                          <strong>
                            {formatPrice(
                              product.price
                            )}
                          </strong>


                          <a
                            href={
                              getProductUrl(
                                product
                              )
                            }
                            className="view-product-link"
                          >

                            View Product

                            <FaArrowRight />

                          </a>

                        </div>



                        {/* CHECK */}

                        <FaCheckCircle
                          className="product-check"
                        />


                      </div>

                    )
                  )}

                </div>



                {/* TOTAL */}

                <div className="outfit-total">

                  <div>

                    <span>
                      Outfit Total
                    </span>

                    <small>
                      Your budget{" "}
                      {formatPrice(
                        result.budget
                      )}
                    </small>

                  </div>


                  <strong>
                    {formatPrice(
                      result.total
                    )}
                  </strong>

                </div>



                {/* BUDGET BAR */}

                <div className="budget-progress-wrapper">

                  <div className="budget-progress-header">

                    <span>
                      Budget Used
                    </span>

                    <strong>
                      {Math.round(
                        (
                          result.total /
                          result.budget
                        ) * 100
                      )}
                      %
                    </strong>

                  </div>


                  <div className="budget-progress">

                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          (
                            result.total /
                            result.budget
                          ) * 100
                        )}%`
                      }}
                    />

                  </div>

                </div>



                {/* REMAINING */}

                <div className="remaining-budget">

                  <div>

                    <FaCheckCircle />

                    <span>
                      Remaining Budget
                    </span>

                  </div>


                  <strong>
                    {formatPrice(
                      result.remaining
                    )}
                  </strong>

                </div>



                {/* ACTIONS */}

                <div className="outfit-actions">

                  <button
                    className="save-outfit-button"
                    onClick={saveOutfit}
                    disabled={saving}
                  >

                    <FaShoppingBag />

                    {saving
                      ? "Saving..."
                      : "Save My Outfit"}

                  </button>


                  <button
                    className="new-outfit-button"
                    onClick={resetResult}
                  >

                    <FaRedo />

                    Change Preferences

                  </button>

                </div>


              </div>

            )}

          </section>


        </div>

      </main>


      <Footer />

    </>

  );

}


export default OutfitGenerator;