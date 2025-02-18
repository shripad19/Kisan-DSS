import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import '@fortawesome/fontawesome-free/css/all.css';
import "../css/CropHistory.css";

const CropHistory = () => {
  const [email, setEmail] = useState("");
  const [historyCrops, setHistoryCrops] = useState([]);

  const navigate = useNavigate();
  let returnHome = async (e) => {
    e.preventDefault();
    navigate("/home-farmer");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token:", token);

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setEmail(decoded.email || ""); // Set email from token
      } catch (error) {
        console.error("Invalid token", error);
      }
    } else {
      navigate("/login/farmer"); // Redirect to login if no token found
    }
  }, [navigate]);

  // Fetch crops only after email is set
  useEffect(() => {
    if (email) {
      fetchCrops(email);
    }
  }, [email]); // Runs only when email is updated

  const fetchCrops = async (userEmail) => {
    try {
      console.log("Fetching crops for email:", userEmail);
      const response = await fetch(`http://localhost:4000/history-crops?email=${encodeURIComponent(userEmail)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch crops");
      }

      const data = await response.json();
      console.log("Fetched Crops:", data);
      setHistoryCrops(data);
    } catch (error) {
      console.error("Error fetching active crops:", error);
    }
  };

  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
        crossOrigin="anonymous"
      ></link>
      <script
        src="https://kit.fontawesome.com/dd438282bc.js"
        crossOrigin="anonymous"
      ></script>

      <div className="historycrop-container">
        <h2>Posted Crop History</h2>
        <div className="historycrop-list">
          {historyCrops.length > 0 ? (
            historyCrops.map((crop) => (
              <div key={crop._id} className="historycrop-card">
                {crop.imageBase64 && (
                  <img
                    src={crop.imageBase64} // Directly use the Base64 string from MongoDB
                    alt={crop.cropname}
                    className="historycrop-image"
                  />
                )}
                <h3 className="activecrop-name">{crop.cropname}</h3>
                <p className="activecrop-price">Price: ₹{crop.price_per_kg} per kg</p>
                <p className="activecrop-quantity">Quantity: {crop.quantity} kg</p>
                <p className="activecrop-earnings">Earnings: {crop.earnings} ₹</p>
                <p className="activecrop-rating">Avg Rating: {crop.rating?.average} / 5</p>
              </div>
            ))
          ) : (
            <p>No history crops available.</p>
          )}
        </div>
      </div>
      <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
        crossOrigin="anonymous"
      ></script>
    </>
  );
};

export default CropHistory;