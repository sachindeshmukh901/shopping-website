import { createContext, useState, useEffect } from "react";

import API from "../api/api";

import { toast } from "react-toastify";


export const WishlistContext = createContext();

function WishlistProvider({ children }) {

  const [wishlistItems, setWishlistItems] = useState([]);

  const [loading, setLoading] = useState(false);


  // ==========================
  // IMAGE URL HELPER
  // ==========================

  const getImageUrl = (image) => {

    if (!image) {

      return "";

    }


    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {

      return image;

    }


    let apiBaseUrl =
      API.defaults?.baseURL || "";

    apiBaseUrl =
      apiBaseUrl.replace(/\/api\/?$/, "");


    if (image.startsWith("/")) {

      return `${apiBaseUrl}${image}`;

    }


    if (image.startsWith("uploads/")) {

      return `${apiBaseUrl}/${image}`;

    }


    return `${apiBaseUrl}/uploads/${image}`;

  };


  // ==========================
  // FETCH WISHLIST FROM BACKEND
  // ==========================

  const fetchWishlist = async () => {

    const token =
      localStorage.getItem("token");

    // User not logged in -> no server-side wishlist
    if (!token) {

      setWishlistItems([]);

      return;

    }

    try {

      setLoading(true);

      const res = await API.get("/wishlist");

      if (res.data.success) {

        const items =
          res.data.wishlist || [];

        const formatted = items.map((item) => {

          const originalPrice =
            Number(item.price || 0);

          const discount =
            Number(item.discount || 0);

          const sellingPrice =
            discount > 0
              ? Math.round(
                  originalPrice *
                  (1 - discount / 100)
                )
              : originalPrice;

          return {

            id: item.product_id,
            product_id: item.product_id,
            wishlist_id: item.wishlist_id,

            name: item.product_name,
            product_name: item.product_name,

            brand: item.brand || "ORGOS",

            image: getImageUrl(item.image),

            price: sellingPrice,
            oldPrice: originalPrice,
            discount: discount,

            stock: Number(item.stock || 0),

            rating: item.rating,

            added_at: item.added_at

          };

        });

        setWishlistItems(formatted);

      }

    }

    catch (error) {

      console.error(
        "Fetch Wishlist Error:",
        error
      );

      setWishlistItems([]);

    }

    finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchWishlist();

  }, []);


  // ==========================
  // ADD TO WISHLIST
  // ==========================

  const addToWishlist = async (product) => {

    const token =
      localStorage.getItem("token");

    if (!token) {

      toast.warning(
        "Please login to add products to your wishlist."
      );

      return;

    }

    const productId =
      product.product_id || product.id;

    if (!productId) {

      console.error(
        "Product ID missing:",
        product
      );

      toast.warning("Product ID not found.");

      return;

    }

    try {

      const res = await API.post(
        "/wishlist",
        { product_id: productId }
      );

      if (res.data.success) {

        await fetchWishlist();

      }

    }

    catch (error) {

      console.error(
        "Add To Wishlist Error:",
        error
      );

      toast.error(

        error.response?.data?.message ||
        "Unable to add product to wishlist."

      );

    }

  };


  // ==========================
  // REMOVE FROM WISHLIST
  // ==========================

  const removeFromWishlist = async (idOrProduct) => {

    const token =
      localStorage.getItem("token");

    if (!token) {

      return;

    }

    const productId =
      typeof idOrProduct === "object" && idOrProduct !== null
        ? (idOrProduct.product_id || idOrProduct.id)
        : idOrProduct;

    try {

      const res = await API.delete(
        `/wishlist/${productId}`
      );

      if (res.data.success) {

        setWishlistItems((prev) =>

          prev.filter(
            (item) =>
              Number(item.id) !== Number(productId)
          )

        );

      }

    }

    catch (error) {

      console.error(
        "Remove From Wishlist Error:",
        error
      );

      toast.error(

        error.response?.data?.message ||
        "Unable to remove item from wishlist."

      );

    }

  };


  // ==========================
  // TOGGLE (used by heart icons)
  // ==========================

  const toggleWishlist = async (product) => {

    const token =
      localStorage.getItem("token");

    if (!token) {

      toast.warning(
        "Please login to use your wishlist."
      );

      return;

    }

    const productId =
      product.product_id || product.id;

    if (!productId) {

      console.error(
        "Product ID missing:",
        product
      );

      toast.warning("Product ID not found.");

      return;

    }

    try {

      const res = await API.post(
        "/wishlist/toggle",
        { product_id: productId }
      );

      if (res.data.success) {

        if (res.data.action === "added") {

          await fetchWishlist();

        }

        else {

          setWishlistItems((prev) =>

            prev.filter(
              (item) =>
                Number(item.id) !== Number(productId)
            )

          );

        }

      }

    }

    catch (error) {

      console.error(
        "Toggle Wishlist Error:",
        error
      );

      toast.error(

        error.response?.data?.message ||
        "Unable to update wishlist."

      );

    }

  };


  // ==========================
  // CHECK IF IN WISHLIST
  // ==========================

  const isInWishlist = (id) => {

    return wishlistItems.some(
      (item) => Number(item.id) === Number(id)
    );

  };


  // ==========================
  // CLEAR WISHLIST (local only)
  // ==========================

  const clearWishlist = () => {

    setWishlistItems([]);

  };


  return (

    <WishlistContext.Provider

      value={{

        wishlistItems,

        loading,

        fetchWishlist,

        addToWishlist,

        removeFromWishlist,

        toggleWishlist,

        isInWishlist,

        clearWishlist

      }}

    >

      {children}

    </WishlistContext.Provider>

  );

}

export default WishlistProvider;
