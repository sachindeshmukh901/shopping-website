import {
  createContext,
  useState,
  useEffect
} from "react";

import API from "../api/api";


import { toast } from "react-toastify";


export const CartContext = createContext();


function CartProvider({ children }) {

  let [cartItems, setCartItems] = useState([]);

  let [loading, setLoading] = useState(false);


  // ========================================
  // GET IMAGE URL
  // ========================================

  const getImageUrl = (image) => {

    if (!image) {

      return "";

    }


    // Already complete URL
    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {

      return image;

    }


    let apiBaseUrl =
      API.defaults?.baseURL || "";


    // Remove /api from backend URL
    apiBaseUrl =
      apiBaseUrl.replace(/\/api\/?$/, "");


    // Database contains:
    // /uploads/watch.jpg

    if (image.startsWith("/")) {

      return `${apiBaseUrl}${image}`;

    }


    // Database contains:
    // uploads/watch.jpg

    if (
      image.startsWith("uploads/")
    ) {

      return `${apiBaseUrl}/${image}`;

    }


    // Database contains only:
    // watch.jpg

    return `${apiBaseUrl}/uploads/${image}`;

  };


  // ========================================
  // GET CART FROM BACKEND
  // ========================================

  const fetchCart = async () => {

    let token =
      localStorage.getItem("token");


    // User is not logged in
    if (!token) {

      setCartItems([]);

      return;

    }


    try {

      setLoading(true);


      let response =
        await API.get("/cart");


      if (
        response.data.success
      ) {

        let items =
          response.data.items || [];


        // ========================================
        // FORMAT BACKEND CART
        // ========================================

        let formattedItems =
          items.map((item) => ({

            // Product ID
            id:
              item.product_id,

            product_id:
              item.product_id,


            size:
              item.size || null,


            // Cart item ID
            cart_item_id:
              item.cart_item_id,


            cart_id:
              item.cart_id,


            // Product information
            name:
              item.product_name,

            product_name:
              item.product_name,


            brand:
              item.brand,


            // ========================================
            // FIX IMAGE URL
            // ========================================

            image:
              getImageUrl(item.image),


            // ========================================
            // PRICE
            // ========================================

            price:
              Number(
                item.cart_price ||
                item.current_price ||
                0
              ),


            current_price:
              Number(
                item.current_price ||
                0
              ),


            discount:
              Number(
                item.discount || 0
              ),


            stock:
              Number(
                item.stock || 0
              ),


            // ========================================
            // QUANTITY
            // ========================================

            quantity:
              Number(
                item.quantity || 1
              )

          }));


        setCartItems(
          formattedItems
        );

      }

      else {

        setCartItems([]);

      }

    }

    catch (error) {

      console.error(
        "Fetch Cart Error:",
        error
      );

    }

    finally {

      setLoading(false);

    }

  };


  // ========================================
  // LOAD CART
  // ========================================

  useEffect(() => {

    fetchCart();

  }, []);


  // ========================================
  // ADD TO CART
  // ========================================

  const addToCart = async (product) => {

    let token =
      localStorage.getItem("token");


    // ========================================
    // LOGIN CHECK
    // ========================================

    if (!token) {

      toast.warning(
        "Please login to add products to cart."
      );

      return false;

    }


    try {

      setLoading(true);


      let productId =
        product.product_id ||
        product.id;


      if (!productId) {

        console.error(
          "Product ID missing:",
          product
        );

        toast.warning(
          "Product ID not found."
        );

        return false;

      }


      // ========================================
      // ADD TO BACKEND CART
      // ========================================

      let quantityToAdd =
        Number(
          product.quantity || 1
        );

      if (
        !quantityToAdd ||
        quantityToAdd < 1
      ) {

        quantityToAdd = 1;

      }


      let response =
        await API.post(
          "/cart",
          {

            product_id:
              productId,

            quantity:
              quantityToAdd,

            size:
              product.size || null

          }
        );


      // ========================================
      // SUCCESS
      // ========================================

      if (
        response.data.success
      ) {

        // Get latest cart from backend
        await fetchCart();


        // IMPORTANT:
        // Return true so Wishlist Buy Now
        // knows that product was added.
        return true;

      }


      return false;

    }

    catch (error) {

      console.error(
        "Add To Cart Error:",
        error
      );


      toast.error(

        error.response?.data?.message ||

        "Unable to add product to cart."

      );


      return false;

    }

    finally {

      setLoading(false);

    }

  };


  // ========================================
  // FIND CART ITEM
  // ========================================

  const findCartItem = (cartItemOrId) => {

    // Full cart item object
    if (
      typeof cartItemOrId === "object" &&
      cartItemOrId !== null
    ) {

      return cartItemOrId;

    }


    // Prefer matching the unique cart line (cart_item_id) since
    // the same product can appear multiple times with different sizes.
    let byCartItemId = cartItems.find(
      (item) =>
        Number(item.cart_item_id) ===
        Number(cartItemOrId)
    );

    if (byCartItemId) {
      return byCartItemId;
    }


    // Fallback: ID se cart item find karo (product id)
    return cartItems.find(
      (item) =>
        Number(item.id) ===
        Number(cartItemOrId)
    );

  };


  // ========================================
  // INCREASE QUANTITY
  // ========================================

  const increaseQty = async (
    cartItemOrId
  ) => {

    try {

      let cartItem =
        findCartItem(cartItemOrId);


      if (!cartItem) {

        console.error(
          "Cart item not found:",
          cartItemOrId
        );

        return;

      }


      let newQuantity =
        Number(
          cartItem.quantity
        ) + 1;


      await updateQuantity(

        cartItem.cart_item_id,

        newQuantity

      );

    }

    catch (error) {

      console.error(
        "Increase Quantity Error:",
        error
      );

    }

  };


  // ========================================
  // DECREASE QUANTITY
  // ========================================

  const decreaseQty = async (
    cartItemOrId
  ) => {

    let cartItem =
      findCartItem(cartItemOrId);


    if (!cartItem) {

      console.error(
        "Cart item not found:",
        cartItemOrId
      );

      return;

    }


    let currentQuantity =
      Number(
        cartItem.quantity
      );


    if (currentQuantity <= 1) {

      return;

    }


    let newQuantity =
      currentQuantity - 1;


    try {

      await updateQuantity(

        cartItem.cart_item_id,

        newQuantity

      );

    }

    catch (error) {

      console.error(
        "Decrease Quantity Error:",
        error
      );

    }

  };


  // ========================================
  // UPDATE QUANTITY
  // ========================================

  const updateQuantity = async (
    cartItemId,
    quantity
  ) => {

    try {

      if (!cartItemId) {

        console.error(
          "Cart Item ID missing"
        );

        return;

      }


      let newQuantity =
        Number(quantity);


      if (
        newQuantity <= 0
      ) {

        return;

      }


      let response =
        await API.put(

          `/cart/${cartItemId}`,

          {

            quantity:
              newQuantity

          }

        );


      if (
        response.data.success
      ) {

        await fetchCart();

      }

    }

    catch (error) {

      console.error(
        "Update Quantity Error:",
        error
      );


      toast.error(

        error.response?.data?.message ||

        "Unable to update quantity."

      );

    }

  };


  // ========================================
  // REMOVE ITEM
  // ========================================

  const removeItem = async (
    cartItemOrId
  ) => {

    try {

      let cartItem =
        findCartItem(cartItemOrId);


      if (!cartItem) {

        console.error(
          "Cart item not found:",
          cartItemOrId
        );

        return;

      }


      let cartItemId =
        cartItem.cart_item_id;


      if (!cartItemId) {

        console.error(
          "Cart Item ID missing:",
          cartItem
        );

        return;

      }


      let response =
        await API.delete(

          `/cart/${cartItemId}`

        );


      if (
        response.data.success
      ) {

        await fetchCart();

      }

    }

    catch (error) {

      console.error(
        "Remove Cart Item Error:",
        error
      );


      toast.error(

        error.response?.data?.message ||

        "Unable to remove item."

      );

    }

  };


  // ========================================
  // CLEAR CART
  // ========================================

  const clearCart = async () => {

    try {

      let response =
        await API.delete(
          "/cart/clear"
        );


      if (
        response.data.success
      ) {

        setCartItems([]);

      }

    }

    catch (error) {

      console.error(
        "Clear Cart Error:",
        error
      );


      toast.error(

        error.response?.data?.message ||

        "Unable to clear cart."

      );

    }

  };


  // ========================================
  // TOTAL PRICE
  // ========================================

  const getTotal = () => {

    return cartItems.reduce(

      (
        total,
        item
      ) => {

        return (

          total +

          (
            Number(
              item.price || 0
            ) *

            Number(
              item.quantity || 1
            )

          )

        );

      },

      0

    );

  };


  // ========================================
  // TOTAL ITEMS
  // ========================================

  const getTotalItems = () => {

    return cartItems.reduce(

      (
        total,
        item
      ) => {

        return (

          total +

          Number(
            item.quantity || 0
          )

        );

      },

      0

    );

  };


  // ========================================
  // CONTEXT
  // ========================================

  return (

    <CartContext.Provider

      value={{

        cartItems,

        loading,

        fetchCart,

        addToCart,

        increaseQty,

        decreaseQty,

        updateQuantity,

        removeItem,

        clearCart,

        getTotal,

        getTotalItems

      }}

    >

      {children}

    </CartContext.Provider>

  );

}


export default CartProvider;