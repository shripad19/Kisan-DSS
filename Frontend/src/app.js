// app.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import IntelGovMarketForm from "./components/IntelGovMarketForm";
import IntelGovMarketPrice from "./components/IntelGovMarketPrice";
import FarmerDashBoard from "./components/FarmerDashBoard";
import IntelLocalMarketForm from "./components/IntelLocalMarketForm";
import IntelLocalMarket from "./components/IntelLocalMarket";

import FarmerAdminDashboard from "./components/FarmerAdminDashboard";
import UserDashboard from "./components/UserDashboard";
import UserAdminDashboard from "./components/UserAdminDashboard";
import CoverPage from "./components/CoverPage";
import LoginFarmer from "./components/LoginFarmer";
import SignupFarmer from "./components/SignupFarmer";
import LoginUser from "./components/LoginUser";
import SignupUser from "./components/SignupUser";
import PostCrop from "./components/PostCrop";
import ActiveCrops from "./components/ActiveCrops";
import CropHistory from "./components/CropHistory";
import MyCart from "./components/MyCart";
import MyOrders from "./components/MyOrders";

import IntelCropRec from "./components/IntelCropRec";
import IntelCropRecResult from "./components/IntelCropRecResult";

import IntelGovScheme from "./components/IntelGovScheme";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CoverPage />} />

        <Route path="/farmer-dashboard" element={<FarmerDashBoard />} />
        <Route path="/intel-gov-market-form" element={<IntelGovMarketForm />} />
        <Route
          path="/intel-gov-market-price"
          element={<IntelGovMarketPrice />}
        />
        <Route
          path="/intel-local-market-form"
          element={<IntelLocalMarketForm />}
        />
        <Route
          path="/intel-gov-market-dashboard"
          element={<IntelLocalMarket />}
        />

        <Route path="/intel-crop-recommendation" element={<IntelCropRec />} />
        <Route path="/intel-crop-rec-result" element={<IntelCropRecResult />} />

        <Route path="/intel-goverment-scheme" element={<IntelGovScheme />} />

        <Route path="/login/farmer" element={<LoginFarmer />} />
        <Route path="/signup/farmer" element={<SignupFarmer />} />
       
        <Route path="/home-farmer" element={<FarmerAdminDashboard />} />
        <Route path="/farmer-post-crop" element={<PostCrop />} />
        <Route path="/farmer-active-crops" element={<ActiveCrops />} />
        <Route path="/farmer-crop-history" element={<CropHistory />} />

        <Route path="/login/user" element={<LoginUser />} />
        <Route path="/signup/user" element={<SignupUser />} />

        <Route path="/home-user" element={<UserDashboard />} />
        <Route path="/adminuserdashboard" element={<UserAdminDashboard />} />

        <Route path="/home-user/mycart" element={<MyCart />} />
        <Route path="/home-user/orderhistory" element={<MyOrders />} />
      </Routes>
    </Router>
  );
}
