import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/productDetails.css";
import "../styles/wishlistButton.css";

import {
  getProductById,
  getProductImage
} from "../api/productApi";

import { AiOutlineHeart, AiFillHeart, AiFillStar, AiOutlineStar } from "react-icons/ai";

import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";

import API from "../api/api";

import { toast } from "react-toastify";


function ProductDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  // ========================================
  // REVIEW STATES
  // ========================================

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const isLoggedIn = !!localStorage.getItem("token");

  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);


  // ========================================
  // LOAD PRODUCT
  // ========================================

  useEffect(() => {

    let loadProduct = async () => {

      try {

        setLoading(true);
        setError("");
        setQuantity(1);
        setSelectedSize(null);

        let data = await getProductById(id);

        if (data.success && data.product) {

          setProduct(data.product);

        }
        else {

          setError(data.message || "Product not found");

        }

      }
      catch (err) {

        console.error("Get Product Error:", err);
        setError("Unable to load product details");

      }
      finally {

        setLoading(false);

      }

    };

    loadProduct();

    // Scroll to top when a new product loads
    window.scrollTo(0, 0);

  }, [id]);


  // ========================================
  // LOAD REVIEWS
  // ========================================

  let loadReviews = async () => {

    try {

      setReviewsLoading(true);

      let res = await API.get(`/reviews/product/${id}`);

      if (res.data.success) {

        setReviews(res.data.reviews || []);

      }

    }
    catch (err) {

      console.error("Get Reviews Error:", err);

    }
    finally {

      setReviewsLoading(false);

    }

  };

  useEffect(() => {

    loadReviews();

  }, [id]);


  // ========================================
  // LOADING / ERROR / EMPTY STATES
  // ========================================

  if (loading) {

    return (
      <>
        <Navbar />
        <main className="product-details-empty">
          <h2>Loading product details...</h2>
        </main>
        <Footer />
      </>
    );

  }

  if (error || !product) {

    return (
      <>
        <Navbar />
        <main className="product-details-empty">
          <h2>{error || "Product not found"}</h2>
          <button onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </main>
        <Footer />
      </>
    );

  }


  // ========================================
  // DERIVED VALUES
  // ========================================

  let originalPrice = Number(product.price || 0);

  let sellingPrice = Number(
    product.discount_price || product.price || 0
  );

  let hasDiscount =
    product.discount_price &&
    originalPrice > sellingPrice;

  let discountPercentage = hasDiscount
    ? Math.round(
        ((originalPrice - sellingPrice) / originalPrice) * 100
      )
    : 0;

  // ========================================
  // SIZES
  // ========================================

  let productSizes = Array.isArray(product.sizes) ? product.sizes : [];
  let hasSizes = productSizes.length > 0;

  let selectedSizeEntry = hasSizes
    ? productSizes.find((s) => s.size === selectedSize)
    : null;

  // Stock shown/usable depends on whether this product has sizes:
  // - has sizes -> stock of the size the user picked (0 until picked)
  // - no sizes -> the plain product stock
  let stock = hasSizes
    ? Number(selectedSizeEntry?.stock || 0)
    : Number(product.stock || 0);

  let inWishlist = isInWishlist(product.product_id);


  // ========================================
  // BUILD CART PAYLOAD
  // ========================================

  let buildCartProduct = () => ({

    id: product.product_id,
    product_id: product.product_id,

    name: product.product_name,
    title: product.product_name,

    image: getProductImage(product.image),

    brand: product.brand || "ORGOS",

    price: sellingPrice,
    oldPrice: originalPrice,
    discount_price: product.discount_price,

    quantity: quantity,

    stock: stock,

    size: hasSizes ? selectedSize : null,

    vendor_id: product.vendor_id,
    shop_name: product.shop_name,
    owner_name: product.owner_name,

    category_id: product.category_id,
    category_name: product.category_name,

    gender: product.gender

  });


  // ========================================
  // HANDLERS
  // ========================================

  let handleAddToCart = async () => {

    if (hasSizes && !selectedSize) {

      toast.warning("Please select a size");
      return;

    }

    setAdding(true);

    let added = await addToCart(buildCartProduct());

    setAdding(false);

    if (added) {

      toast.success("Product Added Successfully");

    }

  };

  let handleBuyNow = async () => {

    if (hasSizes && !selectedSize) {

      toast.warning("Please select a size");
      return;

    }

    setBuying(true);

    let added = await addToCart(buildCartProduct());

    setBuying(false);

    if (added) {

      navigate("/checkout");

    }

  };

  let handleToggleWishlist = () => {

    toggleWishlist({

      id: product.product_id,
      product_id: product.product_id,
      name: product.product_name,
      image: getProductImage(product.image),
      price: sellingPrice,
      oldPrice: originalPrice,
      brand: product.brand || "ORGOS",
      stock: stock

    });

  };


  let handleSelectSize = (size) => {

    setSelectedSize(size);
    setQuantity(1);

  };


  let handleSubmitReview = async (e) => {

    e.preventDefault();

    if (!isLoggedIn) {

      toast.warning("Please login to write a review.");
      navigate("/login");
      return;

    }

    if (reviewRating < 1) {

      toast.warning("Please select a star rating.");
      return;

    }

    try {

      setSubmittingReview(true);

      let res = await API.post("/reviews", {

        product_id: product.product_id,
        rating: reviewRating,
        review: reviewText

      });

      if (res.data.success) {

        toast.success("Review submitted successfully");

        setReviewRating(0);
        setReviewText("");

        // Refresh reviews and update product rating shown above
        await loadReviews();

        setProduct((prev) => ({
          ...prev,
          rating: res.data.rating
        }));

      }

    }
    catch (err) {

      console.error("Submit Review Error:", err);

      toast.error(
        err.response?.data?.message ||
        "Unable to submit review."
      );

    }
    finally {

      setSubmittingReview(false);

    }

  };


  // ========================================
  // FORMAT DATE
  // ========================================

  let formatDate = (date) => {

    if (!date) {
      return "";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

  };


  // ========================================
  // RENDER
  // ========================================

  return (

    <>

      <Navbar />

      <main className="product-details-page">

        {/* BREADCRUMB */}

        <div className="product-details-breadcrumb">

          <Link to="/">Home</Link>
          <span>/</span>

          {product.gender === "Women" && <Link to="/women">Women</Link>}
          {product.gender === "Men" && <Link to="/men">Men</Link>}
          {product.gender === "Kids" && <Link to="/kids">Kids</Link>}
          {(!product.gender || product.gender === "Accessories") && (
            <Link to="/accessories">Accessories</Link>
          )}

          <span>/</span>
          <span className="current">{product.product_name}</span>

        </div>


        <div className="product-details-card">


          {/* IMAGE */}

          <div className="product-details-image">

            <button
              type="button"
              className={
                inWishlist ? "wishlist-btn active" : "wishlist-btn"
              }
              aria-label="Toggle Wishlist"
              onClick={handleToggleWishlist}
            >

              {inWishlist ? <AiFillHeart /> : <AiOutlineHeart />}

            </button>

            {product.image ? (

              <img
                src={getProductImage(product.image)}
                alt={product.product_name}
              />

            ) : (

              <div className="no-product-image">No Image</div>

            )}

          </div>


          {/* INFORMATION */}

          <div className="product-details-content">


            <span className="product-details-label">
              {product.category_name || "PRODUCT"}
            </span>


            <h1>{product.product_name || "Unnamed Product"}</h1>


            <p className="product-details-brand">
              {product.brand || "ORGOS"}
              {product.shop_name && (
                <>
                  {" "}• Sold by <strong>{product.shop_name}</strong>
                </>
              )}
            </p>


            {product.rating ? (

              <div className="product-details-rating">
                ⭐ {product.rating}
              </div>

            ) : null}


            {/* PRICE */}

            <div className="product-details-price-row">

              <span className="new-price">
                ₹{sellingPrice.toLocaleString("en-IN")}
              </span>

              {hasDiscount && (

                <>
                  <del>₹{originalPrice.toLocaleString("en-IN")}</del>

                  <span className="discount">
                    -{discountPercentage}%
                  </span>
                </>

              )}

            </div>


            {/* SIZE SELECTOR */}

            {hasSizes && (

              <div className="product-details-size-row">

                <strong>
                  Select Size
                  {selectedSize && ` : ${selectedSize}`}
                </strong>

                <div className="size-options">

                  {productSizes.map((s) => {

                    let outOfStock = Number(s.stock) <= 0;

                    return (

                      <button
                        type="button"
                        key={s.size}
                        className={
                          "size-option-btn" +
                          (selectedSize === s.size ? " selected" : "") +
                          (outOfStock ? " unavailable" : "")
                        }
                        disabled={outOfStock}
                        onClick={() => handleSelectSize(s.size)}
                        title={
                          outOfStock
                            ? `${s.size} - Out of stock`
                            : `${s.size} - ${s.stock} available`
                        }
                      >
                        {s.size}
                      </button>

                    );

                  })}

                </div>

              </div>

            )}


            {/* STOCK */}

            {(!hasSizes || selectedSize) && (

              <p
                className={
                  stock > 0
                    ? "product-details-stock in-stock"
                    : "product-details-stock out-of-stock"
                }
              >

                {stock > 0 ? `In Stock (${stock} available)` : "Out of Stock"}

              </p>

            )}


            {/* DESCRIPTION */}

            {product.description && (

              <div className="product-details-description">

                <strong>Product Details</strong>
                <p>{product.description}</p>

              </div>

            )}


            {/* QUANTITY */}

            {stock > 0 && (!hasSizes || selectedSize) && (

              <div className="product-details-qty-row">

                <strong>Quantity</strong>

                <div className="qty-stepper">

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => Math.max(1, q - 1))
                    }
                    disabled={quantity <= 1}
                  >
                    −
                  </button>

                  <span>{quantity}</span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => Math.min(stock, q + 1))
                    }
                    disabled={quantity >= stock}
                  >
                    +
                  </button>

                </div>

              </div>

            )}


            {/* ACTIONS */}

            <div className="product-detail-actions">

              <button
                className="add-cart-btn"
                disabled={
                  (hasSizes && !selectedSize) ||
                  stock <= 0 ||
                  adding
                }
                onClick={handleAddToCart}
              >

                {hasSizes && !selectedSize
                  ? "Select a Size"
                  : stock <= 0
                  ? "Out of Stock"
                  : adding
                  ? "Adding..."
                  : "🛒 Add To Cart"}

              </button>

              <button
                className="buy-now-btn"
                disabled={
                  (hasSizes && !selectedSize) ||
                  stock <= 0 ||
                  buying
                }
                onClick={handleBuyNow}
              >

                {hasSizes && !selectedSize
                  ? "Select a Size"
                  : stock <= 0
                  ? "Out of Stock"
                  : buying
                  ? "Please wait..."
                  : "⚡ Buy Now"}

              </button>

            </div>


            <button
              className="back-product-btn"
              onClick={() => navigate(-1)}
            >
              ← Back To Products
            </button>


          </div>


        </div>


        {/* ============================================
            REVIEWS SECTION
        ============================================ */}

        <div className="product-reviews-section">


          <h2 className="reviews-heading">
            Customer Reviews
            {reviews.length > 0 && (
              <span className="reviews-count">
                ({reviews.length})
              </span>
            )}
          </h2>


          {/* WRITE REVIEW FORM */}

          <div className="write-review-box">

            <h3>Write a Review</h3>

            {!isLoggedIn && (

              <p className="review-login-hint">
                Please <Link to="/login">login</Link> to write a review.
              </p>

            )}

            <form onSubmit={handleSubmitReview}>

              <div className="star-select">

                {[1, 2, 3, 4, 5].map((star) => (

                  <span
                    key={star}
                    className="star-select-icon"
                    onClick={() => setReviewRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >

                    {(hoverRating || reviewRating) >= star ? (
                      <AiFillStar />
                    ) : (
                      <AiOutlineStar />
                    )}

                  </span>

                ))}

              </div>

              <textarea
                className="review-textarea"
                placeholder="Share your experience with this product..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
              />

              <button
                type="submit"
                className="submit-review-btn"
                disabled={submittingReview}
              >

                {submittingReview ? "Submitting..." : "Submit Review"}

              </button>

            </form>

          </div>


          {/* REVIEWS LIST */}

          <div className="reviews-list">

            {reviewsLoading && (

              <p className="reviews-message">Loading reviews...</p>

            )}

            {!reviewsLoading && reviews.length === 0 && (

              <p className="reviews-message">
                No reviews yet. Be the first to review this product!
              </p>

            )}

            {!reviewsLoading &&
              reviews.map((item) => (

                <div className="review-card" key={item.review_id}>

                  <div className="review-card-header">

                    <div className="review-avatar">

                      {item.profile_image ? (

                        <img
                          src={item.profile_image}
                          alt={item.full_name || "Customer"}
                        />

                      ) : (

                        <span>
                          {(item.full_name || "U").charAt(0).toUpperCase()}
                        </span>

                      )}

                    </div>

                    <div>

                      <p className="review-user-name">
                        {item.full_name || "Customer"}
                      </p>

                      <div className="review-stars">

                        {[1, 2, 3, 4, 5].map((star) => (

                          star <= Math.round(Number(item.rating)) ? (
                            <AiFillStar key={star} />
                          ) : (
                            <AiOutlineStar key={star} />
                          )

                        ))}

                        <span className="review-date">
                          {formatDate(item.review_date)}
                        </span>

                      </div>

                    </div>

                  </div>

                  {item.review && (

                    <p className="review-card-text">{item.review}</p>

                  )}

                </div>

              ))}

          </div>


        </div>


      </main>

      <Footer />

    </>

  );

}


export default ProductDetails;
