import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/checkout.css";

import { CartContext } from "../context/CartContext";
import { getDefaultAddress } from "../utils/addressStore";

import { toast } from "react-toastify";


function Checkout() {

  const navigate = useNavigate();

  const { cartItems, getTotal } =
    useContext(CartContext);

  const [address, setAddress] = useState({

    fullName: "",
    mobile: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: ""

  });

  useEffect(() => {

    const saved = getDefaultAddress();

    if (saved) {

      setAddress({

        fullName: saved.fullName,
        mobile: saved.mobile,
        addressLine: saved.addressLine,
        city: saved.city,
        state: saved.state,
        pincode: saved.pincode

      });

    }

  }, []);

  const handleAddressChange = (e) => {

    setAddress({

      ...address,
      [e.target.name]: e.target.value

    });

  };

  const handleContinue = () => {

    if (

      !address.fullName ||
      !address.mobile ||
      !address.addressLine ||
      !address.city ||
      !address.state ||
      !address.pincode

    ) {

      toast.warning("Please fill in your shipping address");
      return;

    }

    if (cartItems.length === 0) {

      toast.warning("Your cart is empty.");
      return;

    }

    localStorage.setItem(
      "orgos_checkout_address",
      JSON.stringify(address)
    );

    navigate("/payment");

  };

  return (

    <>

      <Navbar />

      <div className="checkout-page">

        <h1>Checkout</h1>

        <div className="checkout-container">

          {/* LEFT */}

          <div className="address-box">

            <h2>Shipping Address</h2>

            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={address.fullName}
              onChange={handleAddressChange}
            />

            <input
              type="text"
              name="mobile"
              placeholder="Mobile Number"
              value={address.mobile}
              onChange={handleAddressChange}
            />

            <textarea
              name="addressLine"
              placeholder="Full Address"
              value={address.addressLine}
              onChange={handleAddressChange}
            ></textarea>

            <input
              type="text"
              name="city"
              placeholder="City"
              value={address.city}
              onChange={handleAddressChange}
            />

            <input
              type="text"
              name="state"
              placeholder="State"
              value={address.state}
              onChange={handleAddressChange}
            />

            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={address.pincode}
              onChange={handleAddressChange}
            />

          </div>

          {/* RIGHT */}

          <div className="summary-box">

            <h2>Order Summary</h2>

            {

              cartItems.map(item => (

                <div
                  className="summary-item"
                  key={item.id}
                >

                  <span>

                    {item.name}

                    × {item.quantity}

                  </span>

                  <span>

                    ₹

                    {item.price * item.quantity}

                  </span>

                </div>

              ))

            }

            <hr />

            <div className="summary-item">

              <b>Total</b>

              <b>

                ₹{getTotal()}

              </b>

            </div>

            <button

              className="payment-btn"

              onClick={handleContinue}

            >

              Continue To Payment

            </button>

          </div>

        </div>

      </div>

      <Footer />

    </>

  );

}

export default Checkout;