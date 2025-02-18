import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "../css/MyOrders.css";

const MyOrders = () => {
  const [orderHistory, setOrderHistory] = useState([]);
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  // Fetch user ID from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
      } catch (error) {
        console.error("Invalid token", error);
      }
    } else {
      navigate("/login/user");
    }
  }, [navigate]);

  // Fetch Order History after userId is set
  useEffect(() => {
    if (userId) {
      fetchOrderHistory();
    }
  }, [userId]);

  // Fetch Order History
  const fetchOrderHistory = async () => {
    try {
      const response = await fetch(`http://localhost:4000/order-history?userId=${userId}`);
      const data = await response.json();

      if (data.status === "success" && Array.isArray(data.order_history)) {
        setOrderHistory(data.order_history);
      } else {
        setOrderHistory([]);
        console.error("Unexpected response format:", data);
      }
    } catch (error) {
      console.error("Error fetching order history:", error);
    }
  };

  return (
    <div className="ordercrop-container">
      <h2 className="ordercrop-title">My Orders</h2>

      {orderHistory.length === 0 ? (
        <p className="ordercrop-no-orders">No orders placed yet.</p>
      ) : (
        <div className="ordercrop-grid">
          {orderHistory.map((order, index) => (
            <div key={index} className="ordercrop-card">
              <img src={order.imageBase64} alt={order.cropname} className="ordercrop-card-img" />
              <div className="ordercrop-card-body">
                <h5 className="ordercrop-card-title">{order.cropname}</h5>
                <p className="ordercrop-card-text">Category: {order.category}</p>
                <p className="ordercrop-card-text">Price: ₹{order.price_per_kg} per kg</p>
                <p className="ordercrop-card-text">Quantity: {order.quantity} kg</p>
                <p className="ordercrop-card-text">Total Paid: ₹{order.total_price}</p>
                <p className="ordercrop-card-date">
                  <small>Ordered on: {new Date(order.date).toLocaleDateString()}</small>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
