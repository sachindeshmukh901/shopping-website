const API_URL = "https://orgos-backend-l7mx.onrender.com/api/products";


// ========================================
// GET PRODUCTS
// ========================================

export const getProducts = async (gender = "") => {

    let url = API_URL;

    if (gender) {
        url += `?gender=${gender}`;
    }

    console.log("Fetching:", url);

    let response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }

    let data = await response.json();

    console.log("Products API Response:", data);

    return data;
};


// ========================================
// GET CATEGORIES
// ========================================

export const getCategories = async () => {

    let response = await fetch("https://orgos-backend-l7mx.onrender.com/api/categories");

    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }

    let data = await response.json();

    return data;
};


// ========================================
// GET TOP SELLER PRODUCTS
// ========================================

export const getTopSellers = async (limit = 8) => {

    let response = await fetch(
        `${API_URL}/top-sellers?limit=${limit}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch top seller products");
    }

    let data = await response.json();

    return data;
};


// ========================================
// GET SINGLE PRODUCT
// ========================================

export const getProductById = async (id) => {

    let response = await fetch(
        `${API_URL}/${id}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch product");
    }

    let data = await response.json();

    return data;
};


// ========================================
// PRODUCT IMAGE URL
// ========================================

export const getProductImage = (image) => {

    if (!image) {
        return "";
    }


    // Agar already complete URL hai
    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }


    // Starting slash remove
    let cleanImage = image.replace(/^\/+/, "");


    // Agar database me uploads/products/... hai
    if (cleanImage.startsWith("uploads/")) {

        return `https://orgos-backend-l7mx.onrender.com/${cleanImage}`;

    }


    // Agar sirf filename hai
    return `https://orgos-backend-l7mx.onrender.com/uploads/products/${cleanImage}`;

};