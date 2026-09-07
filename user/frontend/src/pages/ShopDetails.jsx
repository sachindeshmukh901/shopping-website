import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/shopDetails.css";


function ShopDetails() {

    let location = useLocation();

    let navigate = useNavigate();

    let shop = location.state?.shop;


    if (!shop) {

        return (

            <>

                <Navbar />

                <main className="shop-details-empty">

                    <h2>
                        Shop not found
                    </h2>

                    <button
                        onClick={() =>
                            navigate("/shop")
                        }
                    >
                        Back To Shops
                    </button>

                </main>

                <Footer />

            </>

        );

    }


    function visitShop() {

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


            <main className="shop-details-page">


                <div className="shop-details-card">


                    {/* IMAGE */}

                    <div className="shop-details-image">

                        <img
                            src={shop.image}
                            alt={shop.name}
                        />

                    </div>


                    {/* INFORMATION */}

                    <div className="shop-details-content">


                        <span className="shop-details-label">
                            VERIFIED SHOP
                        </span>


                        <h1>
                            {shop.name}
                        </h1>


                        <p className="shop-details-category">
                            {shop.category}
                        </p>


                        <div className="shop-info-row">

                            <span>
                                📍
                            </span>

                            <div>

                                <strong>
                                    Location
                                </strong>

                                <p>
                                    {shop.location}
                                </p>

                            </div>

                        </div>


                        <div className="shop-info-row">

                            <span>
                                📏
                            </span>

                            <div>

                                <strong>
                                    Distance
                                </strong>

                                <p>
                                    {shop.distance}
                                </p>

                            </div>

                        </div>


                        <div className="shop-detail-actions">


                            <button
                                className="back-shop-btn"
                                onClick={() =>
                                    navigate("/shop")
                                }
                            >

                                ← Back To Shops

                            </button>


                            <button
                                className="detail-visit-btn"
                                onClick={visitShop}
                            >

                                📍 Visit Shop

                            </button>


                        </div>


                    </div>


                </div>


            </main>


            <Footer />

        </>

    );

}


export default ShopDetails;