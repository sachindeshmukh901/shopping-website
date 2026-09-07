import { useContext } from "react";
import { CartContext } from "../context/CartContext";

import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { GST_AMOUNT } from "../utils/taxConfig";

import "../styles/cart.css";

function Cart() {

const navigate = useNavigate();

const {

cartItems,

increaseQty,

decreaseQty,

removeItem,

getTotal

} = useContext(CartContext);

const shipping = cartItems.length > 0 ? 99 : 0;

// GST stays a fixed/constant amount — it does NOT
// increase when quantity or cart total goes up.
const gst = cartItems.length > 0 ? GST_AMOUNT : 0;

const grandTotal =
getTotal() + shipping + gst;


return(

<>

<Navbar/>

<div className="cart-page">

<h1>
Shopping Cart
</h1>

{

cartItems.length===0 ?

<div className="empty-cart">

<h2>
Your Cart is Empty
</h2>

<p>
Add products to continue shopping.
</p>

</div>

:

<div className="cart-wrapper">

<div className="cart-container">

{

cartItems.map((item)=>(

<div
className="cart-item"
key={item.cart_item_id || item.id}
>

<img
src={item.image}
alt=""
/>

<div className="cart-details">

<h3>
{item.name}
</h3>

{item.size && (
<p className="cart-item-size">
Size: <strong>{item.size}</strong>
</p>
)}

<p className="price">
₹{item.price}
</p>

<div className="qty-box">

<button
onClick={()=>decreaseQty(item)}
>
-
</button>

<span>

{item.quantity}

</span>

<button
onClick={()=>increaseQty(item)}
>
+

</button>

</div>

<p>

Total :
₹{item.price*item.quantity}

</p>

<button
className="remove-btn"
onClick={()=>removeItem(item)}
>

Remove

</button>

</div>

</div>

))

}

</div>

<div className="cart-summary">

<h2>

Order Summary

</h2>

<div>

<span>

Subtotal

</span>

<span>

₹{getTotal()}

</span>

</div>

<div>

<span>

Shipping

</span>

<span>

₹{shipping}

</span>

</div>

<div>

<span>

GST

</span>

<span>

₹{gst}

</span>

</div>

<hr/>

<div className="grand-total">

<span>

Grand Total

</span>

<span>

₹{grandTotal}

</span>

</div>

<button

className="buy-btn"

onClick={()=>navigate("/checkout")}

>

Buy Now

</button>

</div>

</div>

}

</div>

<Footer/>

</>

);

}

export default Cart;