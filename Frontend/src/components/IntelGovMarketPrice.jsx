import React from "react";
import { Line } from "react-chartjs-2";
import { useLocation } from "react-router-dom";
import "chart.js/auto";

import "../static/css/intel_gov_market_price.css";

import Bajra from "../static/CropImages/Bajra.jpg";
import Barley from "../static/CropImages/Barley.jpg";
import Cotton from "../static/CropImages/Cotton.jpg";
import Gram from "../static/CropImages/Gram.jpg";
import Groundnut from "../static/CropImages/Groundnut.jpg";
import Jowar from "../static/CropImages/Jowar.jpg";
import Maize from "../static/CropImages/Maize.jpg";
import Masoor from "../static/CropImages/Masoor.jpg";
import Moong from "../static/CropImages/Moong.jpg";
import Soyabean from "../static/CropImages/Soyabean.jpg";
import Sugarcane from "../static/CropImages/Sugarcane.jpg";
import Tur from "../static/CropImages/Tur.jpg";
import Urad from "../static/CropImages/Urad.jpg";
import Wheat from "../static/CropImages/Wheat.jpg";

export default function IntelGovMarketPrice() {
  const location = useLocation();
  const { state } = location;
  console.log(state);

  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const commodityImages = {
    Bajra,
    Barley,
    Cotton,
    Gram,
    Groundnut,
    Jowar,
    Maize,
    Masoor,
    Moong,
    Soyabean,
    Sugarcane,
    Tur,
    Urad,
    Wheat,
  };

  const chartData = (labels, maxData, minData) => ({
    labels,
    datasets: [
      {
        label: "Max Price per Quintal",
        data: maxData,
        borderColor: "#36A2EB",
        backgroundColor: "#9BD0F5",
        borderWidth: 1,
      },
      {
        label: "Min Price per Quintal",
        data: minData,
        borderColor: "#FF6384",
        backgroundColor: "#FFB1C1",
        borderWidth: 1,
      },
    ],
  });

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="intel-gov-market-root">
      <div id="Priceresult_root">
        <nav className="Priceresult_glass-nav">
          <div className="Priceresult_nav-content">
            <a href="/farmer-dashboard" className="Priceresult_logo">Kisan DSS</a>
            <div className="Priceresult_nav-links">
              <a href="/farmer-dashboard" className="Priceresult_nav-link"><i className="fas fa-home"></i> Home</a>
            </div>
          </div>
        </nav>

        <div className="Priceresult_container">
          <div className="Priceresult_header-section">
            <div className="Priceresult_date-card">
              <i className="fas fa-calendar-alt"></i>
              <span>{state.month} / {state.year}</span>
            </div>
            <h1 className="Priceresult_main-title">APMC Market Price Analysis</h1>
          </div>

          <div className="Priceresult_dashboard-grid">
            <div className="Priceresult_commodity-card Priceresult_glass-card">
              <div className="Priceresult_crop-hero">
                <img src={commodityImages[state.commodity]} alt="Crop" className="Priceresult_crop-image" />
                <div className="Priceresult_crop-overlay">
                  <h3>{state.commodity}</h3>
                </div>
              </div>
              <div className="Priceresult_stats-grid">
                <div className="Priceresult_stat-card primary">
                  <i className="fas fa-coins"></i>
                  <div className="Priceresult_stat-content">
                    <h4>Avg Price</h4>
                    <p>{state.avgPrice} ₹/quintal</p>
                  </div>
                </div>
                <div className="Priceresult_stat-card success">
                  <i className="fas fa-arrow-up"></i>
                  <div className="Priceresult_stat-content">
                    <h4>Max Price</h4>
                    <p>{state.maxPrice} ₹/quintal</p>
                  </div>
                </div>
                <div className="Priceresult_stat-card danger">
                  <i className="fas fa-arrow-down"></i>
                  <div className="Priceresult_stat-content">
                    <h4>Min Price</h4>
                    <p>{state.minPrice} ₹/quintal</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="Priceresult_weather-card Priceresult_glass-card">
              <div className="Priceresult_weather-header">
                <i className="fas fa-cloud-sun-rain"></i>
                <h3>Harvesting Advisory</h3>
              </div>
              <div className="Priceresult_weather-body">
                <div className="Priceresult_weather-section">
                  <div className="Priceresult_weather-item best">
                    <p className="blink-dot sucess-dot"></p>
                    <h4>📈 Optimal Selling Months</h4>
                    <p className="value">Maximize profit by selling during peak price months.</p>
                    <p className="month">{state.goldMonthIndex} - {new Date(0, state.goldMonthIndex - 1).toLocaleString('en-US', { month: 'long' })}</p>
                  </div>
                  <div className="Priceresult_weather-item worst">
                  <p className="blink-dot danger-dot"></p>
                    <h4>⚠️ Risk Period</h4>
                    <p className="value">Minimize losses by avoiding sales in low-price months.</p>
                    <p className="month">{state.silverMonthIndex} - {new Date(0, state.silverMonthIndex - 1).toLocaleString('en-US', { month: 'long' })}</p>
                  </div>
                </div>
                <div className="Priceresult_weather-warning">
                  <i className="fas fa-exclamation-triangle"></i>
                  <p>Prediction variance possible with rainfall deviation</p>
                </div>
              </div>
            </div>
          </div>

          <div className="Priceresult_extremes-grid">
            <div className="Priceresult_extremes-card Priceresult_peak-card Priceresult_glass-card">
              <div className="Priceresult_extremes-header">
                <i className="fas fa-chart-line"></i>
                <h3>Peak Season Advantage</h3>
              </div>
              <div className="Priceresult_extremes-body">
                <div className="Priceresult_extremes-item">
                  <div className="Priceresult_extremes-label">Optimal Month</div>
                  <div className="Priceresult_extremes-value">{state.goldMonthIndex}</div>
                </div>
                <div className="Priceresult_price-range">
                  <div className="Priceresult_range-item">
                    <span>
                    <span>Price Range : </span>
                    <span>{state.minMSPPrice} ₹/quintal</span>
                    <span>-</span>
                    <span>{state.maxMSPPrice} ₹/quintal</span>
                    </span>
                  </div>
                </div>
                <div className="Priceresult_extremes-weather">
                  <i className="fas fa-cloud-rain"></i>
                  Expected Rainfall India :  {state.rainfall} mm
                </div>
              </div>
            </div>

            <div className="Priceresult_extremes-card Priceresult_trough-card Priceresult_glass-card">
              <div className="Priceresult_extremes-header">
                <i className="fas fa-chart-line"></i>
                <h3>Low Season Alert</h3>
              </div>
              <div className="Priceresult_extremes-body">
                <div className="Priceresult_extremes-item">
                  <div className="Priceresult_extremes-label">Risk Month</div>
                  <div className="Priceresult_extremes-value">{state.silverMonthIndex}</div>
                </div>
                <div className="Priceresult_price-range">
                  <div className="Priceresult_range-item">
                  <span>
                    <span>Price Range : </span>
                    <span>{state.minAvgPrice} ₹/quintal</span>
                    <span>-</span>
                    <span>{state.maxAvgPrice} ₹/quintal</span>
                    </span>
                  </div>
                </div>
                <div className="Priceresult_extremes-weather">
                  <i className="fas fa-cloud-rain"></i>
                  Expected Rainfall India : {state.rainfall} mm
                </div>
              </div>
            </div>
          </div>

          <div className="Priceresult_warning-card Priceresult_glass-card">
            <div className="Priceresult_warning-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="Priceresult_warning-content">
              <h3>Forecast Advisory</h3>
              <p>If there is variation between actual rainfall and expected rainfall, predictions may deviate from shown values. Always monitor weather updates for accurate planning.</p>
            </div>
          </div>

          <div className="Priceresult_visualization-section">
            <div className="Priceresult_graph-card Priceresult_glass-card">
              <div className="Priceresult_graph-header">
                <h3><i className="fas fa-chart-line"></i> {state.year} Price Trend</h3>
                <div className="Priceresult_graph-legend">
                  <span className="Priceresult_legend-item"><div className="Priceresult_color-box current"></div> Current Year</span>
                </div>
              </div>
              <div className="Priceresult_graph-container">
                <Line data={chartData(labels, state.maxPriceCurrSeries, state.minPriceCurrSeries)} options={options} />
              </div>
            </div>

            <div className="Priceresult_graph-card Priceresult_glass-card">
              <div className="Priceresult_graph-header">
                <h3><i className="fas fa-chart-line"></i> {state.year + 1} Forecast</h3>
                <div className="Priceresult_graph-legend">
                  <span className="Priceresult_legend-item"><div className="Priceresult_color-box forecast"></div> Next Year</span>
                </div>
              </div>
              <div className="Priceresult_graph-container">
                <Line data={chartData(labels, state.maxPriceNextSeries, state.minPriceNextSeries)} options={options} />
              </div>
            </div>
          </div>
        </div>

        <footer className="Priceresult_glass-footer">
          <p>| © 2026 Kisan DSS. All rights reserved | </p>
        </footer>
      </div>
    </div>
  );
}