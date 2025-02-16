// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Cover from './components/Cover'
import IntelGovMarketForm from './components/IntelGovMarketForm';
import IntelGovMarketPrice from './components/IntelGovMarketPrice';
import FarmerDashBoard from './components/FarmerDashBoard'
import IntelLocalMarketForm from './components/IntelLocalMarketForm';
import IntelLocalMarket from './components/IntelLocalMarket';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Cover />} />
        <Route path="/farmer-dashboard" element={<FarmerDashBoard />} />
        <Route path="/intel-gov-market-form" element={<IntelGovMarketForm />} />
        <Route path="/intel-gov-market-price" element={<IntelGovMarketPrice />} />
        <Route path="/intel-local-market-form" element={<IntelLocalMarketForm />} />
        <Route path="/intel-gov-market-dashboard" element={<IntelLocalMarket />} />
      </Routes>
    </Router>
  );
}