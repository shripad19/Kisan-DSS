import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/auth.css";

export default function LoginFarmer() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // State to handle loading during login

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Set loading state to true when login starts

    // Validate email format before proceeding
    if (!email || !password) {
      setError("Please fill in both fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/login-farmer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      //storing the tokens locally & in session
      sessionStorage.setItem("token", data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); // Save user info

      navigate("/farmer-dashboard"); // Redirect to home page after login
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // Reset loading state after request completes
    }
  };

  return (
    <div className="auth-root">
    <div className="authContainer">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
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

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p>
        Don't have an account? <Link to="/signup/farmer">Sign Up</Link>
      </p>
    </div>
    </div>
  );
}
