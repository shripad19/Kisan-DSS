import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../css/FarmerProfile.css";

const FarmerProfile = () => {
  const [farmer, setFarmer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/login/farmer");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      fetchFarmerProfile(decoded.email);
    } catch (error) {
      console.error("Invalid token", error);
      navigate("/login/farmer");
    }
  }, [navigate]);

  const fetchFarmerProfile = async (email) => {
    try {
      const response = await fetch(`http://localhost:4000/farmer-profile?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      setFarmer(data);
    } catch (error) {
      console.error("Error fetching farmer profile:", error);
    }
  };

  return (
    <div className="farmer-profile-container">
      <h2>Farmer Profile</h2>
      {farmer ? (
        <div className="profile-info">
          <p><strong>Name:</strong> {farmer.name}</p>
          <p><strong>Email:</strong> {farmer.email}</p>
          <p><strong>Phone:</strong> {farmer.phone}</p>
          <p><strong>District:</strong> {farmer.district}</p>
          <p><strong>State:</strong> {farmer.state}</p>
          <p><strong>Earning:</strong> {farmer.coins} Rs.</p>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default FarmerProfile;
