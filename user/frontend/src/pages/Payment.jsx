import {
  useState,
  useContext,
  useEffect
} from "react";

import {
  useNavigate
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/payment.css";

import {
  CartContext
} from "../context/CartContext";

import API from "../api/api";

import { GST_AMOUNT } from "../utils/taxConfig";


import { toast } from "react-toastify";


function Payment() {

  const navigate =
    useNavigate();


  const {
    cartItems,
    getTotal,
    clearCart
  } = useContext(CartContext);


  // ======================================================
  // PAYMENT STATES
  // ======================================================

  const [method, setMethod] =
    useState("razorpay");

  const [upiId, setUpiId] =
    useState("");

  const [cardNumber, setCardNumber] =
    useState("");

  const [holderName, setHolderName] =
    useState("");

  const [expiry, setExpiry] =
    useState("");

  const [cvv, setCvv] =
    useState("");

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [appliedReward, setAppliedReward] =
    useState(() => {
      try {
        const savedReward = localStorage.getItem("orgos_latest_spin_reward");
        return savedReward ? JSON.parse(savedReward) : null;
      } catch (error) {
        return null;
      }
    });

  const [rewardLoading, setRewardLoading] =
    useState(false);

  const loadRazorpay = () => new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Razorpay Checkout could not load."));
    document.body.appendChild(script);
  });

  useEffect(() => {
    const loadActiveReward = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setAppliedReward(null);
        return;
      }

      try {
        setRewardLoading(true);
        const response = await API.get("/coupons/my-rewards");
        const rewards = response.data?.rewards || [];
        const activeReward = rewards.find((reward) => reward.status === "active");

        if (activeReward) {
          setAppliedReward(activeReward);
          localStorage.setItem("orgos_latest_spin_reward", JSON.stringify(activeReward));
          return;
        }

        setAppliedReward(null);
        localStorage.removeItem("orgos_latest_spin_reward");
      } catch (error) {
        setAppliedReward(null);
        localStorage.removeItem("orgos_latest_spin_reward");
      } finally {
        setRewardLoading(false);
      }
    };

    loadActiveReward();
  }, []);


  // ======================================================
  // PLACE ORDER
  // ======================================================

  const placeOrder = async () => {

    // ====================================================
    // CART CHECK
    // ====================================================

    if (
      !cartItems ||
      cartItems.length === 0
    ) {

      toast.warning(
        "Your cart is empty."
      );

      return;

    }


    // ====================================================
    // PAYMENT VALIDATION
    // ====================================================

    if (method === "upi") {

      if (
        !upiId.trim()
      ) {

        toast.warning(
          "Enter UPI ID"
        );

        return;

      }

    }


    if (method === "card") {

      if (
        !cardNumber.trim() ||
        !holderName.trim() ||
        !expiry.trim() ||
        !cvv.trim()
      ) {

        toast.warning(
          "Fill all card details"
        );

        return;

      }

    }


    // ====================================================
    // GET SHIPPING ADDRESS
    // ====================================================

    let address = null;


    try {

      const savedAddress =
        localStorage.getItem(
          "orgos_checkout_address"
        );


      if (
        savedAddress
      ) {

        address =
          JSON.parse(
            savedAddress
          );

      }

    }

    catch (error) {

      console.error(
        "Address Parse Error:",
        error
      );

    }


    // ====================================================
    // ADDRESS NOT FOUND
    // ====================================================

    if (
      !address
    ) {

      toast.warning(
        "Shipping address not found. Please go back to checkout."
      );

      navigate(
        "/checkout"
      );

      return;

    }


    // ====================================================
    // ADDRESS VALIDATION
    // ====================================================

    if (

      !address.fullName?.trim() ||

      !address.mobile?.trim() ||

      !address.addressLine?.trim() ||

      !address.city?.trim() ||

      !address.state?.trim() ||

      !address.pincode?.trim()

    ) {

      toast.warning(
        "Complete shipping address is required."
      );

      navigate(
        "/checkout"
      );

      return;

    }


    // ====================================================
    // PAYMENT METHOD
    // ====================================================

    let paymentMethod =
      method.toUpperCase();


    // ====================================================
    // CALCULATE TOTAL
    // ====================================================

    const itemsTotal =
      Number(
        getTotal()
      );


    const deliveryFee =
      50;


    // GST stays a fixed/constant amount — it does NOT
    // increase when quantity or cart total goes up.
    const gst =
      cartItems.length > 0
        ? GST_AMOUNT
        : 0;


    const rewardDiscountAmount =
      appliedReward && Number(appliedReward.discount_percent || 0) > 0
        ? (itemsTotal * Number(appliedReward.discount_percent)) / 100
        : 0;

    const grandTotal =
      Math.max(0, itemsTotal + deliveryFee + gst - rewardDiscountAmount);


    // ====================================================
    // FORMAT CART ITEMS
    // ====================================================

    const items =
      cartItems.map(
        (item) => {

          return {

            product_id:
              Number(
                item.product_id ||
                item.id
              ),

            size:
              item.size || null,

            quantity:
              Number(
                item.quantity || 1
              ),

            price:
              Number(
                item.price || 0
              )

          };

        }
      );


    // ====================================================
    // PRODUCT ID VALIDATION
    // ====================================================

    const invalidProduct =
      items.some(
        (item) =>
          !item.product_id
      );


    if (
      invalidProduct
    ) {

      toast.error(
        "Some product information is missing. Please add the product again."
      );

      console.error(
        "Invalid cart items:",
        cartItems
      );

      return;

    }


    // ====================================================
    // BACKEND PAYLOAD
    // ====================================================
    //
    // IMPORTANT:
    //
    // Backend expects:
    //
    // full_name
    // phone
    // address_line
    //
    // Frontend state contains:
    //
    // fullName
    // mobile
    // addressLine
    //
    // Therefore mapping is required.
    //
    // ====================================================

    const checkoutPayload = {

      address_details: {

        full_name:
          address.fullName.trim(),

        phone:
          address.mobile.trim(),

        address_line:
          address.addressLine.trim(),

        city:
          address.city.trim(),

        state:
          address.state.trim(),

        pincode:
          address.pincode.trim(),

        address_type:
          "Home"

      },

      items:
        items,

      payment_method:
        method === "cod" ? "COD" : "RAZORPAY",

      reward_code:
        appliedReward?.coupon_code || null,

      items_total:
        itemsTotal,

      delivery_fee:
        deliveryFee,

      gst:
        gst,

      grand_total:
        grandTotal

    };


    // ====================================================
    // DEBUG
    // ====================================================

    console.log(
      "===================================="
    );

    console.log(
      "SHIPPING ADDRESS:"
    );

    console.log(
      address
    );

    console.log(
      "===================================="
    );

    console.log(
      "CHECKOUT PAYLOAD:"
    );

    console.log(
      checkoutPayload
    );

    console.log(
      "===================================="
    );


    // ====================================================
    // PLACE ORDER API
    // ====================================================

    try {

      setPlacingOrder(
        true
      );

      if (method !== "cod") {
        await loadRazorpay();

        const paymentOrderResponse = await API.post("/orders/payment/create", {
          amount: grandTotal
        });

        const paymentOrder = paymentOrderResponse.data.order;

        await new Promise((resolve, reject) => {
          const checkout = new window.Razorpay({
            key: paymentOrderResponse.data.key_id,
            amount: paymentOrder.amount,
            currency: paymentOrder.currency,
            name: "ORGOS",
            description: "Secure order payment",
            order_id: paymentOrder.id,
            prefill: {
              name: address.fullName,
              contact: address.mobile
            },
            theme: {
              color: "#10a89a"
            },
            handler: async (paymentResponse) => {
              try {
                await API.post("/orders/payment/verify", paymentResponse);
                checkoutPayload.razorpay_payment_id = paymentResponse.razorpay_payment_id;
                checkoutPayload.razorpay_order_id = paymentResponse.razorpay_order_id;
                resolve();
              } catch (error) {
                reject(error);
              }
            },
            modal: {
              ondismiss: () => reject(new Error("Payment was cancelled."))
            }
          });

          checkout.open();
        });
      }


      const response =
        await API.post(
          "/orders/checkout",
          checkoutPayload
        );


      // ==================================================
      // API RESPONSE
      // ==================================================

      console.log(
        "CHECKOUT RESPONSE:"
      );

      console.log(
        response.data
      );


      // ==================================================
      // SUCCESS
      // ==================================================

      if (
        response.data &&
        response.data.success
      ) {


        // ================================================
        // GET ORDER DATA
        // ================================================

        const order =
          response.data.order ||
          response.data.data ||
          {};


        const orderId =
          order.order_id ||
          order.id ||
          response.data.order_id ||
          response.data.id;


        // ================================================
        // CLEAR CART
        // ================================================

        try {

          await clearCart();

        }

        catch (cartError) {

          console.error(
            "Clear Cart Error:",
            cartError
          );

        }


        // ================================================
        // REMOVE CHECKOUT ADDRESS
        // ================================================

        localStorage.removeItem(
          "orgos_checkout_address"
        );

        localStorage.removeItem(
          "orgos_latest_spin_reward"
        );

        setAppliedReward(null);


        // ================================================
        // REMOVE OLD CART
        // ================================================

        localStorage.removeItem(
          "cart"
        );


        // ================================================
        // SUCCESS PAGE
        // ================================================

        navigate(
          "/success",
          {

            replace: true,

            state: {

              orderId:
                orderId,

              order:
                order,

              transactionId:
                response.data.transaction_id,

              totalAmount:
                response.data.total_amount

            }

          }
        );

      }

      // ==================================================
      // API SUCCESS FALSE
      // ==================================================

      else {

        toast.error(

          response.data?.message ||

          "Unable to place order. Please try again."

        );

      }

    }

    // ====================================================
    // ERROR
    // ====================================================

    catch (error) {

      console.error(
        "===================================="
      );

      console.error(
        "PLACE ORDER ERROR:"
      );

      console.error(
        error
      );

      console.error(
        "BACKEND RESPONSE:"
      );

      console.error(
        error.response?.data
      );

      console.error(
        "BACKEND STATUS:"
      );

      console.error(
        error.response?.status
      );

      console.error(
        "===================================="
      );


      toast.error(

        error.response?.data?.message ||

        error.response?.data?.error ||

        "Unable to place order. Please try again."

      );

    }

    finally {

      setPlacingOrder(
        false
      );

    }

  };


  // ======================================================
  // DISPLAY TOTALS
  // ======================================================

  const itemsTotal =
    Number(
      getTotal() || 0
    );


  const deliveryFee =
    50;


  // GST stays a fixed/constant amount — it does NOT
  // increase when quantity or cart total goes up.
  const gst =
    cartItems.length > 0
      ? GST_AMOUNT
      : 0;


  const rewardDiscountAmount =
    appliedReward && Number(appliedReward.discount_percent || 0) > 0
      ? (itemsTotal * Number(appliedReward.discount_percent)) / 100
      : 0;

  const grandTotal =
    Math.max(0, itemsTotal + deliveryFee + gst - rewardDiscountAmount);


  // ======================================================
  // RENDER
  // ======================================================

  return (

    <>

      <Navbar />


      <div className="payment-page">


        {/* =================================================
            PAGE TITLE
        ================================================== */}

        <h1>
          Payment
        </h1>


        <div className="payment-container">


          {/* =================================================
              LEFT SIDE
          ================================================== */}

          <div className="payment-left">


            <h2>
              Select Payment Method
            </h2>


            <label
              className="radio-box"
            >

              <input
                type="radio"
                name="payment"
                value="razorpay"
                checked={method === "razorpay"}
                onChange={() => setMethod("razorpay")}
              />

              <span>
                Razorpay (UPI / Card / Net Banking)
              </span>

            </label>


            {/* =================================================
                COD RADIO
            ================================================== */}

            <label
              className="radio-box"
            >

              <input

                type="radio"

                name="payment"

                value="cod"

                checked={
                  method === "cod"
                }

                onChange={() =>
                  setMethod("cod")
                }

              />

              <span>
                Cash On Delivery
              </span>

            </label>


            {/* =================================================
                UPI FORM
            ================================================== */}

            {

              method === "upi" && (

                <div
                  className="payment-form"
                >

                  <input

                    type="text"

                    placeholder="Enter UPI ID"

                    value={
                      upiId
                    }

                    onChange={(e) =>
                      setUpiId(
                        e.target.value
                      )
                    }

                    disabled={
                      placingOrder
                    }

                  />

                </div>

              )

            }


            {/* =================================================
                CARD FORM
            ================================================== */}

            {

              method === "card" && (

                <div
                  className="payment-form"
                >


                  {/* CARD NUMBER */}

                  <input

                    type="text"

                    placeholder="Card Number"

                    value={
                      cardNumber
                    }

                    onChange={(e) =>
                      setCardNumber(
                        e.target.value
                      )
                    }

                    maxLength={19}

                    disabled={
                      placingOrder
                    }

                  />


                  {/* HOLDER NAME */}

                  <input

                    type="text"

                    placeholder="Card Holder Name"

                    value={
                      holderName
                    }

                    onChange={(e) =>
                      setHolderName(
                        e.target.value
                      )
                    }

                    disabled={
                      placingOrder
                    }

                  />


                  {/* EXPIRY + CVV */}

                  <div
                    className="card-row"
                  >

                    <input

                      type="text"

                      placeholder="MM/YY"

                      value={
                        expiry
                      }

                      onChange={(e) =>
                        setExpiry(
                          e.target.value
                        )
                      }

                      maxLength={5}

                      disabled={
                        placingOrder
                      }

                    />


                    <input

                      type="password"

                      placeholder="CVV"

                      value={
                        cvv
                      }

                      onChange={(e) =>
                        setCvv(
                          e.target.value
                        )
                      }

                      maxLength={4}

                      disabled={
                        placingOrder
                      }

                    />

                  </div>

                </div>

              )

            }


            {/* =================================================
                COD
            ================================================== */}

            {

              method === "cod" && (

                <div
                  className="cod-box"
                >

                  <p>

                    Cash will be collected at
                    the time of delivery.

                  </p>

                </div>

              )

            }

          </div>


          {/* =================================================
              RIGHT SIDE
          ================================================== */}

          <div className="payment-right">


            <h2>
              Order Summary
            </h2>


            {/* =================================================
                CART ITEMS
            ================================================== */}

            {

              cartItems.map(
                (item) => (

                  <div

                    className="summary-item"

                    key={

                      item.cart_item_id ||

                      item.product_id ||

                      item.id

                    }

                  >

                    <span>

                      {
                        item.name ||
                        item.product_name
                      }

                      {
                        item.size
                          ? ` (${item.size})`
                          : ""
                      }

                      {" × "}

                      {
                        Number(
                          item.quantity || 1
                        )
                      }

                    </span>


                    <span>

                      ₹

                      {

                        Number(
                          item.price || 0
                        ) *

                        Number(
                          item.quantity || 1
                        )

                      }

                    </span>

                  </div>

                )
              )

            }


            <hr />


            {/* =================================================
                PRODUCT TOTAL
            ================================================== */}

            <div
              className="summary-item"
            >

              <span>
                Product Total
              </span>

              <span>

                ₹
                {
                  itemsTotal
                }

              </span>

            </div>


            {/* =================================================
                DELIVERY
            ================================================== */}

            <div
              className="summary-item"
            >

              <span>
                Delivery
              </span>

              <span>
                ₹
                {
                  deliveryFee
                }
              </span>

            </div>


            {/* =================================================
                GST
            ================================================== */}

            <div
              className="summary-item"
            >

              <span>
                GST
              </span>

              <span>
                ₹
                {
                  gst
                }
              </span>

            </div>


            {appliedReward && Number(appliedReward.discount_percent || 0) > 0 && (
              <div className="summary-item discount-row">
                <span>
                  Spin Reward ({appliedReward.reward_label || appliedReward.discount_percent})
                </span>

                <span>
                  -₹
                  {Number(
                    (itemsTotal * Number(appliedReward.discount_percent)) / 100
                  ).toFixed(2)}
                </span>
              </div>
            )}

            <hr />


            {/* =================================================
                GRAND TOTAL
            ================================================== */}

            <div
              className="summary-item total"
            >

              <strong>
                Grand Total
              </strong>


              <strong>

                ₹
                {
                  grandTotal
                }

              </strong>

            </div>

            {rewardLoading && (
              <p className="reward-box-status">Checking your active spin reward...</p>
            )}


            {/* =================================================
                PLACE ORDER
            ================================================== */}

            <button

              className="place-order"

              onClick={
                placeOrder
              }

              disabled={
                placingOrder
              }

            >

              {

                placingOrder

                  ?

                  "PLACING ORDER..."

                  :

                  "PLACE ORDER"

              }

            </button>


          </div>

        </div>

      </div>


      <Footer />

    </>

  );

}


export default Payment;