// import React, { useState, useEffect } from "react";
// import { jwtDecode } from "jwt-decode";
// import { useNavigate } from "react-router-dom";

// const MyCart = () => {
//   const [cartItems, setCartItems] = useState([]);
//   const [userId, setUserId] = useState("");
//   const [rating, setRating] = useState(0); // Store user rating
//   const [showRatingModal, setShowRatingModal] = useState(false); // Control rating modal
//   const [selectedProduct, setSelectedProduct] = useState(null); // Store selected product for rating
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         setUserId(decoded.userId);
//       } catch (error) {
//         console.error("Invalid token", error);
//       }
//     } else {
//       navigate("/login/user");
//     }
//   }, [navigate]);

//   useEffect(() => {
//     fetchCartItems();
//   }, [userId]); // Fetch cart after userId is set

//   const fetchCartItems = async () => {
//     if (!userId) {
//       console.log("User id not fetched");
//       return;
//     }

//     try {
//       const response = await fetch(`http://localhost:4000/cart?userId=${userId}`);
//       const data = await response.json();

//       if (Array.isArray(data)) {
//         setCartItems(data);
//       } else {
//         setCartItems([]);
//         console.error("Unexpected response format:", data);
//       }
//     } catch (error) {
//       console.error("Error fetching cart items:", error);
//     }
//   };

//   // Open rating modal when "Buy Now" is clicked
//   const handleBuyNowClick = (productId) => {
//     setSelectedProduct(productId);
//     setShowRatingModal(true);
//   };

//   // Submit rating and purchase the product
//   const submitRatingAndBuy = async () => {
//     if (!rating || rating < 1 || rating > 5) {
//       alert("Please enter a valid rating between 1 and 5.");
//       return;
//     }

//     try {
//       const response = await fetch("http://localhost:4000/cart/buy", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId, productId: selectedProduct, rating }), // Send rating to backend
//       });

//       const data = await response.json();
//       alert(data.message);
//       fetchCartItems(); // Refresh cart after purchase
//       setShowRatingModal(false); // Close modal
//       setRating(0); // Reset rating
//     } catch (error) {
//       console.error("Error buying crops:", error);
//     }
//   };

//   const removeFromCart = async (productId) => {
//     try {
//       await fetch("http://localhost:4000/cart/remove", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId, productId }),
//       });

//       fetchCartItems(); // Refresh cart
//     } catch (error) {
//       console.error("Error removing item:", error);
//     }
//   };

//   return (
//     <div className="container">
//       <h2 className="text-center mt-3">My Cart</h2>

//       {cartItems.length === 0 ? (
//         <p className="text-center">Your cart is empty.</p>
//       ) : (
//         <div className="row">
//           {cartItems.map((crop) => (
//             <div key={crop.productId._id} className="col-md-4 mb-4">
//               <div className="card">
//                 <img src={crop.productId.imageBase64} alt={crop.productId.cropname} className="card-img-top" />
//                 <div className="card-body">
//                   <h5 className="card-title">{crop.productId.cropname}</h5>
//                   <p className="card-text">Price: ₹{crop.productId.price_per_kg} per kg</p>
//                   <p className="card-text">Quantity: {crop.quantity} kg</p>
//                   <button className="btn btn-danger me-2" onClick={() => removeFromCart(crop.productId._id)}>
//                     Remove
//                   </button>
//                   <button className="btn btn-success" onClick={() => handleBuyNowClick(crop.productId._id)}>
//                     Buy Now
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Rating Modal */}
//       {showRatingModal && (
//         <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Rate Your Purchase</h5>
//                 <button className="btn-close" onClick={() => setShowRatingModal(false)}></button>
//               </div>
//               <div className="modal-body">
//                 <label>Rate the product (1-5): </label>
//                 <input
//                   type="number"
//                   min="1"
//                   max="5"
//                   value={rating}
//                   onChange={(e) => setRating(Number(e.target.value))}
//                   className="form-control"
//                 />
//               </div>
//               <div className="modal-footer">
//                 <button className="btn btn-secondary" onClick={() => setShowRatingModal(false)}>
//                   Cancel
//                 </button>
//                 <button className="btn btn-primary" onClick={submitRatingAndBuy}>
//                   Submit Rating & Buy
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MyCart;


























// import React, { useState, useEffect } from "react";
// import { jwtDecode } from "jwt-decode";
// import { useNavigate } from "react-router-dom";
// import "../css/MyCart.css";

// const MyCart = () => {
//   const [cartItems, setCartItems] = useState([]);
//   const [userId, setUserId] = useState("");
//   const [rating, setRating] = useState(0); // Store user rating
//   const [showRatingModal, setShowRatingModal] = useState(false); // Control rating modal
//   const [selectedProduct, setSelectedProduct] = useState(null); // Store selected product for rating
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         setUserId(decoded.userId);
//       } catch (error) {
//         console.error("Invalid token", error);
//       }
//     } else {
//       navigate("/login/user");
//     }
//   }, [navigate]);

//   useEffect(() => {
//     fetchCartItems();
//   }, [userId]); // Fetch cart after userId is set

//   const fetchCartItems = async () => {
//     if (!userId) {
//       console.log("User id not fetched");
//       return;
//     }

//     try {
//       const response = await fetch(`http://localhost:4000/cart?userId=${userId}`);
//       const data = await response.json();

//       if (Array.isArray(data)) {
//         setCartItems(data);
//       } else {
//         setCartItems([]);
//         console.error("Unexpected response format:", data);
//       }
//     } catch (error) {
//       console.error("Error fetching cart items:", error);
//     }
//   };

//   // Open rating modal when "Buy Now" is clicked
//   const handleBuyNowClick = (productId) => {
//     setSelectedProduct(productId);
//     setShowRatingModal(true);
//   };

//   // Submit rating and purchase the product
//   const submitRatingAndBuy = async () => {
//     if (!rating || rating < 1 || rating > 5) {
//       alert("Please enter a valid rating between 1 and 5.");
//       return;
//     }

//     try {
//       const response = await fetch("http://localhost:4000/cart/buy", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId, productId: selectedProduct, rating }), // Send rating to backend
//       });

//       const data = await response.json();
//       alert(data.message);
//       fetchCartItems(); // Refresh cart after purchase
//       setShowRatingModal(false); // Close modal
//       setRating(0); // Reset rating
//     } catch (error) {
//       console.error("Error buying crops:", error);
//     }
//   };

//   const removeFromCart = async (productId) => {
//     try {
//       await fetch("http://localhost:4000/cart/remove", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId, productId }),
//       });

//       fetchCartItems(); // Refresh cart
//     } catch (error) {
//       console.error("Error removing item:", error);
//     }
//   };

//   return (
//     <div className="container">
//       <h2 className="text-center mt-3">My Cart</h2>

//       {cartItems.length === 0 ? (
//         <p className="text-center">Your cart is empty.</p>
//       ) : (
//         <div className="row">
//           {cartItems.map((crop) => (
//             <div key={crop.productId._id} className="col-md-4 mb-4">
//               <div className="card">
//                 <img src={crop.productId.imageBase64} alt={crop.productId.cropname} className="card-img-top" />
//                 <div className="card-body">
//                   <h5 className="card-title">{crop.productId.cropname}</h5>
//                   <p className="card-text">Price: ₹{crop.productId.price_per_kg} per kg</p>
//                   <p className="card-text">Quantity: {crop.quantity} kg</p>
//                   <button className="btn btn-danger me-2" onClick={() => removeFromCart(crop.productId._id)}>
//                     Remove
//                   </button>
//                   <button className="btn btn-success" onClick={() => handleBuyNowClick(crop.productId._id)}>
//                     Buy Now
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Rating Modal */}
//       {/* {showRatingModal && (
//         <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Rate Your Purchase</h5>
//                 <button className="btn-close" onClick={() => setShowRatingModal(false)}></button>
//               </div>
//               <div className="modal-body">
//                 <label>Rate the product (1-5): </label>
//                 <input
//                   type="number"
//                   min="1"
//                   max="5"
//                   value={rating}
//                   onChange={(e) => setRating(Number(e.target.value))}
//                   className="form-control"
//                 />
//               </div>
//               <div className="modal-footer">
//                 <button className="btn btn-secondary" onClick={() => setShowRatingModal(false)}>
//                   Cancel
//                 </button>
//                 <button className="btn btn-primary" onClick={submitRatingAndBuy}>
//                   Submit Rating & Buy
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )} */}
//       {/* Rating Modal */}
//       {showRatingModal && (
//         <>
//           <div className="modal-backdrop" onClick={() => setShowRatingModal(false)}></div>
//           <div className="modal">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Rate Your Purchase</h5>
//                 <button className="btn-close" onClick={() => setShowRatingModal(false)}></button>
//               </div>
//               <div className="modal-body">
//                 <label>Rate the product (1-5): </label>
//                 <input
//                   type="number"
//                   min="1"
//                   max="5"
//                   value={rating}
//                   onChange={(e) => setRating(Number(e.target.value))}
//                   className="form-control"
//                 />
//               </div>
//               <div className="modal-footer">
//                 <button className="btn btn-secondary" onClick={() => setShowRatingModal(false)}>
//                   Cancel
//                 </button>
//                 <button className="btn btn-primary" onClick={submitRatingAndBuy}>
//                   Submit Rating & Buy
//                 </button>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//     </div>
//   );
// };

// export default MyCart;
































import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "../css/MyCart.css";

const MyCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState("");
  const [rating, setRating] = useState(""); // Store user rating
  const [showRatingModal, setShowRatingModal] = useState(false); // Control rating modal
  const [selectedProduct, setSelectedProduct] = useState(null); // Store selected product for rating
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchCartItems();
  }, [userId]); // Fetch cart after userId is set

  const fetchCartItems = async () => {
    if (!userId) {
      console.log("User id not fetched");
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/cart?userId=${userId}`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setCartItems(data);
      } else {
        setCartItems([]);
        console.error("Unexpected response format:", data);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  // Open rating modal when "Buy Now" is clicked
  const handleBuyNowClick = (productId) => {
    setSelectedProduct(productId);
    setShowRatingModal(true);
  };

  // Submit rating and purchase the product
  const submitRatingAndBuy = async () => {
    if (!rating || rating < 1 || rating > 5) {
      alert("Please enter a valid rating between 1 and 5.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/cart/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId: selectedProduct, rating }), // Send rating to backend
      });

      const data = await response.json();
      alert(data.message);
      fetchCartItems(); // Refresh cart after purchase
      setShowRatingModal(false); // Close modal
      setRating(0); // Reset rating
    } catch (error) {
      console.error("Error buying crops:", error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await fetch("http://localhost:4000/cart/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId }),
      });

      fetchCartItems(); // Refresh cart
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  return (
    <div className="cartcrops-container">
      <h2 className="text-center mt-3">My Cart</h2>

      {cartItems.length === 0 ? (
        <p className="text-center">Your cart is empty.</p>
      ) : (
        <div className="row">
          {cartItems.map((crop) => (
            <div key={crop.productId._id} className="cartcrops-card col-md-4 mb-4">
              <div className="cartcrops-card">
                <img
                  src={crop.productId.imageBase64}
                  alt={crop.productId.cropname}
                  className="card-img-top"
                />
                <div className="cartcrops-card-body">
                  <h5 className="cartcrops-card-title">{crop.productId.cropname}</h5>
                  <p className="cartcrops-card-text">Price: ₹{crop.productId.price_per_kg} per kg</p>
                  <p className="cartcrops-card-text">Quantity: {crop.quantity} kg</p>
                  <button
                    className="cartcrops-btn-danger"
                    onClick={() => removeFromCart(crop.productId._id)}
                  >
                    Remove
                  </button>
                  <button
                    className="cartcrops-btn-success"
                    onClick={() => handleBuyNowClick(crop.productId._id)}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <>
          <div className="cartcrops-modal-backdrop" onClick={() => setShowRatingModal(false)}></div>
          <div className="cartcrops-modal">
            <div className="cartcrops-modal-content">
              <div className="cartcrops-modal-header">
                <h5 className="cartcrops-modal-title">Rate Your Purchase</h5>
                <button className="btn-close" onClick={() => setShowRatingModal(false)}></button>
              </div>
              <div className="cartcrops-modal-body">
                <label>Rate the product (1-5): </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="form-control"
                />
              </div>
              <div className="cartcrops-modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowRatingModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={submitRatingAndBuy}>
                  Submit Rating & Buy
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyCart;
