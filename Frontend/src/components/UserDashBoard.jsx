import React, { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { useNavigate, Link } from "react-router-dom";
import {
    FaSearch,
    FaUserCircle,
    FaShoppingCart,
    FaRegBell,
    FaFilter,
    FaSeedling,
    FaFacebook,
    FaTwitter,
    FaInstagram,
    FaLinkedin
} from 'react-icons/fa';
import '../css/UserDashboard.css';

const UserDashboard = () => {
    const [crops, setCrops] = useState([]);
    const [userId, setUserId] = useState("");
    const [search, setSearch] = useState("");
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("All Crops");

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
        fetchCrops();
    }, [search]);

    const fetchCrops = async () => {
        try {
            const response = await fetch(`http://localhost:4000/crops?search=${search}`);
            const data = await response.json();
            setCrops(data);
        } catch (error) {
            console.error("Error fetching crops:", error);
        }
    };

    // Open modal for adding crop to cart
    const openModal = (crop) => {
        setSelectedCrop(crop);
        setQuantity(1); // Reset quantity to 1 when modal opens
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedCrop(null);
        setQuantity(1);
    };

    // Add crop to cart
    const addToCart = async () => {
        if (!selectedCrop) return;

        if (quantity < 1 || quantity > selectedCrop.quantity) {
            alert(`Invalid quantity! Available: ${selectedCrop.quantity} kg`);
            return;
        }

        try {
            const response = await fetch("http://localhost:4000/add-to-cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, productId: selectedCrop._id, quantity }),
            });

            const data = await response.json();
            alert(data.message);
            closeModal();
        } catch (error) {
            console.error("Error adding to cart:", error);
        }
    };

    // Filter crops based on search input and selected category
    const filteredCrops = crops.filter((crop) => {
        const matchesSearch = crop.cropname.toLowerCase().includes(search.toLowerCase()) ||
            crop.category.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === "All Crops" || crop.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Handle category button click
    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    return (
        <div className="UserDashboard_container">
            {/* Top Navigation Bar */}
            <nav className="UserDashboard_navbar">
                <div className="UserDashboard_navLeft">
                    <h1 className="UserDashboard_logo">🌾 KisanFresh</h1>
                    <div className="UserDashboard_navLinks">
                        <a href="#farmers">Farmers</a>
                        <a href="#products">Products</a>
                        <a href="#orders">Orders</a>
                        <a href="#support">Support</a>
                    </div>
                </div>

                <div className="UserDashboard_navRight">
                    <div className="UserDashboard_searchBar">
                        <FaSearch className="UserDashboard_searchIcon" />
                        <input
                            type="text"
                            placeholder="Search crops, vegetables, or farmers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <FaRegBell className="UserDashboard_navIcon" />
                    <Link to="/adminuserdashboard">
                        <FaUserCircle className="UserDashboard_navIcon" />
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="UserDashboard_mainContent">
                {/* Category Filters */}
                <div className="UserDashboard_categoryFilters">
                    <button
                        className={`UserDashboard_filterBtn ${selectedCategory === "All Crops" ? "active" : ""}`}
                        onClick={() => handleCategoryClick("All Crops")}
                    >
                        All Crops
                    </button>
                    <button
                        className={`UserDashboard_filterBtn ${selectedCategory === "Cereals" ? "active" : ""}`}
                        onClick={() => handleCategoryClick("Cereals")}
                    >
                        Cereals
                    </button>
                    <button
                        className={`UserDashboard_filterBtn ${selectedCategory === "Pulses" ? "active" : ""}`}
                        onClick={() => handleCategoryClick("Pulses")}
                    >
                        Pulses
                    </button>
                    <button
                        className={`UserDashboard_filterBtn ${selectedCategory === "Vegetables" ? "active" : ""}`}
                        onClick={() => handleCategoryClick("Vegetables")}
                    >
                        Vegetables
                    </button>
                    <button
                        className={`UserDashboard_filterBtn ${selectedCategory === "Fruits" ? "active" : ""}`}
                        onClick={() => handleCategoryClick("Fruits")}
                    >
                        Fruits
                    </button>
                    <button
                        className={`UserDashboard_filterBtn ${selectedCategory === "Oilseeds" ? "active" : ""}`}
                        onClick={() => handleCategoryClick("Oilseeds")}
                    >
                        Oilseeds
                    </button>
                    <button
                        className={`UserDashboard_filterBtn ${selectedCategory === "Spices" ? "active" : ""}`}
                        onClick={() => handleCategoryClick("Spices")}
                    >
                        Spices
                    </button>
                    <button
                        className={`UserDashboard_filterBtn ${selectedCategory === "Beverage Crops" ? "active" : ""}`}
                        onClick={() => handleCategoryClick("Beverage Crops")}
                    >
                        Beverage Crops
                    </button>
                    <FaFilter className="UserDashboard_filterIcon" />
                </div>

                {/* Products Grid */}
                <section className="UserDashboard_section">
                    <h2 className="UserDashboard_sectionHeading">Fresh Harvest Today</h2>
                    <div className="UserDashboard_productsGrid">
                        {filteredCrops.map((crop) => (
                            <div key={crop._id} className="UserDashboard_productCard">
                                <div className="UserDashboard_productImage">
                                    <img
                                        src={crop.imageBase64 || "https://via.placeholder.com/150"}
                                        alt={crop.cropname}
                                        className="UserDashboard_productImage"
                                    />
                                </div>
                                <div className="UserDashboard_productInfo">
                                    <h5 className="cropname-cardtitle">{crop.cropname}</h5>
                                    <p className="UserDashboard_price">₹{crop.price_per_kg} per kg</p>
                                    <p className="UserDashboard_productText">Category: {crop.category} </p>
                                    <p className="UserDashboard_productText">Available: {crop.quantity} kg</p>
                                    <p className="UserDashboard_productText">
                                        Average Rating: {(crop.rating?.average ?? 0).toFixed(2)} / 5
                                    </p>

                                    <button className="UserDashboard_addToCart" onClick={() => openModal(crop)}>
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Modal for Add to Cart */}
            {showModal && (
                <div className="UserDashboard_modalOverlay">
                    <div className="UserDashboard_modal">
                        <h3>Add to Cart</h3>
                        <p>{selectedCrop?.cropname}</p>
                        <p>Available: {selectedCrop?.quantity} kg</p>
                        <div className="UserDashboard_modalQuantity">
                            <label>Quantity (kg):</label>
                            <input
                                type="number"
                                value={quantity}
                                min="1"
                                max={selectedCrop?.quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                            />
                        </div>
                        <div className="UserDashboard_modalActions">
                            <button onClick={closeModal}>Cancel</button>
                            <button onClick={addToCart}>Add to Cart</button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="UserDashboard_footer">
                <div className="UserDashboard_footerContent">
                    <div className="UserDashboard_footerSection">
                        <h4>🌾 KisanFresh</h4>
                        <p>Empowering Farmers, Enriching Lives</p>
                        <div className="UserDashboard_socialIcons">
                            <FaFacebook />
                            <FaTwitter />
                            <FaInstagram />
                            <FaLinkedin />
                        </div>
                    </div>

                    <div className="UserDashboard_footerSection">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><a href="#about">About Us</a></li>
                            <li><a href="#farmers">Our Farmers</a></li>
                            <li><a href="#products">Products</a></li>
                            <li><a href="#contact">Contact</a></li>
                        </ul>
                    </div>

                    <div className="UserDashboard_footerSection">
                        <h4>Legal</h4>
                        <ul>
                            <li><a href="#privacy">Privacy Policy</a></li>
                            <li><a href="#terms">Terms of Service</a></li>
                            <li><a href="#refund">Refund Policy</a></li>
                        </ul>
                    </div>

                    <div className="UserDashboard_footerSection">
                        <h4>Contact Us</h4>
                        <p>📞 +91 98765 43210</p>
                        <p>📧 support@kisanfresh.com</p>
                        <p>📍 123 Farm Lane, AgriCity, India</p>
                    </div>
                </div>

                <div className="UserDashboard_footerBottom">
                    <p>© 2025 KisanFresh. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default UserDashboard;