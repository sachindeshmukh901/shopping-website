import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  Sparkles,
  AlertCircle
} from "lucide-react";

import OrgosLogo from "../components/OrgosLogo";

import { motion, AnimatePresence } from "motion/react";

import API from "../api/api";

import "./Login.css";


export default function Login() {

  const navigate = useNavigate();


  // ============================
  // LOGIN STATES
  // ============================

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");


  // ============================
  // FORGOT PASSWORD STATES
  // ============================

  const [showForgotModal, setShowForgotModal] =
    useState(false);

  const [forgotEmail, setForgotEmail] =
    useState("");

  const [forgotSuccess, setForgotSuccess] =
    useState(false);


  // ============================
  // ADMIN LOGIN
  // ============================

  const handleLogin = async (e) => {

    e.preventDefault();

    setErrorMsg("");


    if (!email.trim()) {

      setErrorMsg(
        "Please enter your admin email address."
      );

      return;

    }


    if (!password) {

      setErrorMsg(
        "Please enter your secure password."
      );

      return;

    }


    try {

      setIsLoading(true);


      const res = await API.post(
        "/admin/login",
        {
          email: email.trim(),
          password: password
        }
      );


      if (res.data.success) {


        // Remove old login information

        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");

        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("admin");


        // Remember Me

        if (rememberMe) {

          localStorage.setItem(
            "adminToken",
            res.data.token
          );

          localStorage.setItem(
            "admin",
            JSON.stringify(res.data.admin)
          );

        }

        else {

          sessionStorage.setItem(
            "adminToken",
            res.data.token
          );

          sessionStorage.setItem(
            "admin",
            JSON.stringify(res.data.admin)
          );

        }


        // Dashboard

        navigate(
          "/dashboard",
          {
            replace: true
          }
        );

      }

    }

    catch (err) {

      console.log(
        "Admin Login Error:",
        err
      );


      if (err.response) {

        setErrorMsg(

          err.response.data?.message ||

          "Invalid email or password."

        );

      }

      else if (err.request) {

        setErrorMsg(
          "Unable to connect to ORGOS server. Please check that the backend is running."
        );

      }

      else {

        setErrorMsg(
          "Something went wrong. Please try again."
        );

      }

    }

    finally {

      setIsLoading(false);

    }

  };


  // ============================
  // FORGOT PASSWORD
  // ============================

  const handleForgotSubmit = (e) => {

    e.preventDefault();


    if (!forgotEmail.trim()) {

      return;

    }


    setForgotSuccess(true);

  };


  // ============================
  // UI
  // ============================

  return (

    <div className="login-page">


      {/* =====================================
          LOGIN CARD
      ====================================== */}

      <div
        id="login_card_container"
        className="login-card"
      >


        {/* Decorative Glow */}

        <div className="login-glow-top"></div>

        <div className="login-glow-bottom"></div>


        {/* =====================================
            BRAND HEADER
        ====================================== */}

        <div className="login-header">

          <OrgosLogo className="login-logo" />


          <h2
            id="login_title"
            className="login-title"
          >

            Admin Login

          </h2>


          <p
            id="login_subtitle"
            className="login-subtitle"
          >

            Sign in to continue to ORGOS admin panel

          </p>

        </div>


        {/* =====================================
            ERROR MESSAGE
        ====================================== */}

        <AnimatePresence>

          {errorMsg && (

            <motion.div

              initial={{
                opacity: 0,
                y: -10
              }}

              animate={{
                opacity: 1,
                y: 0
              }}

              exit={{
                opacity: 0,
                y: -10
              }}

              className="login-error"
            >

              <AlertCircle />

              <div>

                {errorMsg}

              </div>

            </motion.div>

          )}

        </AnimatePresence>


        {/* =====================================
            LOGIN FORM
        ====================================== */}

        <form
          onSubmit={handleLogin}
          className="login-form"
        >


          {/* EMAIL */}

          <div className="login-form-group">

            <label
              className="login-label"
              htmlFor="input_email"
            >

              Email

            </label>


            <div className="login-input-wrapper">

              <span className="login-input-icon">

                <Mail />

              </span>


              <input

                id="input_email"

                type="email"

                value={email}

                onChange={(e) =>
                  setEmail(e.target.value)
                }

                placeholder="admin@orgos.com"

                autoComplete="email"

                disabled={isLoading}

                className="login-input"

              />

            </div>

          </div>


          {/* PASSWORD */}

          <div className="login-form-group">

            <label
              className="login-label"
              htmlFor="input_password"
            >

              Password

            </label>


            <div className="login-input-wrapper">


              <span className="login-input-icon">

                <Lock />

              </span>


              <input

                id="input_password"

                type={
                  showPassword
                    ? "text"
                    : "password"
                }

                value={password}

                onChange={(e) =>
                  setPassword(e.target.value)
                }

                placeholder="Secure Admin Password"

                autoComplete="current-password"

                disabled={isLoading}

                className="login-input password-input"

              />


              <button

                id="btn_toggle_password"

                type="button"

                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }

                className="password-toggle"

                tabIndex={-1}

              >

                {showPassword ? (

                  <EyeOff />

                ) : (

                  <Eye />

                )}

              </button>

            </div>

          </div>


          {/* =====================================
              REMEMBER + FORGOT
          ====================================== */}

          <div className="login-options">


            <label className="remember-label">

              <input

                id="chk_remember_me"

                type="checkbox"

                checked={rememberMe}

                onChange={() =>
                  setRememberMe(
                    !rememberMe
                  )
                }

                className="hidden-checkbox"

              />


              <span
                className={
                  rememberMe
                    ? "remember-checkbox active"
                    : "remember-checkbox"
                }
              >

                {rememberMe && (

                  <Check />

                )}

              </span>


              <span>

                Remember me

              </span>

            </label>


            <button

              id="btn_forgot_password"

              type="button"

              onClick={() => {

                setForgotEmail(email);

                setForgotSuccess(false);

                setShowForgotModal(true);

              }}

              className="forgot-password"

            >

              Forgot Password?

            </button>

          </div>


          {/* =====================================
              LOGIN BUTTON
          ====================================== */}

          <button

            id="btn_login_submit"

            type="submit"

            disabled={isLoading}

            className="login-button"

          >

            {isLoading ? (

              <>

                <span className="login-loader"></span>

                <span>
                  Logging in...
                </span>

              </>

            ) : (

              <span>
                Login
              </span>

            )}

          </button>

        </form>


        {/* =====================================
            FOOTER
        ====================================== */}

        <div
          id="login_footer"
          className="login-footer"
        >

          © 2026 ORGOS Pvt. Ltd. All rights reserved.

        </div>

      </div>


      {/* =====================================
          FORGOT PASSWORD MODAL
      ====================================== */}

      <AnimatePresence>

        {showForgotModal && (

          <motion.div

            className="forgot-overlay"

            initial={{
              opacity: 0
            }}

            animate={{
              opacity: 1
            }}

            exit={{
              opacity: 0
            }}

          >


            <motion.div

              initial={{
                scale: 0.95,
                opacity: 0,
                y: 10
              }}

              animate={{
                scale: 1,
                opacity: 1,
                y: 0
              }}

              exit={{
                scale: 0.95,
                opacity: 0,
                y: 10
              }}

              transition={{
                duration: 0.2
              }}

              className="forgot-modal"

            >


              {/* =================================
                  MODAL TITLE
              ================================== */}

              <h3 className="forgot-title">

                <Sparkles />

                Reset Admin Password

              </h3>


              {!forgotSuccess ? (

                <form
                  onSubmit={handleForgotSubmit}
                >


                  <p className="forgot-description">

                    Enter the admin email address
                    registered with your ORGOS
                    administrator account.

                  </p>


                  {/* EMAIL */}

                  <div>

                    <label
                      className="forgot-label"
                      htmlFor="forgot_email"
                    >

                      Admin Email

                    </label>


                    <input

                      id="forgot_email"

                      type="email"

                      required

                      value={forgotEmail}

                      onChange={(e) =>
                        setForgotEmail(
                          e.target.value
                        )
                      }

                      placeholder="admin@orgos.com"

                      className="forgot-input"

                    />

                  </div>


                  {/* ACTIONS */}

                  <div className="forgot-actions">


                    <button

                      type="button"

                      onClick={() =>
                        setShowForgotModal(false)
                      }

                      className="forgot-cancel"

                    >

                      Cancel

                    </button>


                    <button

                      type="submit"

                      className="forgot-submit"

                    >

                      Send Recovery Link

                    </button>

                  </div>

                </form>

              ) : (


                /* =================================
                   SUCCESS
                ================================== */

                <div className="forgot-success">


                  <div className="success-icon">

                    <Check />

                  </div>


                  <p className="success-title">

                    Request Received

                  </p>


                  <p className="success-text">

                    Password recovery for{" "}

                    <strong>
                      {forgotEmail}
                    </strong>

                    {" "}will be available after
                    the backend recovery API is
                    connected.

                  </p>


                  <button

                    type="button"

                    onClick={() =>
                      setShowForgotModal(false)
                    }

                    className="success-button"

                  >

                    Done

                  </button>

                </div>

              )}

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>

  );

}