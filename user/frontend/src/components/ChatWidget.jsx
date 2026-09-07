import { useEffect, useRef, useState } from "react";

import {
  FaCommentDots,
  FaTimes,
  FaPaperPlane,
  FaRobot,
  FaUser,
  FaSpinner
} from "react-icons/fa";

import "../styles/chatWidget.css";


function ChatWidget() {


  // =====================================================
  // API
  // =====================================================

  let API_URL =
    import.meta.env.VITE_API_URL ||
    "https://orgos-backend-h7ad.onrender.com/api";


  // =====================================================
  // STATE
  // =====================================================

  let [open, setOpen] =
    useState(false);


  let [input, setInput] =
    useState("");


  let [sending, setSending] =
    useState(false);


  let [messages, setMessages] =
    useState([

      {
        id: "welcome",
        role: "bot",
        text: "Hi! 👋 Ask me about a product's price, stock, or your recent orders — I'll pull real-time info from the store.",
        products: [],
        orders: []
      }

    ]);


  let messagesEndRef =
    useRef(null);


  // =====================================================
  // AUTO SCROLL TO LATEST MESSAGE
  // =====================================================

  useEffect(() => {

    if (open && messagesEndRef.current) {

      messagesEndRef.current.scrollIntoView({
        behavior: "smooth"
      });

    }

  }, [messages, open, sending]);


  // =====================================================
  // FORMAT PRICE
  // =====================================================

  function formatPrice(price) {

    return `₹${Number(price || 0).toLocaleString("en-IN")}`;

  }


  // =====================================================
  // SEND MESSAGE
  // =====================================================

  async function sendMessage(event) {

    if (event) {

      event.preventDefault();

    }


    let text =
      input.trim();


    if (!text || sending) {

      return;

    }


    let userMessage = {

      id: `u-${Date.now()}`,

      role: "user",

      text

    };


    setMessages(previous => [
      ...previous,
      userMessage
    ]);

    setInput("");

    setSending(true);


    try {

      let token =
        localStorage.getItem("token");


      let conversationHistory =
        messages
          .filter(
            item =>
              item.role === "user" ||
              item.role === "bot"
          )
          .map(item => ({
            role:
              item.role === "bot"
                ? "assistant"
                : "user",
            content: item.text
          }));


      let response =
        await fetch(
          `${API_URL}/chatbot/message`,
          {
            method: "POST",

            headers: {

              "Content-Type": "application/json",

              ...(token
                ? { Authorization: `Bearer ${token}` }
                : {})

            },

            body: JSON.stringify({
              message: text,
              history: conversationHistory
            })

          }
        );


      let data =
        await response.json();


      if (!response.ok || !data.success) {

        throw new Error(
          data.message ||
          "Something went wrong."
        );

      }


      let botMessage = {

        id: `b-${Date.now()}`,

        role: "bot",

        text: data.reply,

        products: data.products || [],

        orders: data.orders || []

      };


      setMessages(previous => [
        ...previous,
        botMessage
      ]);

    }

    catch (error) {

      console.error(
        "Chatbot Error:",
        error
      );


      setMessages(previous => [
        ...previous,
        {
          id: `e-${Date.now()}`,
          role: "bot",
          text: "Sorry, I'm having trouble reaching the store right now. Please try again in a moment.",
          products: [],
          orders: []
        }
      ]);

    }

    finally {

      setSending(false);

    }

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="chat-widget-root">


      {/* ============================================
          FLOATING TOGGLE BUTTON
      ============================================ */}

      <button
        className={`chat-toggle-button ${open ? "is-open" : ""}`}
        onClick={() => setOpen(previous => !previous)}
        aria-label={
          open ? "Close chat" : "Open chat"
        }
      >

        {open ? <FaTimes /> : <FaCommentDots />}

      </button>



      {/* ============================================
          CHAT PANEL
      ============================================ */}

      {open && (

        <div className="chat-panel">


          {/* HEADER */}

          <div className="chat-panel-header">

            <div className="chat-panel-header-info">

              <span className="chat-panel-avatar">
                <FaRobot />
              </span>

              <div>
                <strong>ORGOS Assistant</strong>
                <small>Live product &amp; order help</small>
              </div>

            </div>


            <button
              className="chat-panel-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <FaTimes />
            </button>

          </div>



          {/* MESSAGES */}

          <div className="chat-panel-messages">

            {messages.map(message => (

              <div
                key={message.id}
                className={`chat-message chat-message-${message.role}`}
              >

                <span className="chat-message-icon">
                  {message.role === "bot"
                    ? <FaRobot />
                    : <FaUser />}
                </span>


                <div className="chat-message-bubble">

                  <p>
                    {message.text}
                  </p>


                  {/* PRODUCT RESULTS */}

                  {message.products &&
                    message.products.length > 0 && (

                      <div className="chat-product-list">

                        {message.products.map(product => (

                          <a
                            key={product.id}
                            href={product.url}
                            className="chat-product-card"
                          >

                            <div className="chat-product-image">

                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  loading="lazy"
                                  onError={
                                    event => {
                                      event.target.style.display = "none";
                                    }
                                  }
                                />
                              ) : (
                                <span className="chat-product-noimage">
                                  No image
                                </span>
                              )}

                            </div>


                            <div className="chat-product-info">

                              <strong>
                                {product.name}
                              </strong>

                              <span>
                                {formatPrice(product.price)}
                              </span>

                              <small
                                className={
                                  product.stock > 0
                                    ? "chat-in-stock"
                                    : "chat-out-stock"
                                }
                              >
                                {product.stock > 0
                                  ? `${product.stock} in stock`
                                  : "Out of stock"}
                              </small>

                            </div>

                          </a>

                        ))}

                      </div>

                    )}


                  {/* ORDER RESULTS */}

                  {message.orders &&
                    message.orders.length > 0 && (

                      <div className="chat-order-list">

                        {message.orders.map(order => (

                          <div
                            key={order.order_id}
                            className="chat-order-row"
                          >

                            <span>
                              Order #{order.order_id}
                            </span>

                            <span className="chat-order-status">
                              {order.order_status}
                            </span>

                            <span>
                              {formatPrice(order.total_amount)}
                            </span>

                          </div>

                        ))}

                      </div>

                    )}

                </div>

              </div>

            ))}


            {/* TYPING INDICATOR */}

            {sending && (

              <div className="chat-message chat-message-bot">

                <span className="chat-message-icon">
                  <FaRobot />
                </span>

                <div className="chat-message-bubble chat-typing">
                  <FaSpinner className="chat-spinner" />
                  <span>Checking live store data...</span>
                </div>

              </div>

            )}


            <div ref={messagesEndRef} />

          </div>



          {/* INPUT */}

          <form
            className="chat-panel-input"
            onSubmit={sendMessage}
          >

            <input
              type="text"
              placeholder="Ask about a product, price, or your order..."
              value={input}
              onChange={
                event => setInput(event.target.value)
              }
              disabled={sending}
            />

            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message"
            >
              <FaPaperPlane />
            </button>

          </form>


        </div>

      )}


    </div>

  );

}


export default ChatWidget;
