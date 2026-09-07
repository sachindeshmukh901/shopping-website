import "../styles/home.css";
import "../styles/wishlistButton.css";

import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";

import API from "../api/api";

import {
  getTopSellers,
  getProductImage
} from "../api/productApi";

import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";

import couple1 from "../assets/images/couple1.png";
import couple2 from "../assets/images/couple2.png";
import couple3 from "../assets/images/couple3.png";

import watch from "../assets/images/watch.png";

function Home() {

  const navigate = useNavigate();

  const { addToCart } =
    useContext(CartContext);

  const { toggleWishlist, isInWishlist } =
    useContext(WishlistContext);


  // ========================================
  // TOP SELLERS
  // ========================================

  const [topSellers, setTopSellers] =
    useState([]);

  const [loadingTopSellers, setLoadingTopSellers] =
    useState(true);

  const [topSellersError, setTopSellersError] =
    useState("");

  const [spinState, setSpinState] = useState({
    loading: true,
    spinUsed: false,
    canSpin: false,
    message: "",
    reward: null,
    nextEligibleAt: null
  });

  const [spinning, setSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [rewardModal, setRewardModal] = useState({
    open: false,
    reward: null
  });
  const [spinCountdown, setSpinCountdown] = useState("");

  const SPIN_REWARD_VALUES = [5, 10, 15, 20, 25, 30, 40, 50];

  const getNextMonthStart = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
  };

  const loadTopSellers = async () => {

    try {

      setLoadingTopSellers(true);
      setTopSellersError("");

      let data =
        await getTopSellers(8);

      setTopSellers(
        Array.isArray(data.products)
          ? data.products
          : []
      );

    }

    catch (error) {

      console.error(
        "Top Sellers Load Error:",
        error
      );

      setTopSellersError(
        "Unable to load top seller products right now."
      );

    }

    finally {

      setLoadingTopSellers(false);

    }

  };


  useEffect(() => {

    loadTopSellers();

    const token = localStorage.getItem("token");

    if (!token) {
      setSpinState({
        loading: false,
        spinUsed: false,
        canSpin: false,
        message: "Login to unlock Spin the Wheel.",
        reward: null,
        nextEligibleAt: null
      });
      return;
    }

    const fetchSpinStatus = async () => {
      try {
        const response = await API.get("/coupons/spin-status");
        const data = response.data || {};

        setSpinState({
          loading: false,
          spinUsed: Boolean(data.spinUsed),
          canSpin: Boolean(data.canSpin),
          message: data.message || "",
          reward: data.reward || null,
          nextEligibleAt: data.spinUsed ? getNextMonthStart().toISOString() : null
        });
      } catch (error) {
        const serverMessage =
          error.response?.data?.message || "Unable to load spin status.";

        setSpinState({
          loading: false,
          spinUsed: false,
          canSpin: false,
          message: serverMessage,
          reward: null,
          nextEligibleAt: null
        });
      }
    };

    fetchSpinStatus();

  }, []);

  useEffect(() => {
    if (!spinState.nextEligibleAt) {
      setSpinCountdown("");
      return;
    }

    const updateCountdown = () => {
      const targetTime = new Date(spinState.nextEligibleAt).getTime();
      const remaining = targetTime - Date.now();

      if (remaining <= 0) {
        setSpinCountdown("SPIN NOW");
        setSpinState((prev) => ({
          ...prev,
          canSpin: true,
          spinUsed: false,
          message: "Spin available for this month"
        }));
        return;
      }

      const totalSeconds = Math.max(0, Math.floor(remaining / 1000));
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setSpinCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [spinState.nextEligibleAt]);


  const spinWheel = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.warning("Please login to use Spin the Wheel.");
      return;
    }

    if (spinning || !spinState.canSpin) {
      return;
    }

    try {
      setSpinning(true);

      const wheel = document.querySelector(".wheel");
      const selectedReward = SPIN_REWARD_VALUES[Math.floor(Math.random() * SPIN_REWARD_VALUES.length)];
      const segmentAngle = 360 / SPIN_REWARD_VALUES.length;
      const selectedIndex = SPIN_REWARD_VALUES.indexOf(selectedReward);

      // Pointer is at the bottom of the wheel. In this rotation convention
      // (0deg = top, clockwise), the bottom of the circle is 180deg — NOT 270deg.
      // (270deg would be the left side of the wheel, which is why the wheel
      // was previously stopping 2 segments away from the actual reward.)
      // wheelStartOffset matches the slice label rotations defined in home.css
      // (20deg, 65deg, 110deg, ... i.e. spaced 45deg apart starting at 20deg).
      const wheelStartOffset = 20;
      const pointerAngle = 180;
      const selectedSegmentCenter = wheelStartOffset + (selectedIndex + 0.5) * segmentAngle;
      const stopOffset = pointerAngle - selectedSegmentCenter;
      const nextRotation = wheelRotation + 7200 + stopOffset;
      setWheelRotation(nextRotation);

      if (wheel) {
        wheel.style.transition = "transform 4.2s cubic-bezier(0.17, 0.67, 0.16, 0.99)";
        wheel.style.transform = `rotate(${nextRotation}deg)`;
      }

      const response = await API.post("/coupons/spin", { reward_percent: selectedReward });
      const data = response.data || {};

      if (data.success) {
        const wonReward = data.reward || null;

        setSpinState({
          loading: false,
          spinUsed: true,
          canSpin: false,
          message: "Spinning...",
          reward: null,
          nextEligibleAt: getNextMonthStart().toISOString()
        });

        if (wonReward) {
          const rewardToSave = {
            reward_id: Date.now(),
            reward_label: wonReward.reward,
            coupon_code: wonReward.coupon_code,
            discount_percent: Number(wonReward.discount_percent || 0),
            status: "active",
            source: "spin",
            reward: wonReward.reward,
            expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          };

          localStorage.setItem("orgos_latest_spin_reward", JSON.stringify(rewardToSave));

          setTimeout(() => {
            setSpinState((prev) => ({
              ...prev,
              message: data.message || "Congratulations! You won a reward.",
              reward: wonReward,
              nextEligibleAt: getNextMonthStart().toISOString()
            }));

            setRewardModal({
              open: true,
              reward: rewardToSave
            });
          }, 4400);
        }
      } else {
        setSpinState({
          loading: false,
          spinUsed: true,
          canSpin: false,
          message: data.message || "You have already used your Spin for this month. Come back next month!",
          reward: data.reward || null,
          nextEligibleAt: getNextMonthStart().toISOString()
        });

        toast.info(data.message || "You have already used your Spin for this month. Come back next month!");
      }
    } catch (error) {
      const serverMessage =
        error.response?.data?.message || "Unable to spin right now.";

      setSpinState((prev) => ({
        ...prev,
        loading: false,
        spinUsed: true,
        canSpin: false,
        message: serverMessage,
        reward: null,
        nextEligibleAt: getNextMonthStart().toISOString()
      }));

      toast.error(serverMessage);
    } finally {
      setTimeout(() => setSpinning(false), 4500);
    }
  };

  return (

    <div>

      <Navbar />

      <HeroSection />

      {/* FEATURES */}

      <section className="features">

        <div className="feature-card">

          <div className="icon-circle">
            🚚
          </div>

          <h2>Complimentary Shipping</h2>

          <p>
            Enjoy free standard shipping on
            all orders over ₹150.
          </p>

        </div>

        <div className="feature-card">

          <div className="icon-circle">
            🛡️
          </div>

          <h2>Secure Transactions</h2>

          <p>
            Your security is our priority.
            All payments are encrypted.
          </p>

        </div>

        <div className="feature-card">

          <div className="icon-circle">
            🎧
          </div>

          <h2>Dedicated Concierge</h2>

          <p>
            Our support team is available
            24/7 to assist you.
          </p>

        </div>

      </section>

      {/* PRODUCTS */}

      <section className="products">

        <h2>Our Top Seller Products</h2>


        {/* LOADING */}

        {loadingTopSellers && (

          <div className="products-status">
            Loading top sellers...
          </div>

        )}


        {/* ERROR */}

        {!loadingTopSellers && topSellersError && (

          <div className="products-status error">

            <p>{topSellersError}</p>

            <button
              className="retry-btn"
              onClick={loadTopSellers}
            >
              Try Again
            </button>

          </div>

        )}


        {/* EMPTY */}

        {!loadingTopSellers &&
          !topSellersError &&
          topSellers.length === 0 && (

            <div className="products-status">
              No products available yet.
            </div>

          )}


        {/* PRODUCTS */}

        {!loadingTopSellers &&
          !topSellersError &&
          topSellers.length > 0 && (

            <div className="product-grid">

              {topSellers.map((item) => (

                <div
                  className="card"
                  key={item.product_id}
                  onClick={() =>
                    navigate(`/product/${item.product_id}`)
                  }
                  style={{ cursor: "pointer" }}
                >

                  <div className="card-image-wrap">

                    <button
                      type="button"
                      className={
                        isInWishlist(item.product_id)
                          ? "wishlist-btn active"
                          : "wishlist-btn"
                      }
                      aria-label="Toggle Wishlist"
                      onClick={(event) => {

                        event.stopPropagation();

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
                      src={getProductImage(item.image)}
                      alt={item.product_name}
                    />

                  </div>


                  <p className="card-title">
                    {item.product_name}
                  </p>


                  <div className="card-price-row">

                    <span className="card-price">
                      ₹
                      {Number(
                        item.price || 0
                      ).toLocaleString("en-IN")}
                    </span>

                    {item.discount > 0 && (

                      <span className="card-discount">
                        -{item.discount}%
                      </span>

                    )}

                  </div>


                  <button
                    className="card-cart-btn"
                    onClick={(event) => {

                      event.stopPropagation();

                      addToCart({

                        ...item,

                        id: item.product_id,
                        name: item.product_name,
                        image: getProductImage(item.image)

                      });

                    }}
                  >
                    Add To Cart
                  </button>

                </div>

              ))}

            </div>

          )}

      </section>

      {/* SPIN SECTION */}

      <section className="spin-section">

        {/* LEFT */}

        <div className="spin-left">

          <h1>
            Crafting Timeless
            <br />
            Elegance Since 2026
          </h1>

          <p>
            We don’t just make
            <br />
            clothes.
            <br />
            We make the ones you
            <br />
            reach for without
            <br />
            thinking.
          </p>

        </div>

        {/* CENTER */}

        <div className="spin-center">

          <div className="wheel" style={{ transform: `rotate(${wheelRotation}deg)` }}>

            <div className="slice slice1">
              <span>5% OFF</span>
            </div>

            <div className="slice slice2">
              <span>10% OFF</span>
            </div>

            <div className="slice slice3">
              <span>15% OFF</span>
            </div>

            <div className="slice slice4">
              <span>20% OFF</span>
            </div>

            <div className="slice slice5">
              <span>25% OFF</span>
            </div>

            <div className="slice slice6">
              <span>30% OFF</span>
            </div>

            <div className="slice slice7">
              <span>40% OFF</span>
            </div>

            <div className="slice slice8">
              <span>50% OFF</span>
            </div>

          </div>

          {/* Kept OUTSIDE the rotating .wheel so it never tilts/spins with it */}
          <div className="wheel-center">
            SPIN
          </div>

          <div className="pointer"></div>

        </div>

        {/* RIGHT */}

        <div className="spin-right">

          <div className="reward-card">

            <h2>
              WIN EXCLUSIVE
              <br />
              <span>GARMENT REWARDS!</span>
            </h2>

            <p>
              Spin the wheel for a chance to win
              exciting discounts, free apparel,
              and special offers on your
              favorite styles!
            </p>

            {spinState.reward && (
              <div className="reward-chip">
                <strong>{spinState.reward.reward}</strong>
              </div>
            )}

            <p className="spin-status-message">
              {spinState.message || "Spin once per calendar month."}
            </p>

            <button
              className={spinState.canSpin ? "spin-action-button" : "spin-timer-button"}
              onClick={spinWheel}
              disabled={spinning || spinState.loading || !spinState.canSpin}
            >
              {spinState.canSpin ? "SPIN NOW" : (spinCountdown || "Next spin in 0d 0h 0m")}
            </button>

          </div>

        </div>

      </section>

      {/* COUPLE SECTION */}

      <section className="couple-section">

        <div className="couple-grid">

          <div className="couple-card">
            <img src={couple1} alt="" />
          </div>

          <div className="couple-card">
            <img src={couple2} alt="" />
          </div>

          <div className="couple-card">
            <img src={couple3} alt="" />
          </div>

        </div>

      </section>

      {/* WEDDING */}

      <section className="wedding">

        <h1>
          Two hearts. One celebration.
          One perfect match.
        </h1>

        <p>
          Our wedding outfits are designed to
          complement each other.
        </p>

        <button>
          EXPLORE NOW
        </button>

      </section>

      {/* WATCH SECTION */}

      <section className="watch-section">

        <div className="watch-left">

          <img src={watch} alt="" />

        </div>

        <div className="watch-right">

          <h1>Distinguished Watch</h1>

          <h2>Limited Edition</h2>

          <p>
            Stylish and crafted for modern fashion.
          </p>

          <button>
            SHOP NOW
          </button>

        </div>

      </section>

      {rewardModal.open && rewardModal.reward && (
        <div
          className="reward-modal-overlay"
          onClick={() => setRewardModal({ open: false, reward: null })}
        >
          <div
            className="reward-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="reward-modal-close"
              onClick={() => setRewardModal({ open: false, reward: null })}
              aria-label="Close reward popup"
            >
              ×
            </button>

            <div className="reward-modal-badge">🎉 Reward unlocked</div>
            <div className="reward-modal-title">{rewardModal.reward.reward_label}</div>

            <p className="reward-modal-text">
              You’ve earned a special discount. It will be applied automatically on your next payment.
            </p>

            <div className="reward-modal-meta">
              <span>{rewardModal.reward.discount_percent}% OFF</span>
              <span>Valid for 30 days</span>
            </div>

            <button
              className="reward-modal-button"
              onClick={() => setRewardModal({ open: false, reward: null })}
            >
              Continue shopping
            </button>
          </div>
        </div>
      )}

      <Footer />

    </div>

  );
}

export default Home;