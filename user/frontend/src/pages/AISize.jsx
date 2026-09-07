import { useMemo, useState } from "react";

import {
  FaRulerCombined,
  FaCheckCircle
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/aiSize.css";


import { toast } from "react-toastify";


function AISize() {

  let [selectedProduct, setSelectedProduct] = useState("");

  let [height, setHeight] = useState("");
  let [weight, setWeight] = useState("");
  let [chest, setChest] = useState("");
  let [waist, setWaist] = useState("");
  let [shoulder, setShoulder] = useState("");

  let [result, setResult] = useState(null);


  /*
  ==========================================
  PRODUCT DATA
  ==========================================
  */

  let products = [

    {
      id: 1,

      name: "Classic Cotton Shirt",

      category: "Shirt",

      sizes: ["S", "M", "L", "XL"],

      chart: {

        S: {
          chest: 36,
          waist: 30,
          shoulder: 17
        },

        M: {
          chest: 38,
          waist: 32,
          shoulder: 18
        },

        L: {
          chest: 40,
          waist: 34,
          shoulder: 19
        },

        XL: {
          chest: 42,
          waist: 36,
          shoulder: 20
        }

      }

    },


    {
      id: 2,

      name: "Premium Oversized T-Shirt",

      category: "T-Shirt",

      sizes: ["S", "M", "L", "XL", "XXL"],

      chart: {

        S: {
          chest: 38,
          waist: 34,
          shoulder: 18
        },

        M: {
          chest: 40,
          waist: 36,
          shoulder: 19
        },

        L: {
          chest: 42,
          waist: 38,
          shoulder: 20
        },

        XL: {
          chest: 44,
          waist: 40,
          shoulder: 21
        },

        XXL: {
          chest: 46,
          waist: 42,
          shoulder: 22
        }

      }

    },


    {
      id: 3,

      name: "Slim Fit Denim Jacket",

      category: "Jacket",

      sizes: ["M", "L", "XL"],

      chart: {

        M: {
          chest: 38,
          waist: 32,
          shoulder: 18
        },

        L: {
          chest: 40,
          waist: 34,
          shoulder: 19
        },

        XL: {
          chest: 42,
          waist: 36,
          shoulder: 20
        }

      }

    }

  ];


  /*
  ==========================================
  GET SELECTED PRODUCT
  ==========================================
  */

  let product = useMemo(() => {

    return products.find(
      item => item.id === Number(selectedProduct)
    );

  }, [selectedProduct]);


  /*
  ==========================================
  CALCULATE SIZE
  ==========================================
  */

  function calculateSize() {

    /*
    --------------------------------------
    VALIDATION
    --------------------------------------
    */

    if (
      !selectedProduct ||
      !height ||
      !weight ||
      !chest ||
      !waist ||
      !shoulder
    ) {

      toast.warning("Please fill all details.");

      return;

    }


    if (!product) {

      toast.warning("Please select a valid product.");

      return;

    }


    /*
    --------------------------------------
    CONVERT VALUES TO NUMBERS
    --------------------------------------
    */

    let heightValue = Number(height);

    let weightValue = Number(weight);

    let chestValue = Number(chest);

    let waistValue = Number(waist);

    let shoulderValue = Number(shoulder);


    /*
    --------------------------------------
    BASIC VALIDATION
    --------------------------------------
    */

    if (
      heightValue <= 0 ||
      weightValue <= 0 ||
      chestValue <= 0 ||
      waistValue <= 0 ||
      shoulderValue <= 0
    ) {

      toast.warning("Please enter valid measurements.");

      return;

    }


    /*
    ======================================
    IMPORTANT
    ======================================

    User enters:

    Chest     = inches
    Waist     = inches
    Shoulder  = inches

    Product chart also uses inches.

    Therefore NO /2.54 conversion.
    */


    let userChest = chestValue;

    let userWaist = waistValue;

    let userShoulder = shoulderValue;


    /*
    --------------------------------------
    VARIABLES FOR BEST SIZE
    --------------------------------------
    */

    let bestSize = "";

    let bestScore = Infinity;

    let sizeResults = [];


    /*
    ======================================
    CHECK EVERY SIZE
    ======================================
    */

    product.sizes.forEach(size => {

      let sizeData = product.chart[size];


      /*
      ----------------------------------
      DIFFERENCE CALCULATION
      ----------------------------------
      */

      let chestDifference = Math.abs(
        sizeData.chest - userChest
      );


      let waistDifference = Math.abs(
        sizeData.waist - userWaist
      );


      let shoulderDifference = Math.abs(
        sizeData.shoulder - userShoulder
      );


      /*
      ==================================
      WEIGHTED SIZE SCORE

      Chest     = 50%
      Waist     = 30%
      Shoulder  = 20%

      Lower score = better fit
      ==================================
      */

      let chestScore =
        chestDifference * 0.50;


      let waistScore =
        waistDifference * 0.30;


      let shoulderScore =
        shoulderDifference * 0.20;


      let totalScore =
        chestScore +
        waistScore +
        shoulderScore;


      /*
      ----------------------------------
      STORE RESULT
      ----------------------------------
      */

      sizeResults.push({

        size: size,

        score: totalScore,

        chestDifference: chestDifference,

        waistDifference: waistDifference,

        shoulderDifference: shoulderDifference

      });


      /*
      ----------------------------------
      CHECK BEST SIZE
      ----------------------------------
      */

      if (totalScore < bestScore) {

        bestScore = totalScore;

        bestSize = size;

      }

    });


    /*
    ======================================
    SORT RESULTS
    ======================================
    */

    sizeResults.sort(
      (a, b) => a.score - b.score
    );


    /*
    --------------------------------------
    BEST MATCH
    --------------------------------------
    */

    let bestMatch = sizeResults[0];

    let secondMatch = sizeResults[1];


    /*
    ======================================
    CONFIDENCE CALCULATION
    ======================================
    */

    let confidence;


    /*
    Exact / very close match
    */

    if (bestMatch.score === 0) {

      confidence = 98;

    }

    else {

      confidence = Math.round(
        100 - (bestMatch.score * 10)
      );

    }


    /*
    --------------------------------------
    KEEP CONFIDENCE BETWEEN 70 - 98
    --------------------------------------
    */

    confidence = Math.max(
      70,
      Math.min(
        98,
        confidence
      )
    );


    /*
    ======================================
    IF TWO SIZES ARE VERY CLOSE
    ======================================
    */

    if (
      secondMatch &&
      Math.abs(
        secondMatch.score - bestMatch.score
      ) < 0.5
    ) {

      confidence = Math.max(
        70,
        confidence - 8
      );

    }


    /*
    ======================================
    SAVE RESULT
    ======================================
    */

    setResult({

      size: bestSize,

      confidence: confidence,

      measurements: {

        height: heightValue,

        weight: weightValue,

        chest: userChest,

        waist: userWaist,

        shoulder: userShoulder

      },

      differences: {

        chest:
          bestMatch.chestDifference,

        waist:
          bestMatch.waistDifference,

        shoulder:
          bestMatch.shoulderDifference

      }

    });

  }


  /*
  ==========================================
  RESET FORM
  ==========================================
  */

  function resetForm() {

    setSelectedProduct("");

    setHeight("");

    setWeight("");

    setChest("");

    setWaist("");

    setShoulder("");

    setResult(null);

  }


  /*
  ==========================================
  PRODUCT CHANGE
  ==========================================
  */

  function handleProductChange(e) {

    setSelectedProduct(e.target.value);

    setResult(null);

  }


  /*
  ==========================================
  UI
  ==========================================
  */

  return (

    <>

      <Navbar />


      <main className="ai-size-page">


        {/* =================================
                    HEADER
                ================================= */}

        <div className="ai-size-header">


          <div className="ai-size-header-icon">

            <FaRulerCombined />

          </div>


          <h1>

            AI Size Recommendation

          </h1>


          <p>

            Find your perfect clothing size
            using your measurements.

          </p>


        </div>



        {/* =================================
                    MAIN CONTAINER
                ================================= */}

        <div className="ai-size-container">


          {/* =================================
                        FORM CARD
                    ================================= */}

          <section className="ai-size-form-card">


            <h2>

              Enter Your Details

            </h2>


            <p className="form-subtitle">

              We will compare your measurements
              with the selected product.

            </p>



            {/* PRODUCT */}

            <div className="form-group">


              <label>

                Select Product

              </label>


              <select

                value={selectedProduct}

                onChange={handleProductChange}

              >


                <option value="">

                  Select a product

                </option>


                {products.map(item => (

                  <option

                    key={item.id}

                    value={item.id}

                  >

                    {item.name}

                  </option>

                ))}


              </select>


            </div>



            {/* =================================
                            MEASUREMENTS
                        ================================= */}

            <div className="measurement-grid">


              {/* HEIGHT */}

              <div className="form-group">


                <label>

                  Height (cm)

                </label>


                <input

                  type="number"

                  min="1"

                  placeholder="e.g. 175"

                  value={height}

                  onChange={(e) =>
                    setHeight(e.target.value)
                  }

                />


              </div>



              {/* WEIGHT */}

              <div className="form-group">


                <label>

                  Weight (kg)

                </label>


                <input

                  type="number"

                  min="1"

                  placeholder="e.g. 70"

                  value={weight}

                  onChange={(e) =>
                    setWeight(e.target.value)
                  }

                />


              </div>



              {/* CHEST */}

              <div className="form-group">


                <label>

                  Chest (inches)

                </label>


                <input

                  type="number"

                  min="1"

                  step="0.1"

                  placeholder="e.g. 42"

                  value={chest}

                  onChange={(e) =>
                    setChest(e.target.value)
                  }

                />


              </div>



              {/* WAIST */}

              <div className="form-group">


                <label>

                  Waist (inches)

                </label>


                <input

                  type="number"

                  min="1"

                  step="0.1"

                  placeholder="e.g. 36"

                  value={waist}

                  onChange={(e) =>
                    setWaist(e.target.value)
                  }

                />


              </div>



              {/* SHOULDER */}

              <div className="form-group full-width">


                <label>

                  Shoulder (inches)

                </label>


                <input

                  type="number"

                  min="1"

                  step="0.1"

                  placeholder="e.g. 20"

                  value={shoulder}

                  onChange={(e) =>
                    setShoulder(e.target.value)
                  }

                />


              </div>


            </div>



            {/* =================================
                            BUTTONS
                        ================================= */}

            <div className="size-action-buttons">


              <button

                className="primary-ai-button"

                onClick={calculateSize}

              >

                Get My Size

              </button>



              <button

                className="secondary-ai-button"

                onClick={resetForm}

              >

                Reset

              </button>


            </div>


          </section>



          {/* =================================
                        RESULT CARD
                    ================================= */}

          <section className="ai-size-result-card">


            {/* =================================
                            EMPTY RESULT
                        ================================= */}

            {!result && (

              <div className="empty-ai-result">


                <FaRulerCombined />


                <h2>

                  Your Recommendation

                </h2>


                <p>

                  Enter your measurements
                  to get your recommended size.

                </p>


              </div>

            )}



            {/* =================================
                            RESULT
                        ================================= */}

            {result && (

              <div className="size-result">


                {/* SUCCESS ICON */}

                <FaCheckCircle
                  className="success-icon"
                />



                {/* LABEL */}

                <p className="result-label">

                  Recommended Size

                </p>



                {/* SIZE */}

                <div className="recommended-size">

                  {result.size}

                </div>



                {/* TITLE */}

                <h2>

                  Size {result.size} is recommended

                </h2>



                {/* DESCRIPTION */}

                <p>

                  Based on your measurements,
                  size{" "}

                  <strong>

                    {result.size}

                  </strong>{" "}

                  should provide the best match
                  for this product.

                </p>



                {/* =================================
                                    CONFIDENCE
                                ================================= */}

                <div className="confidence-box">


                  <div className="confidence-header">


                    <span>

                      Fit Confidence

                    </span>


                    <strong>

                      {result.confidence}%

                    </strong>


                  </div>



                  <div className="confidence-bar">


                    <div

                      style={{
                        width:
                          `${result.confidence}%`
                      }}

                    />

                  </div>


                </div>



                {/* =================================
                                    RECOMMENDATION POINTS
                                ================================= */}

                <div className="recommendation-points">


                  <div>

                    <FaCheckCircle />

                    Chest measurement considered

                  </div>


                  <div>

                    <FaCheckCircle />

                    Waist measurement considered

                  </div>


                  <div>

                    <FaCheckCircle />

                    Shoulder measurement considered

                  </div>


                  <div>

                    <FaCheckCircle />

                    Product size chart considered

                  </div>


                  <div>

                    <FaCheckCircle />

                    Height and weight verified

                  </div>


                </div>


              </div>

            )}


          </section>


        </div>



        {/* =================================
                    SIZE CHART
                ================================= */}

        {product && (

          <section className="size-chart-section">


            <h2>

              {product.name} Size Chart

            </h2>


            <div className="size-table-wrapper">


              <table>


                <thead>


                  <tr>


                    <th>

                      Size

                    </th>


                    <th>

                      Chest

                    </th>


                    <th>

                      Waist

                    </th>


                    <th>

                      Shoulder

                    </th>


                  </tr>


                </thead>



                <tbody>


                  {product.sizes.map(size => (


                    <tr key={size}>


                      <td>

                        <strong>

                          {size}

                        </strong>

                      </td>


                      <td>

                        {product.chart[size].chest}"

                      </td>


                      <td>

                        {product.chart[size].waist}"

                      </td>


                      <td>

                        {product.chart[size].shoulder}"

                      </td>


                    </tr>


                  ))}


                </tbody>


              </table>


            </div>


          </section>

        )}


      </main>


      <Footer />

    </>

  );

}


export default AISize;