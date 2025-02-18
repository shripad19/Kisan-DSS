// UserAdminDashboard.js
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaShoppingCart,
  FaUser,
  FaBox,
  FaHistory,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin
} from 'react-icons/fa';
import '../css/UserAdminDashboard.css';
import UserProfile from './UserProfile';
import MyCart from './MyCart';
import MyOrders from './MyOrders';
import UserTransactions from './UserTransactions';

const UserAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userDetails] = useState({
    name: "Aarav Sharma",
    membership: "Premium Buyer",
    joined: "2022"
  });

  return (
    <div className="UserAdminDashboard_container">
      {/* Navigation */}
      <nav className="UserAdminDashboard_nav">
        <h1 className="UserAdminDashboard_logo">🛒Kisan DSS</h1>
        <Link to="/home-user" className="UserAdminDashboard_backBtn">
          <FaArrowLeft /> Back to Market
        </Link>
      </nav>

      {/* Main Content */}
      <main className="UserAdminDashboard_main">
        <h2 className="UserAdminDashboard_title">Crop Marketplace Hub</h2>

        <div className="UserAdminDashboard_card">
          {/* Sidebar */}
          <div className="UserAdminDashboard_sidebar">
            <button
              className={`UserAdminDashboard_menuBtn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FaUser /> Profile
            </button>

            <button
              className={`UserAdminDashboard_menuBtn ${activeTab === 'cart' ? 'active' : ''}`}
              onClick={() => setActiveTab('cart')}
            >
              <FaShoppingCart /> My Cart
            </button>

            <button
              className={`UserAdminDashboard_menuBtn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <FaBox /> Order History
            </button>
            <button
              className={`UserAdminDashboard_menuBtn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <FaHistory /> Transactions
            </button>
          </div>

          {/* Content Area */}
          <div className="UserAdminDashboard_content">
            {activeTab === 'profile' && (
              <div className="UserAdminDashboard_profile">
                <UserProfile />
              </div>
            )}

            {activeTab === 'cart' && (
              <div className="UserAdminDashboard_address">
                <MyCart />
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="UserAdminDashboard_address">
                <MyOrders />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="UserAdminDashboard_address">
                <UserTransactions />
              </div>
            )}

            {/* Add other tab contents similarly */}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="UserAdminDashboard_footer">
        <div className="UserAdminDashboard_footerContent">
          <p>© 2024 AgriBuy - Fresh Farm to Table</p>
          <div className="UserAdminDashboard_footerLinks">
            <a href="#support">Support</a>
            <a href="#quality">Quality Promise</a>
            <a href="#sustainability">Sustainability</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserAdminDashboard;
