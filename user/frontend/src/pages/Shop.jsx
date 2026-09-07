import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/shop.css";

import shop1 from "../assets/images/shop2.png";
import shop2 from "../assets/images/shop3.png";
import shop3 from "../assets/images/shop4.png";
import shop4 from "../assets/images/shop5.png";
import shop5 from "../assets/images/shop6.png";
import shop6 from "../assets/images/shop7.png";


function Shop() {

  let navigate = useNavigate();


  let shops = [

    {
      id: 1,

      image: shop1,

      name: "Trendy Collection",

      category:
        "Ethnic Wear • Western Wear",

      location:
        "Sitabuldi, Nagpur",

      distance:
        "2.1 km",

      mapLocation:
        "Trendy Collection Sitabuldi Nagpur"
    },


    {
      id: 2,

      image: shop2,

      name: "Style Hub",

      category:
        "Men's Wear • Formal Wear",

      location:
        "Dharampeth, Nagpur",

      distance:
        "1.8 km",

      mapLocation:
        "Style Hub Dharampeth Nagpur"
    },


    {
      id: 3,

      image: shop3,

      name: "Nagpur Fashion",

      category:
        "Ethnic Wear • Saree",

      location:
        "IT Park, Nagpur",

      distance:
        "3.3 km",

      mapLocation:
        "Nagpur Fashion IT Park Nagpur"
    },


    {
      id: 4,

      image: shop4,

      name: "B&W",

      category:
        "Unisex Wear • Streetwear",

      location:
        "Civil Line, Nagpur",

      distance:
        "2.6 km",

      mapLocation:
        "B&W Civil Line Nagpur"
    },


    {
      id: 5,

      image: shop5,

      name: "Kids World",

      category:
        "Kids Wear • Boys Wear",

      location:
        "Manewada, Nagpur",

      distance:
        "3.7 km",

      mapLocation:
        "Kids World Manewada Nagpur"
    },


    {
      id: 6,

      image: shop6,

      name: "Fab Outfit",

      category:
        "Accessories • Bags",

      location:
        "Sadar, Nagpur",

      distance:
        "2.6 km",

      mapLocation:
        "Fab Outfit Sadar Nagpur"
    }

  ];


  /* ======================================================
     VIEW SHOP
  ====================================================== */

  function handleViewShop(shop) {

    navigate(
      `/shop/${shop.id}`,
      {
        state: {
          shop: shop
        }
      }
    );

  }


  /* ======================================================
     VISIT SHOP
  ====================================================== */

  function handleVisitShop(shop) {

    let mapUrl =
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        shop.mapLocation
      )}`;

    window.open(
      mapUrl,
      "_blank",
      "noopener,noreferrer"
    );

  }


  return (

    <>

      <Navbar />


      {/* ==================================================
          BANNER
      ================================================== */}

      <section className="shop-banner">

        <h1>
          OUR SHOPS
        </h1>

        <p>
          Explore our top garment shops near you.
        </p>

      </section>


      {/* ==================================================
          SHOP CONTAINER
      ================================================== */}

      <section className="shop-container">


        <div className="shop-header">

          <h2>
            Top Shops
          </h2>


          <div className="sort-box">

            <span>
              Sort by:
            </span>

            <select>

              <option>
                Popular
              </option>

              <option>
                Nearest
              </option>

              <option>
                Newest
              </option>

            </select>

          </div>

        </div>


        {/* ==================================================
            SHOP GRID
        ================================================== */}

        <div className="shop-grid">


          {shops.map((shop) => (

            <div
              className="shop-card"
              key={shop.id}
            >


              {/* IMAGE */}

              <img
                src={shop.image}
                alt={shop.name}
                className="shop-image"
              />


              {/* CONTENT */}

              <div className="shop-content">


                {/* SHOP NAME */}

                <h3>

                  {shop.name}

                  <span className="verified">
                    ✓
                  </span>

                </h3>


                {/* CATEGORY */}

                <p className="category">

                  {shop.category}

                </p>


                {/* LOCATION */}

                <p className="location">

                  <span className="shop-location">

                    📍 {shop.location}

                  </span>


                  <span className="shop-distance">

                    {shop.distance}

                  </span>

                </p>


                {/* ==================================================
                    BUTTONS
                ================================================== */}

                <div className="shop-buttons">


                  {/* VIEW SHOP */}

                  <button
                    type="button"
                    className="view-btn"
                    onClick={() =>
                      handleViewShop(shop)
                    }
                  >

                    View Shop

                  </button>


                  {/* VISIT SHOP */}

                  <button
                    type="button"
                    className="visit-btn"
                    onClick={() =>
                      handleVisitShop(shop)
                    }
                  >

                    Visit Shop

                  </button>


                </div>


              </div>


            </div>

          ))}


        </div>


      </section>


      <Footer />

    </>

  );

}


export default Shop;