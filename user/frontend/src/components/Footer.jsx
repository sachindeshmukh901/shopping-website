import "../styles/footer.css";
import logo from "../assets/images/logo.png";

import { Link } from "react-router-dom";

function Footer() {
  return (

    <footer className="footer">

      <div className="footer-container">

        {/* LEFT */}

        <div className="footer-left">

          <img
            src={logo}
            alt="ORGOS"
            className="footer-logo"
          />

          <p>
            Elevating your style with premium
            fashion and timeless designs.
            We believe in quality,
            sustainability, and the art of
            dressing well.
          </p>

          <h2>ORGOS</h2>

        </div>


        {/* COMPANY */}

        <div className="footer-column">

          <h3>Company</h3>

          <ul>

            <li>
              <Link to="/">Home</Link>
            </li>

            <li>
              <Link to="/shop">Shop</Link>
            </li>

            <li>
              <Link to="/about">About Us</Link>
            </li>

            <li>
              <Link to="/contact">Contact Us</Link>
            </li>

            <li>
              <Link to="/blog">Blog</Link>
            </li>

          </ul>

        </div>


        {/* CATEGORIES */}

        <div className="footer-column">

          <h3>Categories</h3>

          <ul>

            <li>
              <Link to="/women">
                Women's Collection
              </Link>
            </li>

            <li>
              <Link to="/men">
                Men's Collection
              </Link>
            </li>

            <li>
              <Link to="/accessories">
                Accessories
              </Link>
            </li>

            <li>
              <Link to="/new-arrivals">
                New Arrivals
              </Link>
            </li>

            <li>
              <Link to="/sale">
                Sale
              </Link>
            </li>

          </ul>

        </div>


        {/* CONTACT */}

        <div className="footer-column">

          <h3>Contact Info</h3>

          <ul>

            <li>
              <Link to="/contact">
                IT Park Nagpur
              </Link>
            </li>

            <li>
              <a href="tel:+01234567789">
                +0123-4567-789
              </a>
            </li>

            <li>
              <a href="mailto:orgos@gmail.com">
                orgos@gmail.com
              </a>
            </li>

          </ul>

        </div>

      </div>


      <div className="copyright">

        Copyright @2026 ORGOS Pvt Ltd.
        All Rights Reserved.

      </div>

    </footer>
  );
}

export default Footer;