import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../static/css/farmer_dashboard.css";

import IntelGovMarketForm from "./IntelGovMarketForm";
import IntelLocalMarketForm from "./IntelLocalMarketForm";

import ChatBot from "./ChatBot";

export default function FarmerDashBoard() {
  const navigate = useNavigate();

  const [commodity, setCommodity] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [storageAvailability, setStorageAvailability] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [chatBot,setChatBot] = useState(false);

  const [govMarketForm, setGovMarketForm] = useState(false);
  const [localMarketForm, setLocalMarketForm] = useState(false);

  const handleChatBot = (e)=>{
    e.preventDefault();
    if(chatBot){
      setChatBot(false);
    }else{
      setChatBot(true);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setData(null);
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("commodity", commodity);
    formData.append("year", year);
    formData.append("month", month);
    formData.append("storageAvailability", storageAvailability);

    try {
      const response = await axios.post(
        "http://localhost:5000/intel-build-decision",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      let responseData = response.data;
      setData(responseData);
      console.log(responseData);
    } catch (err) {
      setError("Failed to build decision. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Loading state changed:", loading);
  }, [loading]);

  const farmerAdminNavigation = () => {
    navigate("/home-farmer");
  };

  return (
    <div className="farmer-dashboard-root">
      <div id="cover_root">
        <div className="cover_container">
          <h1 className="cover_heading">🌾 Agricultural Services Gateway</h1>

          <main className="farmer-dashboard-smart-container">
            {loading && (
              <div
                className="farmer-dashboard-loading-overlay"
                id="farmer-dashboard-loading"
              >
                <div className="farmer-dashboard-loader">
                  <div className="farmer-dashboard-loader-div"></div>
                  <p>Analyzing...</p>
                </div>
              </div>
            )}

            <h1 className="farmer-dashboard-h1">Smart Decision Building</h1>
            {error && (
              <div
                className="farmer-dashboard-error-message"
                id="farmer-dashboard-error"
              >
                {error}
              </div>
            )}

            <form
              id="farmer-dashboard-transportForm"
              className="farmer-dashboard-transport-form"
              onSubmit={handleSubmit}
            >
              <div className="farmer-dashboard-input-group">
                <label htmlFor="farmer-dashboard-sourceDistrict">
                  Commodity
                </label>
                <select
                  id="farmer-dashboard-sourceDistrict"
                  required
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                >
                  <option value="">Select Commodity</option>
                  {[
                    "Bajra",
                    "Barley",
                    "Cotton",
                    "Gram",
                    "Groundnut",
                    "Jowar",
                    "Maize",
                    "Masoor",
                    "Moong",
                    "Soyabean",
                    "Sugarcane",
                    "Tur",
                    "Urad",
                    "Wheat",
                  ].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="farmer-dashboard-input-group">
                <label htmlFor="farmer-dashboard-destinationDistrict">
                  Year
                </label>
                <input
                  id="farmer-dashboard-destinationDistrict"
                  type="number"
                  placeholder="Enter Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                />
              </div>

              <div className="farmer-dashboard-input-group">
                <label htmlFor="farmer-dashboard-destinationDistrict">
                  Month
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  <option value="">Select Month</option>
                  {[
                    "1 - January",
                    "2 - February",
                    "3 - March",
                    "4 - April",
                    "5 - May",
                    "6 - June",
                    "7 - July",
                    "8 - August",
                    "9 - September",
                    "10 - October",
                    "11 - November",
                    "12 - December",
                  ].map((item, index) => (
                    <option key={index + 1} value={index + 1}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="farmer-dashboard-input-group">
                <label htmlFor="farmer-dashboard-sourceDistrict">
                  Storage Availability
                </label>
                <select
                  id="farmer-dashboard-sourceDistrict"
                  required
                  value={storageAvailability}
                  onChange={(e) => setStorageAvailability(e.target.value)}
                >
                  <option value="">Select Storage Availability</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <button type="submit" className="farmer-dashboard-calculate-btn">
                Build Decision
              </button>
            </form>

            {data && (
              <div
                class="farmer-dashboard-results-section"
                id="farmer-dashboard-results"
              >
                <div class="farmer-dashboard-result-card">
                  <h3>Decision</h3>
                  <div
                    class="farmer-dashboard-result-grid"
                    id="farmer-dashboard-resultGrid"
                  >
                    <p className="decision-text">{data.decision.decision}</p>
                    <p>{data.decision.reasoning}</p>
                  </div>
                </div>
              </div>
            )}
          </main>

          <main className="farmer-dashboard-smart-container crop-recommendation-block">
            <Link
              className="crop-recommendation-link"
              to="/intel-crop-recommendation"
            >
              <h1 className="farmer-dashboard-h1">Smart Crop Recommendation</h1>
            </Link>
            <p>
              <i>Grow the Right Crop, at the Right Time!</i>
            </p>
          </main>

          <main className="farmer-dashboard-smart-container crop-recommendation-block">
            <Link
              className="crop-recommendation-link"
              to="/intel-goverment-scheme"
            >
              <h1 className="farmer-dashboard-h1">Goverment Schemes</h1>
            </Link>
            <p>
              <i>Bridging Farmers with Government Support!</i>
            </p>
          </main>

          {govMarketForm && (
            <IntelGovMarketForm setGovMarketForm={setGovMarketForm} />
          )}
          {localMarketForm && (
            <IntelLocalMarketForm setLocalMarketForm={setLocalMarketForm} />
          )}

          <div className="cover_service_grid">
            <div className="cover_service_card">
              <div className="cover_service_icon">🏛️</div>
              <h2 className="cover_service_name">Government APMC</h2>
              <p className="cover_service_description">
                Agricultural market platform with real-time commodity prices &
                APMC Market price forcasting.
              </p>
              <button
                onClick={() => setGovMarketForm(true)}
                className="cover_access_button"
              >
                Access Portal
              </button>
            </div>

            <div className="cover_service_card">
              <div className="cover_service_icon">🛒</div>
              <h2 className="cover_service_name">Local Mandi</h2>
              <p className="cover_service_description">
                Connect with regional local markets and local traders. Local
                market price forcasting , Trasportation cost calculation and
                market recommendation.
              </p>
              <button
                onClick={() => setLocalMarketForm(true)}
                className="cover_access_button"
              >
                Access Portal
              </button>
            </div>

            <div className="cover_service_card">
              <div className="cover_service_icon">📦</div>
              <h2 className="cover_service_name">E-Commerce</h2>
              <p className="cover_service_description">
                Producer to Consumer Service
                <br />
                Direct digital marketplace connecting farmers with consumers.
              </p>
              <button
                onClick={farmerAdminNavigation}
                className="cover_access_button"
              >
                Visit Marketplace
              </button>
            </div>
          </div>
        </div>

        {chatBot && (<ChatBot/>)}

        <div className="farmer-bot-block">
          <button onClick={handleChatBot} className="farmer-bot-btn">
            <i class="fa-solid fa-robot"></i>
          </button>
        </div>

      </div>
    </div>
  );
}
