import { useEffect, useState } from "react";

import {
  FaBell,
  FaTrash,
  FaCheckCircle,
  FaSyncAlt,
  FaChartLine,
  FaExclamationCircle
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/futurePrice.css";


import { toast } from "react-toastify";


function FuturePrice() {

  let [products, setProducts] = useState([]);

  let [selectedProduct, setSelectedProduct] = useState("");

  let [targetPrice, setTargetPrice] = useState("");

  let [alerts, setAlerts] = useState([]);

  let [loadingProducts, setLoadingProducts] = useState(true);

  let [checking, setChecking] = useState(false);


  // ==========================================
  // LOAD PRODUCTS
  // ==========================================

  useEffect(() => {

    loadProducts();

    let savedAlerts =
      localStorage.getItem("orgos_price_alerts");

    if (savedAlerts) {

      try {

        setAlerts(JSON.parse(savedAlerts));

      } catch (error) {

        console.error(
          "Saved alerts error:",
          error
        );

        setAlerts([]);

      }

    }

  }, []);


  // ==========================================
  // GET REAL PRODUCTS FROM BACKEND
  // ==========================================

  async function loadProducts() {

    try {

      setLoadingProducts(true);

      let response = await fetch(
        "https://orgos-backend-h7ad.onrender.com/api/products"
      );

      let data = await response.json();

      if (
        response.ok &&
        data.success &&
        Array.isArray(data.products)
      ) {

        setProducts(data.products);

      } else {

        setProducts([]);

      }

    }

    catch (error) {

      console.error(
        "Product loading error:",
        error
      );

      setProducts([]);

    }

    finally {

      setLoadingProducts(false);

    }

  }


  // ==========================================
  // SAVE ALERTS
  // ==========================================

  function saveAlerts(newAlerts) {

    setAlerts(newAlerts);

    localStorage.setItem(
      "orgos_price_alerts",
      JSON.stringify(newAlerts)
    );

  }


  // ==========================================
  // SELECTED PRODUCT
  // ==========================================

  let product = products.find(
    item =>
      String(item.product_id) ===
      String(selectedProduct)
  );


  // ==========================================
  // CREATE ALERT
  // ==========================================

  function createAlert() {

    if (!product) {

      toast.warning("Please select a product.");

      return;

    }


    if (
      !targetPrice ||
      Number(targetPrice) <= 0
    ) {

      toast.warning("Please enter a valid target price.");

      return;

    }


    let currentPrice =
      Number(product.price);


    if (
      Number(targetPrice) >=
      currentPrice
    ) {

      toast.warning(
        "Target price should be lower than current price."
      );

      return;

    }


    let alreadyExists =
      alerts.some(
        item =>
          Number(item.productId) ===
          Number(product.product_id) &&
          Number(item.targetPrice) ===
          Number(targetPrice)
      );


    if (alreadyExists) {

      toast.warning(
        "This price alert already exists."
      );

      return;

    }


    let newAlert = {

      id: Date.now(),

      productId:
        product.product_id,

      productName:
        product.product_name,

      currentPrice:
        currentPrice,

      previousPrice:
        currentPrice,

      targetPrice:
        Number(targetPrice),

      createdAt:
        new Date().toLocaleString(),

      status:
        "Waiting",

      priceDropped:
        false,

      notificationShown:
        false

    };


    saveAlerts([
      ...alerts,
      newAlert
    ]);


    setSelectedProduct("");

    setTargetPrice("");

    toast.success(
      "Price alert created successfully!"
    );

  }


  // ==========================================
  // CHECK REAL PRICE
  // ==========================================

  async function checkPrice(alertItem) {

    try {

      setChecking(true);


      let response =
        await fetch(
          `https://orgos-backend-h7ad.onrender.com/api/products/${alertItem.productId}`
        );


      let data =
        await response.json();


      if (
        !response.ok ||
        !data.success ||
        !data.product
      ) {

        toast.error(
          "Unable to fetch latest product price."
        );

        return;

      }


      let currentPrice =
        Number(data.product.price);


      let oldPrice =
        Number(alertItem.currentPrice);


      let targetPrice =
        Number(alertItem.targetPrice);


      let priceDropped =
        currentPrice < oldPrice;


      let targetReached =
        currentPrice <= targetPrice;


      let updatedAlerts =
        alerts.map(item => {

          if (
            item.id ===
            alertItem.id
          ) {

            return {

              ...item,

              previousPrice:
                oldPrice,

              currentPrice:
                currentPrice,

              status:
                targetReached
                  ? "Target Reached"
                  : "Waiting",

              priceDropped:
                priceDropped

            };

          }


          return item;

        });


      saveAlerts(updatedAlerts);


      if (targetReached) {

        toast.info(
          `Price Alert!\n\n${alertItem.productName} is now ₹${currentPrice.toLocaleString(
            "en-IN"
          )}.\n\nYour target price was ₹${targetPrice.toLocaleString(
            "en-IN"
          )}.`
        );

      }

      else if (priceDropped) {

        toast.info(
          `Price Dropped!\n\n${alertItem.productName}\n\nPrevious Price: ₹${oldPrice.toLocaleString(
            "en-IN"
          )}\nCurrent Price: ₹${currentPrice.toLocaleString(
            "en-IN"
          )}\n\nPrice dropped by ₹${(
            oldPrice -
            currentPrice
          ).toLocaleString("en-IN")}.`
        );

      }

      else {

        toast.info(
          `Current price is ₹${currentPrice.toLocaleString(
            "en-IN"
          )}.`
        );

      }

    }

    catch (error) {

      console.error(
        "Price checking error:",
        error
      );

      toast.error(
        "Unable to check latest price."
      );

    }

    finally {

      setChecking(false);

    }

  }


  // ==========================================
  // CHECK ALL ALERTS
  // ==========================================

  async function checkAllPrices() {

    if (alerts.length === 0) {

      return;

    }


    setChecking(true);


    let updatedAlerts = [];


    for (
      let alertItem of alerts
    ) {

      try {

        let response =
          await fetch(
            `https://orgos-backend-h7ad.onrender.com/api/products/${alertItem.productId}`
          );


        let data =
          await response.json();


        if (
          response.ok &&
          data.success &&
          data.product
        ) {

          let currentPrice =
            Number(data.product.price);

          let oldPrice =
            Number(alertItem.currentPrice);

          let targetPrice =
            Number(alertItem.targetPrice);


          let dropped =
            currentPrice < oldPrice;

          let reached =
            currentPrice <= targetPrice;


          updatedAlerts.push({

            ...alertItem,

            previousPrice:
              oldPrice,

            currentPrice:
              currentPrice,

            status:
              reached
                ? "Target Reached"
                : "Waiting",

            priceDropped:
              dropped

          });

        }

        else {

          updatedAlerts.push(
            alertItem
          );

        }

      }

      catch (error) {

        console.error(error);

        updatedAlerts.push(
          alertItem
        );

      }

    }


    saveAlerts(updatedAlerts);

    setChecking(false);


    let notificationAlert =
      updatedAlerts.find(
        item =>
          item.priceDropped ||
          item.status ===
          "Target Reached"
      );


    if (notificationAlert) {

      let oldPrice =
        Number(
          notificationAlert.previousPrice
        );

      let currentPrice =
        Number(
          notificationAlert.currentPrice
        );

      if (
        notificationAlert.status ===
        "Target Reached"
      ) {

        toast.info(
          `🔔 Price Alert!\n\n${notificationAlert.productName} is now ₹${currentPrice.toLocaleString(
            "en-IN"
          )}.\n\nYour target was ₹${Number(
            notificationAlert.targetPrice
          ).toLocaleString("en-IN")}.`
        );

      }

      else if (
        currentPrice < oldPrice
      ) {

        toast.info(
          `🔔 Price Dropped!\n\n${notificationAlert.productName}\n\n₹${oldPrice.toLocaleString(
            "en-IN"
          )} → ₹${currentPrice.toLocaleString(
            "en-IN"
          )}`
        );

      }

    }

  }


  // ==========================================
  // DELETE
  // ==========================================

  function deleteAlert(id) {

    let updatedAlerts =
      alerts.filter(
        item =>
          item.id !== id
      );

    saveAlerts(updatedAlerts);

  }


  return (

    <>

      <Navbar />


      <main className="future-price-page">


        {/* =================================
            PAGE HEADER
        ================================= */}

        <div className="future-price-header">

          <div className="future-price-title">

            <div className="future-price-icon">

              <FaChartLine />

            </div>

            <div>

              <h1 style={{ textAlign: "center" }}>
                Future Price Alert
              </h1>

              <p>
                Track product prices and get notified when they drop.
              </p>

            </div>

          </div>

        </div>


        {/* =================================
            MAIN TWO COLUMN AREA
        ================================= */}

        <div className="future-price-main-grid">


          {/* =================================
              CREATE PRICE ALERT
          ================================= */}

          <section className="price-alert-form-card">


            <div className="card-heading">

              <div className="card-heading-icon">

                <FaBell />

              </div>

              <div>

                <h2>
                  Create Price Alert
                </h2>

                <p>
                  Select a product and set your desired price.
                </p>

              </div>

            </div>


            {/* PRODUCT */}

            <div className="price-form-group">

              <label>
                Select Product
              </label>


              <select
                value={selectedProduct}
                onChange={(e) =>
                  setSelectedProduct(
                    e.target.value
                  )
                }
                disabled={
                  loadingProducts
                }
              >

                <option value="">

                  {loadingProducts
                    ? "Loading products..."
                    : "Select a product"}

                </option>


                {!loadingProducts &&
                  products.length > 0 &&
                  products.map(
                    item => (

                      <option
                        key={
                          item.product_id
                        }
                        value={
                          item.product_id
                        }
                      >

                        {item.product_name}

                        {" - ₹"}

                        {Number(
                          item.price
                        ).toLocaleString(
                          "en-IN"
                        )}

                      </option>

                    )
                  )}

              </select>


              {!loadingProducts &&
                products.length === 0 && (

                  <div className="product-error">

                    <FaExclamationCircle />

                    <span>
                      No active products found.
                    </span>

                  </div>

                )}

            </div>


            {/* SELECTED PRODUCT PRICE */}

            {product && (

              <div className="selected-product-price">

                <div>

                  <span>
                    Current Price
                  </span>

                  <strong>
                    ₹
                    {Number(
                      product.price
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

                <div className="selected-product-name">

                  {product.product_name}

                </div>

              </div>

            )}


            {/* TARGET PRICE */}

            <div className="price-form-group">

              <label>
                Target Price
              </label>


              <div className="price-input">

                <span>
                  ₹
                </span>

                <input
                  type="number"
                  min="1"
                  placeholder="Enter target price"
                  value={targetPrice}
                  onChange={(e) =>
                    setTargetPrice(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>


            {/* SAVING */}

            {product &&
              targetPrice &&
              Number(targetPrice) <
              Number(product.price) && (

                <div className="saving-preview">

                  You can save up to{" "}

                  <strong>

                    ₹
                    {(
                      Number(product.price) -
                      Number(targetPrice)
                    ).toLocaleString(
                      "en-IN"
                    )}

                  </strong>

                </div>

              )}


            {/* CREATE BUTTON */}

            <button
              className="create-alert-button"
              onClick={
                createAlert
              }
            >

              <FaBell />

              Create Price Alert

            </button>


          </section>


          {/* =================================
              MY PRICE ALERTS
          ================================= */}

          <section className="my-alerts-section">


            <div className="my-alerts-header">

              <div>

                <h2>
                  My Price Alerts
                </h2>

                <p>

                  {alerts.length} active alert
                  {alerts.length !== 1
                    ? "s"
                    : ""}

                </p>

              </div>


              {alerts.length > 0 && (

                <button
                  className="check-all-button"
                  onClick={
                    checkAllPrices
                  }
                  disabled={
                    checking
                  }
                >

                  <FaSyncAlt
                    className={
                      checking
                        ? "rotate-icon"
                        : ""
                    }
                  />

                  {checking
                    ? "Checking..."
                    : "Check Now"}

                </button>

              )}

            </div>


            {/* NO ALERT */}

            {alerts.length === 0 ? (

              <div className="no-alerts">

                <FaBell />

                <h3>
                  No Price Alerts
                </h3>

                <p>
                  Create a price alert to track a product.
                </p>

              </div>

            ) : (

              <div className="alerts-grid">

                {alerts.map(
                  alertItem => (

                    <div
                      className="alert-card"
                      key={
                        alertItem.id
                      }
                    >


                      {/* CARD TOP */}

                      <div className="alert-card-top">

                        <div>

                          <h3>
                            {
                              alertItem.productName
                            }
                          </h3>

                          <small>
                            Created{" "}
                            {
                              alertItem.createdAt
                            }
                          </small>

                        </div>


                        <div
                          className={
                            alertItem.status ===
                              "Target Reached"
                              ? "alert-status reached"
                              : "alert-status"
                          }
                        >

                          {alertItem.status ===
                            "Target Reached" ? (

                            <>
                              <FaCheckCircle />

                              Target Reached
                            </>

                          ) : (

                            <>
                              <FaBell />

                              Waiting
                            </>

                          )}

                        </div>

                      </div>


                      {/* PRICES */}

                      <div className="alert-prices">


                        <div>

                          <span>
                            Current Price
                          </span>

                          <strong>

                            ₹
                            {Number(
                              alertItem.currentPrice
                            ).toLocaleString(
                              "en-IN"
                            )}

                          </strong>

                        </div>


                        <div>

                          <span>
                            Target Price
                          </span>

                          <strong className="target-price">

                            ₹
                            {Number(
                              alertItem.targetPrice
                            ).toLocaleString(
                              "en-IN"
                            )}

                          </strong>

                        </div>


                      </div>


                      {/* PRICE DROP MESSAGE */}

                      {alertItem.priceDropped && (

                        <div className="price-drop-message">

                          <FaChartLine />

                          <span>

                            Price dropped by{" "}

                            <strong>

                              ₹
                              {(
                                Number(
                                  alertItem.previousPrice
                                ) -
                                Number(
                                  alertItem.currentPrice
                                )
                              ).toLocaleString(
                                "en-IN"
                              )}

                            </strong>

                          </span>

                        </div>

                      )}


                      {alertItem.status ===
                        "Target Reached" && (

                          <div className="target-message">

                            <FaCheckCircle />

                            <span>
                              Price is now at or below your target price.
                            </span>

                          </div>

                        )}


                      {/* ACTIONS */}

                      <div className="alert-card-actions">

                        <button
                          className="check-price-button"
                          onClick={() =>
                            checkPrice(
                              alertItem
                            )
                          }
                          disabled={
                            checking
                          }
                        >

                          <FaSyncAlt
                            className={
                              checking
                                ? "rotate-icon"
                                : ""
                            }
                          />

                          {checking
                            ? "Checking..."
                            : "Check Price"}

                        </button>


                        <button
                          className="delete-alert-button"
                          onClick={() =>
                            deleteAlert(
                              alertItem.id
                            )
                          }
                        >

                          <FaTrash />

                        </button>

                      </div>


                    </div>

                  )
                )}

              </div>

            )}

          </section>


        </div>

      </main>


      <Footer />

    </>

  );

}


export default FuturePrice;