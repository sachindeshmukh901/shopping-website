import React, {
  useEffect,
  useState
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate
} from "react-router-dom";

import OrgosLogo from "./components/OrgosLogo";

import brandLogo from "./assets/logo.png";

import Dashboard from "./components/pages/Dashboard";
import Products from "./components/pages/Products";
import Orders from "./components/pages/Orders";
import Earnings from "./components/pages/Earnings";
import Analytics from "./components/pages/Analytics";

import Returns from "./components/pages/Returns";
import Reviews  from "./components/pages/Reviews";
import HeatMap from "./components/pages/HeatMap";
import Settings from "./components/pages/Settings";
import Notifications from "./components/pages/Notifications";
import VendorRegister from "./components/pages/VendorRegister";

import VendorLayout from "./components/layout/VendorLayout";

import API from "./api/api";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  X,
  HelpCircle,
  FileText
} from "lucide-react";


// ======================================================
// MAIN APP
// ======================================================

export default function App() {

  return (

    <BrowserRouter>

      <VendorApp />

    </BrowserRouter>

  );

}


// ======================================================
// VENDOR APP
// ======================================================

function VendorApp() {

  let navigate = useNavigate();


  // ====================================================
  // LOGIN STATES
  // ====================================================

  let [email, setEmail] =
    useState("");

  let [password, setPassword] =
    useState("");

  let [showPassword, setShowPassword] =
    useState(false);

  let [rememberMe, setRememberMe] =
    useState(true);

  let [isAuthenticating, setIsAuthenticating] =
    useState(false);

  let [authenticatedUser, setAuthenticatedUser] =
    useState(null);

  let [logoLoaded, setLogoLoaded] =
    useState(false);

  let [showForgotModal, setShowForgotModal] =
    useState(false);

  let [showHelpModal, setShowHelpModal] =
    useState(false);

  let [errorMessage, setErrorMessage] =
    useState("");

  let [checkingSession, setCheckingSession] =
    useState(true);


  // ====================================================
  // RESTORE VENDOR SESSION
  // ====================================================

  useEffect(() => {

    let token =
      localStorage.getItem(
        "vendorToken"
      );

    let storedVendor =
      localStorage.getItem(
        "vendor"
      );


    if (
      token &&
      storedVendor
    ) {

      try {

        let vendor =
          JSON.parse(
            storedVendor
          );

        setAuthenticatedUser(
          vendor
        );

      }

      catch (error) {

        console.error(
          "Vendor Session Parse Error:",
          error
        );

        localStorage.removeItem(
          "vendorToken"
        );

        localStorage.removeItem(
          "vendor"
        );

      }

    }


    setCheckingSession(
      false
    );

  }, []);


  // ====================================================
  // LOAD REMEMBERED EMAIL
  // ====================================================

  useEffect(() => {

    let rememberedEmail =
      localStorage.getItem(
        "vendorRememberEmail"
      );


    if (rememberedEmail) {

      setEmail(
        rememberedEmail
      );

      setRememberMe(
        true
      );

    }

  }, []);


  // ====================================================
  // LOGIN
  // ====================================================

  let handleLoginSubmit =
    async (e) => {

      e.preventDefault();

      setErrorMessage("");


      // ================================================
      // VALIDATION
      // ================================================

      if (
        !email ||
        !email.includes("@")
      ) {

        setErrorMessage(
          "Please enter a valid email address."
        );

        return;

      }


      if (
        !password ||
        password.trim().length === 0
      ) {

        setErrorMessage(
          "Password cannot be blank."
        );

        return;

      }


      try {

        setIsAuthenticating(
          true
        );


        // ==============================================
        // VENDOR LOGIN API
        // ==============================================

        let response =
          await API.post(
            "/vendor/login",
            {
              email:
                email.trim(),

              password:
                password
            }
          );


        console.log(
          "Vendor Login Response:",
          response.data
        );


        // ==============================================
        // LOGIN SUCCESS
        // ==============================================

        if (
          response.data.success
        ) {

          let token =
            response.data.token;

          let vendor =
            response.data.vendor;


          // ============================================
          // TOKEN CHECK
          // ============================================

          if (!token) {

            setErrorMessage(
              "Login successful but authentication token was not received."
            );

            return;

          }


          // ============================================
          // VENDOR CHECK
          // ============================================

          if (!vendor) {

            setErrorMessage(
              "Vendor information was not received."
            );

            return;

          }


          // ============================================
          // SAVE TOKEN
          // ============================================

          localStorage.setItem(
            "vendorToken",
            token
          );


          // ============================================
          // SAVE VENDOR
          // ============================================

          localStorage.setItem(
            "vendor",
            JSON.stringify(
              vendor
            )
          );


          // ============================================
          // REMEMBER EMAIL
          // ============================================

          if (rememberMe) {

            localStorage.setItem(
              "vendorRememberEmail",
              email.trim()
            );

          }

          else {

            localStorage.removeItem(
              "vendorRememberEmail"
            );

          }


          // ============================================
          // SET AUTHENTICATED USER
          // ============================================

          setAuthenticatedUser(
            vendor
          );

          setPassword("");

          setErrorMessage("");


          // ============================================
          // GO DASHBOARD
          // ============================================

          navigate(
            "/dashboard",
            {
              replace: true
            }
          );

        }

        else {

          setErrorMessage(
            response.data.message ||
            "Vendor login failed."
          );

        }

      }

      catch (error) {

        console.error(
          "Vendor Login Error:",
          error
        );


        if (
          error.response
            ?.data
            ?.message
        ) {

          setErrorMessage(
            error.response.data.message
          );

        }

        else if (
          error.request
        ) {

          setErrorMessage(
            "Unable to connect with ORGOS backend server."
          );

        }

        else {

          setErrorMessage(
            "Something went wrong. Please try again."
          );

        }

      }

      finally {

        setIsAuthenticating(
          false
        );

      }

    };


  // ====================================================
  // LOGOUT
  // ====================================================

  let handleSignOut =
    async () => {

      let token =
        localStorage.getItem(
          "vendorToken"
        );


      // ================================================
      // BACKEND LOGOUT
      // ================================================

      if (token) {

        try {

          await API.post(
            "/vendor/logout",
            {},
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        }

        catch (error) {

          console.error(
            "Vendor Logout API Error:",
            error
          );

        }

      }


      // ================================================
      // CLEAR SESSION
      // ================================================

      localStorage.removeItem(
        "vendorToken"
      );

      localStorage.removeItem(
        "vendor"
      );


      setAuthenticatedUser(
        null
      );

      setPassword("");

      setErrorMessage("");


      if (!rememberMe) {

        setEmail("");

      }


      navigate(
        "/",
        {
          replace: true
        }
      );

    };


  // ====================================================
  // SESSION LOADING
  // ====================================================

  if (checkingSession) {

    return (

      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-[#fbfbfa]
        "
      >

        <div
          className="
            flex
            flex-col
            items-center
            gap-4
          "
        >

          <div
            className="
              w-10
              h-10
              border-4
              border-[#175c2e]/20
              border-t-[#175c2e]
              rounded-full
              animate-spin
            "
          />

          <p
            className="
              text-sm
              font-semibold
              text-neutral-500
            "
          >

            Checking vendor session...

          </p>

        </div>

      </div>

    );

  }


  // ====================================================
  // ROUTES
  // ====================================================

  return (

    <Routes>


      {/* ==================================================
          LOGIN
      ================================================== */}

      <Route
        path="/"
        element={

          authenticatedUser

            ? (

              <Navigate
                to="/dashboard"
                replace
              />

            )

            : (

              <LoginPage

                email={
                  email
                }

                setEmail={
                  setEmail
                }

                password={
                  password
                }

                setPassword={
                  setPassword
                }

                showPassword={
                  showPassword
                }

                setShowPassword={
                  setShowPassword
                }

                rememberMe={
                  rememberMe
                }

                setRememberMe={
                  setRememberMe
                }

                isAuthenticating={
                  isAuthenticating
                }

                errorMessage={
                  errorMessage
                }

                setErrorMessage={
                  setErrorMessage
                }

                logoLoaded={
                  logoLoaded
                }

                setLogoLoaded={
                  setLogoLoaded
                }

                showForgotModal={
                  showForgotModal
                }

                setShowForgotModal={
                  setShowForgotModal
                }

                showHelpModal={
                  showHelpModal
                }

                setShowHelpModal={
                  setShowHelpModal
                }

                handleLoginSubmit={
                  handleLoginSubmit
                }

              />

            )

        }
      />


      {/* ==================================================
          VENDOR REGISTER
      ================================================== */}

      <Route
        path="/register"
        element={

          authenticatedUser

            ? (

              <Navigate
                to="/dashboard"
                replace
              />

            )

            : (

              <VendorRegister />

            )

        }
      />


      {/* ==================================================
          PROTECTED VENDOR AREA

          IMPORTANT:
          VendorLayout uses <Outlet />
          so all vendor pages MUST be nested
          inside this Route.
      ================================================== */}

      <Route
        element={

          authenticatedUser

            ? (

              <VendorLayout

                vendor={
                  authenticatedUser
                }

                onLogout={
                  handleSignOut
                }

              />

            )

            : (

              <Navigate
                to="/"
                replace
              />

            )

        }
      >


        {/* ==================================================
            DASHBOARD
        ================================================== */}

        <Route
          path="/dashboard"
          element={

            <Dashboard
              vendor={
                authenticatedUser
              }

              onLogout={
                handleSignOut
              }

            />

          }
        />


        {/* ==================================================
            PRODUCTS
        ================================================== */}

        <Route
          path="/products"
          element={

            <Products
              vendor={
                authenticatedUser
              }

              onLogout={
                handleSignOut
              }

            />

          }
        />


        {/* ==================================================
            ORDERS
        ================================================== */}

        <Route
          path="/orders"
          element={

            <Orders
              vendor={
                authenticatedUser
              }

              onLogout={
                handleSignOut
              }

            />

          }
        />


        {/* ==================================================
            EARNINGS
        ================================================== */}

        <Route
          path="/earnings"
          element={

            <Earnings
              vendor={
                authenticatedUser
              }

              onLogout={
                handleSignOut
              }

            />

          }
        />


        <Route
          path="/returns"
          element={
            <Returns
              vendor={
                authenticatedUser
              }

              onLogout={
                handleSignOut
              }
            />
          }
        />


        {/* ==================================================
            HEATMAP
        ================================================== */}

        <Route
          path="/heatmap"
          element={
            <HeatMap />
          }
        />


        <Route
          path="/settings"
          element={<Settings />}
        />


        <Route
          path="/notifications"
          element={<Notifications />}
        />

        <Route
    path="/reviews"
    element={
        <Reviews />
    }
/>


        {/* ==================================================
            ANALYTICS

            Analytics is inside VendorLayout.
            Therefore sidebar + header will appear.
        ================================================== */}

        <Route
          path="/analytics"
          element={

            <Analytics
              vendor={
                authenticatedUser
              }

              onLogout={
                handleSignOut
              }

            />

          }
        />


      </Route>


      {/* ==================================================
          UNKNOWN URL
      ================================================== */}

      <Route
        path="*"
        element={

          <Navigate
            to={
              authenticatedUser
                ? "/dashboard"
                : "/"
            }
            replace
          />

        }
      />


    </Routes>

  );

}


// ======================================================
// LOGIN PAGE
// ======================================================

function LoginPage({

  email,
  setEmail,

  password,
  setPassword,

  showPassword,
  setShowPassword,

  rememberMe,
  setRememberMe,

  isAuthenticating,

  errorMessage,
  setErrorMessage,

  logoLoaded,
  setLogoLoaded,

  showForgotModal,
  setShowForgotModal,

  showHelpModal,
  setShowHelpModal,

  handleLoginSubmit

}) {

  let navigate =
    useNavigate();


  return (

    <div
      className="
        min-h-screen
        w-full
        flex
        flex-col
        justify-between
        bg-[#fbfbfa]
        text-[#1c1a17]
        font-sans
        relative
        overflow-hidden
        antialiased
      "
    >

      {/* ==================================================
          BACKGROUND
      ================================================== */}

      <div
        className="
          absolute
          inset-0
          pointer-events-none
          opacity-20
          flex
          flex-col
          justify-between
          p-10
          z-0
        "
      >

        <div
          className="
            w-full
            border-t
            border-[#175c2e]/10
            border-dashed
          "
        />

        <div
          className="
            w-full
            border-t
            border-[#175c2e]/10
            border-dashed
          "
        />

        <div
          className="
            w-full
            border-t
            border-[#175c2e]/10
            border-dashed
          "
        />

        <div
          className="
            w-full
            border-t
            border-[#175c2e]/10
            border-dashed
          "
        />

      </div>


      {/* ==================================================
          LEFT LINE
      ================================================== */}

      <div
        className="
          absolute
          left-[8%]
          top-0
          bottom-0
          w-[1px]
          bg-gradient-to-b
          from-[#175c2e]/0
          via-[#175c2e]/5
          to-[#175c2e]/0
          pointer-events-none
        "
      />


      {/* ==================================================
          RIGHT LINE
      ================================================== */}

      <div
        className="
          absolute
          right-[8%]
          top-0
          bottom-0
          w-[1px]
          bg-gradient-to-b
          from-[#175c2e]/0
          via-[#175c2e]/5
          to-[#175c2e]/0
          pointer-events-none
        "
      />


      {/* ==================================================
          HEADER
      ================================================== */}

      <header
        className="
          w-full
          max-w-7xl
          mx-auto
          px-6
          py-4
          flex
          items-center
          justify-between
          z-10
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <span
            className="
              w-2.5
              h-2.5
              rounded-full
              bg-[#175c2e]
              animate-pulse
            "
          />

          <span
            className="
              text-[10px]
              font-bold
              tracking-[0.2em]
              text-[#175c2e]
              uppercase
            "
          >

            ORGOS PRIVATE PORTAL

          </span>

        </div>


        <button
          type="button"
          onClick={() =>
            setShowHelpModal(
              true
            )
          }
          className="
            text-neutral-400
            hover:text-[#175c2e]
            p-1.5
            rounded-full
            hover:bg-neutral-100
            transition-colors
            flex
            items-center
            gap-1
            text-xs
            font-semibold
          "
        >

          <HelpCircle
            className="
              w-4
              h-4
            "
          />

          <span
            className="
              hidden
              sm:inline
            "
          >

            Assistance

          </span>

        </button>

      </header>


      {/* ==================================================
          LOGIN CONTENT
      ================================================== */}

      <main
        className="
          flex-grow
          flex
          items-center
          justify-center
          p-4
          sm:p-6
          md:p-8
          z-10
        "
      >

        <div
          className="
            w-full
            max-w-[480px]
            bg-white
            border
            border-neutral-200/80
            shadow-[0_8px_30px_rgb(0,0,0,0.04)]
            rounded-[24px]
            p-8
            sm:p-10
            space-y-6
            relative
          "
        >


          {/* ==================================================
              LOGO
          ================================================== */}

          <div
            className="
              flex
              justify-center
            "
          >

            <img
              src={
                brandLogo
              }
              alt="ORGOS Logo"
              className={`
                h-24
                w-auto
                object-contain
                transition-all
                duration-300

                ${logoLoaded
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95 h-0 overflow-hidden"
                }
              `}
              onLoad={() =>
                setLogoLoaded(
                  true
                )
              }
              onError={() =>
                setLogoLoaded(
                  false
                )
              }
            />

          </div>


          {!logoLoaded && (

            <OrgosLogo
              className="mx-auto"
              size="md"
            />

          )}


          {/* ==================================================
              TITLE
          ================================================== */}

          <div
            className="
              space-y-1
              text-center
            "
          >

            <h2
              className="
                text-2xl
                font-extrabold
                text-neutral-900
                tracking-tight
              "
            >

              Vendor Login

            </h2>


            <p
              className="
                text-xs
                text-neutral-500
                font-medium
                tracking-wide
              "
            >

              Sign in to continue to ORGOS vendor panel

            </p>

          </div>


          {/* ==================================================
              ERROR
          ================================================== */}

          {errorMessage && (

            <div
              className="
                p-3.5
                bg-rose-50
                border
                border-rose-200/60
                rounded-xl
                text-rose-800
                text-xs
                flex
                items-center
                gap-2.5
              "
            >

              <span
                className="
                  w-1.5
                  h-1.5
                  rounded-full
                  bg-rose-600
                  shrink-0
                "
              />

              <span>

                {errorMessage}

              </span>

            </div>

          )}


          {/* ==================================================
              LOGIN FORM
          ================================================== */}

          <form
            onSubmit={
              handleLoginSubmit
            }
            className="
              space-y-4
            "
          >


            {/* EMAIL */}

            <div
              className="
                space-y-1.5
              "
            >

              <label
                className="
                  block
                  text-[10px]
                  font-bold
                  text-neutral-800
                  uppercase
                  tracking-widest
                  text-left
                "
              >

                Email

              </label>


              <div
                className="
                  relative
                  flex
                  items-center
                "
              >

                <Mail
                  className="
                    absolute
                    left-3.5
                    w-4
                    h-4
                    text-neutral-400
                  "
                />


                <input
                  type="email"
                  required
                  value={
                    email
                  }
                  onChange={(e) => {

                    setEmail(
                      e.target.value
                    );

                    if (
                      errorMessage
                    ) {

                      setErrorMessage(
                        ""
                      );

                    }

                  }}
                  className="
                    w-full
                    pl-11
                    pr-4
                    py-3
                    border
                    border-neutral-300
                    rounded-xl
                    text-sm
                    outline-none
                    focus:ring-1
                    focus:ring-[#175c2e]
                    focus:border-[#175c2e]
                  "
                  placeholder="Enter vendor email"
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div
              className="
                space-y-1.5
              "
            >

              <label
                className="
                  block
                  text-[10px]
                  font-bold
                  text-neutral-800
                  uppercase
                  tracking-widest
                  text-left
                "
              >

                Password

              </label>


              <div
                className="
                  relative
                  flex
                  items-center
                "
              >

                <Lock
                  className="
                    absolute
                    left-3.5
                    w-4
                    h-4
                    text-neutral-400
                  "
                />


                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  required
                  value={
                    password
                  }
                  onChange={(e) => {

                    setPassword(
                      e.target.value
                    );

                    if (
                      errorMessage
                    ) {

                      setErrorMessage(
                        ""
                      );

                    }

                  }}
                  className="
                    w-full
                    pl-11
                    pr-11
                    py-3
                    border
                    border-neutral-300
                    rounded-xl
                    text-sm
                    outline-none
                    focus:ring-1
                    focus:ring-[#175c2e]
                    focus:border-[#175c2e]
                  "
                  placeholder="Enter password"
                />


                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="
                    absolute
                    right-3.5
                    text-neutral-400
                  "
                >

                  {showPassword ? (

                    <EyeOff
                      className="
                        w-4
                        h-4
                      "
                    />

                  ) : (

                    <Eye
                      className="
                        w-4
                        h-4
                      "
                    />

                  )}

                </button>

              </div>

            </div>


            {/* REMEMBER / FORGOT */}

            <div
              className="
                flex
                items-center
                justify-between
                text-xs
                pt-1
              "
            >

              <label
                className="
                  flex
                  items-center
                  gap-2
                  cursor-pointer
                  text-neutral-800
                  font-semibold
                "
              >

                <input
                  type="checkbox"
                  checked={
                    rememberMe
                  }
                  onChange={() =>
                    setRememberMe(
                      !rememberMe
                    )
                  }
                  className="
                    w-4
                    h-4
                    accent-[#175c2e]
                  "
                />

                Remember me

              </label>


              <button
                type="button"
                onClick={() =>
                  setShowForgotModal(
                    true
                  )
                }
                className="
                  font-bold
                  text-[#175c2e]
                  hover:underline
                "
              >

                Forgot Password?

              </button>

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={
                isAuthenticating
              }
              className="
                w-full
                py-3.5
                bg-[#175c2e]
                hover:bg-[#124d25]
                disabled:bg-[#175c2e]/60
                transition-all
                font-bold
                text-white
                text-sm
                rounded-xl
                mt-3.5
                flex
                items-center
                justify-center
                gap-2
              "
            >

              {
                isAuthenticating
                  ? "Authenticating..."
                  : "Login"
              }

            </button>

          </form>


          {/* ==================================================
              REGISTER
          ================================================== */}

          <div
            className="
              pt-1
              text-center
            "
          >

            <p
              className="
                text-xs
                text-neutral-500
                mb-2
              "
            >

              Don't have a vendor account?

            </p>


            <button
              type="button"
              onClick={() => {

                setErrorMessage("");

                navigate(
                  "/register"
                );

              }}
              className="
                w-full
                py-3
                border
                border-[#175c2e]
                text-[#175c2e]
                bg-white
                hover:bg-[#175c2e]/5
                transition-all
                font-bold
                text-sm
                rounded-xl
              "
            >

              Register as Vendor

            </button>

          </div>

        </div>

      </main>


      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer
        className="
          w-full
          max-w-7xl
          mx-auto
          px-6
          py-6
          border-t
          border-neutral-100
          text-center
          text-[11px]
          text-neutral-400
          font-medium
          flex
          flex-col
          sm:flex-row
          justify-between
          items-center
          gap-2
          z-10
        "
      >

        <div>

          © 2026 ORGOS Pvt. Ltd.
          All rights reserved.
          Registered Partner.

        </div>


        <div
          className="
            flex
            gap-4
            font-semibold
            text-neutral-500
          "
        >

          <button
            type="button"
            onClick={() =>
              setShowHelpModal(
                true
              )
            }
          >

            Support

          </button>


          <span>
            •
          </span>


          <button
            type="button"
            onClick={() =>
              setShowHelpModal(
                true
              )
            }
          >

            SLA Policies

          </button>

        </div>

      </footer>


      {/* ==================================================
          FORGOT PASSWORD MODAL
      ================================================== */}

      {showForgotModal && (

        <div
          className="
            fixed
            inset-0
            bg-black/40
            backdrop-blur-sm
            z-50
            flex
            items-center
            justify-center
            p-4
          "
        >

          <div
            className="
              bg-white
              rounded-[20px]
              shadow-xl
              w-full
              max-w-md
              p-6
              relative
            "
          >

            <button
              type="button"
              onClick={() =>
                setShowForgotModal(
                  false
                )
              }
              className="
                absolute
                right-4
                top-4
              "
            >

              <X
                className="
                  w-5
                  h-5
                "
              />

            </button>


            <h3
              className="
                font-bold
                text-lg
                mb-4
              "
            >

              Password Assistance

            </h3>


            <p
              className="
                text-sm
                text-neutral-600
                mb-4
              "
            >

              To reset your vendor password,
              contact ORGOS Support.

            </p>


            <div
              className="
                p-3
                bg-neutral-50
                rounded-xl
                text-center
                font-semibold
              "
            >

              support@orgos.com

            </div>

          </div>

        </div>

      )}


      {/* ==================================================
          HELP MODAL
      ================================================== */}

      {showHelpModal && (

        <div
          className="
            fixed
            inset-0
            bg-black/40
            backdrop-blur-sm
            z-50
            flex
            items-center
            justify-center
            p-4
          "
        >

          <div
            className="
              bg-white
              rounded-[20px]
              shadow-xl
              w-full
              max-w-md
              p-6
              relative
            "
          >

            <button
              type="button"
              onClick={() =>
                setShowHelpModal(
                  false
                )
              }
              className="
                absolute
                right-4
                top-4
              "
            >

              <X
                className="
                  w-5
                  h-5
                "
              />

            </button>


            <div
              className="
                flex
                items-center
                gap-2
                mb-4
              "
            >

              <FileText
                className="
                  w-5
                  h-5
                  text-[#175c2e]
                "
              />


              <h3
                className="
                  font-bold
                  text-lg
                "
              >

                ORGOS Vendor Assistance

              </h3>

            </div>


            <div
              className="
                text-sm
                text-neutral-600
                space-y-3
              "
            >

              <p>

                This portal is available
                to registered ORGOS vendors.

              </p>


              <p>

                New vendors must first
                register their business and
                wait for ORGOS Admin approval.

              </p>


              <p>

                Once approved, use your
                registered email address and
                password to access the vendor
                dashboard.

              </p>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}