import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/contact.css";

import hero from "../assets/images/contact/hero.jpg";

import {
  FaPhoneAlt,
  FaEnvelope,
  FaWhatsapp,
  FaComments,
  FaPaperPlane
} from "react-icons/fa";

function Contact() {
  return (
    <>
      <Navbar />

      {/* HERO BANNER */}
      <section className="contact-hero">
        <img src={hero} alt="" />
      </section>

      {/* CONTACT SECTION */}
      <section className="contact-section">

        <div className="contact-left">

          <h1>Contact</h1>

          <p className="breadcrumb">
            Home &gt; <span>Contact Us</span>
          </p>

          <h2>We're here to Help!</h2>

          <p className="contact-text">
            Have a question or need assistance?
            Our team is ready to help you with any queries.
          </p>

          <div className="contact-item">
            <FaPhoneAlt />
            <div>
              <h4>Call Us</h4>
              <p>+91 9623 929 789</p>
              <p>Mon-Sat: 9 AM - 8 PM</p>
            </div>
          </div>

          <div className="contact-item">
            <FaEnvelope />
            <div>
              <h4>Email Us</h4>
              <p>orgos@gmail.com</p>
              <p>Reply within 24 hrs</p>
            </div>
          </div>

          <div className="contact-item">
            <FaWhatsapp />
            <div>
              <h4>WhatsApp</h4>
              <p>+91 9623 929 789</p>
              <p>Mon-Sat: 9 AM - 8 PM</p>
            </div>
          </div>

          <div className="contact-item">
            <FaComments />
            <div>
              <h4>Live Chat</h4>
              <p>Available on Website</p>
            </div>
          </div>

        </div>

        <div className="contact-right">

          <h2>Send Us a Message</h2>

          <p>
            Fill out the form below and we'll get back to you.
          </p>

          <form>

            <div className="form-row">

              <div>
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email"
                />
              </div>

            </div>

            <div className="form-row">

              <div>
                <label>Phone Number</label>
                <input
                  type="text"
                  placeholder="Enter phone"
                />
              </div>

              <div>
                <label>Subject</label>

                <select>
                  <option>Select Subject</option>
                  <option>Order Query</option>
                  <option>Partnership</option>
                  <option>Support</option>
                </select>

              </div>

            </div>

            <label>Message</label>

            <textarea
              rows="5"
              placeholder="Type your message..."
            ></textarea>

            <button className="send-btn">
              <FaPaperPlane />
              Send Message
            </button>

          </form>

        </div>

      </section>

      <Footer />
    </>
  );
}

export default Contact;