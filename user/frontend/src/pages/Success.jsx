import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/success.css";

import { useLocation, useNavigate } from "react-router-dom";

function Success() {

  const navigate = useNavigate();
  const location = useLocation();

  const orderId =
    location.state?.orderId ||
    "ORG" + Math.floor(Math.random() * 1000000);

  return (

    <>

      <Navbar />

      <div className="success-page">

        <div className="success-box">

          <div className="success-icon">

            ✓

          </div>

          <h1>

            Order Placed Successfully

          </h1>

          <p>

            Thank you for shopping with ORGOS.

          </p>

          <h3>

            Order ID

          </h3>

          <h2>

            {orderId}

          </h2>

          <p>

            Estimated Delivery

          </p>

          <h3>

            3 - 5 Business Days

          </h3>

          <button

            onClick={() => navigate("/")}

          >

            Continue Shopping

          </button>

          <button

            onClick={() => navigate("/dashboard?tab=orders")}

          >

            View My Orders

          </button>

        </div>

      </div>

      <Footer />

    </>

  );

}

export default Success;