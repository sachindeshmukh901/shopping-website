// ==========================================================
// ORDER STORE (localStorage based - no backend orders API yet)
// ==========================================================
// Keeps a per-browser record of placed orders so the User
// Dashboard has real "My Orders" data to show. Swap this out
// for real API calls once /api/orders exists on the backend.

const ORDERS_KEY = "orgos_orders";

export function getOrders() {

    try {

        const raw = localStorage.getItem(ORDERS_KEY);

        return raw ? JSON.parse(raw) : [];

    }

    catch (err) {

        return [];

    }

}

function saveAll(orders) {

    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

}

export function addOrder(order) {

    const orders = getOrders();

    const newOrder = {

        id: order.id || "ORG" + Math.floor(Math.random() * 1000000),
        date: order.date || new Date().toISOString(),
        items: order.items || [],
        itemsTotal: order.itemsTotal || 0,
        deliveryFee: order.deliveryFee || 0,
        gst: order.gst || 0,
        grandTotal: order.grandTotal || 0,
        paymentMethod: order.paymentMethod || "cod",
        address: order.address || null,
        status: order.status || "Processing"

    };

    orders.unshift(newOrder);

    saveAll(orders);

    return newOrder;

}

export function getOrderById(id) {

    return getOrders().find(o => o.id === id) || null;

}

export function updateOrderStatus(id, status) {

    const orders = getOrders().map(o =>

        o.id === id ? { ...o, status } : o

    );

    saveAll(orders);

    return orders;

}

export function cancelOrder(id) {

    return updateOrderStatus(id, "Cancelled");

}

export function clearOrders() {

    localStorage.removeItem(ORDERS_KEY);

}
