import React from "react";
import { useLocation } from "react-router-dom";
import "../static/css/intel-crop-rec-result.css";

// Import Chart.js components
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

export default function IntelCropRecResult() {
  const location = useLocation();
  const { state } = location;

  console.log(state); // Debugging

  // Extract data for the chart
  const commodities = state?.data ? Object.keys(state.data) : [];
  const totalPrices = state?.data ? Object.values(state.data).map(item => item.totalPrice) : [];

  // Chart.js Data
  const chartData = {
    labels: commodities, // X-axis (Commodity names)
    datasets: [
      {
        label: "Expected Total Price",
        data: totalPrices, // Y-axis (Total Price)
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.2)",
        borderWidth: 2,
        pointRadius: 5,
        fill: true,
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
          text: "Commodity",
        },
      },
      y: {
        title: {
          display: true,
          text: "Expected Total Price (₹)",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="intel-yield-result-root">
      {/* Navigation Bar */}
      <div className="intel-yield-result-nav">
        <a href="/farmer-dashboard">Home</a>
      </div>

      {/* Section Header */}
      <div className="section-header">
        <h2>Crop Selection</h2>
      </div>

      <div className="commodity-container">
        {/* Table for Crop Data */}
        {state?.data && (
          <div className="crop-selection-main-block">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th scope="col">Commodity</th>
                  <th scope="col">Expected Price (per Quintal)</th>
                  <th scope="col">Expected Yield (Quintal/hec)</th>
                  <th scope="col">Your Area (hec)</th>
                  <th scope="col">Expected Total Price</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(state.data).map(([commodity, data]) => (
                  <tr key={commodity}>
                    <th scope="row">{commodity}</th>
                    <td>{data.predicted_price}</td>
                    <td>{data.predicted_yield}</td>
                    <td>{data.area}</td>
                    <td>{data.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Conclusion Section */}
        {state?.conclusion && (
          <div className="conclusion">
            <h3>Recommended Crop : {state.conclusion.suggested_crop}</h3>
            <p>{state.conclusion.reasoning}</p>
          </div>
        )}
      </div>

      <div className="section-header">
        <h2>Expected Total Price for Each Crop</h2>
      </div>
      {/* Chart Section */}
      <div className="commodity-container">
        <div style={{ height: "400px", width: "100%" }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Footer */}
      <footer className="intel-yield-result-footer">
        <p>© 2025 Kisan-DSS &dash; Intelligent Decision Support System</p>
      </footer>
    </div>
  );
}
