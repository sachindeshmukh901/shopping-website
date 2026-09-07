import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Otp from "./pages/Otp";
import Account from "./pages/Account";
import Shop from "./pages/Shop";
import ShopDetails from "./pages/ShopDetails";
import ProductDetails from "./pages/ProductDetails";
import Women from "./pages/Women";
import Men from "./pages/Men";
import Kids from "./pages/Kids";
import Accessories from "./pages/Accessories";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Profile from "./pages/Profile";

import SmartDashboard from "./pages/SmartDashboard";
import AISize from "./pages/AISize";
import FuturePrice from "./pages/FuturePrice";
import OutfitGenerator from "./pages/OutfitGenerator";

import ChatWidget from "./components/ChatWidget";
import ScrollToTop from "./components/ScrollToTop";

import CartProvider from "./context/CartContext";
import WishlistProvider from "./context/WishlistContext";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";

import Payment from "./pages/Payment";
import Success from "./pages/Success";

import EditProfile from "./pages/EditProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePassword from "./pages/ChangePassword";


function App() {

  return (

    <CartProvider>

      <WishlistProvider>

        <BrowserRouter>

          <ScrollToTop />

          <Routes>

            <Route path="/" element={<Home />} />

            <Route path="/login" element={<Login />} />

            <Route path="/otp" element={<Otp />} />

            <Route path="/account" element={<Account />} />

            <Route path="/shop" element={<Shop />} />

            <Route path="/shop/:id" element={<ShopDetails />} />

            <Route path="/product/:id" element={<ProductDetails />} />

            <Route path="/women" element={<Women />} />

            <Route path="/men" element={<Men />} />

            <Route path="/kids" element={<Kids />} />

            <Route path="/accessories" element={<Accessories />} />

            <Route path="/about" element={<About />} />

            <Route path="/contact" element={<Contact />} />

            <Route path="/blog" element={<Blog />} />

            <Route path="/profile" element={<Profile />} />

            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/smart-feature" element={<SmartDashboard />} />

            <Route path="/ai-size" element={<AISize />} />

            <Route path="/future-price" element={<FuturePrice />} />

            <Route path="/outfit-generator" element={<OutfitGenerator />}/>

            <Route path="/cart" element={<Cart />} />

            <Route path="/checkout" element={<Checkout />} />

            <Route path="/payment" element={<Payment />} />

            <Route path="/success" element={<Success />} />

            <Route path="/edit-profile" element={<EditProfile />} />

            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/change-password" element={<ChangePassword />} />

          </Routes>


          <ChatWidget />

        </BrowserRouter>

      </WishlistProvider>

    </CartProvider>

  );

}

export default App;