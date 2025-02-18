import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../css/UserProfile.css";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login/user");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      fetchUserProfile(decoded.email);
    } catch (error) {
      console.error("Invalid token", error);
      navigate("/login/user");
    }
  }, [navigate]);

  const fetchUserProfile = async (email) => {
    try {
      const response = await fetch(`http://localhost:4000/user-profile?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  return (
    <div className="user-profile-container">
      <h2>User Profile</h2>
      {user ? (
        <div className="profile-info">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Address:</strong> {user.address.Apartment}, {user.address.district}, {user.address.state} - {user.address.pincode}</p>

        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default UserProfile;
