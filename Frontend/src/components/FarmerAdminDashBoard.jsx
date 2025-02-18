import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaUser,
  FaUpload,
  FaSeedling,
  FaHistory,
  FaPlusCircle,
  FaChartLine,
  FaBookOpen
} from 'react-icons/fa';
import '../css/FarmerAdminDashboard.css';
import CropHistory from './CropHistory';
import ActiveCrops from './ActiveCrops';
import FarmerProfile from './FarmerProfile';
import PostCrop from './PostCrop';
import TransactionHistory from './TransactionHistory';

const FarmerAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const [farmDetails] = useState({
    name: "Green Valley Farms",
    location: "Punjab, India",
    crops: ["Wheat", "Rice", "Corn"]
  });
 
  return (
    <>
      <div className="FarmerAdmin_container">
        {/* Navigation */}
        <nav className="FarmerAdmin_nav">
          <h1 className="FarmerAdmin_logo">🌾 AgriSmart</h1>
          <Link to="/" className="FarmerAdmin_backBtn">
            <FaArrowLeft /> Back to Home
          </Link>
        </nav>

        {/* Main Content */}
        <main className="FarmerAdmin_main">
          <h2 className="FarmerAdmin_title">Crop Commerce Hub</h2>

          <div className="FarmerAdmin_card">
            {/* Sidebar */}
            <div className="FarmerAdmin_sidebar">
              <button
                className={`FarmerAdmin_menuBtn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <FaUser /> Profile
              </button>
              <button
                className={`FarmerAdmin_menuBtn ${activeTab === 'postCrop' ? 'active' : ''}`}
                onClick={() => setActiveTab('postCrop')}
              >
                <FaPlusCircle /> Post Crop
              </button>
              <button
                className={`FarmerAdmin_menuBtn ${activeTab === 'activeCrops' ? 'active' : ''}`}
                onClick={() => setActiveTab('activeCrops')}
              >
                <FaChartLine /> Active Crops
              </button>
              <button
                className={`FarmerAdmin_menuBtn ${activeTab === 'cropHistory' ? 'active' : ''}`}
                onClick={() => setActiveTab('cropHistory')}
              >
                <FaBookOpen /> Crop History
              </button>
              <button
                className={`FarmerAdmin_menuBtn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <FaHistory /> Transaction History
              </button>
            </div>

            {/* Content Area */}
            <div className="FarmerAdmin_content">
              {activeTab === 'profile' && (
                <div className="FarmerAdmin_profile">
                  {/* <h3>Farm Profile</h3>
                  <div className="FarmerAdmin_detailCard">
                    <p>🏠 Farm Name: {farmDetails.name}</p>
                    <p>📍 Location: {farmDetails.location}</p>
                    <p>🌱 Main Crops: {farmDetails.crops.join(', ')}</p>
                  </div> */}
                  <FarmerProfile />
                </div>
              )}

              {activeTab === 'postCrop' && (
                <div className="FarmerAdmin_section">
                  {/* <h3>Post Crop</h3>
                  <p>Submit details of your crop to list it for sale.</p> */}
                  <PostCrop />
                  {/* Add your form here */}
                </div>
              )}

              {activeTab === 'activeCrops' && (
                <div className="FarmerAdmin_section">
                  {/* <h3>Active Crops</h3>
                  <p>View and manage your currently listed crops.</p> */}
                  <ActiveCrops />
                  {/* Display active crops here */}
                </div>
              )}

              {activeTab === 'cropHistory' && (
                <div className="FarmerAdmin_section">
                  {/* <h3>Crop History</h3>
                  <p>Review your past crop listings and sales.</p> */}
                  <CropHistory />
                  {/* Display crop history here */}
                </div>
              )}


              {activeTab === 'history' && (
                <div className="FarmerAdmin_history">
                  {/* <h3>Transaction History</h3>
                  <p>Review your recent transactions here.</p> */}
                  <TransactionHistory />
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="FarmerAdmin_footer">
          <div className="FarmerAdmin_footerContent">
            <p>© 2024 AgriSmart - Empowering Digital Agriculture</p>
            <div className="FarmerAdmin_footerLinks">
              <a href="#support">Support</a>
              <a href="#terms">Terms</a>
              <a href="#privacy">Privacy</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default FarmerAdminDashboard;
