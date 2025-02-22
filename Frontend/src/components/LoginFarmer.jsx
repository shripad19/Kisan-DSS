// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import "../css/auth.css";

// export default function LoginFarmer({setIsLogin}) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true); // Set loading state to true when login starts

//     // Validate email format before proceeding
//     if (!email || !password) {
//       setError("Please fill in both fields");
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await fetch("http://localhost:4000/login-farmer", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Login failed");
//       }

//       //storing the tokens locally & in session
//       sessionStorage.setItem("token", data.token);
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(data.user)); // Save user info

//       navigate("/farmer-dashboard"); // Redirect to home page after login
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false); // Reset loading state after request completes
//     }
//   };

//   return (
//     <div className="auth-root">
//     <div className="authContainer">
//       <h2>Login</h2>
//       {error && <p className="error">{error}</p>}
//       <form onSubmit={handleLogin}>
//         <div className="form-group">
//           <label htmlFor="email">Email</label>
//           <input
//             type="email"
//             id="email"
//             placeholder="Enter your email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="password">Password</label>
//           <input
//             type="password"
//             id="password"
//             placeholder="Enter your password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//         </div>

//         <button type="submit" disabled={loading}>
//           {loading ? "Logging in..." : "Login"}
//         </button>
//       </form>
//       <p>
//         Don't have an account? 
//         <Link onClick={()=>setIsLogin(false)}>Sign Up</Link>
//       </p>
//     </div>
//     </div>
//   );
// }




import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/auth.css";

export default function LoginFarmer({setIsLogin}) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // Step 1: Enter Email, Step 2: Enter OTP
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/request-otp-farmer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "User not found");
      }

      setStep(2); // Move to OTP verification step
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/verify-otp-farmer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      // Store tokens locally
      sessionStorage.setItem("token", data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/farmer-dashboard"); // Redirect to home page
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
    <div className="authContainer">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}

      {step === 1 && (
        <form onSubmit={handleEmailSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Checking..." : "Next"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleOtpSubmit}>
          <div className="form-group">
            <label htmlFor="otp">Enter OTP</label>
            <input
              type="text"
              id="otp"
              placeholder="Enter OTP sent to your email"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Login"}
          </button>
        </form>
      )}

      <p>
        Don't have an account? <Link onClick={()=>setIsLogin(false)}>Sign Up</Link>
      </p>
    </div>
    </div>
  );
}
