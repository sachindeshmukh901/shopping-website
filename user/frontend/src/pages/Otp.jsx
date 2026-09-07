import "../styles/otp.css";

import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";


function Otp() {
  const navigate = useNavigate();

  const input1 = useRef();
  const input2 = useRef();
  const input3 = useRef();
  const input4 = useRef();

  const moveNext = (e, next) => {
    if (e.target.value.length === 1 && next) {
      next.current.focus();
    }
  };

  const verifyOtp = () => {
    const otp =
      input1.current.value +
      input2.current.value +
      input3.current.value +
      input4.current.value;

    if (otp === "1234") {
      const user = {
        name: localStorage.getItem("name"),
        mobile: localStorage.getItem("mobile"),
      };

      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login Successfully");

      navigate("/");
    } else {
      toast.error("Invalid OTP");
    }
  };

  return (
    <div className="otp-page">
      <div className="otp-box">
        <h1>Verify OTP</h1>

        <div className="otp-inputs">
          <input
            type="text"
            maxLength="1"
            ref={input1}
            onChange={(e) => moveNext(e, input2)}
          />

          <input
            type="text"
            maxLength="1"
            ref={input2}
            onChange={(e) => moveNext(e, input3)}
          />

          <input
            type="text"
            maxLength="1"
            ref={input3}
            onChange={(e) => moveNext(e, input4)}
          />

          <input
            type="text"
            maxLength="1"
            ref={input4}
          />
        </div>

        <button onClick={verifyOtp}>
          VERIFY OTP
        </button>
      </div>
    </div>
  );
}

export default Otp;