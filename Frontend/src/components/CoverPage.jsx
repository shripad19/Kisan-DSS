// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Link } from 'react-router-dom';
// import { FaTractor, FaUser, FaLeaf } from 'react-icons/fa';
// import '../css/CoversPage.css';

// import AuthComponents from './AuthComponent';
// const { AuthComponentUser, AuthComponentFarmer } = AuthComponents;

// const CoverPage = () => {
//   const [flipped, setFlipped] = useState(null);

//   const [showAuthFarmer, setShowAuthFarmer] = useState(false);
//   const [showAuthUser, setShowAuthUser] = useState(false);
 
//   return (
//     <div className="cover-container">
//        {showAuthFarmer && <AuthComponentFarmer onClose={() => setShowAuth(false)} />}
//        {showAuthUser && <AuthComponentUser onClose={() => setShowAuth(false)} />}
//       <div className="background-gradient"></div>

//       <motion.div 
//         className="content"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 1 }}
//       >
        
//         {/* Header Section */}
//         <div className="header">
//           {/* <FaLeaf className="logo-icon" /> */}
//           <h1>AgriConnect <span>🌱</span></h1>
//           <p>Connecting Farmers with the World</p>
//         </div>

//         {/* Cards Container */}
//         <div className="cards-container">
//           {/* Farmer Card */}
//           <motion.div 
//             className={`card farmer ${flipped === 'farmer' ? 'flipped' : ''}`}
//             onMouseEnter={() => setFlipped('farmer')}
//             onMouseLeave={() => setFlipped(null)}
//             whileHover={{ scale: 1.05 }}
//           >
//             <div className="card-front">
//               <FaTractor className="card-icon" />
//               <h2>Farmer Login</h2>
//               <p>Direct from the fields</p>
//             </div>
//             <div className="card-back">
//                 {/* <Link to="/login/farmer"> */}
//               <button onClick={() => setShowAuthFarmer(true)} className="login-btn farmer-btn">
//                 Continue as Farmer
//               </button>
//               {/* </Link> */}
//               <p>Access your farming dashboard</p>
//             </div>
//           </motion.div>

//           {/* User Card */}
//           <motion.div 
//             className={`card user ${flipped === 'user' ? 'flipped' : ''}`}
//             onMouseEnter={() => setFlipped('user')}
//             onMouseLeave={() => setFlipped(null)}
//             whileHover={{ scale: 1.05 }}
//           >
//             <div className="card-front">
//               <FaUser className="card-icon" />
//               <h2>User Login</h2>
//               <p>Fresh from the farm</p>
//             </div>
//             <div className="card-back">
//                 {/* <Link to="/login/user"> */}
//               <button onClick={()=>setShowAuthUser(true)} className="login-btn user-btn">
//                 Continue as User
//               </button>
//               {/* </Link> */}
//               <p>Explore farm-fresh products</p>
//             </div>
//           </motion.div>
//         </div>

//         {/* Watermark Section */}
//         <div className="watermark">
//           <p>Nourishing Lives, Cultivating Trust</p>
//           <div className="animated-leaves">
//             <FaLeaf className="leaf leaf1" />
//             <FaLeaf className="leaf leaf2" />
//             <FaLeaf className="leaf leaf3" />
//             <FaLeaf className="leaf leaf4" />
//             <FaLeaf className="leaf leaf5" />
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default CoverPage;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaTractor, FaUser, FaLeaf } from 'react-icons/fa';
import HelpModal from './HelpModal';
import AuthComponents from './AuthComponent';
import '../css/CoversPage.css';

const { AuthComponentUser, AuthComponentFarmer } = AuthComponents;
const CoverPage = () => {
  const [flipped, setFlipped] = useState(null);

  const [showAuthFarmer, setShowAuthFarmer] = useState(false);
  const [showAuthUser, setShowAuthUser] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  return (
    <div className="cover-container">
      {showAuthFarmer && <AuthComponentFarmer onClose={() => setShowAuth(false)} />}
      {showAuthUser && <AuthComponentUser onClose={() => setShowAuth(false)} />}
      {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
      <div className="background-gradient"></div>


      <motion.div
        className="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >

        {/* Header Section */}
        <div className="header">
          {/* <FaLeaf className="logo-icon" /> */}
          <h1>AgriConnect <span>🌱</span></h1>
          <p>Connecting Farmers with the World</p>
          <button
            className="help-button"
            onClick={() => setShowHelpModal(true)}
          >
            Need Help?
          </button>

        </div>

        {/* Cards Container */}
        <div className="cards-container">
          {/* Farmer Card */}
          <motion.div
            className={`card farmer ${flipped === 'farmer' ? 'flipped' : ''}`}
            onMouseEnter={() => setFlipped('farmer')}
            onMouseLeave={() => setFlipped(null)}
            whileHover={{ scale: 1.05 }}
          >
            <div className="card-front">
              <FaTractor className="card-icon" />
              <h2>Farmer Login</h2>
              <p>Direct from the fields</p>
            </div>
            <div className="card-back">
              {/* <Link to="/login/farmer"> */}
              <button onClick={() => setShowAuthFarmer(true)} className="login-btn farmer-btn">
                Continue as Farmer
              </button>
              {/* </Link> */}
              <p>Access your farming dashboard</p>
            </div>
          </motion.div>

          {/* User Card */}
          <motion.div
            className={`card user ${flipped === 'user' ? 'flipped' : ''}`}
            onMouseEnter={() => setFlipped('user')}
            onMouseLeave={() => setFlipped(null)}
            whileHover={{ scale: 1.05 }}
          >
            <div className="card-front">
              <FaUser className="card-icon" />
              <h2>User Login</h2>
              <p>Fresh from the farm</p>
            </div>
            <div className="card-back">
              {/* <Link to="/login/user"> */}
              <button onClick={() => setShowAuthUser(true)} className="login-btn user-btn">
                Continue as User
              </button>
              {/* </Link> */}
              <p>Explore farm-fresh products</p>
            </div>
          </motion.div>
        </div>

        {/* Watermark Section */}
        <div className="watermark">
          <p>Nourishing Lives, Cultivating Trust</p>
          <div className="animated-leaves">
            <FaLeaf className="leaf leaf1" />
            <FaLeaf className="leaf leaf2" />
            <FaLeaf className="leaf leaf3" />
            <FaLeaf className="leaf leaf4" />
            <FaLeaf className="leaf leaf5" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CoverPage;
