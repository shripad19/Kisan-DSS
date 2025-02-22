import React from "react";
import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";

import "../static/css/intel_local_market.css";

// Import Chart.js components
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function IntelLocalMarket() {
  const location = useLocation();
  const { state } = location;

  const marketPriceData = state?.data;
  const transportationData = state?.transportationData;
  const cropyield = state?.cropyield;

  const [marketDataList, setMarketDataList] = useState([]);

  useEffect(() => {
    setMarketDataList([]);
    if (marketPriceData && transportationData) {
      const newMarketDataList = [];

      Object.keys(marketPriceData).forEach((marketName) => {
        // Get the price from marketPriceData
        const price = marketPriceData[marketName];

        // Get the transportation data for the current market
        const transportation = transportationData[marketName] || {
          distance: "N/A",
          duration: "N/A",
          fuel_prices: "N/A",
          transportation_cost: "N/A",
        };

        // Create a new market data object
        const marketData = {
          name: marketName,
          price: price + " ₹/Qtl",
          distance: transportation.distance + " Km",
          duration: transportation.duration + " hours",
          fuelPrice: transportation.fuel_prices + "₹/liter",
          transportationCost: transportation.transportation_cost + "₹",
          netProfit : ((cropyield*price) - transportation.transportation_cost).toFixed(2) + " ₹",
        };

        // Add the new object to the newMarketDataList array
        newMarketDataList.push(marketData);
      });
      // Update the state with the new market data list
      setMarketDataList(newMarketDataList);
    }
  }, [marketPriceData, transportationData]);

  // console.log(marketDataList);

  // Extract data for the chart
  const markets = state?.data ? Object.keys(state.data) : [];
  const prices = state?.data ? Object.values(state.data) : [];

  // Chart.js Data
  const chartData = {
    labels: markets,
    datasets: [
      {
        label: "Market Price (₹ per Quintal)",
        data: prices,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
  };

  // Chart.js Options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Market",
        },
      },
      y: {
        title: {
          display: true,
          text: "Price (₹ per Quintal)",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="intel-local-market-root">
      <nav className="Priceresult_glass-nav">
        <div className="Priceresult_nav-content">
          <a href="/farmer-dashboard" className="Priceresult_logo">
            Kisan DSS
          </a>
          <div className="Priceresult_nav-links">
            <a href="/farmer-dashboard" className="Priceresult_nav-link">
              <i className="fas fa-home"></i> Home
            </a>
          </div>
        </div>
      </nav>
      <div className="intel-local-market-container">
        <div className="intel-local-market-header">
          <h1>Local Market Analysis Dashboard</h1>
          <div className="intel-local-market-update-date">
            {/* Data Updated: <span id="currentDate"></span> */}
          </div>
        </div>
        {state?.conclusion && (
          <div className="intel-local-market-commodity-container">
            <div className="conclusion-market">
              <h3>Recommended Market : {state.conclusion.suggested_market}</h3>
              <p className="reasoning-text">{state.conclusion.reasoning}</p>
            </div>
          </div>
        )}
        <div className="intel-local-market-grid">
          {marketDataList &&
            marketDataList.map((marketData) => (
              <APMCMarketCard key={marketData.name} market={marketData} />
            ))}
        </div>
      </div>
      <div className="intel-local-market-commodity-container">
        <div style={{ height: "450px", width: "100%" }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
      <footer className="Priceresult_glass-footer">
        <p>| © 2026 Kisan DSS. All rights reserved | </p>
      </footer>
    </div>
  );
}

const APMCMarketCard = ({ market }) => {
  return (
    <div className="intel-local-market-card">
      {/* <div className="intel-local-market-apmc-code">{market.apmcCode}</div> */}
      <div className="intel-local-market-name">
        <span>🏢</span>
        <div>{market.name}</div>
      </div>

      <div className="intel-local-market-details">
        <div className="intel-local-market-detail-item">
          <h3>Market Distance</h3>
          <div className="intel-local-market-detail-value">
            {market.distance}
          </div>
        </div>
        <div className="intel-local-market-detail-item">
          <h3>Duration</h3>
          <div className="intel-local-market-detail-value">
            {market.duration}
          </div>
        </div>
        <div className="intel-local-market-detail-item">
          <h3>FulePrice</h3>
          <div className="intel-local-market-detail-value">
            {market.fuelPrice}
          </div>
        </div>
        <div className="intel-local-market-detail-item">
          <h3>TransportationCost</h3>
          <div className="intel-local-market-detail-value">
            {market.transportationCost}
          </div>
        </div>
      </div>

      <div className="intel-local-market-price-section">
        <div className="intel-local-market-current-price">{market.price}</div>
        <div className="intel-local-market-current-price net-price">
          <span className="intel-market-net-profit-title">Net Profit :</span> 
        {market.netProfit}
          </div>
        {/* <div className="intel-local-market-price-change positive">
          {market.change}
        </div> */}
        {/* <div className="intel-local-market-update-date">Today's Price</div> */}
      </div>

      {/* <div className="intel-local-market-commodities">
        {market.commodities.map((commodity, index) => (
          <div key={index} className="intel-local-market-commodity-tag">
            {commodity}
          </div>
        ))}
      </div> */}
    </div>
  );
};
